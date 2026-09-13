import { Link } from 'react-router';
import { formatSync, type NewsEvent } from './lib/content';

export function Masthead() {
	return (
		<>
			<div className="eyebrow">
				AI OBSERVER{' '}
				<a className="home-link" href="https://afreecoder.dev">
					← AFreeCoder
				</a>
			</div>
			<h1>
				<Link to="/">AI 信息流</Link>
			</h1>
			<p>OpenAI 与 Anthropic · 官网、更新日志及官方与员工动态。</p>
		</>
	);
}
export function EventCard({ event, detail = false }: { event: NewsEvent; detail?: boolean }) {
	return (
		<article id={event.id}>
			<div className="time">
				<time dateTime={event.published_at}>{event.clock}</time>
			</div>
			<div>
				<h2>{detail ? event.title : <Link to={`/events/${event.id}`}>{event.title}</Link>}</h2>
				<div className="tags">
					{event.products.join(' / ')} · {event.category}
				</div>
				<p className="body">{event.body}</p>
				<div className="sources">
					<span>{event.sources.length} 个出处</span>
					{event.sources.map((s, i) => (
						<a key={`${s.url}-${i}`} href={s.url} target="_blank" rel="noopener noreferrer">
							{s.label}
						</a>
					))}
				</div>
			</div>
		</article>
	);
}
export function Footer({ synced, stale }: { synced: string | null; stale: boolean }) {
	return (
		<footer>
			<p>
				最近同步：{formatSync(synced)}（UTC+8）{stale ? ' · 更新暂有延迟，当前展示已同步内容。' : ''}
			</p>
			<p>仅标注日期的来源不虚构具体时分；它们列在对应日期的末尾。</p>
			<p>信息由 AI 根据公开来源整理，原文链接可供核对。</p>
		</footer>
	);
}
