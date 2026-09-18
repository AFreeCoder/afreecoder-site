# AI 新鲜事

个人网站同仓库的独立子站，目标域名为 `aihot.afreecoder.dev`。保留原采集任务的时间流样式，使用 TypeScript、React Router SSR、Vite、Cloudflare Workers 和 D1。主站仍使用根目录的 Next.js / OpenNext 配置。

已于 2026-09-14 上线到 https://aihot.afreecoder.dev ，使用独立 Worker 和 D1。主站与子站均已连接同一 GitHub 仓库的独立 Workers Builds 流程；生产数据与发布密钥不进 Git。

## 数据与页面

- Python 采集任务继续产出已整理的事件；本应用不重新采集或调用模型。
- 同步脚本只上传事件 ID、标题、完整中文正文、产品、类别、发布时间和公开来源链接。材料路径、采集覆盖、飞书信息、原始采集记录不进入公开库。
- D1 每条事件独立保存；同一 ID 修订覆盖内容。按内容指纹识别重复，旧批次重试不会覆盖更新的版本。
- 首页和 API 每页最多 20 条，按发布时间及 ID 使用游标分页；上一页、下一页切换时替换列表。搜索及日期、产品、类别筛选在数据库执行，不只筛选当前页。
- 列表保留全文，单条正文上限 12,000 字符。首页请求大小受单页限制；总历史量不会全量下载到浏览器。全文搜索当前用 LIKE，历史数据显著增长后应按实际延迟考虑 FTS，不预先引入搜索服务。
- 每分钟检查一个小型版本接口，有变化显示刷新入口，阅读中不自动插入新闻。每次同步成功都会更新同步时间；超过三小时未同步显示延迟提示，继续展示已有数据。
- HTML 在 Worker 服务端渲染；静态资源由 Workers Assets 服务；详情页包含标题、描述和 canonical。暂不需要服务器、R2 或外部数据库。

## 本地运行

以下命令均在 `apps/aihot` 目录执行，需要 Node 22.22+（推荐 Node 24）和 pnpm 10。

```bash
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars
# 将 .dev.vars 中的占位 PUBLISH_TOKEN 替换成随机本地令牌。
pnpm db:local
pnpm dev
```

开发地址为 `http://localhost:5178`。验证生产产物在另一个终端执行：

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

生产产物预览地址为 `http://localhost:8788`。迁移、开发与预览均使用应用目录下的 `.wrangler/state`；预览脚本显式固定此位置，避免生成配置改用另一套空数据库。

## 导入与后续同步

支持采集任务的 `flow/store.json`（events 字典）或 `events.json`（events 数组）。首次上传所有已整理事件，此后仅发送公开字段变化。不要将原始文件复制进仓库。

```bash
# 只查看投影数量，不上传；不是完整的服务端校验。
pnpm sync --input /absolute/path/to/flow/store.json --dry-run

# 首批本地导入；重复执行会跳过未变化事件。
pnpm sync --input /absolute/path/to/flow/store.json \
  --url http://localhost:8788 --token-file .dev.vars
```

现有“每小时采集 AI 信息并推送飞书”任务在**完成事件整理**后执行已安装的同步脚本，网站和飞书分别记录成败。脚本安装于 `~/.local/share/ai-news-collect/website/sync.mjs`，不依赖开发 worktree 或 pnpm；发布脚本有变更时应同步更新这一副本。手动同步使用子站 HTTPS 地址，用单独 `--state` 区分目标。密钥通过环境变量 `AIHOT_PUBLISH_TOKEN` 或权限为 600 的纯令牌文件传入；不要写入命令参数、URL、日志或仓库。Worker 对应 secret 名为 `PUBLISH_TOKEN`。

脚本每批最多 40 条并限制字节数，服务端每批事务提交。网络失败保留待处理批次及原快照时间，下次执行优先重试；不需要重新采集。`.sync` 状态文件含公开事件的待重试内容，按私有本地文件保存。单个目标只运行一个同步进程，调度端避免并发启动。

```bash
# 显式撤下已发布事件，状态文件会记住撤下标记。
pnpm sync --input /absolute/path/to/flow/store.json \
  --url http://localhost:8788 --token-file .dev.vars --withdraw event-id

# 确认恢复时显式指定，输入中必须仍包含该事件。
pnpm sync --input /absolute/path/to/flow/store.json \
  --url http://localhost:8788 --token-file .dev.vars --restore event-id
```

缺少某条输入不会自动删库。撤下标记存在同步状态文件中，后续普通同步不会自动恢复；保留该文件。如果需要换机器，应连同状态文件迁移，或先从输入中移除已撤下信息，避免将其当作新的公开事件。

## 两条独立部署流程

采用同一个 GitHub 仓库、两个 Workers Builds 项目，各自发布和回滚。

| 配置 | 个人主站 | AI 新鲜事 |
| --- | --- | --- |
| Worker | `afreecoder-site` | `afreecoder-aihot` |
| 根目录 | 仓库根目录 | `apps/aihot` |
| 安装 | `pnpm install --frozen-lockfile` | `pnpm install --frozen-lockfile` |
| 构建 | 现有 `pnpm run build` | `pnpm typecheck && pnpm test && pnpm build` |
| 发布 | `npx wrangler deploy` | `pnpm run deploy` |
| 构建监视路径 | 排除 `apps/aihot/**` | 仅包含 `apps/aihot/**` |
| 数据 | 现有编译期内容 | 独立 D1 |

上表已在控制台保存。两站生产分支均为 `main`，预览分支构建均关闭；子站构建环境 `NODE_VERSION=24`。主站的有效部署说明见根目录 `docs/deployment.md`，该文档中的“无数据库”仅指主站。

重建环境或接管部署时的顺序：

1. 创建 `afreecoder-aihot` D1，将 ID 写入本目录 `wrangler.jsonc`；远程应用 `migrations/0001_events.sql`。已有环境直接复用配置中的 ID，不重复创建。
2. 为子站配置 `PUBLISH_TOKEN` secret，构建并部署到独立 Worker。绑定 `aihot.afreecoder.dev` custom domain，确认 HTTPS 可用。不要把主站现有域名移到子站。
3. 使用独立状态文件导入已有事件；验证首批条数、重复同步、筛选分页、详情、来源及未授权发布被拒绝。
4. 设置两条 Workers Builds 的目录和监视路径，子站使用 Node 24；保留主站原配置。子站数据同步不触发代码重建。
5. 将同步命令接入既有采集任务，并观察一次后续同步成功。最后发布主站导航入口，避免入口先指向未上线站点。

发布前记录上一 Worker 版本；修改已有远程数据库前用 D1 export 留存备份。本次迁移仅新增表，不包含删除。回滚代码使用对应 Worker 历史版本，不会回滚 D1 数据；内容错误通过同 ID 修订或显式撤下处理。生产验收以实际域名页面、API、数据回执和部署版本为准。

首批线上导入 220 条已整理事件，随后重复同步为 0 条。正式同步状态位于 `~/.local/share/ai-news-collect/website/state.json`，密钥由同目录权限为 600 的文件提供。初始 D1 SQL 备份保存在该目录的 `backups` 下；它与同步状态均不进入 Git。

## Codex 重置监控

`/codex-resets` 与原有 AI 热点动态共享左侧导航，仍在本子站独立部署。首屏回答下一次重置是否有明确消息、近期每名符合条件用户获得几张重置卡；发卡统计默认近 7 天，可切换近 30 天。下方历史记录独立展示全部时间范围内最近 30 件事件，可按额度重置或重置卡筛选，不受发卡统计周期限制。没有明确公告时显示未知，不用历史间隔预测日期。个人账户的周期重置时间和卡片余额仍以 Codex 内显示为准。

监控复用已发布新闻。普通关键词命中仅显示“相关公告”；经原帖核实后，在采集事件中补充可选 `reset_updates` 数组，同步脚本只投影下列公开字段：

```json
{
  "reset_updates": [{
    "kind": "credit",
    "announced_at": "2026-09-09T18:23:34Z",
    "summary": "受影响时段使用过重置的用户将获补一次重置。",
    "source_url": "https://x.com/thsottiaux/status/2097752790177370535",
    "audience": "受影响时段使用过重置卡的用户",
    "credit_count": 1,
    "credit_status": "announced"
  }]
}
```

- `kind` 支持 `announced`（预告）、`completed`（确认完成）、`hint`（暗示）、`cancelled`（撤回预告）、`credit`（发卡）、`incident`（异常）。`announced_at` 使用该条原帖时间，不能拿前一条预告时间当完成时间。
- `source_url` 必须出现在同一新闻的公开 `sources` 中。`audience` 说明适用范围；不要把定向补偿写成全员发放。
- 预告可带 `expected_at`（明确且带时区的时间）或 `expected_note`（原文时间窗口）。逾期但未确认时显示“等待完成确认”，不自动算已重置。
- 发卡可带 `credit_count`（每位符合条件用户的张数）和 `credit_status`（`announced` / `distributed`）。同一轮预告和完成记录保持同一事件 ID，避免重复计数；不同人群的张数不相加。
- 未升级的采集端不传该字段时保留库中已核实记录；显式传 `[]` 清除记录。删除来源链接或撤下新闻后，对应记录不再展示。
- `0003_reset_history.sql` 将三条既有新闻的核实记录写入 D1，并补录 11 件 8 月至 9 月的历史事件，共 19 条新增原帖进展。公开补录材料位于 `data/reset-history.json`。`app/lib/resets.ts` 中的三条兼容注解仅在数据库未提供结构化记录、且原新闻与来源仍存在时启用。新消息需要继续核实并产出结构化字段；本应用不直接抓取 X，也不将“相关公告”自动升级成确认。

上线需先应用 `0002_reset_updates.sql`（仅新增可空列）。`pnpm deploy` 先导出 D1 到发布环境的 `.wrangler/backups/`，再执行远程迁移；备份或迁移失败即停止发布。临时构建环境的备份文件需从构建环境另行留存，D1 还会在迁移前自动生成恢复点。迁移成功后旧 Worker 仍兼容该列。首次升级前按原流程备份 D1，并同步更新外部采集任务安装的 `scripts/sync.mjs` 副本。本地验收不访问远程数据库。
