import { afterAll, beforeAll, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
let server: Server;
let directory: string;
let url: string;
let failNext = false;
const payloads: Array<{ events: Array<{ id: string; body: string }>; withdraw: string[]; snapshot_at: string }> = [];

beforeAll(async () => {
	directory = await mkdtemp(join(tmpdir(), 'aihot-sync-test-'));
	server = createServer(async (request, response) => {
		let body = '';
		for await (const chunk of request) body += chunk;
		const payload = JSON.parse(body);
		payloads.push(payload);
		if (failNext) {
			failNext = false;
			response.writeHead(503);
			response.end();
			return;
		}
		response.setHeader('Content-Type', 'application/json');
		response.end(
			JSON.stringify({
				accepted: payload.events.map((e: { id: string }) => e.id),
				withdrawn: payload.withdraw,
				snapshot_at: payload.snapshot_at,
				revision: 1,
			}),
		);
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	if (!address || typeof address === 'string') throw new Error('本地测试服务未启动');
	url = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
	await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
	await rm(directory, { recursive: true, force: true });
});

it('同步保留失败批次，重试后跳过重复，撤下不会被普通同步恢复', async () => {
	const input = join(directory, 'events.json');
	const state = join(directory, 'state.json');
	await writeFile(
		input,
		JSON.stringify({
			events: [
				{
					id: 'event-one',
					title: '公开标题',
					body: '公开正文',
					products: ['Codex'],
					category: '产品更新',
					published_at: '2026-09-14',
					sources: [{ label: '来源', url: 'https://example.com', materials: ['/private/material'] }],
					private_path: '/private/source',
				},
			],
		}),
	);
	const run = (...args: string[]) =>
		exec(
			process.execPath,
			[new URL('../scripts/sync.mjs', import.meta.url).pathname, '--input', input, '--state', state, '--url', url, ...args],
			{ env: { ...process.env, AIHOT_PUBLISH_TOKEN: 'test-only-token' } },
		);
	failNext = true;
	await expect(run()).rejects.toThrow();
	const failed = payloads[0];
	expect(JSON.stringify(failed)).not.toContain('/private/');
	expect(JSON.parse(await readFile(state, 'utf8')).pending).not.toBeNull();
	await run();
	expect(payloads[1]).toEqual(failed);
	expect(JSON.parse(await readFile(state, 'utf8')).pending).toBeNull();
	const unchanged = await run();
	expect(JSON.parse(unchanged.stdout).sent).toBe(0);
	await run('--withdraw', 'event-one');
	await run();
	expect(payloads.at(-1)?.events).toEqual([]);
	expect(JSON.parse(await readFile(state, 'utf8')).withdrawn['event-one']).toBe(true);
	await run('--restore', 'event-one');
	expect(payloads.at(-1)?.events[0].id).toBe('event-one');
	expect(JSON.parse(await readFile(state, 'utf8')).withdrawn['event-one']).toBeUndefined();
});
