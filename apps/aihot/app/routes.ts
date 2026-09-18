import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [index('routes/home.tsx'), route('events/:id', 'routes/event.tsx'), route('codex-resets', 'routes/resets.tsx')] satisfies RouteConfig;
