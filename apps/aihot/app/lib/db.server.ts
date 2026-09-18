import { PAGE_SIZE, PRODUCTS, TIMEZONE, timeParts, validDay, type NewsEvent, type PublicEvent } from './content';

interface Row {
	id: string;
	title: string;
	body: string;
	products_json: string;
	category: string;
	published_at: string;
	day: string;
	clock: string;
	sort_key: string;
	sources_json: string;
	content_updated_at: string;
	reset_updates_json: string | null;
}
export interface SiteState {
	revision: number;
	last_synced_at: string | null;
}
const COLUMNS = 'id,title,body,products_json,category,published_at,day,clock,sort_key,sources_json,content_updated_at,reset_updates_json';
const unpack = (r: Row): NewsEvent => ({
	id: r.id,
	title: r.title,
	body: r.body,
	products: JSON.parse(r.products_json),
	category: r.category,
	published_at: r.published_at,
	day: r.day,
	clock: r.clock,
	sort_key: r.sort_key,
	sources: JSON.parse(r.sources_json),
	content_updated_at: r.content_updated_at,
	...(r.reset_updates_json === null ? {} : { reset_updates: JSON.parse(r.reset_updates_json) }),
});

export function upsert(db: D1Database, event: PublicEvent, fingerprint: string, version: string, now: string) {
	const t = timeParts(event.published_at);
	return db
		.prepare(
			`INSERT INTO events (${COLUMNS},content_hash,source_version,active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body,
      products_json=excluded.products_json, category=excluded.category, published_at=excluded.published_at,
      day=excluded.day, clock=excluded.clock, sort_key=excluded.sort_key, sources_json=excluded.sources_json,
      reset_updates_json=excluded.reset_updates_json,
      content_updated_at=CASE WHEN events.content_hash != excluded.content_hash OR events.active=0 THEN excluded.content_updated_at ELSE events.content_updated_at END,
      content_hash=excluded.content_hash, source_version=excluded.source_version, active=1
    WHERE excluded.source_version >= events.source_version`,
		)
		.bind(
			event.id,
			event.title,
			event.body,
			JSON.stringify(event.products),
			event.category,
			t.published_at,
			t.day,
			t.clock,
			t.sort_key,
			JSON.stringify(event.sources),
			now,
			event.reset_updates === undefined ? null : JSON.stringify(event.reset_updates),
			fingerprint,
			version,
		);
}

export async function siteState(db: D1Database): Promise<SiteState> {
	return (
		(await db.prepare('SELECT revision,last_synced_at FROM site_state WHERE id=1').first<SiteState>()) ?? {
			revision: 0,
			last_synced_at: null,
		}
	);
}

export async function getEvent(db: D1Database, id: string) {
	const row = await db.prepare(`SELECT ${COLUMNS} FROM events WHERE id=? AND active=1`).bind(id).first<Row>();
	return row ? unpack(row) : null;
}

export async function listResetEvents(db: D1Database) {
	// 专用读取，不受热点首页的筛选、分页影响；限制候选数以控制响应体。
	const rows = await db.prepare(`SELECT ${COLUMNS} FROM events
		WHERE active=1 AND id IN (SELECT event_id FROM event_products WHERE product='Codex')
		AND (reset_updates_json IS NOT NULL OR title LIKE '%重置%' OR body LIKE '%重置%' OR title LIKE '%reset%' OR body LIKE '%reset%')
		ORDER BY sort_key DESC,id DESC LIMIT 501`).all<Row>();
	return { events: rows.results.slice(0, 500).map(unpack), limited: rows.results.length > 500 };
}

export interface Filters {
	q: string;
	date: string;
	product: string;
	category: string;
}
export function filtersOf(url: URL): Filters {
	const q = (url.searchParams.get('q') ?? '').trim();
	const date = url.searchParams.get('date') ?? '';
	const product = url.searchParams.get('product') ?? '';
	const category = url.searchParams.get('category') ?? '';
	if (q.length > 160 || category.length > 80 || (date && !validDay(date)) || (product && !PRODUCTS.some((p) => p === product)))
		throw new Response('筛选条件无效', { status: 400 });
	return { q, date, product, category };
}

function cursorOf(event: NewsEvent, filters: Filters) {
	return btoa(unescape(encodeURIComponent(JSON.stringify([event.sort_key, event.id, filters]))));
}

export async function listEvents(db: D1Database, url: URL) {
	const filters = filtersOf(url);
	const conditions = ['active=1'];
	const args: string[] = [];
	if (filters.date) {
		conditions.push('day=?');
		args.push(filters.date);
	}
	if (filters.category) {
		conditions.push('category=?');
		args.push(filters.category);
	}
	if (filters.product) {
		conditions.push('id IN (SELECT event_id FROM event_products WHERE product=?)');
		args.push(filters.product);
	}
	if (filters.q) {
		conditions.push("(title LIKE ? ESCAPE '\\' OR body LIKE ? ESCAPE '\\' OR sources_json LIKE ? ESCAPE '\\')");
		const q = `%${filters.q.replace(/[\\%_]/g, '\\$&')}%`;
		args.push(q, q, q);
	}
	const before = url.searchParams.get('before');
	const newer = url.searchParams.get('after');
	if (before && newer) throw new Response('分页条件无效', { status: 400 });
	const encoded = before || newer;
	if (encoded) {
		try {
			if (encoded.length > 2500) throw new Error();
			const cursor = JSON.parse(decodeURIComponent(escape(atob(encoded))));
			if (
				!Array.isArray(cursor) ||
				cursor.length !== 3 ||
				typeof cursor[0] !== 'string' ||
				typeof cursor[1] !== 'string' ||
				JSON.stringify(cursor[2]) !== JSON.stringify(filters)
			)
				throw new Error();
			conditions.push(`(sort_key,id) ${newer ? '>' : '<'} (?,?)`);
			args.push(cursor[0], cursor[1]);
		} catch {
			throw new Response('分页链接已失效，请返回最新信息', { status: 400 });
		}
	}
	const order = newer ? 'ASC' : 'DESC';
	const results = await db
		.prepare(`SELECT ${COLUMNS} FROM events WHERE ${conditions.join(' AND ')} ORDER BY sort_key ${order},id ${order} LIMIT ?`)
		.bind(...args, PAGE_SIZE + 1)
		.all<Row>();
	const events = results.results.slice(0, PAGE_SIZE).map(unpack);
	if (newer) events.reverse();
	const [cats, state] = await Promise.all([
		db.prepare('SELECT DISTINCT category FROM events WHERE active=1 ORDER BY category').all<{ category: string }>(),
		siteState(db),
	]);
	return {
		events,
		filters,
		categories: cats.results.map((c) => c.category),
		state,
		after: !!encoded,
		timezone: TIMEZONE,
		previous: events.length && (newer ? results.results.length > PAGE_SIZE : !!before) ? cursorOf(events[0], filters) : null,
		next: events.length && (newer || results.results.length > PAGE_SIZE) ? cursorOf(events[events.length - 1], filters) : null,
	};
}
