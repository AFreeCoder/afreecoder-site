import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { publicEvent, timeParts } from '../app/lib/content';
import { resetRecords, resetOverview } from '../app/lib/resets';

it('补录原帖符合公开数据校验，同轮发卡不重复计数，预告不冒充完成', async () => {
  const payload = JSON.parse(await readFile(new URL('../data/reset-history.json', import.meta.url), 'utf8'));
  const events = payload.events.map((input: unknown) => {
    const event = publicEvent(input);
    return { ...event, ...timeParts(event.published_at), content_updated_at: '2026-09-18T10:00:00Z' };
  });
  const records = resetRecords(events);
  expect(events).toHaveLength(11);
  expect(records).toHaveLength(19);
  const overview = resetOverview(records, '2026-09-18T10:00:00Z', 30);
  expect(overview.credits).toHaveLength(3);
  expect(overview.credits.map(r => r.credit_status)).toEqual(['announced', 'announced', 'distributed']);
  expect(overview.latest?.day).toBe('2026-08-31');
  expect(records.filter(r => r.event_id === 'codex-reset-history-2026-08-13').every(r => r.kind === 'announced')).toBe(true);
  expect(records.filter(r => r.event_id === 'codex-reset-history-2026-08-30').every(r => r.kind === 'announced')).toBe(true);
});
