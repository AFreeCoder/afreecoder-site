import { Link, data, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { getEvent, siteState } from '../lib/db.server';
import { Masthead, EventCard, Footer } from '../components';
import { cloudflareContext } from '../lib/context';

export async function loader({ params, context }: LoaderFunctionArgs) {
	const { env } = context.get(cloudflareContext);
	const event = await getEvent(env.DB, params.id ?? '');
	if (!event) throw new Response('信息不存在或已撤下', { status: 404 });
	const state = await siteState(env.DB);
	return data(
		{ event, state, siteUrl: env.SITE_URL, stale: !!state.last_synced_at && Date.now() - Date.parse(state.last_synced_at) > 3 * 3600000 },
		{ headers: { 'Cache-Control': 'no-store' } },
	);
}
export const meta: MetaFunction<typeof loader> = ({ loaderData: value }) =>
	value
		? [
				{ title: `${value.event.title} · AI 信息流` },
				{ name: 'description', content: value.event.body.slice(0, 150) },
				{ property: 'og:title', content: value.event.title },
				{ property: 'og:description', content: value.event.body.slice(0, 150) },
				{ property: 'og:type', content: 'article' },
				{ property: 'og:url', content: `${value.siteUrl}/events/${value.event.id}` },
				{ tagName: 'link', rel: 'canonical', href: `${value.siteUrl}/events/${value.event.id}` },
			]
		: [{ title: '信息暂不可用 · AI 信息流' }];
export default function EventPage() {
	const { event, state, stale } = useLoaderData<typeof loader>();
	return (
		<>
			<header>
				<Masthead />
				<Link to="/">← 返回信息流</Link>
			</header>
			<main>
				<div className="day">{event.day}</div>
				<EventCard event={event} detail />
			</main>
			<Footer synced={state.last_synced_at} stale={stale} />
		</>
	);
}
