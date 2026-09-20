-- 用户审核的发卡线索；仅补充未标注的现存新闻，不覆盖更新的判断。
UPDATE events SET reset_updates_json = '[{"kind":"credit","credit_status":"hint","announced_at":"2026-09-19T16:48:38Z","expected_date":"2026-09-22","summary":"Tibo 对用户索要重置卡的请求回复“OK fine”。","expected_note":"根据回复中的“周二”推测，发卡日期待确认。","source_url":"https://x.com/thsottiaux/status/2101352781219258527","context_url":"https://x.com/udiWertheimer/status/2101093319501664368"}]', content_hash=content_hash||':credit-forecast-v1', content_updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'tibo-astra-weekly-ships-next-week-preview-2026-09-12' AND active=1 AND reset_updates_json IS NULL
AND EXISTS (SELECT 1 FROM json_each(events.sources_json) WHERE json_extract(value, '$.url') = 'https://x.com/thsottiaux/status/2101352781219258527')
AND EXISTS (SELECT 1 FROM json_each(events.sources_json) WHERE json_extract(value, '$.url') = 'https://x.com/udiWertheimer/status/2101093319501664368')
;
