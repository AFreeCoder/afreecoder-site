import type { ResetUpdate } from './resets';

export const PRODUCTS = ['OpenAI', 'Codex', 'ChatGPT', 'Anthropic', 'Claude', 'Claude Code'] as const;
export const TIMEZONE = 'Asia/Singapore';
export const PAGE_SIZE = 20;

export interface PublicEvent {
	id: string;
	title: string;
	body: string;
	products: string[];
	category: string;
	published_at: string;
	sources: { label: string; url: string }[];
	reset_updates?: ResetUpdate[];
}

export interface NewsEvent extends PublicEvent {
	day: string;
	clock: string;
	sort_key: string;
	content_updated_at: string;
}

export function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('数据必须是对象');
	return value as Record<string, unknown>;
}

function text(value: unknown, name: string, max: number): string {
	if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${name} 缺失或过长`);
	return value.trim();
}

export function validId(value: unknown): string {
	const id = text(value, '信息 ID', 160);
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('信息 ID 格式不正确');
	return id;
}

export function validDay(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function timeParts(value: string) {
	if (validDay(value)) return { published_at: value, day: value, clock: '仅日期', sort_key: `${value}T00:00:00.000|0` };
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) || !/(Z|[+-]\d{2}:\d{2})$/.test(value) || !validDay(value.slice(0, 10)))
		throw new Error('发布时间需要有效日期和时区');
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) throw new Error('发布时间无效');
	const local = new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString();
	return {
		published_at: date.toISOString(),
		day: local.slice(0, 10),
		clock: local.slice(11, 16),
		sort_key: `${local.slice(0, 10)}T${local.slice(11, 23)}|1`,
	};
}

// 白名单重建，内部路径、材料引用和投递回执不会进入公开数据。
export function publicEvent(value: unknown): PublicEvent {
	const v = record(value);
	if (!Array.isArray(v.products) || !v.products.length || v.products.length > 6) throw new Error('缺少产品分类');
	const products = [...new Set(v.products.map((p) => text(p, '产品', 40)))].sort();
	if (products.some((p) => !PRODUCTS.some((known) => known === p))) throw new Error('未知产品');
	if (!Array.isArray(v.sources) || !v.sources.length || v.sources.length > 30) throw new Error('缺少来源或来源过多');
	const sources = v.sources
		.map((item) => {
			const source = record(item);
			const url = new URL(text(source.url, '来源网址', 2048));
			if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('来源必须是公开网页链接');
			return { label: text(source.label, '来源名称', 120), url: url.href };
		})
		.sort((a, b) => a.url.localeCompare(b.url));
	let reset_updates: ResetUpdate[] | undefined;
	if (v.reset_updates !== undefined) {
		if (!products.includes('Codex') || !Array.isArray(v.reset_updates) || v.reset_updates.length > 20)
			throw new Error('重置记录仅适用于 Codex，每条信息最多 20 条');
		reset_updates = v.reset_updates.map((item) => {
			const update = record(item);
			if (!['completed', 'announced', 'hint', 'cancelled', 'credit', 'incident'].includes(String(update.kind))) throw new Error('重置记录类型无效');
			const source_url = text(update.source_url, '重置原帖', 2048);
			if (!sources.some((s) => s.url === source_url)) throw new Error('重置原帖必须在信息来源中');
			if (update.credit_count !== undefined && (update.kind !== 'credit' || !Number.isInteger(update.credit_count) || Number(update.credit_count) < 1 || Number(update.credit_count) > 100))
				throw new Error('发卡数量必须为 1–100 的整数，且只用于发卡记录');
			if (update.credit_status !== undefined && (update.kind !== 'credit' || !['announced', 'distributed'].includes(String(update.credit_status)))) throw new Error('发卡进展无效');
			let expected_at: string | undefined;
			if (update.expected_at !== undefined) {
				if (update.kind !== 'announced') throw new Error('只有明确预告能设置预计时间');
				expected_at = timeParts(text(update.expected_at, '预计时间', 60)).published_at;
				if (validDay(expected_at)) throw new Error('预计时间需要明确时区；模糊窗口请用 expected_note');
			}
			return {
				kind: update.kind as ResetUpdate['kind'],
				announced_at: timeParts(text(update.announced_at, '公告时间', 60)).published_at,
				summary: text(update.summary, '重置说明', 1200),
				source_url,
				...(update.audience === undefined ? {} : { audience: text(update.audience, '适用人群', 240) }),
				...(expected_at === undefined ? {} : { expected_at }),
				...(update.expected_note === undefined ? {} : { expected_note: text(update.expected_note, '预计时间说明', 240) }),
				...(update.credit_count === undefined ? {} : { credit_count: Number(update.credit_count) }),
				...(update.credit_status === undefined ? {} : { credit_status: update.credit_status as 'announced' | 'distributed' }),
			};
		});
	}
	return {
		id: validId(v.id),
		title: text(v.title, '标题', 240),
		body: text(v.body, '正文', 12000),
		products,
		category: text(v.category, '类别', 80),
		published_at: timeParts(text(v.published_at, '发布时间', 60)).published_at,
		sources,
		...(reset_updates === undefined ? {} : { reset_updates }),
	};
}

export async function hash(value: unknown) {
	const bytes = new TextEncoder().encode(JSON.stringify(value));
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, '0')).join('');
}

export function formatSync(value: string | null) {
	if (!value) return '尚未同步';
	const d = new Date(new Date(value).getTime() + 8 * 60 * 60 * 1000).toISOString();
	return `${d.slice(0, 10)} ${d.slice(11, 16)}`;
}
