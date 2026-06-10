# 设计改版（P0+P1）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把已定稿的设计预览（/tmp/afreecoder-design-preview.html，2026-06-10 与站主多轮迭代确认）落到真实代码：双色相 token、espresso 浮动边栏、首页 Hero、产品主打卡、写作精选区。

**Architecture:** 全部走现有 CSS 变量体系（globals.css 的 @theme 深色默认 + `html[data-color-scheme="light"]` 覆盖）；组件层新增 HomeHero / FeaturedProductCard / WritingFeatured 三个展示组件，SectionHead 加序号 props，Sidebar 加 NOW 块与统计行。不引入新依赖、不动路由结构。默认主题已是 light（lib/color-scheme.ts），无需改动。

**Tech Stack:** Next 16 App Router（文档见 node_modules/next/dist/docs/，`fill`+`sizes` 的 next/image 与 `await cookies()` 用法已对照确认不变）、Tailwind v4 仅作变量层、vitest + renderToStaticMarkup 组件测试。

**设计定稿参数（来源：预览稿 + 站主拍板）：**
- 浅色：bg 纯白 `#FFFFFF`、fg `#16140F`、muted `#645F56`、rule `rgba(28,25,18,.10)`/strong `.22`、accent `#C2410C`、accent-2 `#0E7A63`、彩色用实色填充 chip（青底白字/焦橙底白字）、卡片投影两层、hero 关键词琥珀马克笔。
- 深色：bg `#0D0C0A`、card `#16140E`、fg `#ECE9E2`、muted `#9A958B`、accent `#E08948`、accent-2 `#4CC2A5`、chip 用软底色字、无投影、截图滤镜 `brightness(.92) saturate(.88)`。
- 边栏：两种模式恒定 espresso 浮动面板 `#1A1610`、圆角 18px、四周 16px 边距（≤600px 为 12px）、浅色下加投影；含 NOW 块（琥珀左线）与「产品 N · 文章 M」统计行。
- 主打卡：截图收进完整描边 10px 圆角容器，四周等距 20px，**无浏览器顶栏**，不垫托盘色。
- 区块标题：mono 序号（01 琥珀 / 02 青）替代橙色短杠。
- a11y：日期/编号小字用 fg-muted（dim 仅装饰）、全局 :focus-visible 焦点环。
- 提交策略：所有任务完成并验证后统一征求站主意见，过程中不做 git commit。

---

### Task 1: 颜色 token 与基础层（globals.css）

**Files:**
- Modify: `app/globals.css:7-37`（@theme + light 块）
- Modify: `app/globals.css:62-67`（::selection 后补 :focus-visible）

- [ ] **Step 1: 替换 @theme 与 light 覆盖块**

```css
@theme {
  --color-bg:            #0d0c0a;
  --color-bg-elevated:   #14120d;
  --color-bg-card:       #16140e;
  --color-bg-card-hover: #1c1912;
  --color-fg:            #ece9e2;
  --color-fg-muted:      #9a958b;
  --color-fg-dim:        #6e6a61;
  --color-rule:          rgba(255, 255, 255, 0.08);
  --color-rule-strong:   rgba(255, 255, 255, 0.17);
  --color-accent:        #e08948;
  --color-accent-soft:   rgba(224, 137, 72, 0.12);
  --color-accent-2:      #4cc2a5;
  --color-accent-2-soft: rgba(76, 194, 165, 0.13);
  --color-chip-bg:       rgba(224, 137, 72, 0.12);
  --color-chip-fg:       #e08948;
  --color-chip-2-bg:     rgba(76, 194, 165, 0.13);
  --color-chip-2-fg:     #4cc2a5;
  --color-featpost-bg:     rgba(76, 194, 165, 0.055);
  --color-featpost-border: rgba(76, 194, 165, 0.30);
  --color-k-mark:        transparent;

  /* 边栏：两种模式恒定的 espresso 面板 */
  --color-sb-bg:     #1a1610;
  --color-sb-card:   #262017;
  --color-sb-fg:     #ece9e2;
  --color-sb-muted:  #9a958b;
  --color-sb-dim:    #6e6a61;
  --color-sb-rule:   rgba(255, 255, 255, 0.09);
  --color-sb-border: rgba(255, 255, 255, 0.06);
  --color-sb-accent: #e08948;

  --font-sans: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI",
               "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, "SF Mono", Menlo, monospace;
}

:root {
  --shadow-card: none;
  --shadow-sidebar: none;
  --shot-filter: brightness(0.92) saturate(0.88);
}

html[data-color-scheme="light"] {
  --color-bg:            #ffffff;
  --color-bg-elevated:   #ffffff;
  --color-bg-card:       #ffffff;
  --color-bg-card-hover: #f7f7f6;
  --color-fg:            #16140f;
  --color-fg-muted:      #645f56;
  --color-fg-dim:        #8f8b82;
  --color-rule:          rgba(28, 25, 18, 0.10);
  --color-rule-strong:   rgba(28, 25, 18, 0.22);
  --color-accent:        #c2410c;
  --color-accent-soft:   rgba(194, 65, 12, 0.10);
  --color-accent-2:      #0e7a63;
  --color-accent-2-soft: rgba(14, 122, 99, 0.11);
  --color-chip-bg:       #c2410c;
  --color-chip-fg:       #fff7f0;
  --color-chip-2-bg:     #0e7a63;
  --color-chip-2-fg:     #f0faf7;
  --color-featpost-bg:     #ffffff;
  --color-featpost-border: rgba(14, 122, 99, 0.38);
  --color-k-mark:        rgba(194, 65, 12, 0.16);
  --shadow-card: 0 1px 2px rgba(28, 25, 18, 0.04), 0 10px 28px rgba(28, 25, 18, 0.07);
  --shadow-sidebar: 0 2px 6px rgba(28, 25, 18, 0.08), 0 16px 36px rgba(28, 25, 18, 0.13);
  --shot-filter: none;
}
```

- [ ] **Step 2: ::selection 之后新增焦点环**

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 3: 跑 `pnpm test` 确认全绿（CSS 不影响测试，防回归基线）**

### Task 2: espresso 浮动边栏（CSS + Sidebar 组件 + siteConfig + layout）

**Files:**
- Modify: `lib/site-config.ts`（新增 now 配置）
- Modify: `components/site/sidebar.tsx`（NOW 块 + stats props）
- Create: `components/site/sidebar.test.tsx`
- Modify: `app/layout.tsx`（计算并传 stats）
- Modify: `app/globals.css`（.app-shell/.app-sidebar/sidebar pieces/移动端断点）

- [ ] **Step 1: siteConfig 加 now**

```ts
  now: {
    building: "APIPool",
    link: "https://apipool.dev",
    note: "对产品合作与交流开放",
  },
```
（插在 `taglines` 之后，`socials` 之前。）

- [ ] **Step 2: 写失败测试 components/site/sidebar.test.tsx**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("renders the NOW block from siteConfig", () => {
    const html = renderToStaticMarkup(<Sidebar scheme="light" />);
    expect(html).toContain("sidebar-now");
    expect(html).toContain("正在构建 APIPool");
    expect(html).toContain("对产品合作与交流开放");
  });

  it("renders stats line when provided", () => {
    const html = renderToStaticMarkup(
      <Sidebar scheme="light" stats={{ products: 4, posts: 67 }} />,
    );
    expect(html).toContain("产品 4 · 文章 67");
  });

  it("omits stats line when not provided", () => {
    const html = renderToStaticMarkup(<Sidebar scheme="light" />);
    expect(html).not.toContain("sidebar-stats");
  });
});
```

- [ ] **Step 3: 跑 `pnpm test sidebar` 确认失败（sidebar-now 不存在）**

- [ ] **Step 4: 改 Sidebar 组件**

在 `<p className="sidebar-tagline">` 之后、`<SocialRow>` 之前插入；props 加 `stats?: { products: number; posts: number }`：

```tsx
      <div className="sidebar-now">
        <span className="sidebar-now-label">NOW</span>
        <span className="sidebar-now-line">正在构建 {siteConfig.now.building}</span>
        <span className="sidebar-now-sub">{siteConfig.now.note}</span>
      </div>
      {stats && (
        <p className="sidebar-stats">
          产品 {stats.products} · 文章 {stats.posts}
        </p>
      )}
```

- [ ] **Step 5: layout.tsx 传 stats**

```tsx
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";
// RootLayout 内：
const posts = await getAllWriting();
const activeProducts = products.filter((p) => p.status === "active").length;
<Sidebar scheme={scheme} stats={{ products: activeProducts, posts: posts.length }} />
```

- [ ] **Step 6: 跑 `pnpm test` 确认全绿**

- [ ] **Step 7: 改 globals.css 边栏段**

`.app-shell` 列宽 `290px` → `306px`；`.app-sidebar` 整体替换为浮动面板（含 sb 变量、圆角、投影、border）；`.sidebar-name` 32px；`.sidebar-bio/.sidebar-tagline` 用 `--color-sb-muted`；avatar/social/colophon/toggle 改用 sb 变量；新增 `.sidebar-now*`、`.sidebar-stats`；1023/600 断点改 margin 12px 面板 + ≤600 隐藏 now/stats（紧凑头部网格保持现状结构）。完整 CSS：

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 306px 1fr;
}

.app-sidebar {
  position: sticky;
  top: 16px;
  align-self: start;
  height: calc(100vh - 32px);
  overflow: hidden auto;
  margin: 16px 0 16px 16px;
  padding: 30px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: var(--color-sb-bg);
  color: var(--color-sb-fg);
  border: 1px solid var(--color-sb-border);
  border-radius: 18px;
  box-shadow: var(--shadow-sidebar);
}

.sidebar-avatar {
  width: 180px;
  height: 180px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-sb-card);
  border: 1px solid var(--color-sb-rule);
}
/* .sidebar-avatar img 保持现状 */

.sidebar-name {
  font-size: 32px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: var(--color-sb-fg);
  margin-top: 4px;
  line-height: 1.1;
}
.sidebar-bio { font-size: 14.5px; color: var(--color-sb-muted); line-height: 1.6; }
.sidebar-tagline { font-size: 13.5px; color: var(--color-sb-muted); letter-spacing: 0.01em; }

.sidebar-now {
  background: rgba(224, 137, 72, 0.10);
  border-left: 2px solid var(--color-sb-accent);
  padding: 10px 13px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sidebar-now-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-sb-accent);
}
.sidebar-now-line { font-size: 13.5px; color: var(--color-sb-fg); }
.sidebar-now-sub { font-size: 12.5px; color: var(--color-sb-muted); }

.sidebar-stats {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-sb-muted);
  letter-spacing: 0.03em;
  margin: 0;
}

/* social-link / scheme-toggle / sidebar-colophon: bg/边框/文字换 sb 变量，hover 色 var(--color-sb-accent) */
```

断点：

```css
@media (max-width: 1023px) {
  .app-shell { grid-template-columns: 1fr; }
  .app-sidebar {
    position: static;
    height: auto;
    margin: 12px;
    border-radius: 16px;
    padding: 24px;
    gap: 16px;
  }
  .app-main { padding: 28px 24px 64px; }
}

@media (max-width: 600px) {
  .app-sidebar {
    display: grid;
    grid-template-columns: 76px 1fr;
    align-items: center;
    gap: 9px 14px;
    padding: 18px 20px 16px;
  }
  .sidebar-now, .sidebar-stats { display: none; }
  /* 其余 600px 内规则保持现状（avatar 76px、colophon 全宽等） */
}
```

- [ ] **Step 8: `pnpm test` 全绿 + dev server 肉眼确认边栏面板两种模式**

### Task 3: SectionHead 序号

**Files:**
- Modify: `components/site/section-head.test.tsx`（新增断言）
- Modify: `components/site/section-head.tsx`
- Modify: `app/globals.css`（删 `.section-head-title::before` 短杠，加 `.section-head-num`）

- [ ] **Step 1: 加失败测试**

```tsx
  it("renders mono index with tone class when num is provided", () => {
    const html = renderToStaticMarkup(
      <SectionHead title="写作" num="02" tone="accent-2" />,
    );
    expect(html).toContain("section-head-num--accent-2");
    expect(html).toContain("02");
  });

  it("omits index span when num is not provided", () => {
    const html = renderToStaticMarkup(<SectionHead title="关于" />);
    expect(html).not.toContain("section-head-num");
  });
```

- [ ] **Step 2: 跑测试确认失败 → 实现组件**

```tsx
type Props = {
  title: string;
  num?: string;
  tone?: "accent" | "accent-2";
  metaHref?: string;
  metaLabel?: string;
};

export function SectionHead({ title, num, tone = "accent", metaHref, metaLabel }: Props) {
  return (
    <header className="section-head">
      <h2 className="section-head-title">
        {num && <span className={`section-head-num section-head-num--${tone}`}>{num}</span>}
        {title}
      </h2>
      {metaHref && metaLabel && (
        <Link href={metaHref} className="section-head-meta">
          {metaLabel} →
        </Link>
      )}
    </header>
  );
}
```

- [ ] **Step 3: CSS——删除 `.section-head-title::before` 块，新增：**

```css
.section-head-num {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.1em;
  color: var(--color-accent);
}
.section-head-num--accent-2 { color: var(--color-accent-2); }
```
（`.section-head-title` 的 `gap: 14px` 保留作序号与标题间距；600px 内 `::before` 宽度覆写一并删除。）

- [ ] **Step 4: `pnpm test` 全绿**

### Task 4: 首页 Hero

**Files:**
- Create: `components/site/home-hero.tsx`
- Create: `components/site/home-hero.test.tsx`
- Modify: `app/page.tsx`（删"关于我"区，顶部放 HomeHero）
- Modify: `app/globals.css`（.hero 系列 + 点阵纹理；删除 `.about-block--home` 相关可保留给 about 页用——`.about-block` 本体保留）

- [ ] **Step 1: 失败测试 home-hero.test.tsx**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeHero } from "./home-hero";
import type { WritingMeta } from "@/lib/types";

const post: WritingMeta = {
  title: "财务自由实证#26——高层火灾如何逃生？",
  date: "2022-12-06",
  slug: "invest-practice-26",
  readingTime: 14,
};

describe("HomeHero", () => {
  it("renders statement, accent keyword and now status", () => {
    const html = renderToStaticMarkup(<HomeHero latestPost={post} />);
    expect(html).toContain("hero-title");
    expect(html).toContain("自由");
    expect(html).toContain("正在构建");
    expect(html).toContain("APIPool");
  });

  it("links the latest post", () => {
    const html = renderToStaticMarkup(<HomeHero latestPost={post} />);
    expect(html).toContain('href="/writing/invest-practice-26"');
    expect(html).toContain("财务自由实证#26");
  });

  it("omits latest-post fragment when not provided", () => {
    const html = renderToStaticMarkup(<HomeHero />);
    expect(html).not.toContain("最近写了");
  });
});
```

- [ ] **Step 2: 实现组件**

```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { WritingMeta } from "@/lib/types";

type Props = { latestPost?: WritingMeta };

export function HomeHero({ latestPost }: Props) {
  return (
    <header className="hero">
      <h1 className="hero-title">
        构建 AI 产品，
        <br />
        用代码追求<em className="hero-k">自由</em>。
      </h1>
      <p className="hero-sub">
        我是 {siteConfig.name}，一名独立开发者。这里记录我正在构建的产品，和构建过程中的思考。
      </p>
      <p className="hero-status">
        <span className="hero-status-dot" aria-hidden="true" />
        <span>
          正在构建{" "}
          <a href={siteConfig.now.link} target="_blank" rel="noreferrer">
            {siteConfig.now.building}
          </a>
        </span>
        {latestPost && (
          <>
            <span className="hero-status-sep">·</span>
            <span>
              最近写了《
              <Link href={`/writing/${latestPost.slug}`} className="hero-status-post">
                {latestPost.title}
              </Link>
              》
            </span>
          </>
        )}
      </p>
    </header>
  );
}
```

- [ ] **Step 3: CSS**

```css
.hero { position: relative; padding: 26px 0 10px; margin-bottom: 64px; }
.hero::before {
  content: "";
  position: absolute;
  inset: -30px -50px 0 -50px;
  pointer-events: none;
  background-image: radial-gradient(var(--color-rule-strong) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  -webkit-mask-image: radial-gradient(ellipse 75% 95% at 28% 15%, #000, transparent 72%);
  mask-image: radial-gradient(ellipse 75% 95% at 28% 15%, #000, transparent 72%);
}
.hero > * { position: relative; }
.hero-title {
  font-size: 46px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-fg);
}
.hero-k {
  color: var(--color-accent);
  font-style: normal;
  box-shadow: inset 0 -0.22em 0 var(--color-k-mark);
}
.hero-sub { font-size: 17px; color: var(--color-fg-muted); margin: 14px 0 0; max-width: 660px; }
.hero-status {
  margin: 24px 0 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-fg-muted);
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  letter-spacing: 0.01em;
}
.hero-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-accent-2); flex: none; }
.hero-status a { color: var(--color-fg); border-bottom: 1px solid var(--color-rule-strong); transition: color .15s, border-color .15s; }
.hero-status a:hover { color: var(--color-accent-2); border-bottom-color: var(--color-accent-2); }
.hero-status-sep { color: var(--color-fg-dim); }
.hero-status-post {
  display: inline-block;
  max-width: 24ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
@media (max-width: 1023px) { .hero-title { font-size: 34px; } }
@media (max-width: 600px)  { .hero-title { font-size: 30px; } .hero { margin-bottom: 48px; } }
```

- [ ] **Step 4: page.tsx 接入（完整新版见 Task 6 Step 3，本步先替换"关于我" section 为 `<HomeHero latestPost={posts[0]} />`）**

- [ ] **Step 5: `pnpm test` 全绿**

### Task 5: 产品主打卡

**Files:**
- Create: `components/site/featured-product-card.tsx`
- Create: `components/site/featured-product-card.test.tsx`
- Modify: `app/globals.css`（.feat-product 系列 + .product-card 投影 + .products-grid--secondary）
- Modify: `app/page.tsx`

- [ ] **Step 1: 失败测试**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FeaturedProductCard } from "./featured-product-card";
import type { Product } from "@/lib/types";

const sample: Product = {
  name: "APIPool",
  description: "AI API 聚合与转发服务。",
  screenshot: "/product-screenshots/apipool-card.png",
  role: "SaaS",
  phase: "线上运行",
  highlight: "把多模型 API、账户池和请求排查收束成一套可维护的服务入口。",
  tags: ["API", "AI", "SaaS"],
  link: "https://apipool.dev",
  status: "active",
};

describe("FeaturedProductCard", () => {
  it("renders name, badge, highlight and hostname link", () => {
    const html = renderToStaticMarkup(<FeaturedProductCard product={sample} />);
    expect(html).toContain("APIPool");
    expect(html).toContain("主打");
    expect(html).toContain("把多模型 API");
    expect(html).toContain("apipool.dev ↗");
    expect(html).toContain('href="https://apipool.dev"');
  });

  it("renders the screenshot inside the framed shot area", () => {
    const html = renderToStaticMarkup(<FeaturedProductCard product={sample} />);
    expect(html).toContain("feat-product-shot");
    expect(html).toContain("APIPool 产品截图");
  });

  it("falls back to a div when no link", () => {
    const html = renderToStaticMarkup(
      <FeaturedProductCard product={{ ...sample, link: undefined }} />,
    );
    expect(html).not.toContain("href=");
  });
});
```

- [ ] **Step 2: 实现组件**

```tsx
import Image from "next/image";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function FeaturedProductCard({ product }: Props) {
  const tags = product.tags.slice(0, 3);
  const inner = (
    <>
      <div className="feat-product-frame">
        <div className="feat-product-shot">
          {product.screenshot && (
            <Image
              src={product.screenshot}
              alt={`${product.name} 产品截图`}
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              loading="eager"
              className="feat-product-image"
            />
          )}
        </div>
      </div>
      <div className="feat-product-body">
        <span className="feat-product-name">
          {product.name}
          <span className="feat-product-badge">主打</span>
        </span>
        <p className="feat-product-desc">{product.highlight}</p>
        {tags.length > 0 && (
          <div className="product-card-tags">
            {tags.map((t) => (
              <span key={t} className="product-card-tag">{t}</span>
            ))}
          </div>
        )}
        {product.link && (
          <span className="feat-product-link">{new URL(product.link).hostname} ↗</span>
        )}
      </div>
    </>
  );

  if (product.link) {
    return (
      <a
        href={product.link}
        target="_blank"
        rel="noreferrer"
        className="feat-product"
        aria-label={`${product.name} — ${product.description}`}
      >
        {inner}
      </a>
    );
  }
  return <div className="feat-product">{inner}</div>;
}
```

- [ ] **Step 3: CSS**

```css
.feat-product {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  background: var(--color-bg-card);
  border: 1px solid var(--color-rule);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: border-color .15s, transform .15s;
}
.feat-product:hover { border-color: var(--color-rule-strong); transform: translateY(-2px); }
.feat-product-frame { padding: 20px; min-width: 0; }
.feat-product-shot {
  position: relative;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--color-rule-strong);
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-bg-elevated);
}
.feat-product-image { object-fit: cover; object-position: top center; filter: var(--shot-filter); }
.feat-product-body { padding: 26px 28px; display: flex; flex-direction: column; gap: 11px; min-width: 0; }
.feat-product-name {
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--color-fg);
  display: flex;
  align-items: center;
  gap: 10px;
}
.feat-product-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-chip-fg);
  background: var(--color-chip-bg);
  padding: 2px 9px;
  border-radius: 999px;
  font-weight: 400;
}
.feat-product-desc { font-size: 15px; color: var(--color-fg-muted); line-height: 1.75; margin: 0; }
.feat-product-link { margin-top: auto; font-family: var(--font-mono); font-size: 13px; color: var(--color-accent); letter-spacing: 0.02em; }
.feat-product:hover .feat-product-link { text-decoration: underline; }

.products-grid--secondary { margin-top: 18px; }

@media (max-width: 700px) {
  .feat-product { grid-template-columns: 1fr; }
  .feat-product-frame { padding: 16px 16px 0; }
  .feat-product-body { padding: 18px 20px 20px; }
}
```
并给 `.product-card` 增加 `box-shadow: var(--shadow-card);`。

- [ ] **Step 4: page.tsx 产品区改为主打 + 其余 3 个（完整代码见 Task 6 Step 3）**

- [ ] **Step 5: `pnpm test` 全绿**

### Task 6: 写作精选区 + 列表配色修正

**Files:**
- Create: `components/site/writing-featured.tsx`
- Create: `components/site/writing-featured.test.tsx`
- Modify: `app/globals.css`（.feat-post 系列 + writing-row hover 改 accent-2、num/date 改 muted）
- Modify: `app/page.tsx`（完整新版）

- [ ] **Step 1: 失败测试**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WritingFeatured } from "./writing-featured";
import type { WritingMeta } from "@/lib/types";

const post: WritingMeta = {
  title: "财务自由实证#26——高层火灾如何逃生？",
  date: "2022-12-06",
  slug: "invest-practice-26",
  summary: "追求财务自由，并不是希望大富大贵，而是希望能拥有自由选择生活方式的权利。",
  readingTime: 14,
};

describe("WritingFeatured", () => {
  it("renders eyebrow, title, excerpt, reading time and date", () => {
    const html = renderToStaticMarkup(<WritingFeatured post={post} />);
    expect(html).toContain("最新文章");
    expect(html).toContain("高层火灾如何逃生");
    expect(html).toContain("追求财务自由");
    expect(html).toContain("约 14 分钟");
    expect(html).toContain("2022/12/06");
    expect(html).toContain('href="/writing/invest-practice-26"');
  });

  it("truncates long summaries to 80 chars with ellipsis", () => {
    const long = { ...post, summary: "字".repeat(120) };
    const html = renderToStaticMarkup(<WritingFeatured post={long} />);
    expect(html).toContain("字".repeat(80) + "…");
    expect(html).not.toContain("字".repeat(81));
  });

  it("omits excerpt when summary missing", () => {
    const html = renderToStaticMarkup(
      <WritingFeatured post={{ ...post, summary: undefined }} />,
    );
    expect(html).not.toContain("feat-post-excerpt");
  });
});
```

- [ ] **Step 2: 实现组件**

```tsx
import Link from "next/link";
import type { WritingMeta } from "@/lib/types";
import { formatDate } from "@/lib/format-date";

type Props = { post: WritingMeta };

const EXCERPT_LIMIT = 80;

function excerptOf(summary: string | undefined): string | null {
  if (!summary) return null;
  const text = summary.trim();
  return text.length > EXCERPT_LIMIT ? `${text.slice(0, EXCERPT_LIMIT)}…` : text;
}

export function WritingFeatured({ post }: Props) {
  const excerpt = excerptOf(post.summary);
  return (
    <Link href={`/writing/${post.slug}`} className="feat-post">
      <span className="feat-post-eyebrow">最新文章</span>
      <h3 className="feat-post-title">{post.title}</h3>
      {excerpt && <p className="feat-post-excerpt">{excerpt}</p>}
      <span className="feat-post-meta">
        <span className="feat-post-tag">约 {post.readingTime} 分钟</span>
        <span className="feat-post-date">{formatDate(post.date)}</span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: page.tsx 完整新版**

```tsx
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingRow } from "@/components/site/writing-row";
import { HomeHero } from "@/components/site/home-hero";
import { FeaturedProductCard } from "@/components/site/featured-product-card";
import { WritingFeatured } from "@/components/site/writing-featured";

export default async function HomePage() {
  const posts = await getAllWriting();
  const active = products.filter((p) => p.status === "active");
  const [featuredProduct, ...restProducts] = active;
  const [latestPost, ...restPosts] = posts;
  const listPosts = restPosts.slice(0, 9);

  return (
    <>
      <HomeHero latestPost={latestPost} />

      <section className="section">
        <SectionHead title="产品" num="01" metaHref="/products" metaLabel="查看全部" />
        {featuredProduct && <FeaturedProductCard product={featuredProduct} />}
        <div className="products-grid products-grid--secondary">
          {restProducts.slice(0, 3).map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="写作" num="02" tone="accent-2" metaHref="/writing" metaLabel="阅读更多" />
        {latestPost && <WritingFeatured post={latestPost} />}
        <div className="writing-list">
          {listPosts.map((p, i) => (
            <WritingRow key={p.slug} post={p} index={i + 1} />
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: CSS**

```css
.feat-post {
  display: block;
  background: var(--color-featpost-bg);
  border: 1px solid var(--color-featpost-border);
  border-radius: 12px;
  padding: 22px 26px;
  box-shadow: var(--shadow-card);
  transition: transform .15s;
  margin-bottom: 10px;
}
.feat-post:hover { transform: translateY(-2px); }
.feat-post-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-accent-2);
}
.feat-post-title {
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.01em;
  line-height: 1.4;
  color: var(--color-fg);
  margin: 7px 0 6px;
}
.feat-post:hover .feat-post-title { color: var(--color-accent-2); }
.feat-post-excerpt {
  font-size: 14.5px;
  color: var(--color-fg-muted);
  line-height: 1.75;
  margin: 0 0 14px;
  max-width: 760px;
}
.feat-post-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.feat-post-tag {
  font-size: 12px;
  color: var(--color-chip-2-fg);
  background: var(--color-chip-2-bg);
  padding: 1px 10px;
  border-radius: 999px;
}
.feat-post-date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-fg-muted);
  letter-spacing: 0.04em;
}
```
writing 列表配色修正（a11y + 分类色）：`.writing-row-num`、`.writing-row-date` 的 `color` 从 `var(--color-fg-dim)` 改为 `var(--color-fg-muted)`；`.writing-row:hover` 及其子元素 hover 色从 `var(--color-accent)` 改为 `var(--color-accent-2)`。

- [ ] **Step 5: `pnpm test` 全绿**

### Task 7: 全量验证

- [ ] `pnpm test` 全部通过
- [ ] `pnpm lint` 无错误
- [ ] dev server：浅色/深色 × 桌面(1440)/移动(375) 截图，与 /tmp/afreecoder-design-preview.html 对照（边栏面板、Hero、主打卡等距 20px 无顶栏、写作精选、纯白底、序号配色）
- [ ] 非首页路由（/about /products /writing /writing/[slug]）抽查无样式破损（SectionHead 无序号时退化正常、边栏全站生效）
- [ ] 完成后向站主汇报并询问是否提交

## Self-Review 结论

- Spec 覆盖：纯白底/默认浅色（已满足，Task 1 落变量）、espresso 面板（Task 2）、序号（Task 3）、Hero+马克笔+状态行（Task 4）、主打卡 20px 等距无顶栏（Task 5）、写作精选+实色 chip+hover 青（Task 6）、a11y dim→muted 与 focus-visible（Task 1/6）。无缺口。
- 占位符扫描：无 TBD/TODO；所有代码块完整。
- 类型一致性：SectionHead `tone?: "accent" | "accent-2"` 与 CSS 类名 `--accent-2` 一致；Sidebar `stats` 与 layout 传参一致；WritingMeta 字段与 lib/types.ts 一致。
