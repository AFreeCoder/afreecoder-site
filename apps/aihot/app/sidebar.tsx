import { Link, NavLink, useLocation } from 'react-router';
import { ArrowUpRight, History, Radio } from 'lucide-react';

export function Sidebar() {
	const { pathname } = useLocation();
	return <aside className="sidebar">
		<Link className="sidebar-brand" to="/" aria-label="AI 新鲜事首页">
			<img src="/brand/ai-news-bird.png" width="42" height="42" alt="" />
			<span>AI 新鲜事<small>AFREECODER</small></span>
		</Link>
		<div className="nav-label">每日关注</div>
		<nav aria-label="栏目导航">
			<NavLink to="/" end className={({ isActive }) => isActive || pathname.startsWith('/events/') ? 'active' : ''}><Radio size={18} aria-hidden="true" />AI 热点动态</NavLink>
			<NavLink to="/codex-resets"><History size={18} aria-hidden="true" />Codex 重置监控</NavLink>
		</nav>
		<a className="sidebar-home" href="https://afreecoder.dev">AFreeCoder<ArrowUpRight size={15} aria-hidden="true" /></a>
	</aside>;
}
