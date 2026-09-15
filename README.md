# AFreeCoder Site

AFreeCoder 的个人站点（[afreecoder.dev](https://afreecoder.dev)）：独立开发者的名片站，展示正在构建的产品与写作存档。

技术栈：Next.js 16 App Router · Tailwind CSS v4（仅作设计 token 层，样式为手写 CSS）· 自研轻量 Markdown 渲染 + shiki 代码高亮 · OpenNext for Cloudflare 部署到 Cloudflare Workers。

## 本地开发

```bash
pnpm install
pnpm dev
```

开发服务默认在 [http://localhost:3000](http://localhost:3000)。

注意：`next dev` 跑在 Node 运行时，**模拟不了 Workers 运行时的限制**（如不可用的 `node:fs`）。验证 Workers 行为用：

```bash
pnpm run build:cloudflare
npx wrangler dev --port 8787 --local
```

## 常用命令

```bash
pnpm lint                # ESLint
pnpm test                # Vitest（组件 + 内容守护测试）
pnpm run build:next      # 仅 Next.js build，检查 App Router 产物
pnpm run build:cloudflare # OpenNext build，生成 .open-next/ Workers 产物
pnpm preview             # 本地预览 Workers 运行时
pnpm run deploy          # 手动构建并部署（应急用；注意必须带 run，
                         # `pnpm deploy` 会撞上 pnpm 内置的 workspace 子命令）
pnpm sync:writing        # 从笔记库同步文章（自动串联 gen:bodies）
pnpm gen:bodies          # 重新生成文章正文模块
pnpm gen:highlight       # 重新生成代码高亮语法/主题数据
```

## 部署

push `main` 到 GitHub 即自动触发 Cloudflare Workers Builds 部署（约 3 分钟）。完整发布流程、体积约束、回滚路径见 [docs/deployment.md](docs/deployment.md)。

AI 新鲜事子站位于 [apps/aihot](apps/aihot/README.md)，使用独立依赖、Worker 与 D1 配置。两站分别构建、部署和回滚；子站的本地启动、数据同步及首次上线配置见该目录说明。

## 目录结构

```
app/                  # App Router 页面（主页 / about / products / writing）+ globals.css
components/site/      # 站点组件（Hero、边栏、主打卡、精选文章、时间线等，均带测试）
content/              # 内容数据
  about.ts            #   关于页结构化内容（lead / 轨迹 / 关注）
  products.ts         #   产品清单
  writing/*.md        #   文章 Markdown 原文
  writing-posts.ts    #   文章 meta 索引（生成）
  writing-bodies.ts   #   文章正文模块（生成）
lib/                  # 渲染与工具（mdx 解析、shiki 高亮、主题方案）
  highlight-data.ts   #   高亮语法/主题数据（生成）
scripts/              # 内容与数据生成脚本
docs/deployment.md    # 部署手册
```

## 内容维护

Cloudflare Workers 运行时**没有文件系统**，请求期代码不能用 `node:fs` 读 Markdown。站点把全部内容作为 TS 模块随应用打包：

- About：`content/about.ts`（结构化数据：lead 段落、轨迹时间线、现在关注）
- Writing 原文：`content/writing/*.md`（仅作为生成源，运行时不读取）
- Writing meta 索引：`content/writing-posts.ts`（生成，勿手改）
- Writing 正文模块：`content/writing-bodies.ts`（生成，勿手改）

历史文章通过 `pnpm sync:writing` 生成：脚本以本地笔记库 `40_outbox/published` 里的 Markdown 为正文源，再用 `AFreeCoder/AFreeCoder.github.io` 的 `local-search.xml` 对齐历史 slug、发布日期、原文 URL 和 OSS 图片链接。能匹配到本地 Markdown 的文章会保留本地正文，只替换图片地址；匹配不到的旧文章会从 GitHub Pages HTML 兜底还原为 Markdown。同步完成后会自动重新生成 `writing-bodies.ts`。

## 代码高亮

文章代码块用 shiki 高亮（vitesse 双主题随站点明暗切换）。实现上有一个重要约束：

- 运行时只依赖 `@shikijs/core` + `@shikijs/engine-javascript`（JS 正则引擎，无 wasm）；
- 语法与主题 JSON 由 `pnpm gen:highlight` 内联生成到 `lib/highlight-data.ts`。

**不要直接依赖 `shiki` 聚合包或在运行时代码 import `@shikijs/langs/*`**：turbopack 会把子路径引用 externalize 成包主入口，OpenNext 二次打包时会把 253 种语言全量打进 worker，直接超出 3 MiB 部署限制（踩过的坑，详见 docs/deployment.md）。

需要支持新语言时：修改 `scripts/generate-highlight-data.mjs` 的 `LANGS` 清单，跑 `pnpm gen:highlight`，并确认 worker 体积仍在限内。

## 设计系统

全站样式走 `app/globals.css` 的 CSS 变量 token 体系：深色为默认值（`@theme`），浅色经 `html[data-color-scheme="light"]` 覆盖。要点：

- 双色相：琥珀为主（产品线），青色为辅（写作线），色彩即导航；
- 边栏是两种模式下恒定深色的 espresso 浮动面板，作为浅色模式的对比锚点；
- 浅色模式靠重墨、实色色块与卡片投影建立层次，不照搬深色的「亮色发光」策略；
- 明暗主题由 cookie + `data-color-scheme` 驱动，默认浅色（`lib/color-scheme.ts`）。

改样式时优先复用既有 token，新增颜色先问「属于产品线还是写作线」。
