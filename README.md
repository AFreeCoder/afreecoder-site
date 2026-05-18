# AFreeCoder Site

AFreeCoder 的个人站点，使用 Next.js 16 App Router、Tailwind CSS v4、轻量 Markdown 渲染和 OpenNext for Cloudflare Workers。

## 本地开发

```bash
pnpm install
pnpm dev
```

开发服务默认在 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
pnpm lint          # ESLint
pnpm test          # Vitest
pnpm run build:next # 仅执行 Next.js build，检查 App Router 产物
pnpm build         # OpenNext build，生成 Cloudflare Workers 产物
pnpm preview       # 本地预览 Cloudflare Workers runtime
pnpm deploy        # 构建并部署到 Cloudflare Workers
```

## Cloudflare Workers 部署

当前项目不是纯 `next build` 产物，部署到 Cloudflare Workers 前必须先运行 OpenNext 构建，生成 `.open-next/.build/open-next.config.edge.mjs` 和 `.open-next/worker.js`。

Cloudflare Workers Builds 推荐配置：

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Deploy command: `npx @opennextjs/cloudflare deploy`

当前 Cloudflare 日志里的 `npx wrangler deploy` 也会检测到 OpenNext 项目并委托到 `opennextjs-cloudflare deploy`；只要 build 阶段已经生成 `.open-next`，它不再会因为缺少编译配置失败。直接使用 `npx @opennextjs/cloudflare deploy` 更明确。

也可以直接使用仓库脚本：

```bash
pnpm deploy
```

不要把 Cloudflare 的构建命令配置成单独的 `next build`。如果只运行 `next build`，后续部署阶段会找不到 OpenNext 编译配置并报错。

实现细节：`opennextjs-cloudflare build` 默认会调用项目的 `build` 脚本来执行 Next build。为了避免 `build` 脚本递归，`open-next.config.ts` 显式把 OpenNext 内部的 Next 构建命令设为 `pnpm run build:next`。

## 内容维护

Cloudflare Workers 运行时不能依赖 Node.js 文件系统读取本地 Markdown，也不适合在请求期编译 MDX。当前站点把 About 和 Writing 内容作为 Markdown 字符串随应用一起打包：

- About：`content/about.ts`
- Writing 原文：`content/writing/*.md`
- Writing 运行时索引：`content/writing-posts.ts`

历史文章通过 `pnpm sync:writing` 生成：脚本以本地笔记库 `40_outbox/published` 里的 Markdown 为正文源，再用 `AFreeCoder/AFreeCoder.github.io` 的 `local-search.xml` 对齐历史 slug、发布日期、原文 URL 和 OSS 图片链接。能匹配到本地 Markdown 的文章会保留本地正文，只替换图片地址；匹配不到的旧文章会从 GitHub Pages HTML 兜底还原为 Markdown。

修改源笔记或重新对齐图片后，运行 `pnpm sync:writing` 重新生成 `content/writing/*.md` 和 `content/writing-posts.ts`。不要直接手改 `content/writing-posts.ts`，它会被脚本覆盖。
