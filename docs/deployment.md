# 部署手册

本手册描述个人主站。AI 新鲜事子站使用同仓库的独立 Worker/D1，部署和同步说明见 [apps/aihot/README.md](../apps/aihot/README.md)。

## 发布目标

- 发布分支：`main`
- 发布环境：仅生产环境
- 生产地址 / 健康端点：`https://afreecoder.dev/`
- 预发环境：无
- 负责人：仓库所有者

## 触发方式

- 部署触发：push `main` 到 GitHub —— 仓库已接入 Cloudflare Workers Builds，推送后自动构建并部署（约 3 分钟；2026-06-10 验证：部署 `a507f66b`、`65b967cc` 均由推送自动产生）。
- **构建失败不会留下任何部署记录。** push 之后 `wrangler deployments list` 没有新条目，意味着构建被触发但失败了（例如超出 3 MiB 体积限制）——去 Cloudflare 控制台 → Workers Builds 查看构建历史，不要据此判断「集成没接上」（2026-06-10 曾因此误判）。
- Workers Builds 构建配置（控制台侧）：
  - Install command：`pnpm install --frozen-lockfile`
  - Build command：`pnpm run build`
  - Deploy command：`npx wrangler deploy`（2026-09-14 控制台回读并通过自动部署验证；由前一步 OpenNext build 生成产物和 Wrangler 重定向配置）
  - 根目录：`/`；构建监视路径包括 `*`、排除 `apps/aihot/**`。只修改子站目录不会触发主站构建。
  - 不要把 Build command 配成单独的 `next build`——后续部署阶段会找不到 OpenNext 编译配置而失败。
- 手动兜底部署（仅应急；下一次 push 会覆盖手动部署的版本）：

```bash
pnpm run deploy
```

（必须带 `run`：`pnpm deploy` 会撞上 pnpm 内置的 workspace deploy 子命令而报错。）

- 预期时长：构建 2–4 分钟 + 上传数秒。
- 并发 / 部署锁：无。

## 运行时架构

- 运行单元：OpenNext for Cloudflare 生成的单个 Cloudflare Worker（`afreecoder-site`），静态资源经 `ASSETS` binding 服务。
- 边缘层：Cloudflare。
- 数据库与持久存储：无。
- 缓存 / 队列 / 定时任务：无。
- 域名：`afreecoder.dev`。
- 运行时配置文件：
  - `wrangler.jsonc`（worker 名称、assets binding、observability 已开启）
  - `open-next.config.ts`（内部 Next 构建命令显式设为 `pnpm run build:next`，避免 `build` 脚本递归）
  - `next.config.ts`
  - `package.json`

## 发布前检查

push 或部署前依次执行：

```bash
pnpm test
pnpm lint
pnpm build:next
pnpm run build:cloudflare
```

然后**必须**用本地 Workers 运行时验证——`next dev` 跑在 Node 上，发现不了 Workers 独有的故障（如请求期 `node:fs` 调用、缺失模块；2026-06-10 文章页线上 500 正是这样被本地拦下的）：

```bash
npx wrangler dev --port 8787 --local
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/writing/go-file-lock
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/about
```

若有意跳过某项检查，先记录原因与残余风险再继续。

## 体积与运行时约束

- 免费版 Workers 限制：单脚本 **gzip 后 3 MiB**。2026-06-10 发布后的水位约 **2.70 MiB**——余量不足 400 KB，新增重依赖前先评估体积。
- 分析 bundle 构成：读 `.open-next/server-functions/default/handler.mjs.meta.json`（esbuild metafile），把 `inputs` 的 bytes 按包聚合。
- 已知陷阱：turbopack 会把子路径引用（如 `shiki/core`）externalize 成包主入口，OpenNext 二次打包时拖入整包（shiki 全家 253 种语言约 10 MB）。重数据（语法、文章正文）必须经生成脚本内联为自有模块：`pnpm gen:highlight`、`pnpm gen:bodies`。
- Workers 运行时**没有文件系统**：请求期代码路径禁止 `node:fs`。`layout.tsx` 使用了 `cookies()`，因此全站每个页面都是请求期动态渲染——任何页面代码都可能在线上执行。
- `pnpm sync:writing` 之后正文模块会自动重新生成（脚本已串联 `gen:bodies`）；调整高亮语言清单后跑 `pnpm gen:highlight`。生成产物均已提交进仓库，CI 构建不依赖额外生成步骤。

## 部署关键文件

每次发布前读这些文件：

- `README.md`
- `docs/deployment.md`
- `package.json`
- `wrangler.jsonc`
- `open-next.config.ts`
- `next.config.ts`

## 备份要求

- 备份触发：无运行时数据库，无需数据备份。
- 备份物：`origin/main` 上一个发布提交 + Cloudflare 历史部署版本。
- 备份位置：GitHub 历史与 Cloudflare 部署历史。
- 校验：push 前确认 `origin/main` 指向上一发布提交；确认 `wrangler deployments list` 中存在可回退的历史版本。
- 保留策略：Git 历史永久（除非重写）；Cloudflare 部署保留遵循平台策略。
- 失败含义：找不到上一提交或平台回滚目标时，停止生产部署。

## 回滚与恢复

- 最快恢复路径：Cloudflare 控制台回退到上一个 Workers 部署版本。
- 版本回滚路径：在 `main` 上 revert 发布提交并 push，等自动构建重新部署。
- 数据库恢复：不适用。
- 迁移回滚：不适用。
- 需要明确确认的操作：force-push、删除部署、改 Cloudflare 路由、轮换凭证及任何破坏性恢复动作。
- 恢复后验证：打开 `https://afreecoder.dev/`，检查关键路由，确认 Cloudflare 部署状态健康。

## 部署期间监控

- CI/CD 状态：Cloudflare 控制台 → `afreecoder-site` → Workers Builds；或轮询 `npx wrangler deployments list` 等新部署条目出现（注意：失败构建不产生条目，超时未出现要去看构建历史）。
- 版本核对：确认线上部署对应刚推送的 Git 提交。
- 健康检查：

```bash
curl -I https://afreecoder.dev/
curl -I https://afreecoder.dev/products
curl -I https://afreecoder.dev/writing
curl -I https://afreecoder.dev/writing/go-file-lock
curl -I https://afreecoder.dev/about
```

（文章详情页必查——它走动态渲染，是历史事故点。）

- 日志检查：Cloudflare Workers 日志 / 构建日志中不应出现启动、路由、资产或 OpenNext 错误。
- 资源检查：控制台无 worker 错误与部署失败。
- 业务检查：人工打开首页，确认 Hero、产品主打卡、写作精选与列表、主题切换、导航正常；抽开一篇带代码的文章确认高亮渲染。

## 成功标准

满足以下全部条件才算发布完成：

- 生产环境运行的是预期 Git 提交对应的部署。
- Cloudflare 构建 / 部署会话成功结束。
- 上一版本回滚目标可用。
- 运行时健康检查通过（含文章详情页）。
- 关键日志干净。
- 首页、产品卡、写作列表、主题切换、导航、文章代码高亮在生产环境工作正常。

## 故障处理

- 未影响线上即失败：停止，收集构建/部署日志，正向修复，不得标记发布完成。
- 已影响线上：优先用 Cloudflare 回退上一部署，再验证生产健康。
- 何时停下询问：回滚目标缺失、需要改 DNS/路由、需要 force-push、需要破坏性操作。
- 何时立即恢复：新部署已上线且核心页面可见损坏。
- 需收集的证据：失败命令、Cloudflare 构建/部署链接或时间戳、响应状态码、截图与相关日志。

## 发布后文档维护

实际流程与本文档不符时，在服务稳定后更新本文件。只记录流程、命令、检查与成功标准；不写任何密钥、令牌或敏感数据。
