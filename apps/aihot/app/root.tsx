import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from 'react-router';
import './style.css';
import { Sidebar } from './sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#3c614c" />
				<meta property="og:site_name" content="AI 新鲜事" />
				<link rel="icon" type="image/png" href="/brand/ai-news-bird.png" />
				<link rel="apple-touch-icon" href="/brand/ai-news-bird.png" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
export default function App() {
	return <><a className="skip-link" href="#page-content">跳至主要内容</a><Sidebar /><div className="page-shell" id="page-content" tabIndex={-1}><Outlet /></div></>;
}
export function ErrorBoundary() {
	const error = useRouteError();
	const status = isRouteErrorResponse(error) ? error.status : 503;
	return (
		<main className="error-page">
			<div className="eyebrow">AI 新鲜事 · AI NEWS</div>
			<h1>{status === 404 ? '这条信息暂不可用' : '暂时无法读取信息'}</h1>
			<p>{status === 400 ? '筛选或分页链接无效，请返回最新信息。' : '你可以返回首页，或稍后再试。'}</p>
			<a href="/">返回 AI 新鲜事</a>
		</main>
	);
}
