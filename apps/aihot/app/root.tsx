import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from 'react-router';
import './style.css';

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
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
	return <Outlet />;
}
export function ErrorBoundary() {
	const error = useRouteError();
	const status = isRouteErrorResponse(error) ? error.status : 503;
	return (
		<main className="error-page">
			<div className="eyebrow">AI OBSERVER</div>
			<h1>{status === 404 ? '这条信息暂不可用' : '暂时无法读取信息'}</h1>
			<p>{status === 400 ? '筛选或分页链接无效，请返回最新信息。' : '你可以返回信息流，或稍后再试。'}</p>
			<a href="/">返回信息流</a>
		</main>
	);
}
