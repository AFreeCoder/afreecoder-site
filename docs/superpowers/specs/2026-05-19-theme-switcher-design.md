# 主题切换器 设计稿

- 日期：2026-05-19
- 范围：在导航栏右上角加入主题切换器，提供 6 套主题（默认沿用当前暖砂）
- 实施路径：Option C1 —— `[data-theme="x"]` 选择器 + CSS 变量 + 自写切换器，保持 hex 颜色写法不迁通道分量

## 1. 目标

1. 让访客可在 6 套主题之间切换
2. 默认仍为现有暖色克制版（暖砂 Warm Sand）
3. 新增主题在色板之外还允许字体差异（报刊衬线、终端 mono），让"设计感"立得住
4. 切换后持久化，跨页 / 刷新保留；首屏不闪烁
5. 不引入主题相关的运行时依赖

## 2. 关键决策摘要

| 决策点 | 选择 |
|---|---|
| 主题方向 | C 渐进表达：默认克制 + 几套同骨架色板 + 少量出格主题 |
| 主题数量 | 6 套：sand / ink / mist / moss / editorial / terminal |
| 切换器形态 | B 调色板图标 + 下拉菜单（右上角，导航栏右侧） |
| 首次访问 | 固定使用暖砂（不读 `prefers-color-scheme`） |
| 字体差异 | 允许：报刊用 Source Serif 4 写标题，终端 body 全 Geist Mono |
| 实施 | Option C1：`[data-theme]` 选择器 + hex 颜色 + 自写切换器 + 内联防闪脚本 |

## 3. 架构

```
app/
  globals.css                          (重写) :root → 6 套 [data-theme="x"] 规则块
  layout.tsx                           (改) <html data-theme="sand">；引入 Source Serif；挂 ThemeInit
  theme-init.tsx                       (新) 输出内联 <script>，paint 前同步改 data-theme
components/site/
  theme-switcher.tsx                   (新) 'use client'，调色板图标 + 下拉菜单
  nav.tsx                              (改) 右侧追加 <ThemeSwitcher />
  hero.tsx                             (改) tokenize 硬编码的 #fffdfa / shadow
  product-card.tsx                     (改) tokenize 两处硬编码 shadow
lib/
  themes.ts                            (新) 主题枚举常量 + 类型，供切换器与防闪脚本共用
```

数据流：

1. **SSR**：`<html data-theme="sand">` 写在 HTML 里——首屏永远是默认主题
2. **Paint 前**：`<head>` 内联脚本同步读 `localStorage.theme`，若值合法就改 `<html>` 的 `data-theme`
3. **运行时**：切换器更新 `document.documentElement.dataset.theme` + `localStorage.theme`，CSS 级联自动重绘所有用 `var(--color-*)` 的样式
4. **跨页**：Next.js 同一 SPA 实例下 `<html>` 不重建；硬刷新由内联脚本兜底

## 4. 主题 Token（完整 6 套）

每套主题在 `globals.css` 的 `@theme` 之外、紧接其后写一段 `[data-theme="<name>"] { ... }` 规则块，定义以下 12 个 token：

| Token | 用途 |
|---|---|
| `--color-bg` | 页面底色 |
| `--color-fg` | 主文字 |
| `--color-muted` | 次要文字（描述、元数据） |
| `--color-faint` | 弱化文字（label、placeholder） |
| `--color-accent` | 强调色（链接、点缀） |
| `--color-accent-soft` | 强调浅底（badge 背景、当前菜单项底色） |
| `--color-card` | 卡片 / surface |
| `--color-border` | 普通边框 |
| `--color-border-strong` | 强边框（hero 头像框） |
| `--color-card-border` | 卡片边框（与 border 同色或微差） |
| `--color-card-border-hover` | 卡片 hover 边框 |
| `--shadow-soft` | 卡片默认阴影（完整 box-shadow 值） |
| `--shadow-soft-hover` | 卡片 hover 阴影 |

值见下表（已在视觉伙伴中确认）：

### 4.1 暖砂 Warm Sand（`data-theme="sand"`，默认）

完全沿用现状（含 `@theme` 块已定义的内容）。仅新增 shadow token：

```
--shadow-soft: 0 1px 2px rgba(28,25,23,0.04);
--shadow-soft-hover: 0 10px 24px rgba(28,25,23,0.07);
```

### 4.2 墨夜 Ink Night（`data-theme="ink"`）

```
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
--shadow-soft: 0 1px 2px rgba(0,0,0,0.4);
--shadow-soft-hover: 0 10px 30px rgba(0,0,0,0.5);
```

### 4.3 冷雾 Cold Mist（`data-theme="mist"`）

```
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
--shadow-soft: 0 1px 2px rgba(15,23,42,0.05);
--shadow-soft-hover: 0 10px 24px rgba(15,23,42,0.08);
```

### 4.4 苔石 Moss Stone（`data-theme="moss"`）

```
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
--shadow-soft: 0 1px 2px rgba(0,0,0,0.3);
--shadow-soft-hover: 0 10px 30px rgba(0,0,0,0.45);
```

### 4.5 报刊 Editorial（`data-theme="editorial"`）

```
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
--shadow-soft: 0 1px 2px rgba(26,20,16,0.05);
--shadow-soft-hover: 0 10px 24px rgba(26,20,16,0.08);
```

### 4.6 终端 Terminal（`data-theme="terminal"`）

```
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
--shadow-soft: 0 0 0 1px rgba(126,231,135,0.05);
--shadow-soft-hover: 0 0 12px rgba(126,231,135,0.15);
```

苔石 / 终端的 `--shadow-soft*` 用"轻发光"而非投影，因为暗底上灰阴影几乎不可见。

### 4.7 `color-scheme` 协同

`globals.css` 的 `html { color-scheme: light; }` 改为按主题分组写：

```css
html[data-theme="sand"],
html[data-theme="mist"],
html[data-theme="editorial"] { color-scheme: light; }

html[data-theme="ink"],
html[data-theme="moss"],
html[data-theme="terminal"] { color-scheme: dark; }
```

这样浏览器原生滚动条、表单控件、autofill 颜色都会跟主题走。

## 5. 字体加载

`app/layout.tsx`：

```ts
import { Source_Serif_4 } from "next/font/google";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
```

`<html>` 的 className 追加 `${serif.variable}`，与现有 `GeistSans.variable` / `GeistMono.variable` 并列。

`globals.css` 增加：

```css
[data-theme="editorial"] h1,
[data-theme="editorial"] h2,
[data-theme="editorial"] h3,
[data-theme="editorial"] h4 {
  font-family: var(--font-serif), Georgia, "Noto Serif SC", serif;
}

[data-theme="terminal"] body {
  font-family: var(--font-mono), ui-monospace, "SF Mono", monospace;
}
```

中文站点 Source Serif 4 不覆盖中文字形，中文标题回落到 `"Noto Serif SC"`（系统已有的话）或浏览器默认衬线。不引入额外中文衬线包，避免拖慢首屏。

## 6. 切换器 `components/site/theme-switcher.tsx`

图标使用 `lucide-react`（项目已装）：按钮内放 `Palette`，菜单项当前态打勾用 `Check`。`'use client'` 组件，结构：

```tsx
<div className="relative">
  <button
    type="button"
    aria-label="切换主题"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls="theme-menu"
    onClick={() => setOpen((v) => !v)}
    className="…32×32 box, border, hover…"
  >
    <PaletteIcon />
  </button>

  {open && (
    <ul
      id="theme-menu"
      role="menu"
      className="absolute right-0 top-[42px] w-[200px] …"
    >
      {THEMES.map((t) => (
        <li
          key={t.id}
          role="menuitem"
          aria-current={current === t.id}
          onClick={() => choose(t.id)}
          className="…active 态用 accent-soft 底色…"
        >
          <span className="swatch" style={{ background: t.swatch }} />
          {t.label}
          {current === t.id && <CheckIcon />}
        </li>
      ))}
    </ul>
  )}
</div>
```

`THEMES` 数组从 `lib/themes.ts` 引入。每项含 `id`（与 `data-theme` 值一一对应）、`label`（中文名）、`swatch`（accent 色 hex，用作菜单缩略）。

`choose(id)`：

```ts
document.documentElement.dataset.theme = id;
localStorage.setItem("theme", id);
setCurrent(id);
setOpen(false);
```

`current` 初始值：组件 `useEffect` 挂载后读 `document.documentElement.dataset.theme`（不直接读 localStorage——以 head 内联脚本已处理好的 DOM 状态为单一真相）。挂载前 SSR 输出占位为 `sand`，挂载后立即纠正。

**关闭语义**：

- 点击菜单外部：document-level mousedown 监听，open 时挂载、close 时卸载
- 按 Esc：button 上 keydown 处理
- 菜单项触发 choose 后自动关

按钮视觉：

- 32×32，`border-[var(--color-card-border)]` `rounded-[8px]` `bg-[var(--color-card)]`
- hover → `border-[var(--color-card-border-hover)]`
- 图标 `currentColor`，颜色继承 `var(--color-fg)`，hover → `var(--color-accent)`

下拉菜单视觉：

- 宽 200px，距按钮 8px，`bg-[var(--color-card)]` `border-[var(--color-border)]` `rounded-[10px]`
- 内边距 6px，每项 8×10px、`rounded-[6px]`、`text-[13px]`
- hover → 背景 `var(--color-accent-soft)`
- `aria-current="true"` 项：背景 `var(--color-accent-soft)`，文字 `var(--color-accent)`
- 阴影使用 `var(--shadow-soft-hover)`

## 7. 防闪脚本 `app/theme-init.tsx`

```tsx
export function ThemeInit() {
  const script =
    "(function(){try{var t=localStorage.getItem('theme');" +
    "if(t&&['sand','ink','mist','moss','editorial','terminal'].indexOf(t)>=0)" +
    "{document.documentElement.dataset.theme=t}}catch(e){}})();";
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

在 `app/layout.tsx` 中渲染。位置有两个候选：（a）作为 `<head>` 的子节点，（b）作为 `<body>` 的第一个子节点。两者都在样式计算前同步执行、效果等价无闪烁。具体取哪种由实现者决定，按当前版本的 `node_modules/next/dist/docs/` 中关于 layout `<head>` / 内联 `<script>` 的约定（见 AGENTS.md 提示）。

白名单校验防止 localStorage 被同源垃圾值污染。读不到 / 不合法 → 沉默回落到 SSR 默认值 `sand`。

`lib/themes.ts` 维护主题列表的单一真相：

```ts
export const THEME_IDS = ["sand", "ink", "mist", "moss", "editorial", "terminal"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "sand",      label: "暖砂 Warm Sand",   swatch: "#c2410c" },
  { id: "ink",       label: "墨夜 Ink Night",   swatch: "#fb923c" },
  { id: "mist",      label: "冷雾 Cold Mist",   swatch: "#1e40af" },
  { id: "moss",      label: "苔石 Moss Stone",  swatch: "#d4a574" },
  { id: "editorial", label: "报刊 Editorial",   swatch: "#9b2c2c" },
  { id: "terminal",  label: "终端 Terminal",    swatch: "#7ee787" },
];
```

防闪脚本的字符串数组是手写的副本（不能从 `lib/themes.ts` import，因为它要在 React 接管前同步执行）。两处必须保持同步——加新主题时需同时改两处，spec 在此处加注释提醒。

## 8. 硬编码颜色清理（pre-work）

**`components/site/hero.tsx`** 第 14 行：

```diff
- bg-[#fffdfa] shadow-[0_12px_30px_rgba(28,25,23,0.08)]
+ bg-[var(--color-card)] shadow-[var(--shadow-soft-hover)]
```

**`components/site/product-card.tsx`** 第 10 行：

```diff
- shadow-[0_1px_2px_rgba(28,25,23,0.04)] … hover:shadow-[0_10px_24px_rgba(28,25,23,0.07)]
+ shadow-[var(--shadow-soft)] … hover:shadow-[var(--shadow-soft-hover)]
```

清理后这两个组件在所有 6 套主题下都用各主题自定义的阴影值。

## 9. 范围外（明确不做）

- 不读 `prefers-color-scheme`：首次访问固定暖砂
- 不引入 `next-themes` 或类似库
- 不迁颜色书写到 HSL/OKLCH 通道分量（C2 路径，留待未来）
- 不增加键盘上下方向键选项导航（菜单只 6 项，Esc + Tab 已够用；如未来需要再补）
- 不为 RSS / sitemap / OG image 做主题变体（这些是静态资源，与主题无关）
- 不监听 `storage` 事件做跨标签页同步（YAGNI）

## 10. 测试

### 单元 `components/site/__tests__/theme-switcher.test.tsx`（vitest + @testing-library/react）

1. 渲染产物含 `<button aria-label="切换主题">`
2. 点击按钮 → 菜单展开，6 项可见，默认 `sand` 项 `aria-current="true"`
3. 点击 ink 项 → `document.documentElement.dataset.theme === "ink"`，`localStorage.getItem("theme") === "ink"`，菜单关闭
4. 按 Esc → 菜单关闭
5. mock `document.documentElement.dataset.theme = "mist"` 后挂载 → mist 项是 aria-current

### 单元 `app/__tests__/theme-init.test.tsx`

渲染产物是 `<script>` 元素，`__html` 字符串中按字面顺序含 6 个主题 id。

### 视觉烟测（手动，pnpm dev）

逐一切换 6 套主题，过一遍 `/`、`/writing`、`/writing/hello-world`、`/products`、`/about`。重点：

- 报刊页：标题确实是衬线
- 终端页：所有文字（含导航、卡片）都是 mono
- 墨夜 / 苔石 / 终端：hero 头像框、product 卡片阴影仍可见
- 切换器：菜单弹出、active 高亮、点击外部关闭

## 11. 实施步骤建议

按依赖排序：

1. 加 `lib/themes.ts`
2. 重写 `app/globals.css`（6 套 token + color-scheme 分组 + 字体覆盖规则）
3. 改 `app/layout.tsx`（Source Serif、`<html data-theme="sand">`、`<ThemeInit />`）
4. 加 `app/theme-init.tsx`
5. 清理 `hero.tsx` / `product-card.tsx` 的硬编码颜色和阴影
6. 加 `components/site/theme-switcher.tsx`
7. 改 `components/site/nav.tsx` 挂入切换器
8. 写测试

每一步都能独立 commit；步骤 1–5 完成后，所有主题已经能通过手改 `<html data-theme>` 验证；步骤 6–7 把切换器 UI 接上。
