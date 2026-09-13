import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

// 先配置真实 D1 再构建，防止把仅供本地验证的配置发布出去。
const configPath = new URL('../build/server/wrangler.json', import.meta.url);
const config = JSON.parse(await readFile(configPath, 'utf8'));
const database = config.d1_databases?.find((value) => value.binding === 'DB');
if (config.name !== 'afreecoder-aihot' || !database?.database_id || database.database_id === '00000000-0000-0000-0000-000000000000') {
	throw new Error('请先配置子站真实 D1 绑定并重新构建，再发布。');
}
const result = spawnSync('pnpm', ['exec', 'wrangler', 'deploy', '--config', configPath.pathname], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
