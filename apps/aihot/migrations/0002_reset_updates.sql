-- NULL: 未作结构化标注；[]: 明确排除（也覆盖历史标注）。
ALTER TABLE events ADD COLUMN reset_updates_json TEXT;
