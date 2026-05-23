# 主题系统重做 设计稿（阶段一 · Annual reference）

- 日期：2026-05-23
- 范围：把现有 6 套"仅换 CSS token"的主题体系替换为 4 套"完整布局体系"的主题，先做 Annual 一套打通架构
- 替换关系：本 spec 完全取代 [2026-05-19-theme-switcher-design.md](2026-05-19-theme-switcher-design.md) 中"6 套并存 / 仅换 token"的方案
- 后续：Workshop / Nocturne / Telegraph 三套留到阶段二，本 spec 只为它们留架构插槽

## 1. 目标与不目标

### 目标

1. 主题不再只是换色板，而是 **整页布局体系切换**：每个主题独立的 nav / hero / 产品列表 / 文章列表 / 页脚组件树
2. 4 套主题：`annual` / `workshop` / `nocturne` / `telegraph`，默认 `annual`
3. 默认主题通过单一常量配置（`lib/themes.ts` 的 `DEFAULT_THEME`），改一行即换全站默认
4. 切换持久化（cookie）+ 跨刷新生效 + 首屏无闪烁
5. 切换器 UI 中性、与具体主题解耦
6. 阶段一只完整实现 Annual，其它三套 fallback 到 Annual + 显示"预览中"标
7. 风格化、虚构的装饰文案集中配置（`content/decorations/annual.ts`），可被实际数据覆盖；可被动态计算的字段（since、文章数、产品数）由 `lib/site-stats.ts` 算

### 不目标（阶段一明确不做）

- Workshop / Nocturne / Telegraph 三套主题的实际组件实现
- 主题分组的字体按需懒加载（阶段一只引 Annual 所需字体）
- 跨标签页主题同步（`storage` 事件监听）
- `prefers-color-scheme` 自动选主题（明确恒用 `DEFAULT_THEME`）
- 客户端主题"瞬切"（接受 router.refresh 一次往返的轻微延迟，换取 SSR 一致性）
- RSS / sitemap / OG image 的主题变体（这些是与主题无关的静态产物）

## 2. 关键决策

| 决策点 | 选择 | 理由 |
|---|---|---|
| 旧 6 套 vs 新 4 套 | 完全替换 | 用户已确认。避免双套体系互稀释 identity |
| 主题分层粒度 | Token + per-page themed component | Annual 的 timeline spine / Telegraph 的 sidebar shell 都需要 React 树差异，只换 token 撑不住 |
| 主题感知方式 | Cookie + RSC dispatch（服务器决定 + RSC 切组件树） | 避免客户端切换 layout 的抖动；保留 SSR 正确性；无 hydration mismatch |
| 切换交互 | `setCookie('theme', id)` + `router.refresh()` | 接受 ~50ms 服务器一次往返；主题切换是低频动作；换来代码极简 + 无闪烁 |
| 实施节奏 | 先 Annual 单套（reference） | 一次 4 套放大架构错误；先打通 dispatch / token / 字体 / 装饰文案配置 / 切换 |
| 装饰文案 vs 真实数据 | 装饰文案在 `content/decorations/<theme>.ts`；动态字段在 `lib/site-stats.ts` | 让"为风格服务的虚构内容"集中可改，不绑死 |
| ThemeInit 防闪脚本 | 删除 | cookie 在 SSR 阶段即决定 `data-theme`，HTML 一发出就正确；不需要防闪脚本 |

## 3. 架构

### 3.1 切换流程

```
用户点 ThemeSwitcher 选 "workshop"
     ↓
document.cookie = 'theme=workshop; path=/; max-age=31536000; samesite=lax'
router.refresh()              # 触发 RSC 重新渲染当前路由
     ↓
Next.js 服务端处理请求
     ↓
app/layout.tsx (async):
  const theme = await getCurrentTheme();           # 读 cookie，fallback DEFAULT_THEME
  return <html data-theme={theme}> ... </>         # 仅设 data-theme，不引入 Context
     ↓
app/page.tsx (RSC):
  const theme = await getCurrentTheme();
  const data  = await loadHomeData();
  return <ThemedHomePage theme={theme} data={data} />
     ↓
ThemedHomePage 按 theme dispatch 到对应主题的 HomePage（阶段一全部 fallback Annual.HomePage）
     ↓
浏览器收到一份新的完整 HTML，CSS 通过 data-theme 选中对应 token 块
```

### 3.2 主题 dispatch

```tsx
// components/themes/dispatch.tsx
import type { ThemeId } from "@/lib/themes";
import { Annual } from "./annual";

type PageKey = "home" | "about" | "products" | "writingList" | "writingPost";

const REGISTRY: Record<ThemeId, Partial<Record<PageKey, ComponentType<any>>>> = {
  annual:    Annual,
  workshop:  {}, // 阶段一空对象 → 进 fallback
  nocturne:  {},
  telegraph: {},
};

export function pickThemedPage(theme: ThemeId, key: PageKey) {
  return REGISTRY[theme][key] ?? Annual[key]; // 兜底永远走 Annual
}
```

每个 `app/*/page.tsx` 调用 `pickThemedPage(theme, "home")` 拿到组件，传 props 渲染。

为何不用客户端 switch：客户端 switch 强制 `'use client'`，意味着所有数据要序列化经过 RSC 边界；服务端 dispatch 让数据保持在 RSC 内。

### 3.3 获取当前主题

```ts
// lib/get-current-theme.ts
import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeId } from "./themes";

export async function getCurrentTheme() {
  const value = (await cookies()).get("theme")?.value;
  return isThemeId(value) ? value : DEFAULT_THEME;
}
```

`cookies()` 在 Next.js 16 App Router 是 async server-only API。读 cookie 后该路由变 dynamic（无法静态预渲染）—— 本站靠 OpenNext 跑在 Cloudflare Workers，本就 SSR-on-demand，无回归。

## 4. 文件清单

### 4.1 新建

```
lib/
  get-current-theme.ts                 主题来源 (cookie + fallback)
  site-stats.ts                        动态数据：since/postCount/productLiveCount/yearsActive/volRoman
  site-stats.test.ts
content/decorations/
  annual.ts                            Annual 主题的装饰文案 + 默认值
components/themes/
  dispatch.tsx                         Per-page dispatch + fallback
  dispatch.test.tsx
  annual/
    index.ts                           re-export {HomePage, AboutPage, ProductsPage, WritingListPage, WritingPostPage}
    home-page.tsx                      Annual 主页（masthead + frontispiece + about + products + writing + colophon）
    about-page.tsx                     Annual 关于页（masthead + chapter + prose 渲染 about.ts）
    products-page.tsx                  Annual 产品列表页
    writing-list-page.tsx              Annual 文章列表（章节扉页 + TOC）
    writing-post-page.tsx              Annual 单篇文章（masthead + 章节信息 + prose）
    masthead.tsx                       顶部 Vol/Issue masthead + 双线 + 居中标题
    timeline-spine.tsx                 左侧 sticky 年份标尺（仅 home / writing-list）
    frontispiece.tsx                   章节扉页（罗马数字 + 大字 + 朱砂印章）
    stamp.tsx                          朱砂印章 SVG（圆环 + 弧形文字 + 中央"实证"）
    chapter-head.tsx                   章节标题（章号 + 标题 + meta）
    about-section.tsx                  关于栏内嵌组件（portrait frame + drop-cap prose + 关注标签）
    product-entry.tsx                  Annual 风产品条目（罗马序号 + 标题 + pull quote + meta）
    toc-row.tsx                        Annual 风文章目录条目（date + № + 标题 + 阅读时间）
    colophon.tsx                       Annual 风页脚（双线 + 4 列奥版信息）
    __tests__/home-page.test.tsx       关键内容存在性 + 装饰文案来源校验
  shared/
    use-cookie-theme.ts                Client-only：写 cookie helper（被 theme-switcher 用）
```

### 4.2 改

```
lib/themes.ts                          重写：4 个 ID + isThemeId 类型保护 + DEFAULT_THEME 改 "annual"
lib/themes.test.ts                     更新断言：4 个 ID + label/swatch 形态
lib/design-tokens.test.ts              更新：4 个 ID + Annual token 全集 + 对比度断言
app/globals.css                        完全重写：删旧 6 套 + 4 套新主题 token + Annual 完整样式 + prose-annual
app/layout.tsx                         改 async：cookies → data-theme；加 Fraunces/Newsreader/JetBrains Mono；删 ThemeInit
app/page.tsx                           改：async + getCurrentTheme + pickThemedPage("home") + 传数据
app/about/page.tsx                     同上 ("about")
app/products/page.tsx                  同上 ("products")
app/writing/page.tsx                   同上 ("writingList")
app/writing/[slug]/page.tsx            同上 ("writingPost")
components/site/theme-switcher.tsx     重写：cookie + router.refresh + 4 套 + "preview" tag
```

### 4.3 删（最后一步，待 Annual 替代实现就位再批量执行）

```
app/theme-init.tsx                     不再需要：cookie SSR 已决定 data-theme
app/theme-init.test.tsx                同上
components/site/nav.tsx                合并入 Annual.Masthead
components/site/hero.tsx               合并入 Annual.AboutSection
components/site/footer.tsx             合并入 Annual.Colophon
components/site/page-shell.tsx         合并入 Annual.HomePage 等各主题自己的 shell
components/site/section-head.tsx       合并入 Annual.ChapterHead
components/site/writing-item.tsx       合并入 Annual.TocRow
components/site/product-card.tsx       合并入 Annual.ProductEntry
```

**留下**：`components/site/theme-switcher.tsx`（4 套共用工具）、`components/ui/*`（shadcn 等基础元件）。

## 5. 主题枚举（`lib/themes.ts`）

```ts
export const THEME_IDS = ["annual", "workshop", "nocturne", "telegraph"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string"
    && (THEME_IDS as readonly string[]).includes(value);
}

export type ThemeMeta = {
  id: ThemeId;
  label: string;        // 中文短名 + 英文副名
  swatch: string;       // 切换器缩略色 (Annual=朱砂红/Workshop=警示橙/Nocturne=琥珀/Telegraph=磷光绿)
  blurb: string;        // 一句话气质
  available: boolean;   // 阶段一只 annual 为 true
};

export const THEMES: ThemeMeta[] = [
  { id: "annual",    label: "年鉴 Annual",     swatch: "#b53028", blurb: "宣纸米 · 朱砂印章 · 章节式",  available: true  },
  { id: "workshop",  label: "工坊 Workshop",   swatch: "#ff5b1f", blurb: "蓝图网格 · 工程文档式",       available: false },
  { id: "nocturne",  label: "夜灯 Nocturne",   swatch: "#f0a04b", blurb: "深炭 · 琥珀光 · 巨型衬线",    available: false },
  { id: "telegraph", label: "电报 Telegraph",  swatch: "#7dff9a", blurb: "墨绿磷光 · ASCII · 终端式",   available: false },
];

export const DEFAULT_THEME: ThemeId = "annual";
```

## 6. Annual 主题 CSS Token（`app/globals.css`）

### 6.1 Token 集（替换原 `@theme` 块）

```css
@theme {
  /* —— Annual: 默认 token（无 data-theme 时生效）—— */
  --color-bg:              #f4ede0;
  --color-bg-soft:         #ece3d1;
  --color-fg:              #15110c;
  --color-fg-soft:         #3a3128;
  --color-muted:           #5a4f3f;   /* 注：原型用 #7b6f5f，本 token 调暗以满足 4.5:1 */
  --color-faint:           #7b6f5f;   /* dot-pattern / 装饰用，不放正文 */
  --color-accent:          #b53028;
  --color-accent-soft:     #f1d8d0;
  --color-rule:            #d8cdb7;
  --color-rule-soft:       #e6dcc6;

  /* 字体 */
  --font-display:          var(--font-fraunces),  Georgia, "Noto Serif SC", serif;
  --font-serif:            var(--font-newsreader), Georgia, "Noto Serif SC", serif;
  --font-mono:             var(--font-jetbrains),  ui-monospace, "SF Mono", monospace;
  --font-sans:             var(--font-geist-sans), -apple-system, "PingFang SC", sans-serif;

  /* 阶段一的 Annual 暂不需要 surface/shadow token（卡片质感由边框 + dotted/double border 给）；
     若 Workshop/Nocturne/Telegraph 阶段二需要 surface token，则补在各自 [data-theme] 块下 */
}

/* —— Annual 主题（也是无 data-theme 的兜底）—— */
html[data-theme="annual"]   { color-scheme: light; }

/* —— Workshop / Nocturne / Telegraph 占位（阶段二填充） —— */
html[data-theme="workshop"]  { color-scheme: light; }
html[data-theme="nocturne"]  { color-scheme: dark;  }
html[data-theme="telegraph"] { color-scheme: dark;  }
```

阶段一只为 Annual 写 token；其它 3 套 `[data-theme="X"]` 块留空（继承 `@theme` 默认 = Annual 颜色）—— 这样未实现主题被选中时，仍能渲染正常（fallback Annual 组件 + Annual token），不会出现"半残"状态。

### 6.2 Annual 全局样式

```css
body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-serif);
  font-feature-settings: "ss01";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background-image:
    radial-gradient(rgba(21,17,12,0.035) 1px, transparent 1px),
    radial-gradient(rgba(21,17,12,0.025) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1.5px 1.5px;
}

::selection { background: var(--color-accent); color: #fff; }

/* prose-annual: 正文 MDX 渲染时使用 */
.prose-annual { 
  font-family: var(--font-serif);
  font-size: 17px; line-height: 1.78; 
  /* h1-h4 切 display 字体；blockquote 左 2px 朱砂线；code 切 mono；img 留呼吸 */
}
```

### 6.3 对比度校验

新 token 必须经过 `lib/design-tokens.test.ts` 的 4 类断言（已存在的基础设施）：

| 检查 | 要求 |
|---|---|
| `fg` vs `bg` | ≥ 7:1（AAA 正文） |
| `accent` vs `bg` | ≥ 4.5:1（AA 小字） |
| `muted` vs `bg` | ≥ 4.5:1（AA 小字） |
| `color-scheme` 声明 | 每个 ID 都要 |

`faint`（装饰、dot pattern）不参与对比度断言（不承载文字）。原型 03/01-annual.html 用的 `#7b6f5f` 对宣纸米 `#f4ede0` 大约 3.3:1，仅 AA Large；本 spec 把承载文字的 token 命名为 `muted`（#5a4f3f，> 4.5:1）；`faint` 仍保留原型色用于装饰。

## 7. 字体策略（阶段一）

`app/layout.tsx`：

```ts
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],     // variable 字体所有可用轴
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
```

- 删除原 `Source_Serif_4` import
- 保留 GeistSans/GeistMono：供 Switcher 等中性 UI 用
- 中文字形：Fraunces / Newsreader / JetBrains Mono 都不覆盖 CJK，CSS 回落到 `"Noto Serif SC"`（系统通常无，但浏览器有合理 fallback 到本地衬线）—— 与现行行为一致，不引入额外 webfont 避免拖慢首屏
- 阶段二加 Telegraph 时再引 IBM Plex Mono / Major Mono Display；加 Workshop 时再引 IBM Plex Sans Condensed / Manrope；加 Nocturne 时再引 Instrument Serif（按主题增量加，避免一次性 4 套字体打全部）

## 8. 装饰文案配置（`content/decorations/annual.ts`）

把原型 [01-annual.html](../../../design/explorations/01-annual.html) 中所有"为风格服务的虚构文案"显式化为可配置：

```ts
import type { Stats } from "@/lib/site-stats";

export type AnnualDecoration = {
  masthead: {
    /** 卷号；用户可手填，或由 stats 自动算 */
    volume: string | ((s: Stats) => string);       // 默认: stats.volRoman ("VII")
    series: string;                                 // 默认: "Series"，会拼成 "2026 Series"
    left:   string;                                 // 默认: "A Coder · In Pursuit of Freedom"
    right:  string;                                 // 默认: "自由痕迹 · 年鉴"
    /** 居中标题三段字符 + EST 标注 */
    centerSegments: [string, string, string];      // 默认: ["A", "F", "C"]
    establishedYear: number;                        // 默认: 2019
  };
  navLabels: { home: string; about: string; products: string; writing: string; colophon: string };
  frontispiece: {
    /** 章号；若是函数则按当前页号传入 */
    roman: string;                                  // 默认: "I."
    title: string;                                  // 默认（home）: "这里是一个追求自由的 Coder 的痕迹。"
    titleAccent?: string;                           // 在 title 内的强调子串；默认: "追求自由"
    /** caption 可用 {{postCount}}/{{productLiveCount}}/{{since}}/{{years}} 占位符 */
    caption: string;                                // 默认: "— 自 {{since}} 起，连续记录 {{postCount}} 篇实证；同时把 {{productLiveCount}} 件还在运行的产品摆在公众可访问的地址下。"
    stamp: { primary: [string, string]; arcTop: string; arcBottom: string };
    // 默认: { primary: ["实","证"], arcTop: "A · FREE · CODER", arcBottom: "EST · MMXIX" }
  };
  chapters: {
    about:     { num: string; title: string; titleAccent?: string; metaHref: string; metaLabel: string };
    products:  { num: string; title: string; titleAccent?: string };
    writing:   { num: string; title: string; titleAccent?: string };
  };
  colophon: {
    fontsLine: string;                              // 默认: "排版于 2026 · 主体字体 Fraunces / Newsreader / JetBrains Mono"
    disclaimerLine: string;                         // 默认: "内容自 {{since}} 持续撰写。一切实证不构成投资建议。"
  };
  /** Hero 中 about 摘要的"签名"行；为空则不渲染 */
  signature?: string;                               // 默认: "— A.F.C."
};

export const annualDecoration: AnnualDecoration = { /* 上述默认值 */ };
```

模板占位符（`{{since}}` / `{{postCount}}` 等）由 `lib/site-stats.ts` 在渲染时填充。所有字段都有合理默认值（基于现有真实数据 + 原型措辞），用户改 `annual.ts` 一处即覆盖。

## 9. 动态数据（`lib/site-stats.ts`）

```ts
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export type Stats = {
  since: string;            // "2019.06.05"  (最早一篇文章日期)
  sinceYear: number;        // 2019
  yearsActive: number;      // 2026 - sinceYear
  volRoman: string;         // 罗马数字 (yearsActive + 1)
  postCount: number;        // 所有文章数
  productLiveCount: number; // products.status === "active"
  productArchivedCount: number;
  uptimeDays: number;       // since 至今的天数
};

export async function getSiteStats(): Promise<Stats> { /* ... */ }

/** 在装饰文案模板中替换 {{since}} / {{postCount}} 等占位符 */
export function fillTemplate(template: string, stats: Stats): string { /* ... */ }
```

Annual 主题组件渲染时调一次 `getSiteStats()`，传给装饰文案的填充器。

## 10. Annual 主题组件实现要点

### 10.1 `Annual.HomePage`

结构（顺序）：

```
<html data-theme="annual"> 由 layout.tsx 输出 -- 此处不重复
  <Masthead theme={theme} />                # Vol/Issue + 居中 A·F·C 标题 + 双线分隔 + 右侧挂 <ThemeSwitcher current={theme}/>
  <Frontispiece                             # 罗马 I + 大字 + 朱砂印章（home 专属：印章只在 home 出现）
      roman="I."
      title={...} caption={...} stamp={...} withStamp />
  <div class="layout-grid">                 # 88px (TimelineSpine) + 1fr (content)
    <TimelineSpine />                       # 左侧 sticky 年份标尺 2019..currentYear
    <main class="content">
      <ChapterHead num="Chapter Two · 关于" title="我，A-Free-Coder" />
      <AboutSection />                      # 头像框 + drop-cap 摘要 + 关注标签
      <ChapterHead num="Chapter Three · 在线运行的产品" title="仍在运转的四件事" />
      <ProductList />                       # 4 个 ProductEntry
      <ChapterHead num="Chapter Four · 实证目录" title="已记录的 N 篇痕迹" />
      <WritingTOC limit={6} />              # 6 行 TocRow
    </main>
  </div>
  <Colophon />
```

### 10.2 `Annual.AboutPage` / `Annual.ProductsPage` / `Annual.WritingListPage`

共同骨架：`Masthead → Frontispiece(无印章) → 主体 → Colophon`。其中 Frontispiece 由各 page 传入对应章号 / 文案，复用同一个组件。差异如下：

- **AboutPage**：Frontispiece 传 `roman="II.", title=…, withStamp=false`，主体为 `<article class="article-column prose-annual">` 用 `lib/mdx.tsx` 渲染 `content/about.ts` 的 `aboutMdx`
- **ProductsPage**：Frontispiece 传 `roman="III.", …`，主体先渲染 active 产品（`<ProductList>` 同 home），若 `archived.length > 0` 再渲染一个 "归档" sub-section（用 `<ChapterHead>` + 灰度 0.7 的 ProductList）
- **WritingListPage**：Frontispiece 传 `roman="IV.", …`。主体不平铺：以 **发布年份分章节**，每年作为一个 `<ChapterHead num="MMXXII" title="2022 · N 篇" />` + 该年的 `<TocRow>` 列表，年内按日期倒序。这是 Annual 主题独有的"按年成卷"叙事；它不改变数据，只换展现。文章总数仍为 `posts.length`

### 10.3 `Annual.WritingPostPage`

### 10.4 `Annual.WritingPostPage`

结构：

```
<Masthead />
<article class="article-column prose-annual">
  <header>
    <ChapterHead num="实证 · #N" title={post.title} meta={post.date + reading time} />
  </header>
  {Mdx 渲染 body}
  <footer>
    <Colophon-mini />
  </footer>
</article>
<Colophon />
```

### 10.5 共享子组件细节

- **Masthead**：原型 `01-annual.html` 中 `<header class="masthead">` 的等价实现，文案来自 `annualDecoration.masthead` + `stats`
- **TimelineSpine**：sticky 左栏，列出从 `stats.sinceYear` 到当前年的每个年份，当前年标 active，末尾"NOW"色块。SVG 不需要，纯 CSS + `writing-mode: vertical-rl`
- **Stamp**：朱砂印章 SVG，外圆 + 内圆 + `<textPath>` 上下弧形文字 + 中央两个汉字。`width` 由 prop 控制（home frontispiece 148px / colophon mini 60px）
- **ChapterHead**：`<div class="ch-head"><div><ch-num/><ch-title/></div><ch-meta/></div>`
- **AboutSection**：头像（`/avatar.png` 经 `<Image>` 优化）+ drop-cap 段落 + 签名 + 关注标签
- **ProductEntry**：罗马序号（i/ii/iii/iv）+ 标题 + 描述 + pull-quote + role/phase/tags meta 列
- **TocRow**：date · № · 标题 · 阅读时间（grid 4 列，sm 下折成 2 列）
- **Colophon**：双线分隔 + 4 列网格（奥版 / 联络 / 订阅 / 声明）

### 10.6 组件级别的 client/server 边界

所有 Annual 组件默认 **RSC**（server component）。唯一 `'use client'` 是 `theme-switcher.tsx` —— 因为它要 setCookie / router.refresh。

## 11. 切换器改造（`components/site/theme-switcher.tsx`）

变更：

1. 文件保留位置和当前外观（调色板按钮 + 下拉）
2. 内部 `choose(id)` 改为：

```ts
import { useRouter } from "next/navigation";

function choose(id: ThemeId) {
  if (!THEMES.find(t => t.id === id)?.available) return;     // preview-only 主题禁用
  document.cookie = `theme=${id}; path=/; max-age=${60*60*24*365}; samesite=lax`;
  setOpen(false);
  router.refresh();                                           // 触发 RSC 重新渲染
}
```

3. 4 个菜单项 UI：未实现的主题（available=false）灰显 + 右侧加 `预览` 标签（不能选）。当 available 状态全部变 true（阶段二完成）后，去掉灰显逻辑。
4. 不再读 / 写 localStorage
5. 当前主题来源改为 **prop**：由各主题的 Masthead/Header（server component）调 `getCurrentTheme()` 后作为 `current={theme}` prop 传给 `<ThemeSwitcher>`，不再从 `document.documentElement.dataset.theme` 取，也不引入 React Context（避免 client provider 包裹整树）

## 12. layout / page 改造

`app/layout.tsx`：

```tsx
export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = await getCurrentTheme();
  return (
    <html lang="zh-CN" data-theme={theme}
          className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${newsreader.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`（典型示例）：

```tsx
import { getCurrentTheme } from "@/lib/get-current-theme";
import { pickThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export default async function HomePage() {
  const theme = await getCurrentTheme();
  const HomePageImpl = pickThemedPage(theme, "home");
  const [posts, stats] = await Promise.all([getAllWriting(), getSiteStats()]);
  return <HomePageImpl theme={theme} posts={posts} products={products} stats={stats} />;
}
```

类似改造 `/about` / `/products` / `/writing` / `/writing/[slug]`。

## 13. 测试

### 13.1 改 / 新加

| 测试 | 类型 | 内容 |
|---|---|---|
| `lib/themes.test.ts`  | 改 | 4 个 ID、`DEFAULT_THEME === "annual"`、每个 meta 完整、`isThemeId` 行为 |
| `lib/design-tokens.test.ts` | 改 | 4 个 ID × token 形态；Annual 实际值满足 fg≥7:1 / accent≥4.5:1 / muted≥4.5:1；color-scheme 声明匹配 |
| `lib/site-stats.test.ts` | 新 | 给定 fake posts/products，断言 since / postCount / productLiveCount / yearsActive / volRoman / fillTemplate 行为 |
| `components/themes/dispatch.test.tsx` | 新 | unavailable 主题选中时 dispatch 回 Annual；available 主题选中时返回对应主题组件 |
| `components/themes/annual/__tests__/home-page.test.tsx` | 新 | 渲染产物含装饰文案默认串（"自由痕迹 · 年鉴"等）；含产品名 / 文章标题；ChapterHead 章号文案与 decoration 一致 |
| `components/site/__tests__/theme-switcher.test.tsx` | 重写 | 渲染 4 项；available=false 项不可选 + 含"预览"标；点击 available 项写入 cookie + 触发 router.refresh（mock） |

### 13.2 删

- `app/theme-init.test.tsx`（连同 `app/theme-init.tsx`）

### 13.3 手动验证（阶段一打磨标准）

`pnpm dev` 启服务，必须全部通过：

1. **首页** `/`：Annual 风格的 masthead + frontispiece + about + 4 个产品 + 6 篇文章 + colophon
2. **关于** `/about`：Annual 框架内的 prose-annual 渲染
3. **产品** `/products`：active 4 件以 Annual 风产品条目展示
4. **文章列表** `/writing`：67 篇按年分章节排列
5. **文章详情** `/writing/[slug]`：Annual 框架 + prose-annual 正文
6. **切换器**：能展开下拉，4 项可见；选 `annual` 仍是 annual；选其他 3 项（unavailable）灰显不可选，hover 显示"预览中"
7. 浏览器 devtools 无 hydration mismatch 警告 / 无 console error
8. 切换后回放首页 cookie：`document.cookie` 含 `theme=annual`
9. 装饰文案：清空 `content/decorations/annual.ts` 中一个字段（如 `masthead.right`）→ 页面对应位置变空（fallback 优雅）
10. 真实数据 → 装饰填充：`stats.postCount` 与 `getAllWriting().length` 一致

### 13.4 自动化 pass criteria

- `pnpm lint` 无 warning / error
- `pnpm test` 全绿
- `pnpm run build:next` 成功（验 Next 产物完整，不必跑 OpenNext build，部署不在 spec 范围）

副作用说明：因 `layout.tsx` 用 `cookies()`，所有页面都被标记为 dynamic（无法在 build 时 prerender）。`app/rss.xml/route.ts` 与 `app/sitemap.ts` 是独立的 route handlers，不经 layout，保持原行为不受影响。

## 14. 阶段二的预留

阶段二做 Workshop / Nocturne / Telegraph 时只需：

1. 各自的 `[data-theme="X"]` token 块（写入 `globals.css`）
2. 各自的字体加载（在 `layout.tsx` 增加 next/font import + className 拼接）
3. 各自的 `content/decorations/<id>.ts`
4. 各自的 `components/themes/<id>/{home,about,products,writing-list,writing-post}-page.tsx` + 内部子组件
5. `dispatch.tsx` 的 REGISTRY 把 `<id>: {}` 改为 `<id>: <Id>`
6. `lib/themes.ts` 的 `THEMES[<id>].available = true`
7. 给各自加测试（同 §13 结构）

不需要再动 `app/*/page.tsx`、`getCurrentTheme`、`theme-switcher.tsx`、`globals.css` 的 `@theme` 默认块。

## 15. 实施步骤（按依赖排序）

为保证每步落地后**全站可 build / 可运行**（不留半残提交），步骤拆分到位：

1. **lib 与配置层**：
   - 改 `lib/themes.ts`（4 个 ID）+ 更新 `lib/themes.test.ts`
   - 新加 `lib/get-current-theme.ts`
   - 新加 `lib/site-stats.ts` + `lib/site-stats.test.ts`
   - 新加 `content/decorations/annual.ts`
   - ✅ 验收：`pnpm test` 全绿；旧组件继续用旧 `lib/themes.ts` 编译失败 → 把 `lib/themes.ts` 中**临时保留**旧 6 个 ID 的 const（仅供旧组件 import），新 ID 并存。后续步骤删除旧组件后再删旧常量
2. **Annual 组件 + dispatch + 装饰文案**（不动 app/* 路由 / globals.css）：
   - 实现 `components/themes/annual/*.tsx` + `index.ts`（含 Masthead/Frontispiece/TimelineSpine/Stamp/ChapterHead/AboutSection/ProductEntry/TocRow/Colophon/5 个 page）
   - 实现 `components/themes/dispatch.tsx` + 测试
   - 写 `components/themes/annual/__tests__/home-page.test.tsx`
   - ✅ 验收：`pnpm test` 全绿；旧 UI 仍在跑（dev server 渲染旧版无变化）
3. **CSS 与字体接入**：
   - 改 `app/globals.css`：删旧 6 套 `[data-theme="X"]` 块；写 4 套占位 + Annual 完整 token；增 `.prose-annual` 等
   - 改 `app/layout.tsx`：async + `getCurrentTheme()` + 字体 import + 注入 className
   - 更新 `lib/design-tokens.test.ts`（4 ID + Annual token + 对比度）
   - ✅ 验收：`pnpm test` 全绿；dev 启动后旧页面颜色已变成 Annual 风（因为旧组件读 `var(--color-bg)` 等，token 集已切；但布局仍是旧版）—— 这是预期中间态
4. **页面接线**：依次替换 5 个 page.tsx 的 body：从渲染旧组件树改为 `pickThemedPage(theme, key)` dispatch
   - `app/page.tsx`（首页）
   - `app/about/page.tsx`
   - `app/products/page.tsx`
   - `app/writing/page.tsx`
   - `app/writing/[slug]/page.tsx`
   - 每替换一个就跑 dev 看一遍
   - ✅ 验收：5 个路由都进入 Annual 体系
5. **切换器**：
   - 重写 `components/site/theme-switcher.tsx`（cookie + router.refresh + 4 套 + available 灰显）
   - 重写测试
   - ✅ 验收：切换器可用；切 `annual` 仍是 annual；选 unavailable 项被禁用
6. **清理与最终打磨**：
   - 批量删除 `app/theme-init.{tsx,test.tsx}`
   - 批量删除 `components/site/{nav,hero,footer,page-shell,section-head,writing-item,product-card}.tsx`
   - 从 `lib/themes.ts` 删去步骤 1 临时保留的旧 6 个 ID 常量
   - 跑 `pnpm lint` / `pnpm test` / `pnpm run build:next` 三件套；手动验证 §13.3 的 10 项
   - 必要时微调：prose 字号 / 章节间距 / 印章 SVG 比例 / 字体加载策略 / Frontispiece caption 模板填充

每步独立 commit。步骤 1-3 后旧 UI 仍能跑；步骤 4 后路由跑 Annual；步骤 5 后切换器可用；步骤 6 收尾删旧代码。

## 16. 风险与对策

| 风险 | 对策 |
|---|---|
| `cookies()` 让所有页面变 dynamic，CF Worker 冷启动 / 边缘缓存劣化 | 接受。本站流量低、内容轻；如未来真需要，可以为 cookie 缺失的请求加 cache-control |
| 朱砂印章 SVG 在不同浏览器对 `<textPath>` 渲染差异 | 阶段一只测 Chrome/Safari；Firefox 兜底用纯圆环 + center 文字（无弧形） |
| 中文衬线 fallback 不一致（Mac vs Windows）| 不引入额外 webfont 控制不到，接受；如未来需要可引 Noto Serif SC subset |
| Annual 装饰文案"卷号 VII"等会随时间漂移 | 设计为函数：`volume: (s) => toRoman(s.yearsActive + 1)`，每年自动 |
| `next/font` 增 3 个字体 → 首屏字体载荷增大 | Newsreader 和 Fraunces 都用 variable + subset latin 控制，display:swap；阶段二上其它主题时再考虑按主题懒加载 |
| router.refresh() 在切换瞬间页面"闪一下" | 接受。主题切换是低频；可加一个短暂的 transition CSS 减弱视觉跳变 |
| dispatch 用 `Partial<Record>` 容易让"忘加新主题"无声 fallback | 阶段二把所有主题 available=true 后，把 REGISTRY 改成完整 `Record<ThemeId, ...>`（TS 强制） |
