import { describe, expect, it } from 'vitest';
import { resetOverview, resetRecords, groupResetRecords, recentSince } from '../app/lib/resets';
import { publicEvent, timeParts, type NewsEvent } from '../app/lib/content';

const event = (overrides: Partial<NewsEvent> = {}): NewsEvent => ({
	id: 'codex-astra-usage-reset-2026-09-12', title: 'Codex 使用额度重置', body: '完成确认见后续原帖。', products: ['Codex'], category: '产品更新',
	...timeParts('2026-09-12T03:20:36Z'), content_updated_at: '2026-09-14T00:00:00Z',
	sources: [{ label: '@thsottiaux', url: 'https://x.com/thsottiaux/status/2098685367058612394' }], ...overrides,
});

describe('重置证据与近期状态', () => {
	it('完成确认采用对应原帖时间，不取预告或采集时间', () => {
		const [record] = resetRecords([event()]);
		expect(record.kind).toBe('completed');
		expect(record.clock).toBe('16:09');
		expect(record.day).toBe('2026-09-12');
	});
	it('新消息仅包含重置关键词不能变成完成确认，其他产品不会混入', () => {
		const records = resetRecords([event({ id: 'new-reset', title: 'Codex 尚未重置' }), event({ id: 'claude-reset', products: ['Claude'] })]);
		expect(records).toHaveLength(1);
		expect(records[0].kind).toBe('related');
	});
	it('撤掉确认来源或显式排除后，历史确认不再展示', () => {
		expect(resetRecords([event({ sources: [] })])).toEqual([]);
		expect(resetRecords([event({ reset_updates: [] })])).toEqual([]);
	});
	it('次数补偿不计作额度完成重置，只有日期的公告不补造时分', () => {
		const item = event({ reset_updates: [{ kind: 'credit', announced_at: '2026-09-15', summary: '发放一次补偿', source_url: event().sources[0].url }] });
		const [record] = resetRecords([item]);
		expect(record.kind).toBe('credit');
		expect(record.clock).toBe('仅日期');
		expect(record.day).toBe('2026-09-15');
	});
	it('显式结构化标注优先，输入排除未知状态与非法日期', () => {
		const update = { kind: 'completed', announced_at: '2026-09-12T18:00:00Z', summary: '新确认', source_url: event().sources[0].url };
		const result = publicEvent({ ...event(), reset_updates: [update] });
		expect(resetRecords([{ ...event(), ...result }])[0].day).toBe('2026-09-13');
		expect(() => publicEvent({ ...event(), reset_updates: [{ ...update, kind: 'guess' }] })).toThrow();
		expect(() => publicEvent({ ...event(), reset_updates: [{ ...update, announced_at: '2026-02-30' }] })).toThrow();
	});
	it('7 天范围按北京时间自然日计算，跨月且包含今天', () => {
		expect(recentSince('2026-09-01T18:00:00Z', 7)).toBe('2026-08-27');
	});
	it('完成确认关闭对应预告；其他产品公告不能产生下一次重置时间', () => {
		const records = resetRecords([event({ sources: [...event().sources, { label: '@thsottiaux', url: 'https://x.com/thsottiaux/status/2098612714704891959' }] })]);
		const overview = resetOverview(records, '2026-09-18T08:00:00Z', 7);
		expect(overview.latest?.clock).toBe('16:09');
		expect(overview.signal).toBeNull();
		expect(groupResetRecords(overview.recent)).toHaveLength(1);
	});
	it('预告时间过期仍等确认，暗示没有倒计时；未来发帖不提前显示', () => {
		const update = { kind: 'announced' as const, announced_at: '2026-09-18T08:00:00Z', expected_at: '2026-09-18T12:00:00Z', summary: '将在今天晚些时候重置', source_url: event().sources[0].url };
		const records = resetRecords([event({ id: 'new-reset', reset_updates: [update] })]);
		expect(resetOverview(records, '2026-09-18T07:00:00Z', 7).signal).toBeNull();
		expect(resetOverview(records, '2026-09-18T09:00:00Z', 7).outlook).toBe('announced');
		expect(resetOverview(records, '2026-09-18T13:00:00Z', 7).outlook).toBe('overdue');
		expect(resetOverview(records, '2026-09-18T13:00:00Z', 7).latest).toBeNull();
		const hint = resetRecords([event({ id: 'hint', reset_updates: [{ ...update, kind: 'hint', expected_at: undefined }] })]);
		expect(resetOverview(hint, '2026-09-18T13:00:00Z', 7).outlook).toBe('hint');
	});
	it('发卡预告与确认不重复计数，同源转述去重，未知数量不补成一张', () => {
		const source = event().sources[0].url;
		const item = event({ reset_updates: [
			{ kind: 'credit', announced_at: '2026-09-15', summary: '预计发卡', source_url: source, credit_status: 'announced' },
			{ kind: 'credit', announced_at: '2026-09-16', summary: '已发卡', source_url: 'https://example.com/confirmed', credit_status: 'distributed', credit_count: 2 },
		], sources: [...event().sources, { label: '确认', url: 'https://example.com/confirmed' }] });
		const records = resetRecords([item, { ...item, id: 'duplicate-story' }]);
		expect(records).toHaveLength(2);
		const overview = resetOverview(records, '2026-09-18T08:00:00Z', 7);
		expect(overview.credits).toHaveLength(1);
		expect(overview.credits[0].credit_count).toBe(2);
		expect(overview.latest).toBeNull();
	});
	it('发卡数量/身份/时间校验，模糊时区不可变成精确倒计时', () => {
		const update = { kind: 'credit', announced_at: '2026-09-15', summary: '补偿', source_url: event().sources[0].url };
		expect(() => publicEvent({ ...event(), reset_updates: [{ ...update, credit_count: 0 }] })).toThrow();
		expect(() => publicEvent({ ...event(), reset_updates: [{ ...update, credit_count: 1.5 }] })).toThrow();
		expect(() => publicEvent({ ...event(), reset_updates: [{ ...update, kind: 'announced', expected_at: '2026-09-18' }] })).toThrow();
		const parsed = publicEvent({ ...event(), reset_updates: [{ ...update, credit_count: 1, audience: '特定用户', credit_status: 'announced', private_notes: 'private' }] });
		expect(parsed.reset_updates?.[0].audience).toBe('特定用户');
		expect(JSON.stringify(parsed)).not.toContain('private');
	});
	it('撤回预告后不再显示未来时间', () => {
		const records = resetRecords([event({ id: 'cancelled-reset', sources: [...event().sources, { label: '更新', url: 'https://example.com/cancelled' }], reset_updates: [
			{ kind: 'announced', announced_at: '2026-09-17', summary: '将重置', source_url: event().sources[0].url },
			{ kind: 'cancelled', announced_at: '2026-09-18', summary: '已取消', source_url: 'https://example.com/cancelled' },
		] })]);
		expect(resetOverview(records, '2026-09-18T08:00:00Z', 7).signal).toBeNull();
	});
});
