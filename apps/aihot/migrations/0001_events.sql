CREATE TABLE site_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  last_synced_at TEXT
);
INSERT INTO site_state(id) VALUES (1);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  products_json TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TEXT NOT NULL,
  day TEXT NOT NULL,
  clock TEXT NOT NULL,
  sort_key TEXT NOT NULL,
  sources_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  content_updated_at TEXT NOT NULL,
  source_version TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);
CREATE INDEX events_timeline ON events(active, sort_key DESC, id DESC);
CREATE INDEX events_day ON events(active, day, sort_key DESC, id DESC);
CREATE INDEX events_category ON events(active, category, sort_key DESC, id DESC);
CREATE TABLE event_products (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  PRIMARY KEY(product, event_id)
);
CREATE INDEX event_products_event ON event_products(event_id);

CREATE TRIGGER events_insert AFTER INSERT ON events BEGIN
  INSERT INTO event_products(event_id, product) SELECT NEW.id, value FROM json_each(NEW.products_json);
  UPDATE site_state SET revision = revision + 1 WHERE id = 1;
END;
CREATE TRIGGER events_update AFTER UPDATE ON events
WHEN OLD.content_hash != NEW.content_hash OR OLD.active != NEW.active BEGIN
  DELETE FROM event_products WHERE event_id = NEW.id;
  INSERT INTO event_products(event_id, product) SELECT NEW.id, value FROM json_each(NEW.products_json);
  UPDATE site_state SET revision = revision + 1 WHERE id = 1;
END;
