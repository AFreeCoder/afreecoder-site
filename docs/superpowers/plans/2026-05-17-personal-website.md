# AFreeCoder 个人网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy AFreeCoder's personal homepage (Home / About / Products / Writing) with MDX articles, dark-mode design-forward aesthetic, in 7 days.

**Architecture:** Static-first Next.js 15 App Router site. MDX for articles + About page; TypeScript data file for products. All pages SSG, deployed to Vercel. Single shared layout, design tokens via Tailwind v4 `@theme`, primitives from shadcn/ui copied as needed.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · next-mdx-remote · gray-matter · rehype-pretty-code (Shiki) · Geist Sans/Mono (via `geist` package) · pnpm · Vercel.

**Spec Reference:** [`docs/superpowers/specs/2026-05-17-personal-website-design.md`](../specs/2026-05-17-personal-website-design.md)

**Wireframe reference:** `.superpowers/brainstorm/35647-1778951603/content/homepage-v3.html`

---

## Pre-flight

- [ ] Verify Node.js ≥ 20: `node --version`
- [ ] Verify pnpm: `pnpm --version` (install: `npm i -g pnpm` if missing)
- [ ] Verify gh CLI (optional, for GitHub push): `gh --version`
- [ ] Verify working directory: `pwd` → should be `/Users/afreecoder/project/personal_website`

---

## Phase 1: Foundation (Day 1)

### Task 1: Initialize Next.js project

**Files:**
- Create (via create-next-app): `package.json`, `next.config.mjs`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`

- [ ] **Step 1: Init Next.js in a temp subfolder (the project root has `.claude/`, `.superpowers/`, `docs/` which conflict with `create-next-app .`)**

```bash
cd /Users/afreecoder/project/personal_website
pnpm dlx create-next-app@latest _init \
  --typescript --tailwind --eslint --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

Expected: ~30s. Installs Next.js 15 + Tailwind v4 + TypeScript inside `_init/`.

- [ ] **Step 2: Move all files from `_init/` to project root (including `.git/`)**

```bash
shopt -s dotglob
mv _init/* .
shopt -u dotglob
rmdir _init
```

- [ ] **Step 3: Verify dev server boots**

```bash
pnpm dev
```

Expected: dev server on http://localhost:3000 renders the default Next.js home page. Press `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: init Next.js project with TypeScript + Tailwind v4"
```

---

### Task 2: Install core dependencies

**Files:** Modify `package.json` (auto by pnpm)

- [ ] **Step 1: Install MDX + frontmatter + code highlight stack**

```bash
pnpm add next-mdx-remote gray-matter rehype-pretty-code shiki reading-time
```

- [ ] **Step 2: Install fonts (Geist) + icons + utilities**

```bash
pnpm add geist clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Install dev dependencies (testing)**

```bash
pnpm add -D vitest @vitest/ui @types/node
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add MDX, fonts, icons, and vitest dependencies"
```

---

### Task 3: Initialize shadcn/ui

**Files:**
- Create: `components.json`, `lib/utils.ts`
- Modify: `app/globals.css` (shadcn adds CSS variables)

- [ ] **Step 1: Run shadcn init**

```bash
pnpm dlx shadcn@latest init
```

Answer prompts:
- Style: `Default`
- Base color: `Neutral`
- CSS variables: `Yes`

- [ ] **Step 2: Add a couple of base primitives we'll use**

```bash
pnpm dlx shadcn@latest add button separator
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: init shadcn/ui with button + separator primitives"
```

---

### Task 4: Configure design tokens in `globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `app/globals.css` contents**

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-bg: #0a0a0a;
  --color-fg: #e5e5e5;
  --color-muted: #888888;
  --color-faint: #555555;
  --color-accent: #fb923c;

  /* Surfaces */
  --color-card: #0f0f0f;
  --color-border: #1a1a1a;
  --color-border-strong: #2a2a2a;
  --color-card-border: #1f1f1f;
  --color-card-border-hover: #333333;

  /* Typography */
  --font-sans: var(--font-geist-sans), -apple-system, "PingFang SC", sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", monospace;
}

html {
  color-scheme: dark;
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--color-accent);
  color: var(--color-bg);
}
```

- [ ] **Step 2: Verify dev server still renders without errors**

```bash
pnpm dev
```

Open http://localhost:3000 — page should be dark (black bg, light text). `Ctrl+C` to stop.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: define dark mode design tokens via Tailwind v4 @theme"
```

---

### Task 5: Configure Geist fonts in root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://afreecoder.com"),
  title: {
    default: "AFreeCoder",
    template: "%s · AFreeCoder",
  },
  description:
    "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
  openGraph: {
    title: "AFreeCoder",
    description:
      "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
    url: "https://afreecoder.com",
    siteName: "AFreeCoder",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

> Note: `metadataBase` uses `afreecoder.com` as a placeholder. Replace with the actual production domain once known (or keep and override per page).

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire Geist Sans/Mono fonts + site-wide metadata"
```

---

### Task 6: Create site config single source of truth

**Files:**
- Create: `lib/site-config.ts`

- [ ] **Step 1: Write `lib/site-config.ts`**

```ts
export const siteConfig = {
  name: "AFreeCoder",
  domain: "https://afreecoder.com",
  description:
    "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
  slogan: ["// Observing", "// Building", "// Iterating"] as const,
  intro: "Independent Developer / AI · 投资理财",
  socials: [
    { label: "GitHub", href: "https://github.com/<your-handle>" },
    { label: "X", href: "https://x.com/<your-handle>" },
    { label: "公众号", href: "#" },
    { label: "Email", href: "mailto:hello@afreecoder.com" },
  ],
  nav: [
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Writing", href: "/writing" },
  ],
} as const;
```

> Replace placeholder URLs with real handles before launch.

- [ ] **Step 2: Commit**

```bash
git add lib/site-config.ts
git commit -m "feat: add siteConfig as single source for site metadata"
```

---

### Task 7: Initialize git remote + push to GitHub

**Files:** none (git operation)

- [ ] **Step 1: Create GitHub repo and push (uses gh CLI)**

```bash
gh repo create afreecoder-site --private --source=. --remote=origin --push
```

If `gh` is not installed, create the repo manually on github.com, then:

```bash
git remote add origin git@github.com:<user>/afreecoder-site.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Verify remote**

```bash
git remote -v
```

Expected: `origin` configured.

---

### Task 8: Deploy to Vercel

**Files:** none (deployment configuration done via Vercel UI or CLI)

- [ ] **Step 1: Deploy via Vercel CLI**

```bash
pnpm dlx vercel
```

Answer prompts:
- Set up and deploy? Y
- Link to existing project? N
- Project name: `afreecoder-site` (or accept default)
- Directory: `./`
- Override settings? N

Expected: deploys to a `xxx.vercel.app` URL.

- [ ] **Step 2: Verify production URL renders**

Open the printed `xxx.vercel.app` URL in browser. Default Next.js page should load.

- [ ] **Step 3: (Optional) configure auto-deploy from git**

In Vercel dashboard → project → Settings → Git → connect the GitHub repo for auto-deploy on push to main.

---

## Phase 2: Components + Homepage (Day 2)

### Task 9: Create `Nav` component

**Files:**
- Create: `components/site/nav.tsx`

- [ ] **Step 1: Write `components/site/nav.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--color-border)] pb-5 text-[13px]">
      <Link
        href="/"
        className="font-semibold tracking-[0.5px] text-white"
      >
        {siteConfig.name}
      </Link>
      <ul className="flex items-center gap-[18px] text-[var(--color-muted)]">
        {siteConfig.nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site/nav.tsx
git commit -m "feat(components): add Nav with site brand + menu"
```

---

### Task 10: Create `Footer` component

**Files:**
- Create: `components/site/footer.tsx`

- [ ] **Step 1: Write `components/site/footer.tsx`**

```tsx
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-9 flex items-center justify-between border-t border-[var(--color-border)] pt-5 font-mono text-[11px] text-[var(--color-faint)]">
      <span>© {new Date().getFullYear()} {siteConfig.name}</span>
      <span>
        <a href="/rss.xml" className="hover:text-white">RSS</a>
        {" · "}
        <a href="/sitemap.xml" className="hover:text-white">Sitemap</a>
      </span>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site/footer.tsx
git commit -m "feat(components): add Footer with RSS + Sitemap links"
```

---

### Task 11: Create `SectionHead` component

**Files:**
- Create: `components/site/section-head.tsx`

- [ ] **Step 1: Write `components/site/section-head.tsx`**

```tsx
import Link from "next/link";

type Props = {
  title: string;
  meta?: string;
  href?: string;
};

export function SectionHead({ title, meta, href }: Props) {
  return (
    <div className="mb-[22px] flex items-baseline justify-between border-t border-[var(--color-border)] pt-7">
      <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-white">
        {title}
      </h2>
      {meta && (
        href ? (
          <Link
            href={href}
            className="font-mono text-[11px] text-[var(--color-faint)] hover:text-white"
          >
            {meta}
          </Link>
        ) : (
          <span className="font-mono text-[11px] text-[var(--color-faint)]">
            {meta}
          </span>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site/section-head.tsx
git commit -m "feat(components): add SectionHead with title + optional meta link"
```

---

### Task 12: Create `Hero` component (left side: identity)

**Files:**
- Create: `components/site/hero.tsx`

- [ ] **Step 1: Write `components/site/hero.tsx` — the full Hero (left + right)**

```tsx
import { siteConfig } from "@/lib/site-config";

type Props = {
  aboutSummary: React.ReactNode;
  aboutHref?: string;
};

export function Hero({ aboutSummary, aboutHref = "/about" }: Props) {
  return (
    <section className="grid grid-cols-1 gap-12 py-3 pb-14 md:grid-cols-[1fr_3fr]">
      {/* LEFT: identity */}
      <div className="pt-1">
        <div className="relative mb-5 h-[88px] w-[88px]">
          <div
            className="h-full w-full rounded-full border border-[var(--color-border-strong)]"
            style={{
              background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
            }}
            aria-label="avatar"
          />
          <div
            className="pointer-events-none absolute -inset-1 -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(251,146,60,0.18), transparent 60%)",
            }}
          />
        </div>
        <h1 className="mb-[10px] text-[24px] font-bold leading-tight tracking-[-0.5px] text-white">
          {siteConfig.name}
        </h1>
        <div className="mb-3 space-y-[2px] font-mono text-[11px] leading-[1.4] text-[var(--color-accent)]">
          {siteConfig.slogan.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <p className="mb-[18px] text-[12px] leading-[1.5] text-[var(--color-muted)]">
          {siteConfig.intro}
        </p>
        <ul className="flex flex-wrap gap-[5px]">
          {siteConfig.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                className="inline-block rounded-full border border-[var(--color-border-strong)] px-[10px] py-1 text-[10px] text-[#aaa] transition-colors hover:text-white"
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: about summary */}
      <div className="pt-1">
        <div className="mb-[18px] font-mono text-[10px] uppercase tracking-[2px] text-[var(--color-faint)]">
          — ABOUT
        </div>
        <div className="max-w-[720px] space-y-[14px] text-[15px] leading-[1.85] text-[#d4d4d4]">
          {aboutSummary}
        </div>
        <a
          href={aboutHref}
          className="mt-4 inline-block font-mono text-[12px] text-[var(--color-accent)] hover:underline"
        >
          → 更多关于我
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site/hero.tsx
git commit -m "feat(components): add Hero with avatar, slogan, socials, and about summary"
```

---

### Task 13: Create `ProductCard` component + product types

**Files:**
- Create: `lib/types.ts`
- Create: `components/site/product-card.tsx`

- [ ] **Step 1: Write `lib/types.ts`**

```ts
export type Product = {
  name: string;
  description: string;
  tags: string[];
  link?: string;
  status: "active" | "archived";
};

export type WritingFrontmatter = {
  title: string;
  date: string; // YYYY-MM-DD
  slug: string;
  summary?: string;
  original_url?: string;
  platforms?: string[];
};

export type WritingMeta = WritingFrontmatter & {
  readingTime: number; // minutes
};
```

- [ ] **Step 2: Write `components/site/product-card.tsx`**

```tsx
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const inner = (
    <div className="group rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 px-[22px] transition-colors hover:border-[var(--color-card-border-hover)]">
      <h3 className="mb-2 text-[16px] font-semibold tracking-[-0.2px] text-white">
        {product.name}
      </h3>
      <p className="mb-[14px] text-[13px] leading-relaxed text-[var(--color-muted)]">
        {product.description}
      </p>
      <ul className="flex flex-wrap gap-[6px]">
        {product.tags.map((t) => (
          <li
            key={t}
            className="rounded font-mono text-[10px] text-[#999]"
            style={{
              background: "#1a1a1a",
              padding: "3px 8px",
            }}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  if (product.link) {
    return (
      <a href={product.link} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts components/site/product-card.tsx
git commit -m "feat(components): add ProductCard + shared types"
```

---

### Task 14: Create `WritingItem` component

**Files:**
- Create: `components/site/writing-item.tsx`

- [ ] **Step 1: Write `components/site/writing-item.tsx`**

```tsx
import Link from "next/link";
import type { WritingMeta } from "@/lib/types";

export function WritingItem({ post }: { post: WritingMeta }) {
  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group grid grid-cols-[100px_1fr] items-center gap-5 border-b border-[#161616] py-[14px]"
    >
      <span className="font-mono text-[11px] text-[var(--color-faint)]">
        {post.date}
      </span>
      <span className="text-[14px] text-[#ddd] group-hover:text-white">
        {post.title}
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site/writing-item.tsx
git commit -m "feat(components): add WritingItem list row"
```

---

### Task 15: Create products data file (placeholder content)

**Files:**
- Create: `content/products.ts`

- [ ] **Step 1: Write `content/products.ts`**

```ts
import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    name: "API Pool",
    description: "AI 接口聚合与转发服务，支持多模型统一调用。",
    tags: ["SaaS", "Next.js", "AI"],
    link: "https://example.com/api-pool",
    status: "active",
  },
  {
    name: "Index Watch",
    description: "指数基金估值与定投信号监控工具。",
    tags: ["Finance", "Tool"],
    link: "https://example.com/index-watch",
    status: "active",
  },
];
```

> Edit this file later with the real product list. At least 2 must be present before launch.

- [ ] **Step 2: Commit**

```bash
git add content/products.ts
git commit -m "feat(content): add products data file with placeholders"
```

---

### Task 16: Build the homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingItem } from "@/components/site/writing-item";
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export default async function HomePage() {
  const posts = (await getAllWriting()).slice(0, 4);
  const homeProducts = products.filter((p) => p.status === "active").slice(0, 4);

  return (
    <main className="mx-auto max-w-[960px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <Hero
        aboutSummary={
          <>
            <p>独立开发者，目前主要关注 AI 工具开发、自动化系统和长期投资理财方向。</p>
            <p>过去几年陆续做过一些产品和小工具，现在更专注于探索如何用 AI 系统性地放大个人的杠杆。</p>
            <p>这里是我的产品、文章和长期记录的地方。</p>
          </>
        }
      />

      <SectionHead
        title="Products"
        meta={`${homeProducts.length} active · view all →`}
        href="/products"
      />
      <div className="mb-12 grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {homeProducts.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>

      <SectionHead title="Writing" meta="all posts →" href="/writing" />
      <div className="mb-4">
        {posts.map((p) => (
          <WritingItem key={p.slug} post={p} />
        ))}
      </div>

      <Footer />
    </main>
  );
}
```

> Note: `getAllWriting` is implemented in Task 19. Until then, this page won't compile. That's intentional — we'll wire it up in Phase 3.

- [ ] **Step 2: Commit (without verifying — depends on Task 19)**

```bash
git add app/page.tsx
git commit -m "feat: assemble homepage with hero + products + writing"
```

---

## Phase 3: Writing System (Day 3)

### Task 17: Create writing content directory + sample post

**Files:**
- Create: `content/writing/2026-04-15-hello-world.mdx`

- [ ] **Step 1: Write `content/writing/2026-04-15-hello-world.mdx`**

```mdx
---
title: Hello, World
date: 2026-04-15
slug: hello-world
summary: 个人站点开张的第一篇文章 — 关于为什么开始，以及打算写什么。
---

# Hello, World

这是 AFreeCoder 个人站点的第一篇文章。

## 为什么开这个站

简单说，就是想要一个**真正属于自己**的内容沉淀和展示的地方。

公众号、知乎、X 都是借来的房子；这里才是地基。

## 接下来打算写什么

- AI 工具与 Agent 系统的实战观察
- 独立开发的方法论与具体产品
- 投资理财的长期思考
- 一些不那么"正经"的随笔

---

> 用 Next.js + MDX 搭建，部署在 Vercel。源码在 GitHub。
```

- [ ] **Step 2: Commit**

```bash
git add content/writing/2026-04-15-hello-world.mdx
git commit -m "content(writing): add hello-world sample post"
```

---

### Task 18: Write tests for `lib/writing.ts` (TDD)

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/writing.test.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 2: Add `test` script to `package.json`**

```bash
# Use a text editor or this perl one-liner:
node -e "const p=require('./package.json');p.scripts.test='vitest run';p.scripts['test:watch']='vitest';require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2)+'\n')"
```

- [ ] **Step 3: Write `lib/writing.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getAllWriting, getWritingBySlug } from "./writing";

describe("getAllWriting", () => {
  it("returns posts sorted by date desc", async () => {
    const posts = await getAllWriting();
    expect(posts.length).toBeGreaterThan(0);
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date >= posts[i].date).toBe(true);
    }
  });

  it("each post has required frontmatter fields", async () => {
    const posts = await getAllWriting();
    for (const p of posts) {
      expect(p.title).toBeTruthy();
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.slug).toBeTruthy();
      expect(typeof p.readingTime).toBe("number");
    }
  });
});

describe("getWritingBySlug", () => {
  it("returns the post + raw mdx body for a known slug", async () => {
    const post = await getWritingBySlug("hello-world");
    expect(post).not.toBeNull();
    expect(post!.meta.title).toBe("Hello, World");
    expect(post!.body).toContain("Hello, World");
  });

  it("returns null for unknown slug", async () => {
    const post = await getWritingBySlug("does-not-exist");
    expect(post).toBeNull();
  });
});
```

- [ ] **Step 4: Run tests — expect failure (function not defined yet)**

```bash
pnpm test
```

Expected: FAIL — vitest reports cannot resolve module `./writing` (file doesn't exist yet). This is the expected TDD red state.

---

### Task 19: Implement `lib/writing.ts`

**Files:**
- Create: `lib/writing.ts`

- [ ] **Step 1: Write `lib/writing.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { WritingFrontmatter, WritingMeta } from "./types";

const WRITING_DIR = path.join(process.cwd(), "content", "writing");

async function listMdxFiles(): Promise<string[]> {
  const entries = await fs.readdir(WRITING_DIR);
  return entries.filter((f) => f.endsWith(".mdx"));
}

async function readWriting(file: string): Promise<{ meta: WritingMeta; body: string }> {
  const filePath = path.join(WRITING_DIR, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as WritingFrontmatter;
  const rt = readingTime(content);
  const meta: WritingMeta = {
    ...fm,
    readingTime: Math.max(1, Math.round(rt.minutes)),
  };
  return { meta, body: content };
}

export async function getAllWriting(): Promise<WritingMeta[]> {
  const files = await listMdxFiles();
  const items = await Promise.all(files.map(async (f) => (await readWriting(f)).meta));
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getWritingBySlug(
  slug: string,
): Promise<{ meta: WritingMeta; body: string } | null> {
  const files = await listMdxFiles();
  for (const f of files) {
    const item = await readWriting(f);
    if (item.meta.slug === slug) return item;
  }
  return null;
}
```

- [ ] **Step 2: Re-run tests — expect pass**

```bash
pnpm test
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts lib/writing.ts lib/writing.test.ts package.json pnpm-lock.yaml
git commit -m "feat(lib): add writing.ts with mdx frontmatter + reading time"
```

---

### Task 20: Set up MDX rendering with Shiki

**Files:**
- Create: `lib/mdx.tsx`

- [ ] **Step 1: Write `lib/mdx.tsx`**

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import rehypePrettyCode from "rehype-pretty-code";

const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      {...props}
      className="mt-10 mb-4 text-[28px] font-bold tracking-[-0.5px] text-white"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="mt-8 mb-3 text-[20px] font-semibold tracking-[-0.3px] text-white"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="mt-6 mb-2 text-[16px] font-semibold text-white"
    />
  ),
  p: (props) => (
    <p {...props} className="my-4 text-[15px] leading-[1.85] text-[#d4d4d4]" />
  ),
  a: (props) => (
    <a
      {...props}
      className="text-[var(--color-accent)] underline-offset-4 hover:underline"
    />
  ),
  ul: (props) => (
    <ul {...props} className="my-4 list-disc space-y-1 pl-6 text-[#d4d4d4]" />
  ),
  ol: (props) => (
    <ol {...props} className="my-4 list-decimal space-y-1 pl-6 text-[#d4d4d4]" />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="my-4 border-l-2 border-[var(--color-accent)] pl-4 italic text-[var(--color-muted)]"
    />
  ),
  code: (props) => (
    <code
      {...props}
      className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-[13px] text-[var(--color-accent)]"
    />
  ),
  hr: (props) => (
    <hr {...props} className="my-8 border-t border-[var(--color-border)]" />
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: "github-dark-dimmed",
                keepBackground: true,
              },
            ],
          ],
        },
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/mdx.tsx
git commit -m "feat(lib): add Mdx renderer with shiki code highlighting"
```

---

### Task 21: Build `/writing` list page

**Files:**
- Create: `app/writing/page.tsx`

- [ ] **Step 1: Write `app/writing/page.tsx`**

```tsx
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { WritingItem } from "@/components/site/writing-item";
import { getAllWriting } from "@/lib/writing";

export const metadata = {
  title: "Writing",
  description: "AFreeCoder 写作存档",
};

export default async function WritingPage() {
  const posts = await getAllWriting();
  return (
    <main className="mx-auto max-w-[960px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <header className="py-10">
        <h1 className="text-[32px] font-bold tracking-[-0.5px] text-white">
          Writing
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-muted)]">
          {posts.length} 篇文章 · 按时间倒序
        </p>
      </header>
      <div>
        {posts.map((p) => (
          <WritingItem key={p.slug} post={p} />
        ))}
      </div>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
pnpm dev
```

Open http://localhost:3000/writing — should render the writing list with the sample post. `Ctrl+C` to stop.

- [ ] **Step 3: Commit**

```bash
git add app/writing/page.tsx
git commit -m "feat(pages): add /writing list page"
```

---

### Task 22: Build `/writing/[slug]` detail page

**Files:**
- Create: `app/writing/[slug]/page.tsx`

- [ ] **Step 1: Write `app/writing/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Mdx } from "@/lib/mdx";
import { getAllWriting, getWritingBySlug } from "@/lib/writing";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllWriting();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getWritingBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.summary,
  };
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getWritingBySlug(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-[760px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <article className="py-10">
        <h1 className="mb-3 text-[34px] font-bold leading-tight tracking-[-0.5px] text-white">
          {post.meta.title}
        </h1>
        <div className="mb-10 font-mono text-[11px] text-[var(--color-faint)]">
          {post.meta.date} · {post.meta.readingTime} min read
        </div>
        <Mdx source={post.body} />
        {post.meta.platforms && post.meta.platforms.length > 0 && (
          <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-[13px] text-[var(--color-muted)]">
            本文同步发布于 {post.meta.platforms.join(" / ")}
            {post.meta.original_url && (
              <>
                {" · "}
                <a
                  href={post.meta.original_url}
                  className="text-[var(--color-accent)] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  原文
                </a>
              </>
            )}
          </div>
        )}
        <div className="mt-10">
          <Link
            href="/writing"
            className="font-mono text-[12px] text-[var(--color-accent)] hover:underline"
          >
            ← 返回 Writing
          </Link>
        </div>
      </article>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify dev server**

```bash
pnpm dev
```

Open http://localhost:3000/writing/hello-world — article should render with the MDX content. `Ctrl+C` to stop.

- [ ] **Step 3: Commit**

```bash
git add app/writing/[slug]/page.tsx
git commit -m "feat(pages): add /writing/[slug] article detail page"
```

---

### Task 23: Build `/about` page with MDX

**Files:**
- Create: `content/about.mdx`
- Create: `app/about/page.tsx`

- [ ] **Step 1: Write `content/about.mdx` (placeholder content)**

```mdx
# AFreeCoder

独立开发者。目前主要关注 AI 工具开发、自动化系统、长期投资理财。

## 当前在做

- AI 相关产品与工具
- 投资理财相关的研究与工具
- 中长期写作记录

## 技术栈与方向

- 前端：Next.js · React · TypeScript · Tailwind
- 后端 / Agent：Node · Python · LLM Tooling
- 部署：Vercel · Cloudflare · DigitalOcean

## 价值观

- 长期主义
- 冷静观察 · 持续构建
- AI 是个人杠杆

## 联系

- GitHub: [github.com/your-handle](https://github.com/your-handle)
- X: [x.com/your-handle](https://x.com/your-handle)
- Email: hello@afreecoder.com
```

> Replace with real content before launch.

- [ ] **Step 2: Write `app/about/page.tsx`**

```tsx
import fs from "node:fs/promises";
import path from "node:path";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Mdx } from "@/lib/mdx";

export const metadata = {
  title: "About",
  description: "关于 AFreeCoder",
};

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), "content", "about.mdx");
  const source = await fs.readFile(filePath, "utf-8");
  return (
    <main className="mx-auto max-w-[760px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <article className="py-10">
        <Mdx source={source} />
      </article>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/about — should render the about content. `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add content/about.mdx app/about/page.tsx
git commit -m "feat(pages): add /about page rendered from MDX"
```

---

## Phase 4: Pages + Content (Day 4)

### Task 24: Build `/products` list page

**Files:**
- Create: `app/products/page.tsx`

- [ ] **Step 1: Write `app/products/page.tsx`**

```tsx
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ProductCard } from "@/components/site/product-card";
import { products } from "@/content/products";

export const metadata = {
  title: "Products",
  description: "AFreeCoder 的产品与项目",
};

export default function ProductsPage() {
  const active = products.filter((p) => p.status === "active");
  const archived = products.filter((p) => p.status === "archived");

  return (
    <main className="mx-auto max-w-[960px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <header className="py-10">
        <h1 className="text-[32px] font-bold tracking-[-0.5px] text-white">
          Products
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-muted)]">
          {active.length} active · {archived.length} archived
        </p>
      </header>

      <section className="mb-12">
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
          {active.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      {archived.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-[18px] font-mono text-[12px] uppercase tracking-[2px] text-[var(--color-faint)]">
            Archived
          </h2>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 opacity-70">
            {archived.map((p) => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/products — should render 2 product cards. `Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
git add app/products/page.tsx
git commit -m "feat(pages): add /products list page"
```

---

### Task 25: Verify homepage end-to-end

**Files:** none (verification only)

- [ ] **Step 1: Start dev server and visit homepage**

```bash
pnpm dev
```

Open http://localhost:3000.

Verify:
- Nav shows AFreeCoder + About/Products/Writing
- Hero shows avatar circle, name, 3-line slogan in orange mono, intro line, 4 social pills
- About summary on right with 3 short paragraphs and "→ 更多关于我" link
- Products section shows 2 cards (API Pool + Index Watch)
- Writing section shows 1 entry (hello-world)
- Footer shows copyright + RSS/Sitemap links

`Ctrl+C` to stop.

- [ ] **Step 2: Build + start production locally to confirm SSG works**

```bash
pnpm build
pnpm start
```

Expected: builds without errors; pages render on http://localhost:3000.

`Ctrl+C` to stop.

- [ ] **Step 3: Commit (if any tweaks were made)**

If no changes, skip.

---

### Task 26: Add at least one more real writing post

**Files:**
- Create: `content/writing/2026-04-28-second-post.mdx` (or any real article)

- [ ] **Step 1: Add a second MDX file**

User-facing task. Pick a real article (公众号 / 知乎 同步过来) and paste content as MDX with proper frontmatter:

```mdx
---
title: <真实标题>
date: <YYYY-MM-DD>
slug: <english-slug>
summary: <一段摘要>
platforms: [公众号]
original_url: https://mp.weixin.qq.com/...
---

<正文 Markdown>
```

- [ ] **Step 2: Verify on /writing**

Both posts should now appear in the list, sorted by date desc.

- [ ] **Step 3: Commit**

```bash
git add content/writing/
git commit -m "content(writing): add second real article"
```

---

### Task 27: Replace placeholder content in products + about

**Files:**
- Modify: `content/products.ts`
- Modify: `content/about.mdx`
- Modify: `lib/site-config.ts` (real socials)

- [ ] **Step 1: Edit `content/products.ts`** — replace placeholder products with real ones (at least 2 active).

- [ ] **Step 2: Edit `content/about.mdx`** — replace the placeholder template with real personal copy (5-8 paragraphs).

- [ ] **Step 3: Edit `lib/site-config.ts`** — replace `<your-handle>` URLs with real GitHub / X handles, public emoji links, real email.

- [ ] **Step 4: Verify all pages render correctly**

```bash
pnpm dev
```

Check `/`, `/about`, `/products`, `/writing`. `Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add content/ lib/site-config.ts
git commit -m "content: fill in real about + products + socials"
```

---

## Phase 5: SEO + Discoverability (Day 5)

### Task 28: Generate `sitemap.xml`

**Files:**
- Create: `app/sitemap.ts`

- [ ] **Step 1: Write `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllWriting } from "@/lib/writing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.domain;
  const writings = await getAllWriting();
  const writingUrls = writings.map((p) => ({
    url: `${base}/writing/${p.slug}`,
    lastModified: p.date,
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    { url: `${base}/writing`, lastModified: new Date() },
    ...writingUrls,
  ];
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/sitemap.xml — should return valid XML with all URLs. `Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): add sitemap.xml"
```

---

### Task 29: Generate `robots.txt`

**Files:**
- Create: `app/robots.ts`

- [ ] **Step 1: Write `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteConfig.domain}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/robots.txt — should show:

```
User-agent: *
Allow: /

Sitemap: https://afreecoder.com/sitemap.xml
```

`Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat(seo): add robots.txt"
```

---

### Task 30: Generate RSS feed

**Files:**
- Create: `app/rss.xml/route.ts`

- [ ] **Step 1: Write `app/rss.xml/route.ts`**

```ts
import { siteConfig } from "@/lib/site-config";
import { getAllWriting } from "@/lib/writing";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllWriting();
  const items = posts
    .map((p) => {
      const url = `${siteConfig.domain}/writing/${p.slug}`;
      const pubDate = new Date(p.date).toUTCString();
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.summary ? `<description>${escapeXml(p.summary)}</description>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.domain}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-cn</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/rss.xml — should return valid RSS XML. `Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
git add app/rss.xml/route.ts
git commit -m "feat(seo): add RSS feed at /rss.xml"
```

---

### Task 31: Add favicon

**Files:**
- Create: `app/icon.svg` (or `app/favicon.ico`)

- [ ] **Step 1: Add a simple SVG favicon**

Write `app/icon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0a0a0a"/>
  <text x="50%" y="58%" text-anchor="middle"
        font-family="ui-monospace, monospace" font-size="32"
        font-weight="700" fill="#fb923c">A</text>
</svg>
```

> Replace with a real favicon if you have one.

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Browser tab should show the orange "A" icon.

- [ ] **Step 3: Commit**

```bash
git add app/icon.svg
git commit -m "feat(seo): add favicon"
```

---

### Task 32: Add OG default image

**Files:**
- Create: `app/opengraph-image.tsx`

- [ ] **Step 1: Write `app/opengraph-image.tsx`** (Next.js auto-generates an OG image)

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AFreeCoder";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#0a0a0a",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#fff" }}>
          AFreeCoder
        </div>
        <div style={{ marginTop: 24, color: "#fb923c", fontSize: 28 }}>
          // Observing · Building · Iterating
        </div>
        <div style={{ marginTop: 24, color: "#888", fontSize: 22 }}>
          Independent Developer · AI · 投资理财
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000/opengraph-image — should download/show the generated PNG. `Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "feat(seo): add default OG image"
```

---

## Phase 6: Polish (Day 6)

### Task 33: Mobile responsive verification

**Files:**
- Modify (if needed): page-level layouts in `app/*/page.tsx` and `components/site/hero.tsx`

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

Open http://localhost:3000 in a browser with DevTools, toggle device toolbar to iPhone or 375px width.

Check each page:
- `/` — Hero stacks vertically (left then right), Products goes to 1 column, Writing list readable
- `/about` — text readable, no horizontal scroll
- `/products` — 1 column
- `/writing` — list rows fit (date + title)
- `/writing/<slug>` — article readable

- [ ] **Step 2: Fix any overflow / awkward stacking**

Common fixes:
- In Hero left side, reduce avatar to 72px on small screens (add `sm:h-[88px] sm:w-[88px]` and base `h-[72px] w-[72px]`)
- In WritingItem, reduce date column width on small screens

- [ ] **Step 3: Commit any tweaks**

```bash
git add -A
git commit -m "fix(responsive): tweak mobile layout for hero + writing list"
```

---

### Task 34: Visual polish pass

**Files:**
- Modify as needed across pages and components

- [ ] **Step 1: Eyeball each page for spacing / typography / hover states**

Specifically check:
- Section gaps feel right (28-36px between major sections)
- Hover transitions feel smooth (200ms ease on borders / colors)
- Selection color shows orange on text drag
- Avatar gradient + glow looks correct

- [ ] **Step 2: Adjust where needed**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: visual polish pass for spacing and hover states"
```

---

## Phase 7: Launch (Day 7)

### Task 35: Configure custom domain on Vercel

**Files:** none (Vercel UI)

- [ ] **Step 1: In Vercel dashboard → project → Settings → Domains, add your custom domain (e.g. `afreecoder.com`)**

- [ ] **Step 2: Configure DNS at your registrar to point to Vercel (A record `76.76.21.21` or CNAME to `cname.vercel-dns.com`)**

- [ ] **Step 3: Wait for HTTPS provisioning (a few minutes), then verify domain resolves**

- [ ] **Step 4: Update `siteConfig.domain` and `metadataBase` if it changed**

If the production domain differs from `afreecoder.com`:

```ts
// lib/site-config.ts
domain: "https://your-real-domain.com",
```

```ts
// app/layout.tsx
metadataBase: new URL("https://your-real-domain.com"),
```

- [ ] **Step 5: Commit and push**

```bash
git add lib/site-config.ts app/layout.tsx
git commit -m "chore: point production URLs to custom domain"
git push origin main
```

Vercel auto-deploys.

---

### Task 36: Final launch checklist

**Files:** none (manual verification)

- [ ] Production homepage loads under custom domain
- [ ] `/about`, `/products`, `/writing`, `/writing/hello-world` (or a real slug) all load
- [ ] `/sitemap.xml`, `/robots.txt`, `/rss.xml` all load with valid content
- [ ] OG image loads at `/opengraph-image`
- [ ] Mobile view (iPhone or 375px width) is readable
- [ ] Browser tab shows favicon
- [ ] Social link pills all point to real URLs
- [ ] At least 2 products, at least 2 writing posts, real about content
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds locally without warnings
- [ ] Push latest to origin/main if any final fixes

Launch ✅

---

## Appendix: Quick Reference

**Commands:**
```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve production build locally
pnpm test         # vitest run
pnpm dlx vercel   # manual deploy
```

**Content workflow (adding a new article):**
1. Create `content/writing/YYYY-MM-DD-slug.mdx` with frontmatter
2. Write content
3. `pnpm test` → ensure parsing still passes
4. `git commit` + push
5. Vercel auto-deploys

**Adding a new product:**
1. Append a new object to the `products` array in `content/products.ts`
2. `git commit` + push
