import { hash, publicEvent, record, validId } from './content';
import { getEvent, siteState, upsert } from './db.server';
import { timingSafeEqual } from 'node:crypto';

const MAX_BYTES = 512 * 1024;

async function readJson(request: Request): Promise<unknown> {
	if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Response('需要 JSON', { status: 415 });
	if (!request.body) throw new Response('请求为空', { status: 400 });
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > MAX_BYTES) {
			await reader.cancel();
			throw new Response('批次过大', { status: 413 });
		}
		chunks.push(value);
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.length;
	}
	return JSON.parse(new TextDecoder().decode(bytes));
}

export async function authenticated(request: Request, token: string | undefined) {
	if (!token) return false;
	const supplied = request.headers.get('authorization') ?? '';
	const encode = new TextEncoder();
	const [a, b] = await Promise.all([
		crypto.subtle.digest('SHA-256', encode.encode(supplied)),
		crypto.subtle.digest('SHA-256', encode.encode(`Bearer ${token}`)),
	]);
	return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}

export async function publish(request: Request, db: D1Database, token: string | undefined) {
	if (!(await authenticated(request, token))) return Response.json({ error: '无权发布' }, { status: 401 });
	if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
	let validated = false;
	try {
		const payload = record(await readJson(request));
		if (
			typeof payload.snapshot_at !== 'string' ||
			!/^\d{4}-\d{2}-\d{2}T/.test(payload.snapshot_at) ||
			!/(Z|[+-]\d{2}:\d{2})$/.test(payload.snapshot_at)
		)
			throw new Error('缺少带时区的快照时间');
		const date = new Date(payload.snapshot_at);
		if (Number.isNaN(date.getTime()) || date.getTime() > Date.now() + 300000) throw new Error('快照时间无效');
		const version = date.toISOString();
		if (!Array.isArray(payload.events) || payload.events.length > 50) throw new Error('每批最多 50 条信息');
		const events = payload.events.map(publicEvent);
		const removed = payload.withdraw ?? [];
		if (!Array.isArray(removed) || removed.length > 50) throw new Error('每批最多撤下 50 条信息');
		const withdraw = removed.map(validId);
		if (new Set([...events.map((e) => e.id), ...withdraw]).size !== events.length + withdraw.length) throw new Error('批次内信息 ID 重复');
		const now = new Date().toISOString();
		validated = true;
		// 兼容未升级的采集端：缺省保留已核实的结构化记录，显式 [] 才清除。
		await Promise.all(events.map(async (event) => {
			if (event.reset_updates !== undefined) return;
			const previous = await getEvent(db, event.id);
			if (previous?.reset_updates !== undefined)
				event.reset_updates = previous.reset_updates.filter((u) => event.sources.some((s) => s.url === u.source_url));
		}));
		const hashes = await Promise.all(events.map(hash));
		const statements = events.map((event, i) => upsert(db, event, hashes[i], version, now));
		for (const id of withdraw)
			statements.push(
				db
					.prepare(
						'UPDATE events SET active=0,source_version=?,content_updated_at=CASE WHEN active=1 THEN ? ELSE content_updated_at END WHERE id=? AND source_version<=?',
					)
					.bind(version, now, id, version),
			);
		statements.push(db.prepare('UPDATE site_state SET last_synced_at=? WHERE id=1').bind(now));
		// D1 batch 在一个事务内执行；校验失败不会留下半批公开内容。
		await db.batch(statements);
		return Response.json(
			{ accepted: events.map((e) => e.id), withdrawn: withdraw, snapshot_at: version, ...(await siteState(db)) },
			{ headers: { 'Cache-Control': 'no-store' } },
		);
	} catch (error) {
		if (error instanceof Response) return error;
		// 数据校验与 JSON 错误可反馈；数据库内部错误交给入口统一处理。
		if (!validated)
			return Response.json({ error: error instanceof Error ? error.message : '数据无效' }, { status: 400 });
		throw error;
	}
}
