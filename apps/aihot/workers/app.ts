import { createRequestHandler, RouterContextProvider } from 'react-router';
import { publish } from '../app/lib/publish.server';
import { listEvents, siteState } from '../app/lib/db.server';

import { cloudflareContext } from '../app/lib/context';

const handler = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE);

export default {
	async fetch(request, env, ctx) {
		try {
			const url = new URL(request.url);
			let response: Response;
			if (url.pathname === '/internal/publish') response = await publish(request, env.DB, env.PUBLISH_TOKEN);
			else if (!['GET', 'HEAD'].includes(request.method)) response = new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
			else if (url.pathname === '/api/status') response = Response.json(await siteState(env.DB));
			else if (url.pathname === '/api/events') response = Response.json(await listEvents(env.DB, url));
			else if (url.pathname === '/robots.txt')
				response = new Response('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /internal/\n', {
					headers: { 'Content-Type': 'text/plain; charset=utf-8' },
				});
			else {
				const context = new RouterContextProvider();
				context.set(cloudflareContext, { env, ctx });
				response = await handler(request, context);
			}
			const headers = new Headers(response.headers);
			headers.set('X-Content-Type-Options', 'nosniff');
			headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
			headers.set('Cache-Control', 'no-store');
			return new Response(request.method === 'HEAD' ? null : response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		} catch (error) {
			if (error instanceof Response) return error;
			console.error(
				JSON.stringify({
					event: 'request_failed',
					path: new URL(request.url).pathname,
					type: error instanceof Error ? error.name : 'unknown',
				}),
			);
			return new Response('暂时无法读取信息，请稍后重试。', {
				status: 503,
				headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
			});
		}
	},
} satisfies ExportedHandler<Env>;
