import { expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { publicEvent, timeParts, type NewsEvent } from '../app/lib/content';
import { resetRecords, resetOverview, type ResetUpdate } from '../app/lib/resets';

const source = 'https://example.com/forecast';
const event = (updates: ResetUpdate[], id = 'credit-forecast'): NewsEvent => ({
  id, title: '重置线索', body: '公开消息', products: ['Codex'], category: '产品更新',
  ...timeParts('2026-09-12'), content_updated_at: '2026-09-20T00:00:00Z',
  sources: updates.flatMap(u => [{ label: '原帖', url: u.source_url }, ...(u.context_url ? [{ label: '上文', url: u.context_url }] : [])]),
  reset_updates: updates,
});
const hint: ResetUpdate = { kind: 'credit', credit_status: 'hint', source_url: source, summary: '疑似发卡', announced_at: '2026-09-19T16:48:38Z', expected_date: '2026-09-22' };

it('本次原帖存为发卡线索：不混入额度预告、历史发卡数量，使用回复时间', async () => {
  const fixture = JSON.parse(await readFile(new URL('../data/reset-credit-signal.json', import.meta.url), 'utf8'));
  const input = event(fixture.reset_updates, fixture.event_id);
  const parsed = publicEvent(input);
  const records = resetRecords([{ ...input, ...parsed }]);
  const overview = resetOverview(records, '2026-09-20T00:00:00Z', 7);
  expect(overview.signal).toBeNull();
  expect(overview.latest).toBeNull();
  expect(overview.credits).toEqual([]);
  expect(overview.lastCredit).toBeNull();
  expect(overview.creditSignal?.day).toBe('2026-09-20');
  expect(overview.creditSignal?.expected_date).toBe('2026-09-22');
  expect(overview.creditSignal?.context_url).toContain('2101093319501664368');
  expect(overview.creditOutlook).toBe('hint');
});

it('仅日期的预告在整天内有效，逾期仍不当作已发卡', () => {
  const records = resetRecords([event([hint])]);
  expect(resetOverview(records, '2026-09-22T15:59:00Z', 7).creditOutlook).toBe('hint');
  const overdue = resetOverview(records, '2026-09-22T16:00:00Z', 7);
  expect(overdue.creditOutlook).toBe('overdue');
  expect(overdue.lastCredit).toBeNull();
});

it.each(['distributed', 'cancelled'] as const)('后续 %s 关闭同一轮疑似发卡', (credit_status) => {
  const records = resetRecords([event([hint, { ...hint, credit_status, announced_at: '2026-09-22', expected_date: undefined, source_url: 'https://example.com/followup' }])]);
  const overview = resetOverview(records, '2026-09-23T00:00:00Z', 7);
  expect(overview.creditSignal).toBeNull();
  expect(overview.credits).toHaveLength(credit_status === 'distributed' ? 1 : 0);
});

it('未来明确发卡与最近一次发放分开，确认到来后关闭预告', () => {
  const upcoming = event([{ ...hint, credit_status: 'announced' }]);
  const previous = event([{ ...hint, credit_status: 'distributed', announced_at: '2026-09-10', expected_date: undefined, source_url: 'https://example.com/previous' }], 'previous-credit');
  const overview = resetOverview(resetRecords([upcoming, previous]), '2026-09-20T00:00:00Z', 30);
  expect(overview.creditOutlook).toBe('announced');
  expect(overview.lastCredit?.event_id).toBe('previous-credit');
  expect(overview.credits).toHaveLength(1);
});

it('日期/上文公开字段校验，不接受非法日期或未收录链接', () => {
  expect(() => publicEvent(event([{ ...hint, expected_date: '2026-02-30' }]))).toThrow();
  expect(() => publicEvent(event([{ ...hint, expected_at: '2026-09-22T00:00:00Z' }]))).toThrow();
  expect(() => publicEvent({ ...event([hint]), reset_updates: [{ ...hint, context_url: 'https://example.com/unlisted' }] })).toThrow();
});
