import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const state = fileURLToPath(new URL('../.wrangler/state', import.meta.url));
const child = spawn(
	'pnpm',
	['exec', 'wrangler', 'dev', '--config', 'build/server/wrangler.json', '--persist-to', state, '--port', '8788'],
	{ cwd: root, stdio: 'inherit' },
);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 1));
