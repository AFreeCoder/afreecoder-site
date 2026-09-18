import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFile } from 'node:fs/promises';
import { getEvent, listEvents, listResetEvents, siteState } from '../app/lib/db.server';
import { resetRecords } from '../app/lib/resets';
import { publicEvent, timeParts } from '../app/lib/content';
import { publish } from '../app/lib/publish.server';

let mf: Miniflare;
let db: D1Database;
const token = 'local-test-token';
const base = Date.now() - 100000;
const stamp = (n: number) => new Date(base + n * 1000).toISOString();
const event = (n: number) => ({
	id: `event-${n}`,
	title: `测试新闻 ${n}`,
	body: n === 25 ? '可搜索的 needle 正文' : '独立信息正文',
	products: [n % 2 ? 'Claude' : 'Codex'],
	category: n % 2 ? '观点与实践' : '产品更新',
	published_at: `2026-09-14T${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}:00Z`,
	sources: [{ label: '官方来源', url: 'https://example.com/news' }],
});
const send = (events: unknown[], version = stamp(1), withdraw: string[] = [], auth = token) =>
	publish(
		new Request('http://localhost/internal/publish', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
			body: JSON.stringify({ events, snapshot_at: version, withdraw }),
		}),
		db,
		token,
	);

beforeAll(async () => {
	mf = new Miniflare(
		convertV4MiniflareOptions({
			modules: true,
			script: 'export default { fetch() { return new Response("test"); } }',
			compatibilityDate: '2026-09-11',
			d1Databases: ['DB'],
		}),
	);
	db = await mf.getD1Database('DB');
	const sql = await readFile(new URL('../migrations/0001_events.sql', import.meta.url), 'utf8');
	// 保持 trigger 整体，D1 exec 的多语句处理与生产迁移一致。
	const statements = sql.match(/CREATE TRIGGER[\s\S]*?END;|(?:CREATE|INSERT)[\s\S]*?;/g) ?? [];
	for (const statement of statements) await db.prepare(statement).run();
	await db.prepare('ALTER TABLE events ADD COLUMN reset_updates_json TEXT').run();
});
afterAll(async () => {
	await mf?.dispose();
});

describe.sequential('事件发布与真实本地 D1 查询', () => {
	it('未授权请求不能写入数据库', async () => {
		expect((await send([event(1)], stamp(1), [], 'wrong')).status).toBe(401);
		expect((await siteState(db)).revision).toBe(0);
	});
	it('整批先校验，包含非法来源时不写入任何条目', async () => {
		const bad = { ...event(2), sources: [{ label: '本地文件', url: 'file:///private/data' }] };
		expect((await send([event(1), bad])).status).toBe(400);
		expect(await getEvent(db, 'event-1')).toBeNull();
	});
	it('导入超过一页，后端只返回二十条并提供前后游标', async () => {
		expect((await send(Array.from({ length: 45 }, (_, i) => event(i)))).status).toBe(200);
		const first = await listEvents(db, new URL('http://localhost/'));
		expect(first.events).toHaveLength(20);
		expect(first.events[0].id).toBe('event-44');
		const next = await listEvents(db, new URL(`http://localhost/?before=${encodeURIComponent(first.next!)}`));
		expect(next.events).toHaveLength(20);
		expect(next.events[0].id).toBe('event-24');
		expect(next.events.some((e) => first.events.some((a) => a.id === e.id))).toBe(false);
		const previous = await listEvents(db, new URL(`http://localhost/?after=${encodeURIComponent(next.previous!)}`));
		expect(previous.events.map((e) => e.id)).toEqual(first.events.map((e) => e.id));
	});
	it('重复发送及材料路径变化不生成重复新闻或新版本提示', async () => {
		const revision = (await siteState(db)).revision;
		expect(
			(await send([{ ...event(1), sources: [{ ...event(1).sources[0], materials: [{ path: '/private/local' }] }] }], stamp(2))).status,
		).toBe(200);
		expect((await siteState(db)).revision).toBe(revision);
		expect(JSON.stringify(await getEvent(db, 'event-1'))).not.toContain('/private/local');
	});
	it('同一 ID 修订，旧批次重试不覆盖新正文', async () => {
		expect((await send([{ ...event(1), body: '已修订的事实' }], stamp(5))).status).toBe(200);
		await send([event(1)], stamp(3));
		expect((await getEvent(db, 'event-1'))?.body).toBe('已修订的事实');
	});
	it('搜索和组合筛选在全库执行，游标不能串用筛选条件', async () => {
		const search = await listEvents(db, new URL('http://localhost/?q=needle&product=Claude&date=2026-09-14'));
		expect(search.events.map((e) => e.id)).toEqual(['event-25']);
		const first = await listEvents(db, new URL('http://localhost/'));
		await expect(
			listEvents(db, new URL(`http://localhost/?product=Codex&before=${encodeURIComponent(first.next!)}`)),
		).rejects.toBeInstanceOf(Response);
		expect((await listEvents(db, new URL('http://localhost/?q=%25'))).events).toHaveLength(0);
	});
	it('翻页期间新增新闻不会推移后续游标', async () => {
		const first = await listEvents(db, new URL('http://localhost/'));
		await send([event(59)], stamp(6));
		const next = await listEvents(db, new URL(`http://localhost/?before=${encodeURIComponent(first.next!)}`));
		expect(next.events[0].id).toBe('event-24');
	});
	it('显式撤下后不再公开，旧快照重试不会恢复它', async () => {
		await send([], stamp(8), ['event-1']);
		expect(await getEvent(db, 'event-1')).toBeNull();
		await send([event(1)], stamp(7));
		expect(await getEvent(db, 'event-1')).toBeNull();
		const revision = (await siteState(db)).revision;
		await send([], stamp(10), ['event-1']);
		await send([event(1)], stamp(9));
		expect(await getEvent(db, 'event-1')).toBeNull();
		expect((await siteState(db)).revision).toBe(revision);
	});
	it('新重置记录进入独立栏目；修订不丢失标注，显式撤下同步退出日历', async () => {
		const item = { ...event(70), title: 'Codex 额度公告', reset_updates: [{ kind: 'completed', announced_at: '2026-09-14T18:00:00Z', summary: '本轮重置已完成。', source_url: 'https://example.com/news' }] };
		expect((await send([item], stamp(11))).status).toBe(200);
		let records = resetRecords((await listResetEvents(db)).events);
		expect(records.find((r) => r.event_id === item.id)?.day).toBe('2026-09-15');
		const revision = (await siteState(db)).revision;
		await send([{ ...event(70), title: item.title }], stamp(12));
		expect((await getEvent(db, item.id))?.reset_updates).toEqual([{ ...item.reset_updates[0], announced_at: '2026-09-14T18:00:00.000Z' }]);
		expect((await siteState(db)).revision).toBe(revision);
		await send([{ ...item, reset_updates: [] }], stamp(13));
		expect(resetRecords((await listResetEvents(db)).events).some((r) => r.event_id === item.id)).toBe(false);
		await send([item], stamp(14));
		await send([], stamp(15), [item.id]);
		records = resetRecords((await listResetEvents(db)).events);
		expect(records.some((r) => r.event_id === item.id)).toBe(false);
	});
	it('重置元数据的来源必须可回溯；非法记录整批拒绝', async () => {
		const bad = { ...event(80), reset_updates: [{ kind: 'completed', announced_at: '2026-09-14', summary: '完成', source_url: 'https://other.example.com' }] };
		expect((await send([bad], stamp(16))).status).toBe(400);
		expect(await getEvent(db, bad.id)).toBeNull();
	});
});

it('只标日期的条目排在当天精确时间之后，跨日按 UTC+8 归日', () => {
	expect(timeParts('2026-09-13T18:30:00Z').day).toBe('2026-09-14');
	expect(timeParts('2026-09-14').sort_key < timeParts('2026-09-14T00:00:00+08:00').sort_key).toBe(true);
	expect(() => timeParts('2026-02-30')).toThrow();
	expect(() => publicEvent({ ...event(1), products: ['unknown'] })).toThrow();
});
