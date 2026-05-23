# 主题系统重做（阶段一 · Annual reference）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 6 套"仅换 CSS token"的主题体系替换为 4 套"整页布局体系"的主题，先做 Annual 一套打通架构（cookie+RSC dispatch / per-page themed component / 装饰文案配置 / 动态数据 / 切换器改造），并通过完整测试 + 打包验证。

**Architecture:** 由 SSR 阶段的 `cookies()` 决定主题 → `html[data-theme=…]` + 通过 `pickThemedPage(theme, key)` 调度到 `Annual.*` 完整页面组件。装饰文案集中在 `content/decorations/annual.ts`，动态数据由 `lib/site-stats.ts` 提供。切换器 cookie + `router.refresh()` 触发 RSC 重渲染。

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · TypeScript · Vitest · next/font/google · OpenNext Cloudflare · pnpm

**Spec:** [docs/superpowers/specs/2026-05-23-theme-system-redesign-design.md](../specs/2026-05-23-theme-system-redesign-design.md)

---

## Task 1：`lib/themes.ts` 重写 + 测试（含旧 ID 临时兼容）

**Files:**
- Modify: `lib/themes.ts`
- Modify: `lib/themes.test.ts`

- [ ] **Step 1: 改测试** `lib/themes.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { THEME_IDS, THEMES, DEFAULT_THEME, isThemeId, type ThemeId } from "./themes";

describe("themes", () => {
  it("exposes 4 theme ids in expected order", () => {
    expect(THEME_IDS).toEqual(["annual", "workshop", "nocturne", "telegraph"]);
  });

  it("DEFAULT_THEME is annual", () => {
    expect(DEFAULT_THEME).toBe("annual");
  });

  it("provides a metadata entry per id with label/swatch/blurb/available", () => {
    expect(THEMES.map((t) => t.id)).toEqual(THEME_IDS);
    for (const t of THEMES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.blurb.length).toBeGreaterThan(0);
      expect(t.swatch).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof t.available).toBe("boolean");
    }
  });

  it("only annual is available in stage one", () => {
    const available = THEMES.filter((t) => t.available).map((t) => t.id);
    expect(available).toEqual(["annual"]);
  });

  it("isThemeId narrows correctly", () => {
    expect(isThemeId("annual")).toBe(true);
    expect(isThemeId("workshop")).toBe(true);
    expect(isThemeId("sand")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(isThemeId(42)).toBe(false);
  });

  it("ThemeId type contains exactly the documented ids", () => {
    const ids: ThemeId[] = ["annual", "workshop", "nocturne", "telegraph"];
    expect(new Set(ids).size).toBe(4);
  });
});
```

- [ ] **Step 2: 运行测试看失败**

`pnpm test lib/themes.test.ts`
Expected: 多条 FAIL（旧 ids、缺 DEFAULT_THEME / isThemeId 等）。

- [ ] **Step 3: 改实现** `lib/themes.ts`

```ts
export const THEME_IDS = ["annual", "workshop", "nocturne", "telegraph"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string"
    && (THEME_IDS as readonly string[]).includes(value);
}

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  swatch: string;
  blurb: string;
  available: boolean;
};

export const THEMES: ThemeMeta[] = [
  { id: "annual",    label: "年鉴 Annual",    swatch: "#b53028", blurb: "宣纸米 · 朱砂印章 · 章节式",  available: true  },
  { id: "workshop",  label: "工坊 Workshop",  swatch: "#ff5b1f", blurb: "蓝图网格 · 工程文档式",       available: false },
  { id: "nocturne",  label: "夜灯 Nocturne",  swatch: "#f0a04b", blurb: "深炭 · 琥珀光 · 巨型衬线",    available: false },
  { id: "telegraph", label: "电报 Telegraph", swatch: "#7dff9a", blurb: "墨绿磷光 · ASCII · 终端式",   available: false },
];

export const DEFAULT_THEME: ThemeId = "annual";

/**
 * 临时保留：旧主题 ID 字符串数组。
 * 仅供尚未删除的旧组件 import，避免中间阶段编译失败。
 * 阶段一收尾（Task 16）时连同旧组件一起删除。
 */
export const LEGACY_THEME_IDS = ["sand", "ink", "mist", "moss", "editorial", "terminal"] as const;
```

- [ ] **Step 4: 运行测试看通过**

`pnpm test lib/themes.test.ts`
Expected: 全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add lib/themes.ts lib/themes.test.ts
git commit -m "feat(theme): 主题枚举切到 4 套 + DEFAULT_THEME=annual + isThemeId

替换为 annual / workshop / nocturne / telegraph 四套主题元数据；
DEFAULT_THEME 改为 annual；新加 isThemeId 类型保护与 available 标志。
临时保留 LEGACY_THEME_IDS 供尚未删除的旧组件兼容引用，
后续清理步骤会一并移除。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2：`lib/get-current-theme.ts` —— 服务端读 cookie

**Files:**
- Create: `lib/get-current-theme.ts`

- [ ] **Step 1: 写实现**

```ts
import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "./themes";

const COOKIE_NAME = "theme";

export async function getCurrentTheme(): Promise<ThemeId> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return isThemeId(value) ? value : DEFAULT_THEME;
}

export const THEME_COOKIE_NAME = COOKIE_NAME;
```

无单测：`next/headers cookies()` mock 成本高于价值；逻辑通过 page-level 手测验证。

- [ ] **Step 2: Commit**

```bash
git add lib/get-current-theme.ts
git commit -m "feat(theme): 加 getCurrentTheme 工具（cookie+fallback）

服务端 RSC 通过 cookies() 读 theme cookie，校验后命中
DEFAULT_THEME。导出 THEME_COOKIE_NAME 供切换器写入时复用。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3：`lib/site-stats.ts` —— 动态数据 + 测试

**Files:**
- Create: `lib/site-stats.ts`
- Create: `lib/site-stats.test.ts`

- [ ] **Step 1: 写测试**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/content/products", () => ({
  products: [
    { name: "A", description: "", role: "", phase: "", highlight: "", tags: [], link: "", status: "active" },
    { name: "B", description: "", role: "", phase: "", highlight: "", tags: [], link: "", status: "active" },
    { name: "C", description: "", role: "", phase: "", highlight: "", tags: [], link: "", status: "archived" },
  ],
}));

vi.mock("@/lib/writing", () => ({
  getAllWriting: async () => [
    { title: "x", date: "2022-12-06", slug: "x", summary: "", original_url: "", platforms: [], bodyFormat: "markdown", readingTime: 1 },
    { title: "y", date: "2019-06-05", slug: "y", summary: "", original_url: "", platforms: [], bodyFormat: "markdown", readingTime: 1 },
  ],
}));

import { getSiteStats, fillTemplate, toRoman } from "./site-stats";

describe("site-stats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T00:00:00Z"));
  });

  it("computes since / sinceYear / yearsActive", async () => {
    const s = await getSiteStats();
    expect(s.since).toBe("2019.06.05");
    expect(s.sinceYear).toBe(2019);
    expect(s.yearsActive).toBe(7);
  });

  it("counts posts and products", async () => {
    const s = await getSiteStats();
    expect(s.postCount).toBe(2);
    expect(s.productLiveCount).toBe(2);
    expect(s.productArchivedCount).toBe(1);
  });

  it("volRoman is toRoman(yearsActive + 1)", async () => {
    const s = await getSiteStats();
    expect(s.volRoman).toBe("VIII"); // 7 + 1
  });

  it("uptimeDays counts to today", async () => {
    const s = await getSiteStats();
    // 2019-06-05 → 2026-05-23 ≈ 2545 days (允许 ±1)
    expect(s.uptimeDays).toBeGreaterThanOrEqual(2540);
    expect(s.uptimeDays).toBeLessThanOrEqual(2550);
  });

  it("fillTemplate replaces {{key}} tokens", async () => {
    const s = await getSiteStats();
    const out = fillTemplate("自 {{since}} 起 {{postCount}} 篇 {{productLiveCount}} 件 {{years}} 年", s);
    expect(out).toBe("自 2019.06.05 起 2 篇 2 件 7 年");
  });

  it("toRoman known values", () => {
    expect(toRoman(1)).toBe("I");
    expect(toRoman(4)).toBe("IV");
    expect(toRoman(7)).toBe("VII");
    expect(toRoman(8)).toBe("VIII");
    expect(toRoman(40)).toBe("XL");
  });
});
```

- [ ] **Step 2: 运行测试看失败**

`pnpm test lib/site-stats.test.ts`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 写实现**

```ts
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export type Stats = {
  since: string;
  sinceYear: number;
  yearsActive: number;
  volRoman: string;
  postCount: number;
  productLiveCount: number;
  productArchivedCount: number;
  uptimeDays: number;
};

export function toRoman(n: number): string {
  if (n <= 0) return "";
  const pairs: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"],  [90, "XC"],  [50, "L"],  [40, "XL"],
    [10, "X"],   [9, "IX"],   [5, "V"],   [4, "IV"], [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [k, sym] of pairs) {
    while (v >= k) { out += sym; v -= k; }
  }
  return out;
}

function formatSinceDate(iso: string): string {
  // "2019-06-05" → "2019.06.05"
  return iso.replaceAll("-", ".");
}

export async function getSiteStats(): Promise<Stats> {
  const posts = await getAllWriting();
  const dates = posts.map((p) => p.date).sort();
  const earliestIso = dates[0] ?? "2019-06-05";
  const earliest = new Date(earliestIso + "T00:00:00Z");
  const now = new Date();
  const sinceYear = earliest.getUTCFullYear();
  const currentYear = now.getUTCFullYear();
  const yearsActive = currentYear - sinceYear;

  return {
    since: formatSinceDate(earliestIso),
    sinceYear,
    yearsActive,
    volRoman: toRoman(yearsActive + 1),
    postCount: posts.length,
    productLiveCount: products.filter((p) => p.status === "active").length,
    productArchivedCount: products.filter((p) => p.status === "archived").length,
    uptimeDays: Math.floor((now.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

export function fillTemplate(template: string, stats: Stats): string {
  return template
    .replaceAll("{{since}}",            stats.since)
    .replaceAll("{{sinceYear}}",        String(stats.sinceYear))
    .replaceAll("{{years}}",            String(stats.yearsActive))
    .replaceAll("{{volRoman}}",         stats.volRoman)
    .replaceAll("{{postCount}}",        String(stats.postCount))
    .replaceAll("{{productLiveCount}}", String(stats.productLiveCount))
    .replaceAll("{{productArchivedCount}}", String(stats.productArchivedCount))
    .replaceAll("{{uptimeDays}}",       String(stats.uptimeDays));
}
```

- [ ] **Step 4: 运行测试看通过**

`pnpm test lib/site-stats.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add lib/site-stats.ts lib/site-stats.test.ts
git commit -m "feat(theme): 加 site-stats 动态数据 + fillTemplate

提供 since / postCount / productLiveCount / yearsActive / volRoman /
uptimeDays，供主题装饰文案在渲染时替换 {{占位符}}。toRoman
工具按经典减法律法实现 1..3999 范围。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4：`content/decorations/annual.ts` 装饰文案配置

**Files:**
- Create: `content/decorations/annual.ts`

- [ ] **Step 1: 写实现**

```ts
import type { Stats } from "@/lib/site-stats";

export type AnnualDecoration = {
  masthead: {
    volume: string | ((s: Stats) => string);
    series: string;
    left: string;
    right: string;
    centerSegments: readonly [string, string, string];
    establishedYear: number;
  };
  navLabels: { home: string; about: string; products: string; writing: string; colophon: string };
  /** 首页（带朱砂印章）的章节扉页 */
  frontispieceHome: {
    roman: string;
    title: string;
    titleAccent?: string;
    caption: string;
    stamp: {
      primary: readonly [string, string];
      arcTop: string;
      arcBottom: string;
    };
  };
  /** about/products/writing 三页扉页（无印章） */
  frontispieceAbout:    { roman: string; title: string; titleAccent?: string; caption: string };
  frontispieceProducts: { roman: string; title: string; titleAccent?: string; caption: string };
  frontispieceWriting:  { roman: string; title: string; titleAccent?: string; caption: string };
  /** 首页内嵌的章节标题 */
  chapters: {
    about:     { num: string; title: string; titleAccent?: string; metaHref: string; metaLabel: string };
    products:  { num: string; title: string; titleAccent?: string };
    writing:   { num: string; title: string; titleAccent?: string };
  };
  colophon: {
    fontsLine: string;
    contactLine: string;
    subscribeLine: string;
    disclaimerLine: string;
  };
  signature?: string;
};

export const annualDecoration: AnnualDecoration = {
  masthead: {
    volume: (s) => s.volRoman,
    series: "Series",
    left:  "A Coder · In Pursuit of Freedom",
    right: "自由痕迹 · 年鉴",
    centerSegments: ["A", "F", "C"],
    establishedYear: 2019,
  },
  navLabels: {
    home: "索引",
    about: "关于",
    products: "在线",
    writing: "实证",
    colophon: "奥版",
  },
  frontispieceHome: {
    roman: "I.",
    title: "这里是一个追求自由的 Coder 的痕迹。",
    titleAccent: "追求自由",
    caption:
      "— 自 {{since}} 起，连续记录 {{postCount}} 篇实证；同时把 {{productLiveCount}} 件还在运行的产品摆在公众可访问的地址下，作为长期可验证的证据。",
    stamp: {
      primary:    ["实", "证"],
      arcTop:     "A · FREE · CODER",
      arcBottom:  "EST · MMXIX",
    },
  },
  frontispieceAbout: {
    roman: "II.",
    title: "我，A-Free-Coder。",
    titleAccent: "A-Free-Coder",
    caption: "— 一个追求自由的 Coder 的自白。",
  },
  frontispieceProducts: {
    roman: "III.",
    title: "仍在运转的 {{productLiveCount}} 件事。",
    caption: "— 当前 {{productLiveCount}} 件运行中，{{productArchivedCount}} 件已归档。",
  },
  frontispieceWriting: {
    roman: "IV.",
    title: "已记录的 {{postCount}} 篇痕迹。",
    caption: "— 自 {{since}} 起按年成卷，倒序排列。",
  },
  chapters: {
    about:    { num: "— Chapter Two · 关于",         title: "我，A-Free-Coder", titleAccent: "A-Free-Coder", metaHref: "/about", metaLabel: "→ 完整自白" },
    products: { num: "— Chapter Three · 在线运行的产品", title: "仍在运转的四件事", titleAccent: "运转" },
    writing:  { num: "— Chapter Four · 实证目录",     title: "已记录的 {{postCount}} 篇痕迹",   titleAccent: "{{postCount}} 篇" },
  },
  colophon: {
    fontsLine:     "排版于 {{sinceYear}}—当下 · 主体字体 Fraunces / Newsreader / JetBrains Mono · 纸色仿宣纸。",
    contactLine:   "GitHub · AFreeCoder · hello@afreecoder.dev",
    subscribeLine: "RSS 全文 · 站点地图",
    disclaimerLine:"内容自 {{since}} 持续撰写。一切实证不构成投资建议。© {{sinceYear}} — 当下 · A-Free-Coder",
  },
  signature: "— A.F.C.",
};
```

- [ ] **Step 2: Commit**

```bash
git add content/decorations/annual.ts
git commit -m "feat(theme): 加 Annual 主题装饰文案默认配置

把原型中所有 '为风格服务的虚构文案'（卷号 / masthead / 印章 /
章节标题 / 奥版）显式化为可配置项；支持 {{since}}/{{postCount}}
等占位符，由 site-stats 在渲染时填充。volume 默认从 stats 自动算
（VIII 等），用户可改为字符串硬编码。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5：`components/themes/dispatch.tsx` + 测试

**Files:**
- Create: `components/themes/dispatch.tsx`
- Create: `components/themes/dispatch.test.tsx`
- Create: `components/themes/annual/index.ts` (空 re-export，让 dispatch 可 import；具体组件 Task 6+ 实现)

- [ ] **Step 1: 先建空 annual index 让 import 可解析**

`components/themes/annual/index.ts`:
```ts
import type { ComponentType } from "react";

// 这些组件由 Task 6-13 实现；这里先以占位 stub 满足 dispatch import
function Placeholder({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}

export const Annual = {
  home: Placeholder as ComponentType<any>,
  about: Placeholder as ComponentType<any>,
  products: Placeholder as ComponentType<any>,
  writingList: Placeholder as ComponentType<any>,
  writingPost: Placeholder as ComponentType<any>,
};
```

- [ ] **Step 2: 写 dispatch 测试**

`components/themes/dispatch.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { pickThemedPage, type PageKey } from "./dispatch";
import { Annual } from "./annual";

describe("dispatch", () => {
  const keys: PageKey[] = ["home", "about", "products", "writingList", "writingPost"];

  it("annual returns Annual.* components", () => {
    for (const k of keys) {
      expect(pickThemedPage("annual", k)).toBe(Annual[k]);
    }
  });

  it("unavailable themes fall back to Annual.*", () => {
    for (const k of keys) {
      expect(pickThemedPage("workshop", k)).toBe(Annual[k]);
      expect(pickThemedPage("nocturne", k)).toBe(Annual[k]);
      expect(pickThemedPage("telegraph", k)).toBe(Annual[k]);
    }
  });
});
```

- [ ] **Step 3: 写 dispatch 实现**

`components/themes/dispatch.tsx`:
```tsx
import type { ComponentType } from "react";
import type { ThemeId } from "@/lib/themes";
import { Annual } from "./annual";

export type PageKey = "home" | "about" | "products" | "writingList" | "writingPost";

const REGISTRY: Record<ThemeId, Partial<Record<PageKey, ComponentType<any>>>> = {
  annual:    Annual,
  workshop:  {},
  nocturne:  {},
  telegraph: {},
};

export function pickThemedPage(theme: ThemeId, key: PageKey): ComponentType<any> {
  return REGISTRY[theme][key] ?? Annual[key];
}
```

- [ ] **Step 4: 运行测试看通过**

`pnpm test components/themes/dispatch.test.tsx`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add components/themes/dispatch.tsx components/themes/dispatch.test.tsx components/themes/annual/index.ts
git commit -m "feat(theme): dispatch + Annual 占位 — RSC 按主题选 page 组件

pickThemedPage(theme, key) 在 RSC 中按当前主题返回对应主题的
page 组件；阶段一三套未实现主题统一兜底到 Annual。Annual 暂
先 Placeholder stub 让 dispatch 自洽，下一批任务替换为真实组件。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6：Annual 子组件 - 基础 SVG 与时间标尺

**Files:**
- Create: `components/themes/annual/stamp.tsx`
- Create: `components/themes/annual/timeline-spine.tsx`

- [ ] **Step 1: 写 stamp.tsx**

```tsx
type Props = {
  primary: readonly [string, string];
  arcTop: string;
  arcBottom: string;
  size?: number;
  className?: string;
};

export function Stamp({ primary, arcTop, arcBottom, size = 148, className }: Props) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ width: size, height: size, transform: "rotate(-7deg)" }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
        <defs>
          <path id="annual-stamp-arc-top" d="M 30,100 A 70,70 0 0 1 170,100" />
          <path id="annual-stamp-arc-bot" d="M 30,100 A 70,70 0 0 0 170,100" />
        </defs>
        <text fill="var(--color-accent)" fontFamily='"JetBrains Mono", monospace' fontSize="10" letterSpacing="0.3em">
          <textPath href="#annual-stamp-arc-top" startOffset="50%" textAnchor="middle">{arcTop}</textPath>
        </text>
        <text fill="var(--color-accent)" fontFamily='"JetBrains Mono", monospace' fontSize="10" letterSpacing="0.3em">
          <textPath href="#annual-stamp-arc-bot" startOffset="50%" textAnchor="middle">{arcBottom}</textPath>
        </text>
        <text x="100" y="92" textAnchor="middle" fill="var(--color-accent)" fontFamily='"Noto Serif SC","Fraunces", serif' fontWeight="700" fontSize="34" letterSpacing="0.04em">{primary[0]}</text>
        <text x="100" y="128" textAnchor="middle" fill="var(--color-accent)" fontFamily='"Noto Serif SC","Fraunces", serif' fontWeight="700" fontSize="34" letterSpacing="0.04em">{primary[1]}</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 写 timeline-spine.tsx**

```tsx
type Props = { startYear: number; currentYear: number };

export function TimelineSpine({ startYear, currentYear }: Props) {
  const years: number[] = [];
  for (let y = startYear; y <= currentYear; y++) years.push(y);
  return (
    <aside aria-hidden className="annual-timeline">
      <div className="annual-timeline-track">
        {years.map((y) => (
          <span key={y} className={`annual-timeline-year${y === currentYear ? " is-active" : ""}`}>{y}</span>
        ))}
        <span className="annual-timeline-now">NOW</span>
      </div>
    </aside>
  );
}
```

(CSS class `.annual-timeline*` 由 Task 14 的 globals.css 提供。)

- [ ] **Step 3: Commit**

```bash
git add components/themes/annual/stamp.tsx components/themes/annual/timeline-spine.tsx
git commit -m "feat(theme): Annual - 朱砂印章 SVG + 年份时间标尺

Stamp 接受双字主字 + 弧形上下文字 + 可调尺寸。
TimelineSpine 根据 startYear..currentYear 自动生成年份，
末尾加 NOW 标。视觉细节由 globals.css 配套类提供。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7：Annual 子组件 - Masthead

**Files:**
- Create: `components/themes/annual/masthead.tsx`

- [ ] **Step 1: 写实现**

```tsx
import Link from "next/link";
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { AnnualDecoration } from "@/content/decorations/annual";
import { ThemeSwitcher } from "@/components/site/theme-switcher";

type Props = {
  theme: ThemeId;
  decoration: AnnualDecoration;
  stats: Stats;
  active: "home" | "about" | "products" | "writing";
};

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function Masthead({ theme, decoration, stats, active }: Props) {
  const m = decoration.masthead;
  const volume = typeof m.volume === "function" ? m.volume(stats) : m.volume;
  const seriesLine = `Vol. ${volume} · ${new Date().getUTCFullYear()} ${m.series}`;

  return (
    <header className="annual-masthead">
      <div className="annual-shell">
        <div className="annual-masthead-row">
          <div className="annual-masthead-left">
            <span className="annual-masthead-issue">{seriesLine}</span>
            <span className="annual-masthead-date">Issue · {todayIso()}</span>
          </div>
          <nav className="annual-masthead-nav">
            <Link href="/"          className={active === "home"     ? "is-active" : ""}>{decoration.navLabels.home}</Link>
            <Link href="/about"     className={active === "about"    ? "is-active" : ""}>{decoration.navLabels.about}</Link>
            <Link href="/products"  className={active === "products" ? "is-active" : ""}>{decoration.navLabels.products}</Link>
            <Link href="/writing"   className={active === "writing"  ? "is-active" : ""}>{decoration.navLabels.writing}</Link>
            <ThemeSwitcher current={theme} />
          </nav>
        </div>
        <div className="annual-masthead-title">
          <span className="annual-masthead-mt-left">A Coder · In Pursuit of Freedom</span>
          <h1 className="annual-masthead-mt-center">
            {m.centerSegments[0]}<i>·</i>{m.centerSegments[1]}<i>·</i>{m.centerSegments[2]}
            <span className="annual-masthead-est">EST. {m.establishedYear}</span>
          </h1>
          <span className="annual-masthead-mt-right">{m.right}</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/themes/annual/masthead.tsx
git commit -m "feat(theme): Annual - Masthead（卷号 + 居中标题 + 切换器槽位）

按当前年份与 stats.volRoman 拼出 Vol/Series 行；居中 A·F·C
三段字符 + EST 年份；右侧菜单含 4 个导航 + ThemeSwitcher。
切换器作为 prop 接收 current={theme}，避免引入客户端 Context。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8：Annual 子组件 - Frontispiece + ChapterHead

**Files:**
- Create: `components/themes/annual/frontispiece.tsx`
- Create: `components/themes/annual/chapter-head.tsx`

- [ ] **Step 1: 写 frontispiece.tsx**

```tsx
import { Stamp } from "./stamp";

type StampProps = { primary: readonly [string, string]; arcTop: string; arcBottom: string };

type Props = {
  roman: string;
  title: string;
  titleAccent?: string;
  caption: string;
  stamp?: StampProps;
};

function renderTitleWithAccent(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title;
  const parts = title.split(accent);
  return parts.flatMap((p, i) =>
    i === 0 ? [p] : [<em key={i}>{accent}</em>, p],
  );
}

export function Frontispiece({ roman, title, titleAccent, caption, stamp }: Props) {
  return (
    <section className="annual-frontispiece">
      <div className="annual-shell annual-frontispiece-grid">
        <div className="annual-frontispiece-roman">{roman}</div>
        <div>
          <h2 className="annual-frontispiece-title">{renderTitleWithAccent(title, titleAccent)}</h2>
          <p className="annual-frontispiece-caption">{caption}</p>
        </div>
        {stamp ? <Stamp primary={stamp.primary} arcTop={stamp.arcTop} arcBottom={stamp.arcBottom} className="annual-frontispiece-stamp" /> : <div />}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 写 chapter-head.tsx**

```tsx
import Link from "next/link";

type Props = {
  num: string;
  title: string;
  titleAccent?: string;
  metaLabel?: string;
  metaHref?: string;
};

function renderTitleWithAccent(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title;
  const parts = title.split(accent);
  return parts.flatMap((p, i) =>
    i === 0 ? [p] : [<em key={i}>{accent}</em>, p],
  );
}

export function ChapterHead({ num, title, titleAccent, metaLabel, metaHref }: Props) {
  return (
    <div className="annual-chapter-head">
      <div>
        <div className="annual-chapter-num">{num}</div>
        <h3 className="annual-chapter-title">{renderTitleWithAccent(title, titleAccent)}</h3>
      </div>
      {metaLabel && (
        metaHref
          ? <Link href={metaHref} className="annual-chapter-meta">{metaLabel}</Link>
          : <span className="annual-chapter-meta">{metaLabel}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/themes/annual/frontispiece.tsx components/themes/annual/chapter-head.tsx
git commit -m "feat(theme): Annual - Frontispiece + ChapterHead

Frontispiece 罗马数字 + 大字标题（支持 titleAccent 高亮子串）
+ 可选朱砂印章；首页带印章，其它三页不带。ChapterHead 章节
分隔。两者都用同样的 accent 高亮逻辑。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9：Annual 子组件 - AboutSection

**Files:**
- Create: `components/themes/annual/about-section.tsx`

- [ ] **Step 1: 写实现**

```tsx
import Image from "next/image";
import { aboutMdx } from "@/content/about";

type Props = {
  signature?: string;
};

/** 从 aboutMdx 中粗暴提取前 3 段文字与"现在关注"列表（避免把整篇 MDX 渲染到首页）。 */
function parseAboutSummary() {
  const lines = aboutMdx.split("\n");
  const paras: string[] = [];
  const pursuits: string[] = [];
  let inPursuits = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## 现在关注")) { inPursuits = true; continue; }
    if (line.startsWith("## ")) { inPursuits = false; continue; }
    if (inPursuits) {
      if (line.startsWith("- ")) pursuits.push(line.slice(2));
      continue;
    }
    if (/^[#-]/.test(line) || line === "") continue;
    if (paras.length < 3) paras.push(line);
  }
  return { paras, pursuits };
}

export function AboutSection({ signature }: Props) {
  const { paras, pursuits } = parseAboutSummary();
  return (
    <div className="annual-about">
      <div className="annual-about-portrait">
        <div className="annual-about-frame">
          <Image src="/avatar.png" alt="AFreeCoder 头像" width={1242} height={1124} priority className="annual-about-avatar" />
        </div>
        <div className="annual-about-caption">
          <b>AFreeCoder</b> · 主理人<br/>
          ex-bigtech · ex-soe<br/>
          now: 自由职业 / AI / 独立产品
        </div>
      </div>
      <div className="annual-about-prose">
        {paras.map((p, i) => <p key={i}>{p}</p>)}
        {signature && <div className="annual-about-sign">{signature}</div>}
        {pursuits.length > 0 && (
          <ul className="annual-about-pursuits">
            {pursuits.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/themes/annual/about-section.tsx
git commit -m "feat(theme): Annual - AboutSection（头像框 + drop-cap 自述 + 关注标签）

从 content/about.ts 解析出前 3 段正文与 '现在关注' 列表，
不再人工硬编码 Hero 摘要。头像走 next/image 优化；drop-cap
首字效果由配套 CSS 提供。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10：Annual 子组件 - ProductEntry + TocRow + Colophon

**Files:**
- Create: `components/themes/annual/product-entry.tsx`
- Create: `components/themes/annual/toc-row.tsx`
- Create: `components/themes/annual/colophon.tsx`

- [ ] **Step 1: 写 product-entry.tsx**

```tsx
import type { Product } from "@/lib/types";

const ROMAN_LOWER = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

const STATUS_LABEL: Record<Product["status"], string> = {
  active:   "RUNNING",
  archived: "ARCHIVED",
};

type Props = { product: Product; index: number };

export function ProductEntry({ product, index }: Props) {
  const inner = (
    <div className="annual-entry">
      <div className="annual-entry-idx">{ROMAN_LOWER[index] ?? String(index + 1)}</div>
      <div className="annual-entry-body">
        <h4 className="annual-entry-title"><span className="annual-entry-glyph">¶</span>{product.name}</h4>
        <p className="annual-entry-desc">{product.description}</p>
        <p className="annual-entry-pull">{product.highlight}</p>
      </div>
      <div className="annual-entry-meta">
        <span className="annual-entry-role">{product.role}</span>
        <span className="annual-entry-phase">{product.phase} · {STATUS_LABEL[product.status]}</span>
        <ul className="annual-entry-tags">
          {product.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
        {product.link && <a className="annual-entry-url" href={product.link}>{new URL(product.link).host}</a>}
      </div>
    </div>
  );

  if (product.link) {
    return <a href={product.link} target="_blank" rel="noreferrer" className="annual-entry-link">{inner}</a>;
  }
  return inner;
}
```

- [ ] **Step 2: 写 toc-row.tsx**

```tsx
import Link from "next/link";
import type { WritingMeta } from "@/lib/types";

type Props = { post: WritingMeta; index: number; };

export function TocRow({ post, index }: Props) {
  return (
    <Link href={`/writing/${post.slug}`} className="annual-toc-row">
      <span className="annual-toc-date">{post.date.replaceAll("-", "·")}</span>
      <span className="annual-toc-no">№ {String(index + 1).padStart(2, "0")}</span>
      <span className="annual-toc-title">{post.title}</span>
      <span className="annual-toc-rt">{post.readingTime} min</span>
    </Link>
  );
}
```

- [ ] **Step 3: 写 colophon.tsx**

```tsx
import type { AnnualDecoration } from "@/content/decorations/annual";
import type { Stats } from "@/lib/site-stats";
import { fillTemplate } from "@/lib/site-stats";

type Props = { decoration: AnnualDecoration; stats: Stats };

export function Colophon({ decoration, stats }: Props) {
  const c = decoration.colophon;
  return (
    <section className="annual-colophon">
      <div className="annual-colophon-grid">
        <div>
          <b>奥版 · Colophon</b>
          {fillTemplate(c.fontsLine, stats)}
        </div>
        <div>
          <b>联络</b>
          <a href="https://github.com/AFreeCoder">github · AFreeCoder</a><br/>
          <a href="mailto:hello@afreecoder.dev">hello@afreecoder.dev</a>
        </div>
        <div>
          <b>订阅</b>
          <a href="/rss.xml">RSS 全文</a><br/>
          <a href="/sitemap.xml">站点地图</a>
        </div>
        <div>
          <b>声明</b>
          {fillTemplate(c.disclaimerLine, stats)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/themes/annual/product-entry.tsx components/themes/annual/toc-row.tsx components/themes/annual/colophon.tsx
git commit -m "feat(theme): Annual - ProductEntry + TocRow + Colophon

ProductEntry 罗马序号 + 标题 + pull-quote + 右侧元数据；
TocRow 网格四列（date / № / title / 阅读时间）；
Colophon 双线分隔的 4 列奥版（字体 / 联络 / 订阅 / 声明），
fontsLine 与 disclaimerLine 走模板填充。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11：Annual page 组件 - HomePage / AboutPage

**Files:**
- Create: `components/themes/annual/home-page.tsx`
- Create: `components/themes/annual/about-page.tsx`
- Modify: `components/themes/annual/index.ts`

- [ ] **Step 1: 写 home-page.tsx**

```tsx
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { Product } from "@/lib/types";
import type { WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
import { TimelineSpine } from "./timeline-spine";
import { ChapterHead } from "./chapter-head";
import { AboutSection } from "./about-section";
import { ProductEntry } from "./product-entry";
import { TocRow } from "./toc-row";
import { Colophon } from "./colophon";

type Props = {
  theme: ThemeId;
  posts: WritingMeta[];
  products: Product[];
  stats: Stats;
};

export function HomePage({ theme, posts, products, stats }: Props) {
  const d = annualDecoration;
  const liveProducts = products.filter((p) => p.status === "active").slice(0, 4);
  const recentPosts = posts.slice(0, 6);
  const currentYear = new Date().getUTCFullYear();

  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="home" />
      <Frontispiece
        roman={d.frontispieceHome.roman}
        title={d.frontispieceHome.title}
        titleAccent={d.frontispieceHome.titleAccent}
        caption={fillTemplate(d.frontispieceHome.caption, stats)}
        stamp={d.frontispieceHome.stamp}
      />
      <div className="annual-layout">
        <TimelineSpine startYear={stats.sinceYear} currentYear={currentYear} />
        <div className="annual-content annual-shell">
          <section id="about">
            <ChapterHead num={d.chapters.about.num} title={fillTemplate(d.chapters.about.title, stats)} titleAccent={d.chapters.about.titleAccent} metaHref={d.chapters.about.metaHref} metaLabel={d.chapters.about.metaLabel} />
            <AboutSection signature={d.signature} />
          </section>
          <section id="products">
            <ChapterHead num={d.chapters.products.num} title={fillTemplate(d.chapters.products.title, stats)} titleAccent={d.chapters.products.titleAccent} metaHref="/products" metaLabel={`${stats.productLiveCount} 件 RUNNING · 全部 →`} />
            <div className="annual-ledger">
              {liveProducts.map((p, i) => <ProductEntry key={p.name} product={p} index={i} />)}
            </div>
          </section>
          <section id="writing">
            <ChapterHead num={d.chapters.writing.num} title={fillTemplate(d.chapters.writing.title, stats)} titleAccent={fillTemplate(d.chapters.writing.titleAccent ?? "", stats)} metaHref="/writing" metaLabel={`${stats.postCount} 篇 · 全部 →`} />
            <div className="annual-toc">
              {recentPosts.map((p, i) => <TocRow key={p.slug} post={p} index={i} />)}
            </div>
          </section>
        </div>
      </div>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
```

- [ ] **Step 2: 写 about-page.tsx**

```tsx
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
import { Colophon } from "./colophon";
import { Mdx } from "@/lib/mdx";
import { aboutMdx } from "@/content/about";

type Props = { theme: ThemeId; stats: Stats };

export function AboutPage({ theme, stats }: Props) {
  const d = annualDecoration;
  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="about" />
      <Frontispiece roman={d.frontispieceAbout.roman} title={d.frontispieceAbout.title} titleAccent={d.frontispieceAbout.titleAccent} caption={fillTemplate(d.frontispieceAbout.caption, stats)} />
      <article className="annual-article prose-annual">
        <Mdx source={aboutMdx} />
      </article>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
```

- [ ] **Step 3: 改 index.ts 暴露真实组件**

```ts
import { HomePage } from "./home-page";
import { AboutPage } from "./about-page";
import { ProductsPage } from "./products-page";
import { WritingListPage } from "./writing-list-page";
import { WritingPostPage } from "./writing-post-page";

export const Annual = {
  home: HomePage,
  about: AboutPage,
  products: ProductsPage,
  writingList: WritingListPage,
  writingPost: WritingPostPage,
};
```

注意：暂时只引 HomePage / AboutPage，products / writing 两个 import 在 Task 12 加之前会编译失败 —— 因此先注释掉这两行，Task 12 完成后再启用。临时版：

```ts
import { HomePage } from "./home-page";
import { AboutPage } from "./about-page";
import type { ComponentType } from "react";

function Placeholder() { return null; }

export const Annual = {
  home: HomePage,
  about: AboutPage,
  products: Placeholder as ComponentType<any>,
  writingList: Placeholder as ComponentType<any>,
  writingPost: Placeholder as ComponentType<any>,
};
```

- [ ] **Step 4: Commit**

```bash
git add components/themes/annual/home-page.tsx components/themes/annual/about-page.tsx components/themes/annual/index.ts
git commit -m "feat(theme): Annual - HomePage + AboutPage 组件

HomePage：Masthead + Frontispiece(带印章) + TimelineSpine +
About/Products/Writing 三章节 + Colophon；
AboutPage：Masthead + Frontispiece(无印章) + prose-annual 渲染 +
Colophon。products/writingList/writingPost 仍占位等下一批。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12：Annual page 组件 - ProductsPage / WritingListPage / WritingPostPage

**Files:**
- Create: `components/themes/annual/products-page.tsx`
- Create: `components/themes/annual/writing-list-page.tsx`
- Create: `components/themes/annual/writing-post-page.tsx`
- Modify: `components/themes/annual/index.ts`

- [ ] **Step 1: 写 products-page.tsx**

```tsx
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { Product } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
import { Colophon } from "./colophon";
import { ChapterHead } from "./chapter-head";
import { ProductEntry } from "./product-entry";

type Props = { theme: ThemeId; products: Product[]; stats: Stats };

export function ProductsPage({ theme, products, stats }: Props) {
  const d = annualDecoration;
  const active = products.filter((p) => p.status === "active");
  const archived = products.filter((p) => p.status === "archived");

  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="products" />
      <Frontispiece roman={d.frontispieceProducts.roman} title={fillTemplate(d.frontispieceProducts.title, stats)} caption={fillTemplate(d.frontispieceProducts.caption, stats)} />
      <div className="annual-content annual-shell">
        <section>
          <ChapterHead num="— 在线运行" title="RUNNING" />
          <div className="annual-ledger">
            {active.map((p, i) => <ProductEntry key={p.name} product={p} index={i} />)}
          </div>
        </section>
        {archived.length > 0 && (
          <section className="annual-archived">
            <ChapterHead num="— 已归档" title="ARCHIVED" />
            <div className="annual-ledger">
              {archived.map((p, i) => <ProductEntry key={p.name} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
```

- [ ] **Step 2: 写 writing-list-page.tsx**

```tsx
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate, toRoman } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
import { Colophon } from "./colophon";
import { ChapterHead } from "./chapter-head";
import { TocRow } from "./toc-row";

type Props = { theme: ThemeId; posts: WritingMeta[]; stats: Stats };

function groupByYear(posts: WritingMeta[]): Map<number, WritingMeta[]> {
  const m = new Map<number, WritingMeta[]>();
  for (const p of posts) {
    const y = Number(p.date.slice(0, 4));
    if (!m.has(y)) m.set(y, []);
    m.get(y)!.push(p);
  }
  return m;
}

export function WritingListPage({ theme, posts, stats }: Props) {
  const d = annualDecoration;
  const grouped = groupByYear(posts);
  const years = Array.from(grouped.keys()).sort((a, b) => b - a);

  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="writing" />
      <Frontispiece roman={d.frontispieceWriting.roman} title={fillTemplate(d.frontispieceWriting.title, stats)} caption={fillTemplate(d.frontispieceWriting.caption, stats)} />
      <div className="annual-content annual-shell">
        {years.map((year) => {
          const yearPosts = grouped.get(year)!;
          return (
            <section key={year}>
              <ChapterHead num={`Vol. ${toRoman(year - stats.sinceYear + 1)} · ${year}`} title={`${year} · ${yearPosts.length} 篇`} />
              <div className="annual-toc">
                {yearPosts.map((p, i) => <TocRow key={p.slug} post={p} index={i} />)}
              </div>
            </section>
          );
        })}
      </div>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
```

- [ ] **Step 3: 写 writing-post-page.tsx**

```tsx
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { Masthead } from "./masthead";
import { Colophon } from "./colophon";
import { ChapterHead } from "./chapter-head";
import { Mdx } from "@/lib/mdx";

type Props = {
  theme: ThemeId;
  stats: Stats;
  meta: WritingMeta;
  body: string;
};

export function WritingPostPage({ theme, stats, meta, body }: Props) {
  const d = annualDecoration;
  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="writing" />
      <article className="annual-article prose-annual">
        <header className="annual-article-head">
          <ChapterHead num={meta.date.replaceAll("-", "·")} title={meta.title} metaLabel={`${meta.readingTime} min`} />
        </header>
        <Mdx source={body} />
      </article>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
```

- [ ] **Step 4: 改 index.ts 暴露真实组件**

```ts
import { HomePage } from "./home-page";
import { AboutPage } from "./about-page";
import { ProductsPage } from "./products-page";
import { WritingListPage } from "./writing-list-page";
import { WritingPostPage } from "./writing-post-page";

export const Annual = {
  home: HomePage,
  about: AboutPage,
  products: ProductsPage,
  writingList: WritingListPage,
  writingPost: WritingPostPage,
};
```

- [ ] **Step 5: Commit**

```bash
git add components/themes/annual/products-page.tsx components/themes/annual/writing-list-page.tsx components/themes/annual/writing-post-page.tsx components/themes/annual/index.ts
git commit -m "feat(theme): Annual - Products / Writing(List+Post) page 组件

ProductsPage active 区 + archived 区分章节；WritingListPage 按
年分章节（每年罗马卷号 + 篇数），年内倒序；WritingPostPage 走
prose-annual + Masthead 一致框架。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13：Annual home-page 内容验证测试

**Files:**
- Create: `components/themes/annual/__tests__/home-page.test.tsx`

- [ ] **Step 1: 写测试**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { HomePage } from "../home-page";

vi.mock("@/components/site/theme-switcher", () => ({
  ThemeSwitcher: () => null,
}));

const stats = {
  since: "2019.06.05",
  sinceYear: 2019,
  yearsActive: 7,
  volRoman: "VIII",
  postCount: 67,
  productLiveCount: 4,
  productArchivedCount: 0,
  uptimeDays: 2548,
};

const products = [
  { name: "APIPool", description: "desc", role: "SaaS", phase: "线上", highlight: "hl", tags: ["A"], link: "https://apipool.dev", status: "active" as const },
];

const posts = [
  { title: "P1", date: "2022-12-06", slug: "p1", summary: "", original_url: "", platforms: [], bodyFormat: "markdown" as const, readingTime: 14 },
];

describe("Annual.HomePage", () => {
  it("renders masthead nav labels from decoration", () => {
    const { getByText } = render(<HomePage theme="annual" stats={stats} products={products} posts={posts} />);
    expect(getByText("索引")).toBeTruthy();
    expect(getByText("关于")).toBeTruthy();
    expect(getByText("在线")).toBeTruthy();
    expect(getByText("实证")).toBeTruthy();
  });

  it("renders product name from data", () => {
    const { getByText } = render(<HomePage theme="annual" stats={stats} products={products} posts={posts} />);
    expect(getByText("APIPool")).toBeTruthy();
  });

  it("renders post title from data", () => {
    const { getByText } = render(<HomePage theme="annual" stats={stats} products={products} posts={posts} />);
    expect(getByText("P1")).toBeTruthy();
  });

  it("fills frontispiece caption with stats", () => {
    const { container } = render(<HomePage theme="annual" stats={stats} products={products} posts={posts} />);
    const text = container.textContent ?? "";
    expect(text).toContain("2019.06.05");  // since
    expect(text).toContain("67");          // postCount
  });
});
```

需要 `@testing-library/react`，检查 package.json，如果没装：

- [ ] **Step 2: 检查依赖**

`pnpm ls @testing-library/react 2>/dev/null || echo "not installed"`

如果未安装：

`pnpm add -D @testing-library/react @testing-library/jest-dom jsdom`

并在 `vitest.config.ts` 设 `environment: 'jsdom'`（如已有则跳过）。

- [ ] **Step 3: 运行测试**

`pnpm test components/themes/annual/__tests__/home-page.test.tsx`
Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add components/themes/annual/__tests__/home-page.test.tsx package.json pnpm-lock.yaml vitest.config.ts
git commit -m "test(theme): Annual HomePage 关键内容渲染断言

校验装饰文案 navLabels 出现在 DOM、产品/文章数据被渲染、
frontispiece caption 中 stats 占位符被填充。引入 @testing-
library/react + jsdom 环境（如未配置）。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14：`app/globals.css` 完全重写 + design-tokens 测试更新

**Files:**
- Modify: `app/globals.css`
- Modify: `lib/design-tokens.test.ts`

- [ ] **Step 1: 改 design-tokens.test.ts**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_IDS } from "./themes";

const REQUIRED_TOKENS = [
  "color-bg", "color-bg-soft", "color-fg", "color-fg-soft",
  "color-muted", "color-faint",
  "color-accent", "color-accent-soft",
  "color-rule", "color-rule-soft",
] as const;

function loadCss(): string {
  return readFileSync("app/globals.css", "utf8");
}

function extractBlock(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`);
  const match = re.exec(css);
  if (!match) throw new Error(`Missing CSS block: ${selector}`);
  return match[1];
}

function getHexToken(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block);
  if (!match) throw new Error(`Missing token --${name} (hex)`);
  return match[1];
}

function relativeLuminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)!.map((value) => {
    const channel = Number.parseInt(value, 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(fg: string, bg: string) {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("design tokens · annual reference", () => {
  const css = loadCss();
  const annual = extractBlock(css, "@theme");

  it("annual token block defines all required tokens as hex", () => {
    for (const name of REQUIRED_TOKENS) {
      expect(getHexToken(annual, name)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("annual fg vs bg >= 7:1 (AAA body)", () => {
    expect(contrastRatio(getHexToken(annual, "color-fg"), getHexToken(annual, "color-bg")))
      .toBeGreaterThanOrEqual(7);
  });

  it("annual accent vs bg >= 4.5:1 (AA)", () => {
    expect(contrastRatio(getHexToken(annual, "color-accent"), getHexToken(annual, "color-bg")))
      .toBeGreaterThanOrEqual(4.5);
  });

  it("annual muted vs bg >= 4.5:1 (AA)", () => {
    expect(contrastRatio(getHexToken(annual, "color-muted"), getHexToken(annual, "color-bg")))
      .toBeGreaterThanOrEqual(4.5);
  });

  const SCHEMES: Record<(typeof THEME_IDS)[number], "light" | "dark"> = {
    annual: "light",
    workshop: "light",
    nocturne: "dark",
    telegraph: "dark",
  };

  it.each(THEME_IDS)("%s declares color-scheme", (id) => {
    const scheme = SCHEMES[id];
    const re = new RegExp(`html\\[data-theme="${id}"\\][^}]*\\bcolor-scheme:\\s*${scheme}`);
    expect(css).toMatch(re);
  });
});
```

- [ ] **Step 2: 改 globals.css**

```css
@import "tailwindcss";

@theme {
  /* Annual 默认 token —— @theme 默认值，即 data-theme="annual" 行为 */
  --color-bg:          #f4ede0;
  --color-bg-soft:     #ece3d1;
  --color-fg:          #15110c;
  --color-fg-soft:     #3a3128;
  --color-muted:       #5a4f3f;
  --color-faint:       #7b6f5f;
  --color-accent:      #b53028;
  --color-accent-soft: #f1d8d0;
  --color-rule:        #d8cdb7;
  --color-rule-soft:   #e6dcc6;

  /* 字体 */
  --font-display:  var(--font-fraunces),    Georgia, "Noto Serif SC", serif;
  --font-serif:    var(--font-newsreader),  Georgia, "Noto Serif SC", serif;
  --font-mono:     var(--font-jetbrains),   ui-monospace, "SF Mono", monospace;
  --font-sans:     var(--font-geist-sans),  -apple-system, "PingFang SC", sans-serif;
}

html[data-theme="annual"]    { color-scheme: light; }
html[data-theme="workshop"]  { color-scheme: light; }
html[data-theme="nocturne"]  { color-scheme: dark;  }
html[data-theme="telegraph"] { color-scheme: dark;  }

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-serif);
  font-weight: 380;
  font-size: 17px;
  line-height: 1.78;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background-image:
    radial-gradient(rgba(21,17,12,0.035) 1px, transparent 1px),
    radial-gradient(rgba(21,17,12,0.025) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1.5px 1.5px;
}

::selection { background: var(--color-accent); color: #fff; }

/* —————— Annual layout primitives —————— */
.annual-shell { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
.annual-layout { display: grid; grid-template-columns: 88px 1fr; border-bottom: 1px solid var(--color-fg); }
.annual-content { padding: 48px 56px 64px; }

/* —————— Masthead —————— */
.annual-masthead { border-bottom: 1px solid var(--color-fg); padding: 18px 0 12px; }
.annual-masthead-row { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; }
.annual-masthead-left { display: flex; align-items: baseline; gap: 18px; }
.annual-masthead-issue, .annual-masthead-date {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-muted);
}
.annual-masthead-nav { display: flex; align-items: center; gap: 26px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
.annual-masthead-nav a { color: var(--color-muted); transition: color .15s; }
.annual-masthead-nav a:hover { color: var(--color-accent); }
.annual-masthead-nav a.is-active { color: var(--color-fg); position: relative; }
.annual-masthead-nav a.is-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; border-bottom: 2px solid var(--color-accent); }

.annual-masthead-title {
  border-top: 6px double var(--color-fg);
  border-bottom: 1px solid var(--color-fg);
  padding: 14px 0 18px; margin-top: 8px;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
}
.annual-masthead-mt-left, .annual-masthead-mt-right {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-muted);
}
.annual-masthead-mt-right { text-align: right; }
.annual-masthead-mt-center {
  font-family: var(--font-display); font-weight: 300; letter-spacing: -0.02em;
  font-size: 64px; line-height: 1; text-align: center;
}
.annual-masthead-mt-center i { font-style: italic; font-weight: 300; color: var(--color-accent); }
.annual-masthead-est {
  font-family: var(--font-mono); font-size: 14px; letter-spacing: 0.4em;
  margin-left: 14px; vertical-align: middle; color: var(--color-muted);
}

/* —————— Frontispiece —————— */
.annual-frontispiece { padding: 80px 0 56px; border-bottom: 1px solid var(--color-rule); }
.annual-frontispiece-grid { display: grid; grid-template-columns: 100px 1fr 220px; gap: 48px; }
.annual-frontispiece-roman {
  font-family: var(--font-display); font-weight: 300;
  font-size: 120px; line-height: 0.85; color: var(--color-accent);
}
.annual-frontispiece-title {
  font-family: var(--font-display); font-weight: 300;
  font-size: 80px; line-height: 0.98; letter-spacing: -0.025em;
}
.annual-frontispiece-title em { font-style: italic; color: var(--color-accent); font-weight: 300; }
.annual-frontispiece-caption {
  margin-top: 24px; color: var(--color-fg-soft); font-style: italic;
  font-family: var(--font-serif); font-size: 19px; line-height: 1.55; max-width: 560px;
}
.annual-frontispiece-stamp { align-self: start; justify-self: end; }

/* —————— TimelineSpine —————— */
.annual-timeline { border-right: 1px solid var(--color-rule); padding: 48px 0; }
.annual-timeline-track {
  position: sticky; top: 24px;
  display: flex; flex-direction: column; align-items: center;
  font-family: var(--font-mono); font-size: 11px; color: var(--color-muted);
}
.annual-timeline-year {
  writing-mode: vertical-rl; letter-spacing: 0.3em; padding: 18px 0;
  border-bottom: 1px solid var(--color-rule-soft);
}
.annual-timeline-year:last-of-type { border-bottom: none; }
.annual-timeline-year.is-active { color: var(--color-accent); }
.annual-timeline-now {
  margin-top: 14px; padding: 6px 0;
  border-top: 2px solid var(--color-accent);
  color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.2em;
}

/* —————— ChapterHead —————— */
.annual-chapter-head {
  display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: baseline;
  padding-bottom: 14px; margin-top: 48px; margin-bottom: 30px;
  border-bottom: 1px solid var(--color-fg);
}
.annual-chapter-num {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.3em; color: var(--color-accent); text-transform: uppercase;
}
.annual-chapter-title {
  font-family: var(--font-display); font-weight: 300; letter-spacing: -0.01em;
  font-size: 42px; line-height: 1;
}
.annual-chapter-title em { font-style: italic; color: var(--color-accent); font-weight: 300; }
.annual-chapter-meta {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-muted);
}
.annual-chapter-meta:hover { color: var(--color-accent); }

/* —————— AboutSection —————— */
.annual-about { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.annual-about-portrait { position: relative; }
.annual-about-frame {
  width: 200px; height: 240px; padding: 6px;
  border: 1px solid var(--color-fg); background: var(--color-bg-soft);
  box-shadow:
    0 1px 0 var(--color-bg-soft),
    4px 4px 0 var(--color-rule),
    9px 9px 0 var(--color-bg),
    9px 9px 0 1px var(--color-rule);
  transform: rotate(-1.5deg);
  overflow: hidden;
}
.annual-about-avatar { width: 100%; height: 100%; object-fit: contain; display: block; }
.annual-about-caption {
  margin-top: 18px; font-family: var(--font-mono); font-size: 10.5px;
  color: var(--color-muted); letter-spacing: 0.08em; line-height: 1.6;
  padding-left: 14px; border-left: 2px solid var(--color-accent);
}
.annual-about-caption b { color: var(--color-fg); font-weight: 500; }
.annual-about-prose { font-size: 18px; line-height: 1.85; color: var(--color-fg-soft); }
.annual-about-prose p { margin-bottom: 14px; }
.annual-about-prose p:first-child {
  font-family: var(--font-display); font-size: 24px; line-height: 1.45;
  font-weight: 300; letter-spacing: -0.005em; color: var(--color-fg);
}
.annual-about-prose p:first-child::first-letter {
  font-family: var(--font-display); font-weight: 300; font-size: 78px;
  line-height: 0.85; float: left; padding: 6px 10px 0 0; color: var(--color-accent);
}
.annual-about-sign {
  margin-top: 24px; font-family: var(--font-display); font-style: italic;
  font-size: 22px; color: var(--color-accent);
}
.annual-about-pursuits {
  display: flex; flex-wrap: wrap; gap: 6px 10px; margin-top: 18px;
  font-family: var(--font-mono); font-size: 11px; color: var(--color-muted);
  list-style: none;
}
.annual-about-pursuits li {
  padding: 3px 9px; border: 1px solid var(--color-rule);
  border-radius: 999px; background: var(--color-bg-soft);
}
.annual-about-pursuits li::before { content: "§ "; color: var(--color-accent); }

/* —————— ProductEntry (Annual ledger) —————— */
.annual-ledger { border-top: 1px solid var(--color-rule); }
.annual-entry-link { display: block; }
.annual-entry {
  display: grid; grid-template-columns: 64px 1fr 240px; gap: 24px;
  padding: 24px 0; border-bottom: 1px solid var(--color-rule);
  align-items: start; transition: background .15s;
}
.annual-entry:hover { background: var(--color-bg-soft); }
.annual-entry-idx {
  font-family: var(--font-display); font-weight: 300; font-size: 46px;
  color: var(--color-accent); line-height: 0.9;
}
.annual-entry-title {
  font-family: var(--font-display); font-weight: 400; font-size: 28px;
  letter-spacing: -0.01em; margin-bottom: 4px;
}
.annual-entry-glyph { color: var(--color-accent); font-style: italic; margin-right: 4px; }
.annual-entry-desc { color: var(--color-fg-soft); font-size: 16px; margin-bottom: 10px; max-width: 620px; }
.annual-entry-pull {
  font-family: var(--font-display); font-style: italic; font-size: 17px;
  color: var(--color-fg); border-left: 2px solid var(--color-accent);
  padding-left: 12px; max-width: 620px;
}
.annual-entry-meta {
  text-align: right; font-family: var(--font-mono); font-size: 11px;
  color: var(--color-muted); letter-spacing: 0.06em; line-height: 1.8;
}
.annual-entry-role { color: var(--color-fg); text-transform: uppercase; letter-spacing: 0.16em; }
.annual-entry-phase { display: block; margin-top: 2px; }
.annual-entry-tags {
  margin-top: 8px; display: flex; justify-content: flex-end; gap: 6px;
  flex-wrap: wrap; list-style: none;
}
.annual-entry-tags li {
  padding: 2px 7px; border: 1px solid var(--color-rule);
  border-radius: 2px; color: var(--color-fg-soft); background: var(--color-bg);
}
.annual-entry-url { display: inline-block; margin-top: 10px; color: var(--color-accent); }
.annual-entry-url::after { content: " →"; }

/* —————— Writing TOC —————— */
.annual-toc { margin-top: 8px; }
.annual-toc-row {
  display: grid; grid-template-columns: 80px 56px 1fr 100px; gap: 18px;
  align-items: baseline; padding: 14px 0; border-bottom: 1px dotted var(--color-rule);
  transition: color .15s;
}
.annual-toc-row:hover { color: var(--color-accent); }
.annual-toc-date { font-family: var(--font-mono); font-size: 12px; color: var(--color-muted); letter-spacing: 0.04em; }
.annual-toc-no { font-family: var(--font-display); font-style: italic; color: var(--color-accent); font-size: 15px; }
.annual-toc-title { font-family: var(--font-display); font-weight: 400; font-size: 19px; letter-spacing: -0.005em; }
.annual-toc-rt { font-family: var(--font-mono); font-size: 11px; color: var(--color-muted); text-align: right; }

/* —————— Colophon —————— */
.annual-colophon {
  padding: 36px 0 48px; border-top: 6px double var(--color-fg);
  margin: 48px auto 0; max-width: 1180px; padding-left: 32px; padding-right: 32px;
}
.annual-colophon-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  font-family: var(--font-mono); font-size: 11px; color: var(--color-muted);
  letter-spacing: 0.06em; line-height: 1.7;
}
.annual-colophon-grid b { color: var(--color-fg); font-weight: 500; display: block; margin-bottom: 6px; letter-spacing: 0.16em; text-transform: uppercase; }
.annual-colophon-grid a { color: var(--color-accent); }

/* —————— Article (about/post) —————— */
.annual-article {
  max-width: 820px; margin: 48px auto; padding: 0 32px;
}
.annual-article-head { margin-bottom: 32px; }

/* —————— prose-annual —————— */
.prose-annual { font-family: var(--font-serif); font-size: 17px; line-height: 1.78; color: var(--color-fg); }
.prose-annual h1, .prose-annual h2, .prose-annual h3, .prose-annual h4 { font-family: var(--font-display); font-weight: 400; }
.prose-annual h1 { font-size: 38px; margin-top: 36px; margin-bottom: 14px; }
.prose-annual h2 { font-size: 28px; margin-top: 32px; margin-bottom: 12px; }
.prose-annual h3 { font-size: 22px; margin-top: 24px; margin-bottom: 10px; }
.prose-annual p { margin-bottom: 14px; }
.prose-annual a { color: var(--color-accent); border-bottom: 1px solid var(--color-accent); }
.prose-annual a:hover { background: var(--color-accent-soft); }
.prose-annual blockquote {
  border-left: 2px solid var(--color-accent); padding-left: 16px; margin: 18px 0;
  font-style: italic; color: var(--color-fg-soft);
}
.prose-annual code {
  font-family: var(--font-mono); font-size: 14px; background: var(--color-bg-soft);
  padding: 1px 5px; border-radius: 2px;
}
.prose-annual pre { font-family: var(--font-mono); background: var(--color-bg-soft); padding: 14px 18px; overflow-x: auto; border: 1px solid var(--color-rule); }
.prose-annual ul, .prose-annual ol { padding-left: 22px; margin-bottom: 14px; }
.prose-annual ul { list-style: disc; }
.prose-annual ol { list-style: decimal; }
.prose-annual li { margin-bottom: 6px; }
.prose-annual img { max-width: 100%; margin: 18px 0; }
.prose-annual hr { border: 0; border-top: 1px solid var(--color-rule); margin: 24px 0; }

/* —————— Responsive —————— */
@media (max-width: 900px) {
  .annual-frontispiece-grid { grid-template-columns: 1fr; gap: 24px; }
  .annual-frontispiece-title { font-size: 48px; }
  .annual-frontispiece-stamp { justify-self: start; }
  .annual-masthead-mt-center { font-size: 42px; }
  .annual-layout { grid-template-columns: 1fr; }
  .annual-timeline { display: none; }
  .annual-content { padding: 32px 20px; }
  .annual-about { grid-template-columns: 1fr; }
  .annual-entry { grid-template-columns: 48px 1fr; }
  .annual-entry-meta { grid-column: 1 / -1; text-align: left; }
  .annual-entry-tags { justify-content: flex-start; }
  .annual-toc-row { grid-template-columns: 64px 1fr; gap: 8px; }
  .annual-toc-no, .annual-toc-rt { display: none; }
  .annual-colophon-grid { grid-template-columns: 1fr 1fr; }
}
```

- [ ] **Step 3: 运行 design-tokens 测试**

`pnpm test lib/design-tokens.test.ts`
Expected: PASS（含对比度 7:1 / 4.5:1）。

- [ ] **Step 4: Commit**

```bash
git add app/globals.css lib/design-tokens.test.ts
git commit -m "feat(theme): globals.css 重写为 Annual 完整样式 + 4 套 token 占位

@theme 默认即 Annual；4 套 color-scheme 声明（annual/workshop
light, nocturne/telegraph dark）。引入完整 annual-* 类供主题
组件使用，含 masthead/frontispiece/timeline/chapter-head/
about/entry/toc/colophon/prose-annual + 移动端响应式。
design-tokens.test.ts 改为校验 Annual token 实际对比度。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15：`app/layout.tsx` async + 字体

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: 改实现**

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import { getCurrentTheme } from "@/lib/get-current-theme";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afreecoder.dev"),
  title: { default: "AFreeCoder", template: "%s · AFreeCoder" },
  description: "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
  openGraph: {
    title: "AFreeCoder",
    description: "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
    url: "https://afreecoder.dev",
    siteName: "AFreeCoder",
    locale: "zh_CN",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getCurrentTheme();
  return (
    <html
      lang="zh-CN"
      data-theme={theme}
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

注意：删除 `ThemeInit` import 与渲染。

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(theme): layout async + cookie 决定 data-theme + 引入 3 个新字体

root layout 改 async，调 getCurrentTheme 决定 data-theme；引入
Fraunces variable / Newsreader / JetBrains Mono。删除 ThemeInit
防闪脚本（cookie 已在 SSR 决定 HTML data-theme，不需要客户端
防闪）。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16：5 个 page.tsx 改为 dispatch 接线

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/products/page.tsx`
- Modify: `app/writing/page.tsx`
- Modify: `app/writing/[slug]/page.tsx`

- [ ] **Step 1: `app/page.tsx`**

```tsx
import { getCurrentTheme } from "@/lib/get-current-theme";
import { pickThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export default async function HomePage() {
  const [theme, posts, stats] = await Promise.all([
    getCurrentTheme(),
    getAllWriting(),
    getSiteStats(),
  ]);
  const Page = pickThemedPage(theme, "home");
  return <Page theme={theme} posts={posts} products={products} stats={stats} />;
}
```

- [ ] **Step 2: `app/about/page.tsx`**

```tsx
import { getCurrentTheme } from "@/lib/get-current-theme";
import { pickThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";

export const metadata = { title: "关于我", description: "关于 AFreeCoder" };

export default async function AboutPage() {
  const [theme, stats] = await Promise.all([getCurrentTheme(), getSiteStats()]);
  const Page = pickThemedPage(theme, "about");
  return <Page theme={theme} stats={stats} />;
}
```

- [ ] **Step 3: `app/products/page.tsx`**

```tsx
import { getCurrentTheme } from "@/lib/get-current-theme";
import { pickThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { products } from "@/content/products";

export const metadata = { title: "产品", description: "AFreeCoder 的产品与项目" };

export default async function ProductsPage() {
  const [theme, stats] = await Promise.all([getCurrentTheme(), getSiteStats()]);
  const Page = pickThemedPage(theme, "products");
  return <Page theme={theme} products={products} stats={stats} />;
}
```

- [ ] **Step 4: `app/writing/page.tsx`**

```tsx
import { getCurrentTheme } from "@/lib/get-current-theme";
import { pickThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { getAllWriting } from "@/lib/writing";

export const metadata = { title: "文章", description: "AFreeCoder 写作存档" };

export default async function WritingPage() {
  const [theme, posts, stats] = await Promise.all([
    getCurrentTheme(),
    getAllWriting(),
    getSiteStats(),
  ]);
  const Page = pickThemedPage(theme, "writingList");
  return <Page theme={theme} posts={posts} stats={stats} />;
}
```

- [ ] **Step 5: `app/writing/[slug]/page.tsx`**

需要先读当前实现确认数据结构。然后改为：

```tsx
import { notFound } from "next/navigation";
import { getCurrentTheme } from "@/lib/get-current-theme";
import { pickThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { getWritingBySlug } from "@/lib/writing";

export default async function WritingPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getWritingBySlug(slug);
  if (!post) notFound();
  const [theme, stats] = await Promise.all([getCurrentTheme(), getSiteStats()]);
  const Page = pickThemedPage(theme, "writingPost");
  return <Page theme={theme} stats={stats} meta={post.meta} body={post.body} />;
}
```

（如果原本有 generateMetadata 等保留。）

- [ ] **Step 6: 运行 lint**

`pnpm lint`
Expected: 无 error。

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/about/page.tsx app/products/page.tsx app/writing/page.tsx app/writing/[slug]/page.tsx
git commit -m "feat(theme): 5 个 page.tsx 接 dispatch — 全站路由进入主题体系

每个 page 只负责数据加载 + 调用 pickThemedPage(theme, key)；
Annual 当前是唯一实现的主题，其它三套通过 dispatch 兜底亦能渲染。
about / writing/[slug] page 兼容 Next.js 16 的 params Promise API。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17：切换器重写（cookie + router.refresh + available 灰显）+ 测试

**Files:**
- Modify: `components/site/theme-switcher.tsx`
- Modify (或新建): `components/site/theme-switcher.test.tsx`

- [ ] **Step 1: 重写 theme-switcher.tsx**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, type ThemeId } from "@/lib/themes";
import { THEME_COOKIE_NAME } from "@/lib/get-current-theme";

type Props = { current: ThemeId };

export function ThemeSwitcher({ current }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

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

  function choose(id: ThemeId, available: boolean) {
    if (!available || id === current) {
      if (id === current) setOpen(false);
      return;
    }
    const yearSec = 60 * 60 * 24 * 365;
    document.cookie = `${THEME_COOKIE_NAME}=${id}; path=/; max-age=${yearSec}; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="annual-switcher">
      <button
        ref={buttonRef}
        type="button"
        aria-label="切换主题"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="theme-menu"
        onClick={() => setOpen((v) => !v)}
        className="annual-switcher-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="12"  cy="7.5"  r="1.2" fill="currentColor" />
          <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="15"  cy="15"   r="1.2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul id="theme-menu" role="menu" className="annual-switcher-menu">
          {THEMES.map((t) => {
            const active = current === t.id;
            const disabled = !t.available;
            return (
              <li
                key={t.id}
                role="menuitem"
                aria-current={active}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => choose(t.id, t.available)}
                onKeyDown={(e) => {
                  if (disabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(t.id, t.available);
                  }
                }}
                className={`annual-switcher-item${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`}
                title={disabled ? `${t.blurb} · 预览中` : t.blurb}
              >
                <span className="annual-switcher-swatch" style={{ background: t.swatch }} aria-hidden />
                <span className="annual-switcher-label">{t.label}</span>
                {disabled && <span className="annual-switcher-badge">预览</span>}
                {active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

并在 `app/globals.css` 末尾追加 switcher 视觉：

```css
/* —————— ThemeSwitcher —————— */
.annual-switcher { position: relative; }
.annual-switcher-btn {
  display: flex; height: 32px; width: 32px;
  align-items: center; justify-content: center;
  border: 1px solid var(--color-rule); background: var(--color-bg-soft);
  color: var(--color-fg); border-radius: 6px; cursor: pointer;
  transition: color .15s, border-color .15s;
}
.annual-switcher-btn:hover { color: var(--color-accent); border-color: var(--color-accent); }
.annual-switcher-menu {
  position: absolute; right: 0; top: 42px; z-index: 50;
  width: 220px; padding: 6px; list-style: none;
  border: 1px solid var(--color-fg); background: var(--color-bg);
  font-family: var(--font-mono); font-size: 12px;
}
.annual-switcher-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  cursor: pointer; transition: background .12s;
  color: var(--color-fg);
}
.annual-switcher-item:hover:not(.is-disabled) { background: var(--color-accent-soft); color: var(--color-accent); }
.annual-switcher-item.is-active { background: var(--color-accent-soft); color: var(--color-accent); }
.annual-switcher-item.is-disabled { opacity: .45; cursor: not-allowed; }
.annual-switcher-swatch { width: 14px; height: 14px; border: 1px solid var(--color-rule); display: inline-block; }
.annual-switcher-label { flex: 1; }
.annual-switcher-badge {
  font-size: 9px; letter-spacing: 0.18em; padding: 1px 5px;
  border: 1px solid var(--color-accent); color: var(--color-accent);
  text-transform: uppercase;
}
```

- [ ] **Step 2: 写 / 重写测试** `components/site/theme-switcher.test.tsx`

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ThemeSwitcher } from "./theme-switcher";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

beforeEach(() => {
  refresh.mockReset();
  document.cookie = "theme=; max-age=0; path=/;";
});

describe("ThemeSwitcher", () => {
  it("opens menu showing 4 items", () => {
    const { getByLabelText, getByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    expect(getByText("年鉴 Annual")).toBeTruthy();
    expect(getByText("工坊 Workshop")).toBeTruthy();
    expect(getByText("夜灯 Nocturne")).toBeTruthy();
    expect(getByText("电报 Telegraph")).toBeTruthy();
  });

  it("disabled themes are not selectable", () => {
    const { getByLabelText, getByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    fireEvent.click(getByText("工坊 Workshop"));
    expect(refresh).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("theme=workshop");
  });

  it("active theme click closes menu without refresh", () => {
    const { getByLabelText, getByText, queryByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    fireEvent.click(getByText("年鉴 Annual"));
    expect(refresh).not.toHaveBeenCalled();
    expect(queryByText("工坊 Workshop")).toBeNull();
  });

  it("Esc closes menu", () => {
    const { getByLabelText, queryByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    expect(queryByText("年鉴 Annual")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByText("年鉴 Annual")).toBeNull();
  });
});
```

- [ ] **Step 3: 运行测试**

`pnpm test components/site/theme-switcher.test.tsx`
Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add components/site/theme-switcher.tsx components/site/theme-switcher.test.tsx app/globals.css
git commit -m "feat(theme): 切换器重写 — cookie + router.refresh + 灰显未实现主题

废弃 localStorage 路径，改写 theme cookie 后 router.refresh()
触发 RSC 重新渲染；阶段一仅 annual available，其它三套 aria-
disabled + tabindex=-1 + 预览标。current 改为 prop（avoid
client Context）。新增 .annual-switcher-* 样式。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 18：清理旧文件 + 删除 LEGACY_THEME_IDS

**Files:**
- Delete: `app/theme-init.tsx`
- Delete: `app/theme-init.test.tsx`
- Delete: `components/site/nav.tsx`
- Delete: `components/site/hero.tsx`
- Delete: `components/site/footer.tsx`
- Delete: `components/site/page-shell.tsx`
- Delete: `components/site/section-head.tsx`
- Delete: `components/site/writing-item.tsx`
- Delete: `components/site/product-card.tsx`
- Modify: `lib/themes.ts`（删 LEGACY_THEME_IDS）

- [ ] **Step 1: 删旧文件**

```bash
rm app/theme-init.tsx app/theme-init.test.tsx
rm components/site/nav.tsx components/site/hero.tsx components/site/footer.tsx \
   components/site/page-shell.tsx components/site/section-head.tsx \
   components/site/writing-item.tsx components/site/product-card.tsx
```

- [ ] **Step 2: 从 `lib/themes.ts` 删除 `LEGACY_THEME_IDS`**

删除文件中的以下区块：

```ts
/**
 * 临时保留：旧主题 ID 字符串数组。
 * 仅供尚未删除的旧组件 import，避免中间阶段编译失败。
 * 阶段一收尾（Task 16）时连同旧组件一起删除。
 */
export const LEGACY_THEME_IDS = ["sand", "ink", "mist", "moss", "editorial", "terminal"] as const;
```

- [ ] **Step 3: 全仓库 grep 确认无残留 import**

```bash
grep -rn "from .*components/site/\(nav\|hero\|footer\|page-shell\|section-head\|writing-item\|product-card\)" app components lib 2>/dev/null
grep -rn "from .*theme-init" app components lib 2>/dev/null
grep -rn "LEGACY_THEME_IDS" app components lib 2>/dev/null
grep -rn "from .*lib/site-config" app components lib 2>/dev/null  # 旧 nav 依赖
```

如有残留，按 grep 结果决定保留（如 site-config 仍被需要）或删除。`lib/site-config.ts` 当前数据（slogan / intro / socials / nav）已被 Annual decoration 取代，但可暂时保留以备阶段二复用。

- [ ] **Step 4: 跑 lint + test + build:next**

```bash
pnpm lint
pnpm test
pnpm run build:next
```

Expected: 全部 0 error。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(theme): 清理旧主题组件 + 删除 LEGACY_THEME_IDS

删除 app/theme-init.{tsx,test.tsx}、components/site/{nav,hero,
footer,page-shell,section-head,writing-item,product-card}.tsx
（已被 Annual 主题组件替代）。lib/themes.ts 中临时桥接的
LEGACY_THEME_IDS 一并移除。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 19：手动验证 10 项 + 视觉打磨

**Files:**
- 可能微调：任何 `components/themes/annual/*.tsx`、`app/globals.css`

- [ ] **Step 1: 启动 dev**

`pnpm dev`

打开浏览器：

| # | URL | 期待 |
|---|-----|------|
| 1 | `/`         | masthead + frontispiece + about + 4 个产品 + 6 篇文章 + colophon |
| 2 | `/about`    | prose-annual 渲染 about.ts，标题用 display 字体 |
| 3 | `/products` | 4 个 active 产品 |
| 4 | `/writing`  | 67 篇按年分章 |
| 5 | `/writing/<某 slug>` | masthead + 文章正文 prose-annual |
| 6 | 切换器展开 → 看到 4 项；3 项灰显有"预览"标 |
| 7 | DevTools console | 无 hydration mismatch / 无 error |
| 8 | DevTools Application > Cookies | 选 annual 后存在 `theme=annual` |
| 9 | 改 `content/decorations/annual.ts` 的 `masthead.right` 为空串 → 页面对应槽空 |
| 10 | `stats.postCount` 与 `getAllWriting().length` 一致 |

- [ ] **Step 2: 根据视觉反馈调样式**

常见微调：
- prose 字号 / 标题间距
- frontispiece 在窄屏的折叠
- 印章 SVG 缩放
- masthead-nav 与切换器对齐
- 字体 swap 期间的 layout shift

- [ ] **Step 3: 复跑 test + build:next**

`pnpm test && pnpm run build:next`

- [ ] **Step 4: Commit（如果有微调）**

```bash
git add -A
git commit -m "style(theme): Annual 视觉微调 — <具体说明>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 20：打包验证 OpenNext for Cloudflare

**Files:**（仅运行命令）

- [ ] **Step 1: 跑 OpenNext build**

`pnpm build`

Expected: 完成后生成 `.open-next/worker.js` 与 `.open-next/.build/open-next.config.edge.mjs`。

- [ ] **Step 2: 跑本地预览**

`pnpm preview`

Expected: 本地起 Cloudflare Workers runtime，浏览器访问 http://localhost:8788（或 wrangler 输出的端口）能访问网站，切换主题正常。

- [ ] **Step 3: Commit（如果 build 触发了任何 generated artifact 应被 ignore 已经在 .gitignore）**

无需 commit，验证完成即可。

---

## Task 21：部署确认（不主动执行 deploy）

- [ ] **Step 1: 向用户报告打包结果**

报告项：
- pnpm build 输出 worker bundle 大小
- pnpm preview 手动验证结果（关键页面 / 切换 / cookie）

- [ ] **Step 2: 等用户授权后执行 deploy**

`pnpm deploy` 是真正发布到生产 Cloudflare Workers 的命令，**不可逆**。需明确得到用户"上线"指令后再执行。

---

## Self-Review 备忘

| Spec 章节 | Plan 任务 |
|---|---|
| §3 架构 | Task 2, 15, 16 |
| §4 文件清单 | Task 1-18 |
| §5 主题枚举 | Task 1 |
| §6 Annual token + 对比度 | Task 14 |
| §7 字体策略 | Task 15 |
| §8 装饰文案 | Task 4 |
| §9 site-stats | Task 3 |
| §10 Annual 组件 | Task 6-12 |
| §11 切换器改造 | Task 17 |
| §12 layout/page 改造 | Task 15, 16 |
| §13 测试 | Task 1, 3, 5, 13, 14, 17, 19 |
| §14 阶段二预留 | 不在阶段一执行；架构自然支持 |
| §15 实施步骤 | Plan 任务序对应 |
| §16 风险 | 文档化，执行中按需应对 |
| **/goal 增量** | Task 20, 21 |
