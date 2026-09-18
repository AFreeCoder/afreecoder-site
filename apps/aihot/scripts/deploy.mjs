import { readFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

// 先配置真实 D1 再构建，防止把仅供本地验证的配置发布出去。
const configPath = new URL('../build/server/wrangler.json', import.meta.url);
const config = JSON.parse(await readFile(configPath, 'utf8'));
const database = config.d1_databases?.find((value) => value.binding === 'DB');
if (config.name !== 'afreecoder-aihot' || !database?.database_id || database.database_id === '00000000-0000-0000-0000-000000000000') {
	throw new Error('请先配置子站真实 D1 绑定并重新构建，再发布。');
}
// 先应用向后兼容的迁移；失败时不发布依赖新列的 Worker。
const backupDir = new URL('../.wrangler/backups/', import.meta.url);
await mkdir(backupDir, { recursive: true });
const backupPath = new URL(`before-deploy-${Date.now()}.sql`, backupDir).pathname;
const backup = spawnSync('pnpm', ['exec', 'wrangler', 'd1', 'export', 'DB', '--remote', '--output', backupPath, '--config', configPath.pathname], { stdio: 'inherit' });
if (backup.error) throw backup.error;
if (backup.status !== 0) process.exit(backup.status ?? 1);
const migration = spawnSync('pnpm', ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'DB', '--remote', '--config', configPath.pathname], { stdio: 'inherit' });
if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status ?? 1);
const result = spawnSync('pnpm', ['exec', 'wrangler', 'deploy', '--config', configPath.pathname], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
