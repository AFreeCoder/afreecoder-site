import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
	options: {
		input: { type: 'string' },
		url: { type: 'string' },
		state: { type: 'string', default: '.sync/state.json' },
		'token-file': { type: 'string' },
		'dry-run': { type: 'boolean', default: false },
		withdraw: { type: 'string' },
		restore: { type: 'string' },
	},
});
if (!values.input) throw new Error('请用 --input 指定已整理的 flow/store.json 或累计 events.json');
const source = JSON.parse(await readFile(values.input, 'utf8'));
const items = Array.isArray(source.events) ? source.events : Object.values(source.events ?? {});
if (!items.length) throw new Error('输入没有已整理事件；空输入不会清空网站');
const events = items.map((e) => ({
	id: e.id,
	title: e.title,
	body: e.body,
	products: e.products,
	category: e.category,
	published_at: e.published_at,
	sources: e.sources?.map((s) => ({ label: s.label, url: s.url })),
	...(e.reset_updates === undefined ? {} : { reset_updates: e.reset_updates.map((r) => ({
		kind: r.kind, announced_at: r.announced_at, summary: r.summary, source_url: r.source_url,
		audience: r.audience, expected_at: r.expected_at, expected_note: r.expected_note,
		credit_count: r.credit_count, credit_status: r.credit_status,
	})) }),
}));
if (new Set(events.map((e) => e.id)).size !== events.length) throw new Error('输入有重复事件 ID');
const withdraw = values.withdraw
	? values.withdraw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	: [];
const restore = values.restore
	? values.restore
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	: [];
if (withdraw.length > 50 || restore.some((id) => withdraw.includes(id))) throw new Error('每次最多撤下 50 条，撤下与恢复 ID 不能重叠');
if (restore.some((id) => !events.some((e) => e.id === id))) throw new Error('恢复的信息必须存在于输入文件');
const digest = (e) => createHash('sha256').update(JSON.stringify(e)).digest('hex');
const endpoint = values.url ? new URL('/internal/publish', values.url) : null;
if (
	endpoint &&
	(endpoint.username ||
		endpoint.password ||
		(endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))))
)
	throw new Error('同步目标需要 HTTPS，本地回环地址除外');
const statePath = resolve(values.state);
let state = { target: endpoint?.origin, fingerprints: {}, withdrawn: {}, pending: null };
try {
	state = JSON.parse(await readFile(statePath, 'utf8'));
} catch (e) {
	if (e.code !== 'ENOENT') throw e;
}
state.withdrawn ??= {};
const selected = () => events.filter((e) => !withdraw.includes(e.id) && (!state.withdrawn[e.id] || restore.includes(e.id)));
if (state.target && endpoint && state.target !== endpoint.origin) throw new Error('此状态文件属于另一个网站，请使用独立 --state');
const atomicWrite = async (value) => {
	await mkdir(dirname(statePath), { recursive: true });
	const tmp = statePath + '.tmp';
	await writeFile(tmp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
	await rename(tmp, statePath);
};
if (!endpoint || values['dry-run']) {
	console.log(
		JSON.stringify({
			events: events.length,
			changed: selected().filter((e) => state.fingerprints[e.id] !== digest(e)).length,
			withdraw,
			restore,
			mode: 'dry-run',
			note: '仅检查字段投影与数量，没有上传',
		}),
	);
	process.exit(0);
}
let token = process.env.AIHOT_PUBLISH_TOKEN;
if (values['token-file']) {
	const value = (await readFile(values['token-file'], 'utf8')).trim();
	token = value.startsWith('PUBLISH_TOKEN=') ? value.slice('PUBLISH_TOKEN='.length).trim() : value;
}
if (!token || token.includes('\n')) throw new Error('需要 AIHOT_PUBLISH_TOKEN 或 --token-file；不要把令牌放到网址里');
let sent = 0;
async function sendPending() {
	const pending = state.pending;
	if (!pending) return;
	const response = await fetch(endpoint, {
		method: 'POST',
		redirect: 'error',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body: JSON.stringify(pending.payload),
		signal: AbortSignal.timeout(30000),
	});
	if (!response.ok) throw new Error(`同步失败，HTTP ${response.status}；批次已保存，重跑会续传`);
	const receipt = await response.json();
	if (
		JSON.stringify(receipt.accepted) !== JSON.stringify(pending.payload.events.map((e) => e.id)) ||
		JSON.stringify(receipt.withdrawn) !== JSON.stringify(pending.payload.withdraw)
	)
		throw new Error('同步回执不匹配，保留待重试批次');
	for (const e of pending.payload.events) {
		state.fingerprints[e.id] = digest(e);
		delete state.withdrawn[e.id];
	}
	for (const id of pending.payload.withdraw) {
		delete state.fingerprints[id];
		state.withdrawn[id] = true;
	}
	sent += pending.payload.events.length;
	state.pending = null;
	state.last_receipt = receipt;
	state.target = endpoint.origin;
	await atomicWrite(state);
}
await sendPending();
const changed = selected().filter((e) => state.fingerprints[e.id] !== digest(e));
const snapshot_at = new Date().toISOString();
const batches = [];
let group = [];
for (const event of changed) {
	if (Buffer.byteLength(JSON.stringify(event)) > 450000) throw new Error('单条信息过大');
	if (group.length >= 40 || Buffer.byteLength(JSON.stringify([...group, event])) > 450000) {
		batches.push(group);
		group = [];
	}
	group.push(event);
}
if (group.length) batches.push(group);
if (!batches.length) batches.push([]); // 即使没有内容变化，也更新最近成功同步时间。
for (let i = 0; i < batches.length; i++) {
	state.pending = { payload: { snapshot_at, events: batches[i], withdraw: i === 0 ? withdraw : [] } };
	await atomicWrite(state);
	await sendPending();
}
console.log(JSON.stringify({ sent, withdrawn: withdraw.length, revision: state.last_receipt.revision, mode: 'synced' }));
