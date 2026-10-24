import { expect, it } from 'vitest';
import { publicEvent, timeParts, type NewsEvent } from '../app/lib/content';
import { resetOverview, resetRecords, type ResetUpdate } from '../app/lib/resets';
const make = (id: string, updates: ResetUpdate[]): NewsEvent => ({
 id, title: 'Codex 重置', body: '重置进展', category: '产品更新', products: ['Codex'],
 ...timeParts('2026-10-22T06:55:22Z'), content_updated_at: '2026-10-25T00:00:00Z',
 sources: updates.map(u => ({label: '原帖', url: u.source_url})), reset_updates: updates,
});
const announcement: ResetUpdate = {kind: 'announced', announced_at: '2026-10-22T06:55:22Z', expected_date: '2026-10-23', summary: '预告', source_url: 'https://example.com/day17'};
const receipt: ResetUpdate = {kind: 'observed', announced_at: '2026-10-22T17:10:28Z', summary: '用户报告剩余恢复100%', audience: '单个公开反馈账户，未确认全量完成', source_url: 'https://example.com/receipt17'};
it('Day17到账进入最近重置并关闭同一轮预告，保留用户反馈标签和原帖时间', () => {
 const item = make('day17', [announcement, receipt]);
 const parsed = publicEvent(item);
 const overview = resetOverview(resetRecords([{...item, ...parsed}]), '2026-10-25T00:00:00Z', 7);
 expect(overview.latest?.kind).toBe('observed');
 expect(overview.latest?.day).toBe('2026-10-23');
 expect(overview.latest?.clock).toBe('01:10');
 expect(overview.signal).toBeNull();
 expect(overview.latest?.audience).toBe(receipt.audience);
 expect(() => publicEvent(make('day17', [{...receipt, audience: undefined}]))).toThrow();
});
it('其他轮次到账不会隐藏更早宣布而尚待兑现的Day18；日期到期不能自动变成完成', () => {
 const pending = make('day18', [{...announcement, announced_at: '2026-10-23T04:46:19Z', expected_date: '2026-10-24', source_url: 'https://example.com/day18'}]);
 const later = make('another-round', [{...receipt, announced_at: '2026-10-24T17:10:28Z'}]);
 const overview = resetOverview(resetRecords([pending,later]), '2026-10-25T00:00:00Z', 7);
 expect(overview.signal?.event_id).toBe('day18');
 expect(overview.outlook).toBe('overdue');
 expect(overview.latest?.event_id).toBe('another-round');
});
it('官方后续完成确认升级同一轮；未来到账反馈不提前展示', () => {
 const item = make('day17', [announcement, receipt, {...receipt, kind: 'completed', announced_at: '2026-10-23T05:00:00Z', source_url: 'https://example.com/official'}]);
 expect(resetOverview(resetRecords([item]), '2026-10-23T06:00:00Z',7).latest?.kind).toBe('completed');
 expect(resetOverview(resetRecords([item]), '2026-10-22T07:00:00Z',7).latest).toBeNull();
});
