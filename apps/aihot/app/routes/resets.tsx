import { Link, data, useLoaderData, useNavigation, useRevalidator, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { useEffect, useState } from 'react';
import { Flame, ArrowUpRight, ArrowRight, Check, ChevronDown, Clock3, Radio, Ticket, RefreshCw, Info } from 'lucide-react';
import { cloudflareContext } from '../lib/context';
import { listResetEvents, siteState } from '../lib/db.server';
import { formatSync, timeParts } from '../lib/content';
import { groupResetRecords, RESET_LABELS, resetOverview, resetRecords, type ResetRecord } from '../lib/resets';

export const meta: MetaFunction = () => [
	{ title: 'Codex 重置监控 · AI 新鲜事' },
	{ name: 'description', content: '下一次 Codex 额度何时重置？近期发过几张重置卡？查看公开预告、发放范围与最新进展。' },
	{ tagName: 'link', rel: 'canonical', href: 'https://aihot.afreecoder.dev/codex-resets' },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
	const params = new URL(request.url).searchParams;
	const period = params.get('days') ?? '7';
	const filter = params.get('type') ?? 'all';
	if (!['7', '30'].includes(period) || !['all', 'reset', 'credit'].includes(filter)) throw new Response('筛选条件无效', { status: 400 });
	const [{ events, limited }, state] = await Promise.all([listResetEvents(context.get(cloudflareContext).env.DB), siteState(context.get(cloudflareContext).env.DB)]);
	const now = new Date().toISOString();
	const overview = resetOverview(resetRecords(events), now, Number(period));
	const matches = (r: ResetRecord) => filter === 'all' || (filter === 'credit' ? r.kind === 'credit' : ['completed', 'announced', 'hint', 'cancelled'].includes(r.kind));
	// 摘要与记录同源；单次事件中的旧预告仍可展开，避免把一次重置拆成两次。
	const allGroups = groupResetRecords(overview.visible);
	const historyGroups = allGroups.filter((group) => group.some(matches));
	const age = overview.latest ? Math.floor((Date.parse(`${timeParts(now).day}T00:00Z`) - Date.parse(`${overview.latest.day}T00:00Z`)) / 86400000) : null;
	return data({
		...overview, visible: undefined, recent: undefined, days: Number(period), filter, limited, state, age,
		historyGroups: historyGroups.slice(0, 30),
		moreRecords: historyGroups.length > 30,
		stale: !state.last_synced_at || Date.now() - Date.parse(state.last_synced_at) > 3 * 3600000,
	}, { headers: { 'Cache-Control': 'no-store' } });
}

const dayLabel = (day: string) => `${Number(day.slice(5, 7))} 月 ${Number(day.slice(8))} 日`;
const stamp = (r: ResetRecord) => `${dayLabel(r.day)}${r.clock === '仅日期' ? '' : ` ${r.clock}`}`;
const creditStage = (r: ResetRecord) => r.credit_status === 'distributed' ? '已确认发放' : r.credit_status === 'announced' ? '宣布发放' : '发放进展待核实';
function SourceLink({ record }: { record: ResetRecord }) {
	return <a href={record.source.url} target="_blank" rel="noopener noreferrer">{record.source.label} 原帖<ArrowUpRight size={13} aria-hidden="true" /></a>;
}
function CreditLine({ record }: { record: ResetRecord }) {
	return <div className="credit-line">
		<div className={`credit-quantity${record.credit_count ? '' : ' unknown'}`} aria-label={record.credit_count ? `每人 ${record.credit_count} 张重置卡` : '数量未明确'}>{record.credit_count ? <><Flame size={30} aria-hidden="true" /><b>+{record.credit_count}</b></> : <span>待定</span>}</div>
		<time className="credit-date" dateTime={record.announced_at}><span>{dayLabel(record.day)}</span><small>{record.clock === '仅日期' ? record.day.slice(0, 4) : record.clock}</small></time>
		<div className="credit-copy"><strong>{record.audience ?? '适用范围见原帖'}</strong><div className="credit-details"><span>{creditStage(record)}</span><SourceLink record={record} /></div></div>
	</div>;
}
function EventRow({ records }: { records: ResetRecord[] }) {
	const latest = records[0];
	const count = records.filter((r) => r.kind === 'credit').length;
	return <section className="monitor-event" id={latest.event_id}>
		<div className="event-date"><span>{dayLabel(latest.day)}</span><small>{latest.clock === '仅日期' ? latest.day.slice(0, 4) : latest.clock}</small></div>
		<div className="event-copy"><div className="event-kicker"><span className={`status ${latest.kind}`}>{latest.kind === 'completed' && <Check size={12} aria-hidden="true" />}{latest.kind === 'credit' ? creditStage(latest) : RESET_LABELS[latest.kind]}</span>{latest.audience && <span>{latest.audience}</span>}</div>
			<h3>{latest.kind === 'credit' && latest.credit_count ? `每名符合条件用户 ${latest.credit_count} 张重置卡` : latest.kind === 'completed' ? '本轮额度重置已确认完成' : latest.title}</h3>
			<p>{latest.summary.length > 260 ? `${latest.summary.slice(0, 260)}…` : latest.summary}</p>
			<div className="event-links"><SourceLink record={latest} /><Link to={`/events/${latest.event_id}`}>完整动态<ArrowUpRight size={13} aria-hidden="true" /></Link></div>
			{records.length > 1 && <details className="event-evidence"><summary>查看本次 {records.length} 条进展<ChevronDown size={13} aria-hidden="true" /></summary><ol>{[...records].reverse().map((record) => <li key={record.id}><div><time dateTime={record.announced_at}>{record.day} {record.clock}</time><span className={`status ${record.kind}`}>{record.kind === 'credit' ? creditStage(record) : RESET_LABELS[record.kind]}</span></div><p>{record.summary}</p><SourceLink record={record} /></li>)}</ol>{count > 1 && <p>同一次发放的进展合并记录，不重复累计张数。</p>}</details>}
		</div>
	</section>;
}

export default function Resets() {
	const result = useLoaderData<typeof loader>();
	const { days, filter, latest, signal, outlook, credits, lastCredit, historyGroups, state, stale, age } = result;
	const navigation = useNavigation();
	const revalidator = useRevalidator();
	const [changed, setChanged] = useState(false);
	const [checkFailed, setCheckFailed] = useState(false);
	useEffect(() => {
		setChanged(false);
		setCheckFailed(false);
		const controller = new AbortController();
		const timer = setInterval(async () => {
			if (document.visibilityState !== 'visible') return;
			try {
				const response = await fetch('/api/status', { signal: controller.signal, cache: 'no-store' });
				if (!response.ok) throw new Error('status unavailable');
				const next = await response.json() as { revision: number; last_synced_at: string | null };
				setCheckFailed(false);
				if (next.revision !== state.revision) setChanged(true);
				else void revalidator.revalidate(); // 同步时刻和预告到期状态也需要更新。
			} catch { if (!controller.signal.aborted) setCheckFailed(true); }
		}, 60000);
		return () => { clearInterval(timer); controller.abort(); };
	}, [state.revision, state.last_synced_at, revalidator.revalidate]);
	const href = (d = days, f = filter) => `/codex-resets?days=${d}&type=${f}`;
	const heading = outlook === 'announced' ? (signal?.expected_at ? `${dayLabel(timeParts(signal.expected_at).day)} ${timeParts(signal.expected_at).clock}` : '已有重置预告') : outlook === 'overdue' ? '仍在等待完成确认' : outlook === 'hint' ? '有新动向，时间未定' : '暂无明确预告';
	const badge = outlook === 'announced' ? '官方已预告' : outlook === 'overdue' ? '预告窗口已过' : outlook === 'hint' ? '尚非明确预告' : '持续监控中';
	return <>
		<header className="watch-heading"><div><div className="watch-eyebrow">CODEX / RESET WATCH</div><h1 className="page-title">Codex 重置监控</h1><p>额度重置预告、重置卡发放与最新进展</p></div><div className="watch-timezone">北京时间 · UTC+8<br /><span>公开公告持续整理</span></div></header>
		<main className="reset-watch" aria-busy={navigation.state !== 'idle' || revalidator.state !== 'idle'}>
			{changed && <button className="new-content refresh-button" onClick={() => void revalidator.revalidate()}><RefreshCw size={15} aria-hidden="true" />有新的重置动向，点击更新</button>}
			{(stale || checkFailed) && <p className="watch-warning" role="status"><Info size={15} aria-hidden="true" />{checkFailed ? '暂时无法检查更新，以下保留已同步记录。' : state.last_synced_at ? '数据同步暂有延迟，以下为上次同步的公开记录。' : '公开记录尚未同步，暂时无法判断最新进展。'}</p>}
			<div className="watch-grid">
				<div className="reset-summary">
				<section className="outlook-card" aria-label="下一次额度重置预告">
					<div className="card-eyebrow"><span><Radio size={16} aria-hidden="true" />下一次额度重置预告</span><span className={`outlook-badge${!signal ? ' monitoring' : ''}`}>{badge}</span></div>
					<h2>{heading}</h2>
					<p className="outlook-description">{signal ? signal.summary : '重置时间待公布，有新消息即更新。'}</p>
					{signal?.expected_note && <p className="expected-note">原帖时间说明：{signal.expected_note}</p>}
					{signal?.audience && <p className="expected-note">适用范围：{signal.audience}</p>}
					{signal && <div className="outlook-links"><SourceLink record={signal} /><span>{stamp(signal)} 发布</span></div>}
				</section>
				<section className="latest-reset" aria-label="最近一次重置">
					<div className="card-eyebrow"><span><Clock3 size={16} aria-hidden="true" />最近一次重置</span>{latest && <span className="status completed"><Check size={12} aria-hidden="true" />已确认重置</span>}</div>
					{latest ? <>
						<div className="latest-reset-time"><h2><time dateTime={latest.announced_at}>{stamp(latest)}</time></h2><span>{age === 0 ? '今天' : `${age} 天前`}</span></div>
						<p>{latest.summary}</p>
						<div className="latest-reset-source"><span>{latest.audience || '以原帖说明的适用范围为准'}</span><a href={latest.source.url} target="_blank" rel="noopener noreferrer">查看确认原帖<ArrowUpRight size={14} aria-hidden="true" /></a></div>
					</> : <><h2>暂无确认记录</h2><p>尚未收录额度重置完成的公开确认。</p></>}
				</section>
				</div>
				<section className="credit-card" aria-label="近期重置卡">
					<div className="credit-heading"><h2><Ticket size={18} aria-hidden="true" />近期重置卡</h2><nav className="period-tabs" aria-label="近期范围">{[7, 30].map((d) => <Link key={d} preventScrollReset to={href(d)} aria-current={days === d ? 'true' : undefined}>近 {d} 天</Link>)}</nav></div>
					{credits.length ? <><p className="credit-lead">已收录 <b>{credits.length}</b> 次发卡公告</p><div className="credit-list">{credits.slice(0, 3).map((record) => <CreditLine record={record} key={record.id} />)}</div>{credits.length > 3 && <Link className="more-credits" to={`${href(days, 'credit')}#reset-updates`}>查看本期全部发卡<ArrowRight size={13} /></Link>}</> : <><div className="no-credits"><Ticket size={28} strokeWidth={1.2} aria-hidden="true" /><h3>近 {days} 天暂无新发卡记录</h3><p>发卡消息收录后会在这里显示。</p></div>{lastCredit && <div className="last-credit"><span>最近一次发卡消息</span><CreditLine record={lastCredit} /></div>}</>}
					<p className="credit-footnote">数量为每名符合条件用户获发张数，到账以 Codex 为准。</p>
				</section>
			</div>
			<div className="watch-meta"><span><Clock3 size={13} aria-hidden="true" />最近数据同步：{formatSync(state.last_synced_at)}</span><a href="https://chatgpt.com/codex/cloud/settings/analytics#usage" target="_blank" rel="noopener noreferrer">查看我的 Codex 用量<ArrowUpRight size={13} aria-hidden="true" /></a></div>
			<section className="updates-section" id="reset-updates" aria-label="历史记录">
				<div className="updates-heading"><div><h2>历史记录</h2><p>额度重置与重置卡发放记录，按时间倒序排列</p></div><nav className="update-tabs" aria-label="记录类型">{[['all', '全部'], ['reset', '额度重置'], ['credit', '重置卡']].map(([value, label]) => <Link key={value} preventScrollReset to={href(days, value)} aria-current={filter === value ? 'true' : undefined}>{label}</Link>)}</nav></div>
				<div className="event-list" key={filter}>{historyGroups.length ? historyGroups.map((records) => <EventRow key={records[0].event_id} records={records} />) : <div className="watch-empty"><Radio size={24} strokeWidth={1.2} aria-hidden="true" /><h3>暂无{filter === 'credit' ? '重置卡' : filter === 'reset' ? '额度重置' : '相关'}记录</h3><p>已核实的公开记录会在这里持续补充。</p></div>}</div>
				{result.moreRecords && <p className="history-limit">当前展示最近 30 件已收录事件。</p>}
			</section>
			<details className="watch-method"><summary><Info size={14} aria-hidden="true" />信息来源与统计口径<ChevronDown size={13} aria-hidden="true" /></summary><p>本站跟进公开公告，不读取个人账户。重置卡发放与直接恢复额度分开记录；预告和完成确认合并为同一次事件。个人周期恢复时间以账户用量页为准。</p><p>公告时间统一换算为北京时间。仅有日期时不补造时分；未明确时区的预告保留原文说明，不推算精确时刻。关键词命中的消息标为「相关公告」，不会自动认定已经重置。</p><p>数据同步时间表示网站收到新数据的时间，不等于所有来源均已核验。历史仍在补录，暂无记录不代表一定没有发生；本站不据此计算重置概率。</p>{(result.limited || result.moreRecords) && <p>当前仅展示最近 500 条候选信息、当前类型最多 30 件事件，更早记录可能未包含。</p>}</details>
		</main>
		<footer className="watch-footer"><span>AI 新鲜事 · 关注每一次新变化</span><span>非 OpenAI 官方页面 · 以原帖及账户实际显示为准</span></footer>
	</>;
}
