# AFreeCoder 个人网站设计文档

> 日期：2026-05-17
> 状态：Spec（待实现）

---

## 一、项目概述

**站点性质**：独立开发者的个人主页

**核心目标**：用一个有设计感的、能持续维护的个人站点，承载基本介绍、产品/项目、文章三类内容。

**不做的事**：
- 不做变现（无 SaaS 入口、无广告、无付费墙）
- 不做大规模 SEO 投入（个人主页非媒体站）
- 不做信息聚合/RSS Reader/AI Summary 等重型内容 pipeline

**MVP 时间预算**：1 周（7 天）

**成功标准（MVP 完成）**：
- 站点已部署、可通过自定义域名访问
- 至少 2 篇文章正常显示
- 至少 2 个产品在 Products 列表展示
- 移动端可访问

---

## 二、信息架构

| 路径 | 名称 | 是否在导航 | 内容 |
|---|---|---|---|
| `/` | Home | — | 首页（紧凑分区式） |
| `/about` | About | ✓ | 完整个人介绍 |
| `/products` | Products | ✓ | 全部产品卡片网格 |
| `/writing` | Writing | ✓ | 全部文章列表 |
| `/writing/[slug]` | 文章详情 | — | MDX 渲染的单篇文章 |

> 注：原先计划的 Toolkit 模块不在本主站点承接，后续由独立三级域名承接。

顶部 Nav 仅展示：**About · Products · Writing**。

---

## 三、首页布局

整体风格：紧凑分区式（参考 idoubi.ai），首屏即可看到站点的几大板块。

### 3.1 顶部 Nav
- 左：品牌名 `AFreeCoder`（白色、600 字重、字距 0.5px）
- 右：菜单链接 `About · Products · Writing`（灰色、悬浮变白）
- 底部一条细分割线（颜色 `#1a1a1a`）

### 3.2 Hero 区（双栏 1:3）

**左侧（1/4）：身份信息**
- 头像：圆形 88×88px，深灰渐变填充，**外缘有微弱橙色光晕装饰**（方向在实现时确定）
- 姓名：`AFreeCoder`，24px，700 字重，字距 `-0.5px`
- Slogan：三行 mono 字体，橙色（`#fb923c`），格式：
  ```
  // Observing
  // Building
  // Iterating
  ```
- 简介一行：`Independent Developer / AI · 投资理财`（灰色 12px）
- 社交链接：胶囊状（圆角 999px、细边框），项目：GitHub · X · 公众号 · Email

**右侧（3/4）：About 摘要**
- 小标签：`— ABOUT`（mono 字体，10px，字距 2px，全大写，深灰色）
- 3 段中文简介（约 100 字），15px 字号、1.85 行高、最大宽度 720px
- 底部链接：`→ 更多关于我`（跳转 `/about`），mono 字体、橙色

### 3.3 Products 区

- 区段头：左侧大字 `Products`（22px 白色），右侧 mono 灰色 meta `view all →`
- 区段头上方有 1px 顶部分割线
- 内容：**2 列网格大卡片**，gap 14px
- 每卡片：
  - 背景 `#0f0f0f`，边框 1px `#1f1f1f`，圆角 8px，padding 20px 22px
  - 产品名：16px 白色 600 字重
  - 描述：13px 灰色，一行简短描述
  - 技术栈 tag：mono 字体 10px，深灰背景 `#1a1a1a`，圆角 4px，padding 3×8px
  - hover 时边框变 `#333`
- 首页展示 **4 个**产品；超出的去 `/products` 看

### 3.4 Writing 区

- 区段头同 Products 风格（标题 + meta `all posts →`）
- 内容：列表行，每行包含：
  - 日期（mono 字体、11px、深灰、固定宽 100px）
  - 标题（14px 浅灰，hover 变白）
- 每行底部细分割线
- 首页展示 **4-5 篇**最新文章

### 3.5 Footer

- 顶部细分割线
- 左：`© 2026 AFreeCoder`
- 右：`RSS · Sitemap`
- 全部 mono 字体、11px、深灰色

> ✅ 首页线框已在 brainstorming 阶段通过 visual companion 视觉确认。
> 文件：`.superpowers/brainstorm/35647-1778951603/content/homepage-v3.html`

---

## 四、内页布局

### 4.1 `/about`

完整个人介绍页。

- 顶部：头像（与首页一致或更大版本）+ 姓名
- 主体：5–8 段中文长文（包括个人经历、技术栈、关注方向、价值观等）
- 底部：联系方式 / 社交账号
- 视觉延续首页风格：黑底、橙色点缀、mono 字体的标签和元信息

### 4.2 `/products`

完整产品列表页。

- 视觉与首页 Products 区一致（2 列大卡片）
- 展示**全部**产品（含 archived 状态）
- 卡片点击 → 外链跳转到产品本体或 GitHub 仓库
- **不做产品详情页**

### 4.3 `/writing`

完整文章列表页。

- 视觉与首页 Writing 区一致（日期 + 标题列表）
- 展示**全部**文章，按 `date` 倒序
- 点击 → 进入 `/writing/[slug]`

### 4.4 `/writing/[slug]`

单篇文章详情页。

结构：
1. 标题（大字、紧字距）
2. 元信息行（mono 字体灰色）：日期 · 阅读时长
3. 正文（MDX 渲染，typography 优化、Shiki 代码高亮）
4. 底部 callout：如果 frontmatter 有 `platforms` 字段，显示"本文同步发布于 公众号 / 知乎"
5. 底部链接：返回 `/writing`

---

## 五、内容存储

### 5.1 Writing — MDX 文件

**位置**：`content/writing/*.mdx`

**Frontmatter 标准**：

```yaml
---
title: AI 时代的独立开发者，到底在做什么
date: 2026-05-12
slug: ai-indie-dev
summary: 一段摘要，列表页和首页可能用到
original_url: https://mp.weixin.qq.com/...   # 可选
platforms: [公众号, 知乎]                     # 可选
---
```

**正文**：标准 Markdown + MDX（可以嵌入 React 组件，但 MVP 不做）。

### 5.2 About — MDX 文件

**位置**：`content/about.mdx`

一个单页长文。直接在 `/about` 路由里渲染。

### 5.3 Products — TypeScript 数据文件

**位置**：`content/products.ts`

```typescript
export type Product = {
  name: string;
  description: string;       // 一行短描述
  tags: string[];            // 技术栈或分类标签
  link?: string;             // 外链
  status: 'active' | 'archived';
};

export const products: Product[] = [
  {
    name: 'API Pool',
    description: 'AI 接口聚合与转发服务',
    tags: ['SaaS', 'Next.js', 'AI'],
    link: 'https://...',
    status: 'active',
  },
  // ...
];
```

---

## 六、技术栈

| 层 | 选择 | 备注 |
|---|---|---|
| 框架 | **Next.js 15（App Router）** | 静态生成 + MDX 生态成熟 + React 组件复用性高 |
| 语言 | TypeScript | 默认 |
| 样式 | **Tailwind CSS v4** | 事实标准；v4 配置更简洁 |
| 组件库 | **shadcn/ui** | 源码复制式，可自由改 |
| MDX | **next-mdx-remote** | 灵活、支持 frontmatter |
| 代码高亮 | Shiki | next-mdx-remote 集成 |
| 字体 | Geist Sans + Geist Mono | Vercel 出品、免费 |
| 中文字体 | PingFang SC（macOS）/ 系统 fallback | 不内嵌中文 webfont（避免数 MB 加载） |
| 部署 | **Vercel** | 一键部署 + CDN |
| 域名 | 用户自有域名（暂未指定） | 起步阶段也可用 `xxx.vercel.app` |

---

## 七、视觉规范（MVP 默认值 — 实现时可整体微调）

> 第九节说"V1 不做配色/字体精修"，含义是：先按下面的默认值实现，**不投入额外时间打磨**；上线后再根据实际感受调整。本节不是不可改的硬约束。

### 配色

| 用途 | 颜色 |
|---|---|
| 背景 | `#0a0a0a` |
| 主文字 | `#e5e5e5` |
| 弱化文字 | `#888` |
| 极弱文字 / 时间戳 | `#555` |
| 强调色 | `#fb923c`（橙色） |
| 边框 / 分割线 | `#1a1a1a` ~ `#2a2a2a` |
| 卡片背景 | `#0f0f0f` |
| 卡片边框 | `#1f1f1f`（hover：`#333`） |

### 字体

- 拉丁 / 数字：Geist Sans
- 等宽（slogan、日期、tag、meta、footer）：Geist Mono
- 中文：`-apple-system, PingFang SC, sans-serif`

### 其他

- 全站默认 Dark Mode（无切换按钮）
- 单一强调色（橙色），避免多色
- 间距节奏：大板块之间 28-36px，板块内 14-22px
- 圆角：卡片 6-8px、tag 3-4px、社交链接胶囊 999px

---

## 八、MVP 范围（V1 必须完成）

### 页面
- [x] `/`、`/about`、`/products`、`/writing`、`/writing/[slug]`

### 内容
- [x] About MDX（一段较完整的自我介绍）
- [x] 至少 2 个产品在 `content/products.ts`
- [x] 至少 2 篇文章在 `content/writing/`

### 站点基础
- [x] 部署 Vercel
- [x] 域名解析
- [x] Dark mode（默认）
- [x] 移动端适配（Hero 1:3 → 单栏纵向折叠；Products 2 列 → 1 列）

### SEO 与可发现性
- [x] 每页 meta tags（title / description / OG image）
- [x] `sitemap.xml`（基于路由自动生成）
- [x] `robots.txt`（标准，允许全部）
- [x] `rss.xml`（Writing 文章订阅）
- [x] Favicon

---

## 九、V1 明确不做（留待后期）

| 项 | 推迟理由 |
|---|---|
| Hero 比例 / 字号 / 间距精修 | 结构已定，比例细节是落地时微调 |
| 配色 / 字体定制 | 上线后慢慢调；先用占位方案 |
| `/now` 页面 | 持续更新成本高，目前不需要 |
| Products 详情页 | 直接外链节省时间 |
| Writing 标签 / 分类 / 搜索 | 文章 < 20 篇时不需要 |
| 评论 / 访问统计 | 无变现需求 |
| Newsletter / RSS 转邮件 | 暂无需求 |
| 多语言 i18n | 内容以中文为主 |
| 暗色 / 亮色切换 | 默认 dark 即可 |

---

## 十、时间分配（建议）

| Day | 任务 |
|---|---|
| Day 1 | 框架搭建 + Vercel 部署跑通空壳（Next.js + Tailwind v4 + shadcn/ui + MDX 跑通） |
| Day 2 | 首页（按线框实现：Nav + Hero + Products + Writing + Footer） |
| Day 3 | About 页 + Writing 列表页 + Writing 详情页 |
| Day 4 | Products 页 + 内容填充（产品 + 至少 2 篇文章） |
| Day 5 | SEO（meta / OG / sitemap / robots / RSS / favicon） |
| Day 6 | 移动端适配 + 视觉打磨（比例、字号、间距微调） |
| Day 7 | Buffer / 上线 / 检查 |

---

## 十一、后期可扩展项

| 扩展项 | 触发时机 |
|---|---|
| Hero 视觉细节升级（动态背景、头像替换为真实照片） | MVP 上线后 |
| `/now` 页 | 想做时随时加 |
| Products 详情页 `/products/[slug]` | 某个产品需要长描述时 |
| Writing 标签 / 分类 / 全文搜索 | 文章 ≥ 20 篇 |
| Toolkit 三级域名站点 | 主站点上线后另起项目，与主站点独立 |
| 投资理财仪表盘交互组件 | Products 内部某个项目独立扩展时 |
| 暗色 / 亮色切换 | 想做时 |
| i18n（英文版） | 有海外读者诉求时 |

---

## 十二、项目目录结构（建议）

```
personal_website/
├── app/                         # Next.js App Router
│   ├── (site)/
│   │   ├── page.tsx             # /
│   │   ├── about/page.tsx       # /about
│   │   ├── products/page.tsx    # /products
│   │   └── writing/
│   │       ├── page.tsx         # /writing
│   │       └── [slug]/page.tsx  # /writing/[slug]
│   ├── rss.xml/route.ts         # RSS
│   ├── sitemap.ts               # Sitemap
│   ├── robots.ts                # Robots
│   └── layout.tsx
├── components/
│   ├── ui/                      # shadcn/ui 复制过来的组件
│   ├── site/
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── product-card.tsx
│   │   ├── writing-item.tsx
│   │   └── section-head.tsx
│   └── mdx/
│       └── mdx-components.tsx
├── content/
│   ├── about.mdx
│   ├── products.ts
│   └── writing/
│       ├── 2026-05-12-xxx.mdx
│       └── 2026-04-28-xxx.mdx
├── lib/
│   ├── writing.ts               # 读取 mdx + frontmatter
│   └── utils.ts
├── public/
│   ├── favicon.svg
│   ├── og-default.png
│   └── avatar.jpg
├── docs/superpowers/specs/      # 本文档所在位置
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 附录：参考资料

- 视觉参考：[idoubi.ai](https://idoubi.ai/)
- 首页线框（已验证）：`.superpowers/brainstorm/35647-1778951603/content/homepage-v3.html`
