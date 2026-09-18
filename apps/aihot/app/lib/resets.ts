import { timeParts, type NewsEvent } from './content';

export const RESET_LABELS = {
	completed: '已确认重置',
	announced: '重置预告',
	hint: '相关暗示',
	cancelled: '预告已撤回',
	credit: '重置卡',
	incident: '额度异常',
	related: '相关公告',
} as const;
export type ResetKind = keyof typeof RESET_LABELS;
export interface ResetUpdate {
	kind: Exclude<ResetKind, 'related'>;
	announced_at: string;
	summary: string;
	source_url: string;
	audience?: string;
	expected_at?: string;
	expected_note?: string;
	credit_count?: number;
	credit_status?: 'announced' | 'distributed';
}
export interface ResetRecord extends Omit<ResetUpdate, 'kind' | 'source_url'> {
	id: string;
	event_id: string;
	title: string;
	summary: string;
	kind: ResetKind;
	announced_at: string;
	day: string;
	clock: string;
	source: { label: string; url: string };
}

// 已回读的历史原帖。只有关联新闻仍在公开库、且仍包含对应来源时才展示。
// 9/12 新闻的 published_at 是预告时间，完成确认必须使用后续原帖时间。
const historicalUpdates: Record<string, ResetUpdate[]> = {
	'codex-astra-usage-reset-2026-09-12': [
		{ kind: 'announced', announced_at: '2026-09-12T03:20:36Z', summary: 'Tibo 预告将提供一次 Astra 使用额度重置；原帖未明确时区，不据此推算完成时间。', source_url: 'https://x.com/thsottiaux/status/2098612714704891959' },
		{ kind: 'completed', announced_at: '2026-09-12T08:09:17Z', summary: 'Tibo 确认本轮额度重置已全部生效。', source_url: 'https://x.com/thsottiaux/status/2098685367058612394' },
	],
	'codex-astra-usage-reset-2026-09-08': [
		{ kind: 'announced', announced_at: '2026-09-07T19:24:57Z', summary: 'Tibo 预告将为所有付费订阅统一重置 Astra 使用额度。', source_url: 'https://x.com/thsottiaux/status/2097043464538264003' },
		{ kind: 'completed', announced_at: '2026-09-08T04:05:53Z', summary: 'Tibo 确认已为所有付费订阅完成本轮 Astra 使用额度重置。', source_url: 'https://x.com/thsottiaux/status/2097174560412246215' },
	],
	'codex-unexpected-usage-limit-resets-2026-09-10': [
		{ kind: 'incident', announced_at: '2026-09-09T17:29:00Z', summary: '部分 Codex 用户遇到额度意外重置；官方随后宣布服务恢复。', source_url: 'https://status.openai.com//incidents/01M23KG62KKK448RN434CQ64Z8' },
		{ kind: 'credit', credit_count: 1, credit_status: 'announced', audience: '受影响时段使用过重置卡的用户', announced_at: '2026-09-09T18:23:34Z', summary: 'Tibo 表示，在受影响时段使用过重置的用户将获补一次重置。这是补偿公告，不代表全员额度已重置。', source_url: 'https://x.com/thsottiaux/status/2097752790177370535' },
	],
};

export function resetRecords(events: NewsEvent[]): ResetRecord[] {
	const records = events.flatMap((event): ResetRecord[] => {
		if (!event.products.includes('Codex')) return [];
		const updates = event.reset_updates ?? historicalUpdates[event.id];
		if (updates) return updates.flatMap((update, i) => {
			const source = event.sources.find((s) => s.url === update.source_url);
			if (!source) return [];
			const { day, clock, published_at } = timeParts(update.announced_at);
			return [{ ...update, announced_at: published_at, id: `${event.id}-${i}`, event_id: event.id, title: event.title, day, clock, source }];
		});
		// 关键词只召回待核实线索，不把一般产品消息或否定句提升为重置预告。
		if (!/重置|\breset(?:s)?\b/i.test(`${event.title} ${event.body}`)) return [];
		return [{ id: event.id, event_id: event.id, title: event.title, summary: event.body, kind: 'related', announced_at: event.published_at, day: event.day, clock: event.clock, source: event.sources[0] }];
	});
	const unique = new Map<string, ResetRecord>();
	for (const record of records) {
		const key = `${record.source.url}|${record.kind}`;
		if (!unique.has(key)) unique.set(key, record);
	}
	return [...unique.values()].sort((a, b) => timeParts(b.announced_at).sort_key.localeCompare(timeParts(a.announced_at).sort_key) || b.id.localeCompare(a.id));
}

export function recentSince(now: string, days: number) {
	const today = timeParts(now).day;
	const start = new Date(`${today}T00:00:00Z`);
	start.setUTCDate(start.getUTCDate() - days + 1);
	return start.toISOString().slice(0, 10);
}

export function resetOverview(records: ResetRecord[], now: string, days: number) {
	const today = timeParts(now).day;
	// 非真实的未来公告不进入当前状态；仅有日期的记录按北京时间归日。
	const visible = records.filter((r) => r.clock === '仅日期' ? r.day <= today : Date.parse(r.announced_at) <= Date.parse(now));
	const latest = visible.find((r) => r.kind === 'completed') ?? null;
	const since = recentSince(now, days);
	const recent = visible.filter((r) => r.day >= since);
	const closed = new Set(visible.filter((r) => r.kind === 'completed' || r.kind === 'cancelled').map((r) => r.event_id));
	const signal = visible.find((r) =>
		(r.kind === 'announced' || r.kind === 'hint') && !closed.has(r.event_id) &&
		(!latest || timeParts(r.announced_at).sort_key > timeParts(latest.announced_at).sort_key),
	) ?? null;
	let outlook: 'unknown' | 'hint' | 'announced' | 'overdue' = 'unknown';
	if (signal) {
		outlook = signal.kind === 'hint' ? 'hint' : 'announced';
		if (signal.kind === 'announced' && signal.expected_at && Date.parse(signal.expected_at) <= Date.parse(now)) outlook = 'overdue';
	}
	// 一次发卡的预告与到账确认仅计一轮，以最新进展为准。
	const allCredits = visible.filter((r, i, all) => r.kind === 'credit' && !all.slice(0, i).some((x) => x.kind === 'credit' && x.event_id === r.event_id));
	const credits = allCredits.filter((r) => r.day >= since);
	return { latest, signal, outlook, since, recent, credits, lastCredit: allCredits[0] ?? null, visible };
}

export function groupResetRecords(records: ResetRecord[]) {
	const groups = new Map<string, ResetRecord[]>();
	for (const record of records) {
		const group = groups.get(record.event_id) ?? [];
		group.push(record);
		groups.set(record.event_id, group);
	}
	return [...groups.values()];
}
