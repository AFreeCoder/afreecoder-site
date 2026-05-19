# 主题切换器 实施 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在导航栏右上角加入主题切换器，提供 6 套主题（sand/ink/mist/moss/editorial/terminal），默认沿用当前暖砂，切换后持久化到 localStorage 且首屏不闪烁。

**Architecture:** `[data-theme="x"]` CSS 选择器 + Tailwind v4 `@theme` 默认值 + 自写客户端切换器 + 内联 `<script>` 在 paint 前同步主题。零额外运行时依赖。

**Tech Stack:** Next.js 16.2.6 (App Router) + React 19 + Tailwind v4 + Vitest 4（node 环境，无 jsdom）+ next/font/google（Source Serif 4）。

**参考 spec：** [`docs/superpowers/specs/2026-05-19-theme-switcher-design.md`](../specs/2026-05-19-theme-switcher-design.md)

---

## 实施前提

### AGENTS.md 偏离说明

AGENTS.md 要求"读 `node_modules/next/dist/docs/` 后再写代码"。本仓库装的 Next 16.2.6 实际**没有**这个目录。涉及 Next.js API 时，按下面顺序兜底：

1. **context7**（已配 MCP）：`mcp__context7__query-docs` 查 Next.js fonts / app router layout / inline script。
2. Next.js 官方在线文档（如果允许访问）。
3. 通读 `node_modules/next/dist/` 中相关源码（如 `next/font/google` 的类型定义）。

### 文件结构

```
app/
  globals.css                    ← 改：6 套 [data-theme] + color-scheme + 字体覆盖规则
  layout.tsx                     ← 改：Source Serif、<html data-theme="sand">、挂 <ThemeInit/>
  theme-init.tsx                 ← 新：(server) 输出内联防闪 <script>
  theme-init.test.ts             ← 新：测试 script 字符串含 6 主题白名单
components/site/
  theme-switcher.tsx             ← 新：'use client'，调色板按钮 + 下拉菜单
  nav.tsx                        ← 改：右侧追加 <ThemeSwitcher />
  hero.tsx                       ← 改：移除硬编码 #fffdfa / shadow
  product-card.tsx               ← 改：移除两处硬编码 shadow
lib/
  themes.ts                      ← 新：THEME_IDS + THEMES 数据
  themes.test.ts                 ← 新：测试主题数据形状
  design-tokens.test.ts          ← 改：覆盖全部 6 套主题的对比度
```

### 测试策略

- **lib 单元测试**（vitest + node）：`themes.test.ts` 校验数据形状；`design-tokens.test.ts` 读 globals.css 字符串校验 6 套主题各自满足 WCAG AA 对比度；`theme-init.test.ts` 校验内联脚本字符串。
- **切换器组件**：**不**加 jsdom + Testing Library——本项目从未引入这些依赖，新加一个一次性切换器不值得。改用最后的视觉烟测覆盖。
- **TDD 顺序**：先写测试 → 跑（FAIL）→ 实现 → 跑（PASS）→ commit。

### 提交规范

参照仓库 commit 风格（前缀 + 中文，见 `git log --oneline`），例如：`feat(theme)`、`refactor(hero)`、`test(theme)`。

---

## Task 1 — 新增 `lib/themes.ts` 主题枚举

**Files:**
- Create: `lib/themes.ts`
- Create: `lib/themes.test.ts`

- [ ] **Step 1：写 `lib/themes.test.ts`（应失败）**

```ts
import { describe, it, expect } from "vitest";
import { THEME_IDS, THEMES, type ThemeId } from "./themes";

describe("themes", () => {
  it("exposes 6 theme ids in expected order", () => {
    expect(THEME_IDS).toEqual([
      "sand",
      "ink",
      "mist",
      "moss",
      "editorial",
      "terminal",
    ]);
  });

  it("provides a metadata entry per id", () => {
    expect(THEMES.map((t) => t.id)).toEqual(THEME_IDS);
    for (const t of THEMES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("ThemeId type contains exactly the documented ids", () => {
    // 编译期校验 + 运行时 sanity：用每个字面量构造一次
    const ids: ThemeId[] = ["sand", "ink", "mist", "moss", "editorial", "terminal"];
    expect(new Set(ids).size).toBe(6);
  });
});
```

- [ ] **Step 2：跑测试验证失败**

```
pnpm test lib/themes.test.ts
```

预期：`Cannot find module './themes'`。

- [ ] **Step 3：实现 `lib/themes.ts`**

```ts
export const THEME_IDS = [
  "sand",
  "ink",
  "mist",
  "moss",
  "editorial",
  "terminal",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "sand",      label: "暖砂 Warm Sand",   swatch: "#c2410c" },
  { id: "ink",       label: "墨夜 Ink Night",   swatch: "#fb923c" },
  { id: "mist",      label: "冷雾 Cold Mist",   swatch: "#1e40af" },
  { id: "moss",      label: "苔石 Moss Stone",  swatch: "#d4a574" },
  { id: "editorial", label: "报刊 Editorial",   swatch: "#9b2c2c" },
  { id: "terminal",  label: "终端 Terminal",    swatch: "#7ee787" },
];

export const DEFAULT_THEME: ThemeId = "sand";
```

- [ ] **Step 4：跑测试验证通过**

```
pnpm test lib/themes.test.ts
```

预期：3 passed。

- [ ] **Step 5：commit**

```bash
git add lib/themes.ts lib/themes.test.ts
git commit -m "feat(theme): add THEMES enum + metadata as single source of truth"
```

---

## Task 2 — 扩展 `lib/design-tokens.test.ts` 覆盖 6 主题

写测试先于 globals.css 重写——这些断言会失败，下个任务让它们通过。

**Files:**
- Modify: `lib/design-tokens.test.ts`

- [ ] **Step 1：重写 `lib/design-tokens.test.ts`**

完整替换为：

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_IDS } from "./themes";

const REQUIRED_TOKENS = [
  "color-bg",
  "color-fg",
  "color-muted",
  "color-faint",
  "color-accent",
  "color-accent-soft",
  "color-card",
  "color-border",
  "color-border-strong",
  "color-card-border",
  "color-card-border-hover",
] as const;

function loadCss(): string {
  return readFileSync("app/globals.css", "utf8");
}

/** 提取选择器内的属性值。selector 例：":root" / "[data-theme=\"ink\"]" / "@theme" */
function extractBlock(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`);
  const match = re.exec(css);
  if (!match) throw new Error(`Missing CSS block: ${selector}`);
  return match[1];
}

function getHexToken(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block);
  if (!match) throw new Error(`Missing token --${name} (hex) in block`);
  return match[1];
}

function hasShadowToken(block: string, name: string): boolean {
  return new RegExp(`--${name}:\\s*[^;]+;`).test(block);
}

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => {
      const channel = Number.parseInt(value, 16) / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(fg: string, bg: string) {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** sand 主题的 tokens 来自 @theme 默认值；其他主题来自 [data-theme="id"] 覆盖块。 */
function blockFor(css: string, id: string): string {
  return id === "sand"
    ? extractBlock(css, "@theme")
    : extractBlock(css, `[data-theme="${id}"]`);
}

describe("design tokens · 6 themes", () => {
  const css = loadCss();

  it.each(THEME_IDS)("%s 主题定义全部必需 color token", (id) => {
    const block = blockFor(css, id);
    for (const name of REQUIRED_TOKENS) {
      expect(getHexToken(block, name)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it.each(THEME_IDS)("%s 主题定义 shadow-soft 与 shadow-soft-hover", (id) => {
    const block = blockFor(css, id);
    expect(hasShadowToken(block, "shadow-soft")).toBe(true);
    expect(hasShadowToken(block, "shadow-soft-hover")).toBe(true);
  });

  it.each(THEME_IDS)("%s 主题 accent 和 faint 对 bg 满足 4.5:1 对比度（小字 AA）", (id) => {
    const block = blockFor(css, id);
    const bg = getHexToken(block, "color-bg");
    expect(contrastRatio(getHexToken(block, "color-accent"), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(getHexToken(block, "color-faint"), bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(THEME_IDS)("%s 主题正文 fg 对 bg 满足 7:1 对比度（正文 AAA）", (id) => {
    const block = blockFor(css, id);
    const bg = getHexToken(block, "color-bg");
    expect(contrastRatio(getHexToken(block, "color-fg"), bg)).toBeGreaterThanOrEqual(7);
  });

  it("声明 color-scheme 分组规则", () => {
    expect(css).toMatch(/html\[data-theme="ink"\][\s\S]*?\bcolor-scheme:\s*dark/);
    expect(css).toMatch(/html\[data-theme="sand"\][\s\S]*?\bcolor-scheme:\s*light/);
  });
});
```

注：把 `faint` 的对比度阈值保留 4.5（与原断言一致）。若任何主题的 faint 设计上做不到 4.5（如苔石），届时再降到 3:1 大字 AA 阈值，但**在改阈值之前要先记录在 spec 的"已知偏差"小节**。

- [ ] **Step 2：跑测试验证失败**

```
pnpm test lib/design-tokens.test.ts
```

预期：多条 FAIL（globals.css 还没有 `[data-theme="ink"]` 等块；shadow token 不存在）。

- [ ] **Step 3：commit（测试先行）**

```bash
git add lib/design-tokens.test.ts
git commit -m "test(theme): assert 6 themes 满足 token + 对比度 + color-scheme 契约"
```

---

## Task 3 — 重写 `app/globals.css`：6 套主题 token

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1：完整替换 `app/globals.css`**

```css
@import "tailwindcss";

/* sand 主题作为 @theme 默认值；切换器不主动设置 data-theme="sand" 时也走这里。 */
@theme {
  /* Brand — Warm Sand (default) */
  --color-bg: #fbfaf7;
  --color-fg: #1c1917;
  --color-muted: #625a55;
  --color-faint: #78716c;
  --color-accent: #c2410c;
  --color-accent-soft: #fff7ed;

  /* Surfaces */
  --color-card: #fffdfb;
  --color-border: #e8e1d8;
  --color-border-strong: #d6cec4;
  --color-card-border: #e8e1d8;
  --color-card-border-hover: #c8b7a8;

  /* Shadows */
  --shadow-soft: 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow-soft-hover: 0 10px 24px rgba(28, 25, 23, 0.07);

  /* Typography */
  --font-sans: var(--font-geist-sans), -apple-system, "PingFang SC", sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", monospace;
  --font-serif: var(--font-source-serif), Georgia, "Noto Serif SC", serif;
}

/* —— 主题覆盖 —— */

[data-theme="ink"] {
  --color-bg: #0c0c0f;
  --color-fg: #ececef;
  --color-muted: #8e8e96;
  --color-faint: #5b5b63;
  --color-accent: #fb923c;
  --color-accent-soft: #3a1f0a;
  --color-card: #16161b;
  --color-border: #25252c;
  --color-border-strong: #3a3a44;
  --color-card-border: #25252c;
  --color-card-border-hover: #4a4a55;
  --shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-soft-hover: 0 10px 30px rgba(0, 0, 0, 0.5);
}

[data-theme="mist"] {
  --color-bg: #eef2f6;
  --color-fg: #0f172a;
  --color-muted: #475569;
  --color-faint: #94a3b8;
  --color-accent: #1e40af;
  --color-accent-soft: #eff6ff;
  --color-card: #ffffff;
  --color-border: #d8dee6;
  --color-border-strong: #b8c2cf;
  --color-card-border: #d8dee6;
  --color-card-border-hover: #94a3b8;
  --shadow-soft: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-soft-hover: 0 10px 24px rgba(15, 23, 42, 0.08);
}

[data-theme="moss"] {
  --color-bg: #0f1611;
  --color-fg: #e8e1d3;
  --color-muted: #8a9285;
  --color-faint: #5a6258;
  --color-accent: #d4a574;
  --color-accent-soft: #2a2018;
  --color-card: #1a2520;
  --color-border: #2a3a32;
  --color-border-strong: #3d5044;
  --color-card-border: #2a3a32;
  --color-card-border-hover: #556657;
  --shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-soft-hover: 0 10px 30px rgba(0, 0, 0, 0.45);
}

[data-theme="editorial"] {
  --color-bg: #f5efe6;
  --color-fg: #1a1410;
  --color-muted: #5c544a;
  --color-faint: #8a7f71;
  --color-accent: #9b2c2c;
  --color-accent-soft: #fef2f2;
  --color-card: #ffffff;
  --color-border: #e0d8cc;
  --color-border-strong: #c9bfae;
  --color-card-border: #e0d8cc;
  --color-card-border-hover: #a89a82;
  --shadow-soft: 0 1px 2px rgba(26, 20, 16, 0.05);
  --shadow-soft-hover: 0 10px 24px rgba(26, 20, 16, 0.08);
}

[data-theme="terminal"] {
  --color-bg: #0a0e0a;
  --color-fg: #c9d1c9;
  --color-muted: #6e7a6e;
  --color-faint: #4a554a;
  --color-accent: #7ee787;
  --color-accent-soft: #0f2515;
  --color-card: #11161a;
  --color-border: #1f2a22;
  --color-border-strong: #324032;
  --color-card-border: #1f2a22;
  --color-card-border-hover: #4a5c4a;
  --shadow-soft: 0 0 0 1px rgba(126, 231, 135, 0.05);
  --shadow-soft-hover: 0 0 12px rgba(126, 231, 135, 0.15);
}

/* —— color-scheme：影响原生滚动条 / autofill 颜色 —— */

html[data-theme="sand"],
html[data-theme="mist"],
html[data-theme="editorial"],
html:not([data-theme]) {
  color-scheme: light;
}

html[data-theme="ink"],
html[data-theme="moss"],
html[data-theme="terminal"] {
  color-scheme: dark;
}

/* —— 字体差异：报刊衬线标题 / 终端全 mono —— */

[data-theme="editorial"] h1,
[data-theme="editorial"] h2,
[data-theme="editorial"] h3,
[data-theme="editorial"] h4 {
  font-family: var(--font-serif);
}

[data-theme="terminal"] body {
  font-family: var(--font-mono);
}

/* —— 全局基础 —— */

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--color-accent);
  color: #ffffff;
}
```

- [ ] **Step 2：跑全部 vitest 验证通过**

```
pnpm test
```

预期：`lib/themes.test.ts` 通过；`lib/design-tokens.test.ts` 全部通过（21 个 it.each 用例 + 1 个 color-scheme）。

若 faint 在某主题对比度不达 4.5——调 hex 调到达标（轻微微调，不重新设计）。

- [ ] **Step 3：commit**

```bash
git add app/globals.css
git commit -m "feat(theme): 在 globals.css 中实现 6 套主题 + color-scheme + 字体覆盖"
```

---

## Task 4 — Tokenize `components/site/hero.tsx`

把硬编码的 `#fffdfa` 与 rgba 阴影替换为 `var(--color-card)` / `var(--shadow-soft-hover)`。

**Files:**
- Modify: `components/site/hero.tsx`

- [ ] **Step 1：定位行 14 改写**

把：

```tsx
<div className="relative mb-4 h-[104px] w-[116px] overflow-hidden rounded-[24px] border border-[var(--color-border-strong)] bg-[#fffdfa] shadow-[0_12px_30px_rgba(28,25,23,0.08)]">
```

改成：

```tsx
<div className="relative mb-4 h-[104px] w-[116px] overflow-hidden rounded-[24px] border border-[var(--color-border-strong)] bg-[var(--color-card)] shadow-[var(--shadow-soft-hover)]">
```

- [ ] **Step 2：grep 验证没有遗漏的硬编码颜色**

```
grep -n "#fffdfa\|rgba(28,25,23" components/site/hero.tsx || echo "clean"
```

预期：`clean`。

- [ ] **Step 3：跑 lint + 已有测试**

```
pnpm lint
pnpm test
```

预期：均通过。

- [ ] **Step 4：commit**

```bash
git add components/site/hero.tsx
git commit -m "refactor(hero): 头像框背景与阴影改用主题 token"
```

---

## Task 5 — Tokenize `components/site/product-card.tsx`

**Files:**
- Modify: `components/site/product-card.tsx`

- [ ] **Step 1：改写行 10**

把：

```tsx
<div className="group relative min-h-[210px] overflow-hidden rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 px-[22px] shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all hover:border-[var(--color-card-border-hover)] hover:shadow-[0_10px_24px_rgba(28,25,23,0.07)]">
```

改成：

```tsx
<div className="group relative min-h-[210px] overflow-hidden rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 px-[22px] shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-card-border-hover)] hover:shadow-[var(--shadow-soft-hover)]">
```

- [ ] **Step 2：grep 验证**

```
grep -n "rgba(28,25,23" components/site/product-card.tsx || echo "clean"
```

预期：`clean`。

- [ ] **Step 3：跑 lint + 测试**

```
pnpm lint
pnpm test
```

预期：均通过。

- [ ] **Step 4：commit**

```bash
git add components/site/product-card.tsx
git commit -m "refactor(product-card): 卡片阴影改用主题 token"
```

---

## Task 6 — 新增 `app/theme-init.tsx` 防闪脚本

服务端组件，渲染一段 `<script>`，在客户端 paint 前同步读 localStorage、改 `data-theme`。

**Files:**
- Create: `app/theme-init.tsx`
- Create: `app/theme-init.test.ts`

- [ ] **Step 1：写测试（应失败）**

`app/theme-init.test.ts`：

```ts
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeInit } from "./theme-init";
import { THEME_IDS } from "@/lib/themes";

describe("ThemeInit", () => {
  it("渲染为一个 <script> 节点", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html.startsWith("<script>")).toBe(true);
    expect(html.endsWith("</script>")).toBe(true);
  });

  it("脚本字符串中按字面顺序包含 6 个主题 id（白名单防 XSS）", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    for (const id of THEME_IDS) {
      expect(html).toContain(`'${id}'`);
    }
  });

  it("脚本使用 try/catch 包裹（localStorage 在 sandbox iframe 下可能抛错）", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html).toContain("try{");
    expect(html).toContain("catch");
  });

  it("脚本读取 localStorage 的 'theme' 键", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html).toContain("localStorage.getItem('theme')");
  });

  it("脚本写入 document.documentElement.dataset.theme", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html).toContain("document.documentElement.dataset.theme");
  });
});
```

> 测试使用 `react-dom/server` 的 `renderToStaticMarkup`——React 19 已含此 API，无需新依赖。

- [ ] **Step 2：跑测试验证失败**

```
pnpm test app/theme-init.test.ts
```

预期：`Cannot find module './theme-init'`。

- [ ] **Step 3：实现 `app/theme-init.tsx`**

```tsx
/**
 * 内联防闪脚本：在 React 接管前同步根据 localStorage 改 <html data-theme>。
 *
 * 注意：这里的主题白名单数组是手写副本，无法 import lib/themes.ts——脚本
 * 要在 hydration 前作为字符串求值，import 会变成异步模块加载。
 * 加新主题时必须同步改两处。
 */
export function ThemeInit() {
  const script =
    "(function(){try{" +
    "var t=localStorage.getItem('theme');" +
    "if(t&&['sand','ink','mist','moss','editorial','terminal'].indexOf(t)>=0){" +
    "document.documentElement.dataset.theme=t" +
    "}}catch(e){}})();";
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

- [ ] **Step 4：跑测试验证通过**

```
pnpm test app/theme-init.test.ts
```

预期：5 passed。

- [ ] **Step 5：commit**

```bash
git add app/theme-init.tsx app/theme-init.test.ts
git commit -m "feat(theme): add ThemeInit 内联脚本在 paint 前同步主题"
```

---

## Task 7 — 改 `app/layout.tsx`：字体 + 默认 data-theme + ThemeInit

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1：完整替换 `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Source_Serif_4 } from "next/font/google";
import { ThemeInit } from "./theme-init";
import "./globals.css";

const SourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afreecoder.dev"),
  title: {
    default: "AFreeCoder",
    template: "%s · AFreeCoder",
  },
  description:
    "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
  openGraph: {
    title: "AFreeCoder",
    description:
      "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
    url: "https://afreecoder.dev",
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
      data-theme="sand"
      className={`${GeistSans.variable} ${GeistMono.variable} ${SourceSerif.variable}`}
    >
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
```

要点：
- `<ThemeInit />` 作为 `<body>` 的**第一个子节点**——在 React 接管前同步执行，不需要 `<head>`。
- `--font-source-serif` 变量名与 globals.css 中 `--font-serif: var(--font-source-serif), ...` 引用一致。
- `data-theme="sand"` 设在 SSR HTML 上——首屏永远是 sand；防闪脚本在执行前的极短时间也是 sand。

- [ ] **Step 2：启动 dev server 手动验证**

```
pnpm dev
```

打开 http://localhost:3000，devtools 检查：

1. `<html>` 标签上有 `data-theme="sand"`
2. `<body>` 第一个节点是 `<script>(function(){try{...})();</script>`
3. 在 console 输入 `localStorage.setItem('theme','ink'); location.reload()`——刷新后页面应是墨夜暗色，**且无白闪**
4. 输入 `localStorage.removeItem('theme'); location.reload()`——回到暖砂

- [ ] **Step 3：恢复 sand、停 dev**

```
localStorage.removeItem('theme')
```

Ctrl+C 停 dev。

- [ ] **Step 4：lint + 完整测试**

```
pnpm lint
pnpm test
```

预期：均通过。

- [ ] **Step 5：commit**

```bash
git add app/layout.tsx
git commit -m "feat(theme): 加载 Source Serif、SSR 默认主题 sand、挂入 ThemeInit"
```

---

## Task 8 — 新增 `components/site/theme-switcher.tsx`

调色板按钮 + 下拉菜单。客户端组件，无外部依赖（图标用内联 SVG 避免 lucide-react 版本兼容问题）。

**Files:**
- Create: `components/site/theme-switcher.tsx`

- [ ] **Step 1：实现**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_THEME, THEMES, type ThemeId } from "@/lib/themes";

function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    THEMES.some((t) => t.id === value)
  );
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>(DEFAULT_THEME);
  const containerRef = useRef<HTMLDivElement>(null);

  // 挂载后从 <html data-theme> 同步当前值（防闪脚本已设置）
  useEffect(() => {
    const value = document.documentElement.dataset.theme;
    if (isThemeId(value)) setCurrent(value);
  }, []);

  // 点击菜单外关闭 & Esc 关闭
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(id: ThemeId) {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("theme", id);
    } catch {
      // sandbox iframe 等场景 localStorage 不可写——忽略
    }
    setCurrent(id);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="切换主题"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="theme-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-fg)] transition-colors hover:border-[var(--color-card-border-hover)] hover:text-[var(--color-accent)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
          <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="15" r="1.2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul
          id="theme-menu"
          role="menu"
          className="absolute right-0 top-[42px] z-50 w-[200px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-card)] p-1.5 text-[13px] shadow-[var(--shadow-soft-hover)]"
        >
          {THEMES.map((t) => {
            const active = current === t.id;
            return (
              <li
                key={t.id}
                role="menuitem"
                aria-current={active}
                onClick={() => choose(t.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-fg)] hover:bg-[var(--color-accent-soft)]"
                }`}
              >
                <span
                  className="inline-block h-3.5 w-3.5 rounded border border-[var(--color-border)]"
                  style={{ background: t.swatch }}
                  aria-hidden
                />
                <span className="flex-1">{t.label}</span>
                {active && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

注意：

- 用 `useRef<HTMLDivElement>` 挂在容器上做"点击外部关闭"判定，比 click listener + closest 选择器更稳。
- `pointerdown` 而非 `click`——`click` 会让"按钮再次点击关闭"逻辑和"外部点击关闭"在同一事件中竞态；`pointerdown` 在 button 的 `onClick` 之前触发，因此先关后立刻被 button 的 onClick 再开——这是错的。需要保留：**button 自己的 onClick 触发 toggle 时，外部 listener 不应该把它当成"外部"关闭**。
- 解决方案：listener 用 `containerRef.current?.contains(target)` 判定，button 在 container 内 → 不被识别为外部点击 → 不冲突。这正是上面代码的写法。

- [ ] **Step 2：跑 lint + test 验证编译通过**

```
pnpm lint
pnpm test
```

预期：均通过（无新增测试，仅类型/格式校验）。

- [ ] **Step 3：commit**

```bash
git add components/site/theme-switcher.tsx
git commit -m "feat(theme): 添加调色板下拉切换器（无外部依赖、内联 SVG）"
```

---

## Task 9 — 把切换器挂到 `nav.tsx` 右侧

**Files:**
- Modify: `components/site/nav.tsx`

- [ ] **Step 1：完整替换 `components/site/nav.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ThemeSwitcher } from "./theme-switcher";

export function Nav() {
  return (
    <nav className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 text-[15px] sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/"
        className="text-[17px] font-semibold text-[var(--color-fg)]"
      >
        {siteConfig.name}
      </Link>
      <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-2 sm:w-auto sm:justify-end">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[var(--color-muted)]">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="transition-colors hover:text-[var(--color-fg)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-2 flex items-center">
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
```

要点：
- 原本 `<ul>` 是 nav 的直接子节点，现在包到 `<div>` 里以便和 `<ThemeSwitcher />` 同行。
- 手机端 `flex-col` 模式下，菜单 + 切换器仍在同一行（`flex-wrap` 兜底）。
- 切换器与菜单之间 `ml-2`（约 8px）间距，避免点击误触。

- [ ] **Step 2：lint + test**

```
pnpm lint
pnpm test
```

预期：均通过。

- [ ] **Step 3：commit**

```bash
git add components/site/nav.tsx
git commit -m "feat(nav): 在导航栏右侧挂入主题切换器"
```

---

## Task 10 — 跨主题视觉烟测 + 收尾

这是不写代码的验收任务，但**必须做**：spec 中所有主题差异（衬线、mono、阴影、accent-soft）只有靠眼睛能验证。

- [ ] **Step 1：起 dev**

```
pnpm dev
```

打开 http://localhost:3000。

- [ ] **Step 2：逐个主题过 5 个页面**

每个主题依次打开：

1. `/` — Hero（头像框 + slogan）+ ProductCard + WritingItem 列表
2. `/writing` — 列表 + WritingItem
3. `/writing/hello-world` — MDX 渲染 + code block + 引用块
4. `/products` — 列表
5. `/about` — MDX

主题列表：sand / ink / mist / moss / editorial / terminal（点切换器即可）。

每个组合勾选下面 checklist：

- [ ] **sand** · 5 页面正常（基线，对照参考）
- [ ] **ink** · hero 头像框背景是深 card 色而非纯黑；product 卡片阴影可见（不是漆黑一片）
- [ ] **mist** · 链接是靛蓝；标题深灰偏蓝
- [ ] **moss** · 卡片阴影是发光感而非投影；accent 黄铜色在深绿底上清晰
- [ ] **editorial** · `<h1>` `<h2>` `<h3>` 是衬线（Source Serif 4）；中文标题回退合理；accent 朱红
- [ ] **terminal** · 整页所有文字都是等宽（连导航和按钮也是）；accent 绿色

- [ ] **Step 3：交互验证**

- [ ] 切换器按钮 Tab 到达，按 Enter 展开
- [ ] 展开后按 Esc 关闭
- [ ] 点菜单外区域关闭
- [ ] 点当前主题（sand），保持 sand，菜单关闭，无报错
- [ ] localStorage 写入了 `theme` 键（devtools → Application → Local Storage）

- [ ] **Step 4：刷新无闪烁**

切到 ink 后硬刷（Cmd+Shift+R）——页面应直接显示 ink，**没有任何白屏 / 暖砂闪现**。重点：地址栏底色（color-scheme）也应该暗。

- [ ] **Step 5：build 验证**

```
pnpm build:next
```

预期：构建无错误。`opennextjs-cloudflare build`（生产路径）可以暂不跑，留给后续部署 PR。

- [ ] **Step 6：commit 烟测笔记（如有偏差）**

如果烟测发现需要微调（如 faint 对比度、苔石 swatch 选色），改完用合适的 commit 信息提交。

如果一切正常，无需额外 commit；直接进入下一步。

---

## 自检清单（plan 写完后我已做）

- ✅ Spec 第 1–11 节内容全部映射到任务：
  - 1 目标 → 全 plan
  - 2 决策摘要 → 全 plan
  - 3 架构 → Tasks 1/3/6/7/8/9
  - 4 主题 token → Tasks 1/2/3
  - 5 字体加载 → Tasks 3/7
  - 6 切换器 → Tasks 8/9
  - 7 防闪脚本 → Tasks 6/7
  - 8 硬编码清理 → Tasks 4/5
  - 9 范围外 → 未实施（正确）
  - 10 测试 → Tasks 1/2/6 + Task 10 烟测
  - 11 实施步骤 → 即本 plan 的 Task 顺序
- ✅ 无 TBD / TODO / 占位（除 Task 10 内部允许的"如有偏差再调"，因为是人工烟测的合理预案）
- ✅ 类型 / 函数命名前后一致：`ThemeId`、`THEME_IDS`、`THEMES`、`DEFAULT_THEME`、`ThemeInit`、`ThemeSwitcher`、`choose`
- ✅ 每个代码步骤都附完整代码块，不写"按上面方法做"
