import { Form, Link, data, useLoaderData, useNavigation, useSearchParams, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { useEffect, useState } from 'react';
import { Masthead, EventCard, Footer } from '../components';
import { listEvents } from '../lib/db.server';
import { PRODUCTS } from '../lib/content';
import { cloudflareContext } from '../lib/context';

export const meta: MetaFunction = () => [
	{ title: 'AI 信息流 · AFreeCoder' },
	{ name: 'description', content: 'OpenAI、ChatGPT、Codex、Claude 与 Claude Code 动态。完整中文信息、公开来源与时间流。' },
	{ tagName: 'link', rel: 'canonical', href: 'https://aihot.afreecoder.dev/' },
];
export async function loader({ request, context }: LoaderFunctionArgs) {
	const result = await listEvents(context.get(cloudflareContext).env.DB, new URL(request.url));
	return data(
		{ ...result, stale: !!result.state.last_synced_at && Date.now() - Date.parse(result.state.last_synced_at) > 3 * 3600000 },
		{ headers: { 'Cache-Control': 'no-store' } },
	);
}
export default function Home() {
	const result = useLoaderData<typeof loader>();
	const { events, filters, categories, state, next, previous, after, stale } = result;
	const [params] = useSearchParams();
	const navigation = useNavigation();
	const [newContent, setNewContent] = useState(false);
	const formKey = JSON.stringify(filters);
	useEffect(() => {
		setNewContent(false);
		const controller = new AbortController();
		const timer = setInterval(async () => {
			if (document.visibilityState !== 'visible') return;
			try {
				const response = await fetch('/api/status', { signal: controller.signal, cache: 'no-store' });
				if (response.ok) {
					const latest = (await response.json()) as { revision: number };
					if (latest.revision !== state.revision) setNewContent(true);
				}
			} catch {
				/* 不以检查失败打断阅读，下次继续检查。 */
			}
		}, 60000);
		return () => {
			clearInterval(timer);
			controller.abort();
		};
	}, [state.revision]);
	const href = (updates: Record<string, string | null>) => {
		const p = new URLSearchParams(params);
		for (const [key, value] of Object.entries(updates)) {
			if (value) p.set(key, value);
			else p.delete(key);
		}
		return `/?${p.toString()}`;
	};
	return (
		<>
			<header>
				<Masthead />
				<Form key={formKey} method="get" className="toolbar" role="search">
					<input
						name="q"
						type="search"
						aria-label="搜索信息"
						placeholder="搜索标题、正文或来源…"
						maxLength={160}
						defaultValue={filters.q}
					/>
					<input type="date" name="date" aria-label="按日期筛选" defaultValue={filters.date} />
					<select name="category" aria-label="按类别筛选" defaultValue={filters.category}>
						<option value="">全部类别</option>
						{categories.map((c) => (
							<option key={c}>{c}</option>
						))}
					</select>
					<input type="hidden" name="product" value={filters.product} />
					<button type="submit">筛选</button>
					{(filters.q || filters.date || filters.category) && (
						<Link className="clear" to={href({ q: null, date: null, category: null, before: null, after: null })}>
							清除筛选
						</Link>
					)}
				</Form>
				<nav className="filters" aria-label="产品筛选">
					{['', ...PRODUCTS].map((product) => (
						<Link
							key={product}
							to={href({ product, before: null, after: null })}
							className={product === filters.product ? 'selected' : ''}
							aria-current={product === filters.product ? 'true' : undefined}
						>
							{product || '全部产品'}
						</Link>
					))}
				</nav>
				<p className="count" role="status" aria-live="polite">
					{navigation.state !== 'idle' ? '正在读取…' : `本页 ${events.length} 条独立信息 · 时间倒序 · UTC+8`}
				</p>
				{newContent && (
					<a className="new-content" href={href({ before: null, after: null })}>
						有新内容，点击刷新
					</a>
				)}
			</header>
			<main aria-busy={navigation.state !== 'idle'}>
				{events.length ? (
					events.map((event, i) => (
						<section key={event.id}>
							{(!i || events[i - 1].day !== event.day) && <div className="day">{event.day}</div>}
							<EventCard event={event} />
						</section>
					))
				) : (
					<p id="empty">{state.last_synced_at ? '没有符合条件的信息，试试其他关键词或筛选条件。' : '信息正在准备中，稍后再来看看。'}</p>
				)}
				<nav className="pagination" aria-label="信息分页">
					{previous && <Link to={href({ after: previous, before: null })}>← 上一页</Link>}
					{after && <Link to={href({ before: null, after: null })}>返回最新</Link>}
					{next && <Link to={href({ before: next, after: null })}>下一页 →</Link>}
				</nav>
			</main>
			<Footer synced={state.last_synced_at} stale={stale} />
		</>
	);
}
