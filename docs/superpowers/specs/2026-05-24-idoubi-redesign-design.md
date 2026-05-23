# AFreeCoder · idoubi 风格重构

> 2026-05-24 · 完全参考 https://idoubi.ai/ 的设计，对当前个人站做整站改造。

## 1. 目标

把 AFreeCoder 站从现行的"年鉴"editorial 风（暖宣纸色 + Fraunces 衬线 + 年份装饰侧轨）切换为 idoubi.ai 风格：**暗色优先的左侧固定边栏 + 右侧滚动内容**两栏布局，低噪静音的现代 sans-serif 调性。在 accent、字体、文案细节上保留 AFreeCoder 的口味。

## 2. 决策清单（已对齐）

| 维度 | 决策 |
|---|---|
| 主题系统 | 删除多主题抽象，单一布局 |
| 忠实度 | 同结构同调性，accent/字体/文案微调 |
| 产品视觉 | 抽象占位图（用户后补真实截图） |
| 明暗 | dark 默认 + sun/moon toggle |
| 范围 | 全部 5 个页面：home / about / products / writing / writing/[slug] |

## 3. 架构改动（路径 A · 一刀切）

### 删除
- `components/themes/`（整目录，含 `dispatch.tsx` / `annual/` 各 page 与组件 / 测试）
- `lib/themes.ts`、`lib/themes.test.ts`
- `lib/get-current-theme.ts`（被 `lib/color-scheme.ts` 取代）
- `lib/site-stats.ts`、`lib/site-stats.test.ts`（章节模板填充不再需要）
- `lib/site-layout.test.ts`（与旧 Masthead/Colophon 耦合）
- `content/decorations/`（装饰内容驱动层）
- `app/scroll-year-track.tsx`（年份轨道滚动监听）
- `components/site/theme-switcher.tsx` + 同名 test（被新的 color-scheme-toggle 取代）
- `lib/assets.test.ts`（年鉴 avatar 校验，若不再适用）

### 改动
- `app/layout.tsx`：移除 ScrollYearTrack；改读 `getColorScheme()` 并写到 `<html data-color-scheme>`；用 grid 拼装 `<Sidebar />` + `<main>{children}</main>` 两栏
- `app/globals.css`：完全重写。dark/light token + sidebar grid + 组件级 utility 样式
- `app/page.tsx`、`app/about/page.tsx`、`app/products/page.tsx`、`app/writing/page.tsx`、`app/writing/[slug]/page.tsx`：去掉 dispatch，直接渲染组件
- `lib/site-config.ts`：扩展 socials 字段为 4-5 个平台；新增 `taglines: { primary, secondary }`

### 新增
- `lib/color-scheme.ts`：定义 `ColorScheme = "dark" | "light"`，cookie 常量 `COLOR_SCHEME_COOKIE = "color-scheme"`，`isColorScheme()`、`DEFAULT_SCHEME = "dark"`
- `lib/get-color-scheme.ts`：服务端读 cookie
- `components/site/sidebar.tsx`：服务器组件，接收 active key
- `components/site/sidebar-nav.tsx`：客户端组件，用 `usePathname()` 计算 active 状态
- `components/site/social-row.tsx`：内联 SVG 社交图标行
- `components/site/section-head.tsx`：`— 标题      meta →` 章节头通用组件
- `components/site/product-card.tsx`：占位图 + 标题 + 副标题 + 标签
- `components/site/product-placeholder.tsx`：抽象占位图（首字母 + 渐变背景）
- `components/site/writing-row.tsx`：编号 + 标题 + 日期
- `components/site/color-scheme-toggle.tsx`：sun/moon 客户端按钮，写 cookie + `router.refresh()`

## 4. 设计 tokens

```css
/* dark (默认) */
--bg:            #0a0a0a;
--bg-card:       #161616;
--bg-card-hover: #1c1c1c;
--fg:            #e8e6e0;
--fg-muted:      #8a8780;
--fg-dim:        #5a5750;
--rule:          rgba(255,255,255,0.08);
--rule-strong:   rgba(255,255,255,0.16);
--accent:        #d97a3d;   /* AFreeCoder 自家琥珀色 */
--accent-soft:   rgba(217,122,61,0.16);

/* light */
--bg:            #fafaf7;
--bg-card:       #ffffff;
--bg-card-hover: #f4f2ec;
--fg:            #1a1a1a;
--fg-muted:      #6b6b6b;
--fg-dim:        #a8a8a8;
--rule:          rgba(0,0,0,0.08);
--rule-strong:   rgba(0,0,0,0.16);
--accent:        #b53028;
--accent-soft:   rgba(181,48,40,0.10);
```

字体（精简）：
- `--font-sans`: Geist Sans —— 中英文正文 + 标题
- `--font-mono`: JetBrains Mono —— 日期 / 编号 / 社交 label / 版权
- 移除 Fraunces、Newsreader（editorial 衬线与新调性冲突）

## 5. 布局

```
┌─────────────┬─────────────────────────────────────────┐
│             │                                          │
│  sidebar    │   main (scrollable)                      │
│  (sticky)   │                                          │
│             │   — 关于我             了解更多 →         │
│  avatar     │   <bio paragraphs>                       │
│  AFreeCoder │                                          │
│  bio        │   — 我的产品           查看全部 →         │
│  tagline    │   [card] [card] [card]                   │
│  [socials]  │                                          │
│  - 关于     │   — 近期文章           阅读更多 →         │
│  - 产品     │   01  Title ………… 2026/05/24             │
│  - 写作     │   02  Title ………… 2026/05/22             │
│  © 2026     │   ...                                    │
│  ☼ toggle   │                                          │
└─────────────┴─────────────────────────────────────────┘
```

- desktop ≥ 1024px：`grid-template-columns: 280px 1fr`；sidebar `position: sticky; top: 0; height: 100vh; overflow: hidden auto`
- 1024 > viewport ≥ 640：单列，sidebar 变为页头（avatar + name 一行 + nav 一行）
- < 640：sidebar 变为紧凑页头（avatar + name + nav 三行紧凑堆叠）

## 6. 页面骨架

### `/`（home）
- `<AboutBlock>` 取 `aboutMdx` 前 3 段
- `<ProductsBlock>` 3 列卡片，取 `products.slice(0, 3)`
- `<WritingBlock>` 编号列表，取 `posts.slice(0, 10)`

### `/about`
- 单 `<SectionHead>` "关于"
- `<article>` 用 `Mdx` 渲染完整 `aboutMdx`

### `/products`
- `<SectionHead>` "我的产品"
- 3 列 `<ProductCard>` grid，渲染全部 `products`（active 在前，archived 在后并淡化）

### `/writing`
- `<SectionHead>` "写作"
- 按年份分组渲染 `<WritingRow>`，每年小标题（mono，小字号）

### `/writing/[slug]`
- `<SectionHead>` "阅读" + meta（日期 · 阅读时间）
- `<article>` 用 `Mdx` 渲染正文
- footer "← 返回文章列表"

## 7. 明暗切换机制

- cookie：`color-scheme=dark|light`，1 年过期，samesite=lax
- 首次访问无 cookie → `dark`
- 服务端：`getColorScheme()` 读 cookie，写到 `<html data-color-scheme>` 与 `<html>` 的 `style="color-scheme: dark|light"`
- 客户端：`<ColorSchemeToggle>` 读 cookie 决定按钮状态；点击写 cookie → `router.refresh()`；无水合 flash（服务端已注入正确 token）

## 8. 测试策略

- 删除已耦合旧主题的测试：`themes.test.ts`、`site-stats.test.ts`、`site-layout.test.ts`、`get-current-theme` 相关（无独立 test 文件可知）、`dispatch.test.tsx`、所有 `components/themes/annual/__tests__/`
- 新写：
  - `lib/color-scheme.test.ts`：`isColorScheme` / `DEFAULT_SCHEME`
  - `components/site/sidebar-nav.test.tsx`：active 高亮逻辑
  - `components/site/color-scheme-toggle.test.tsx`：点击写 cookie
  - `components/site/section-head.test.tsx`：meta 链接渲染
  - `components/site/product-card.test.tsx`：占位图 + 标签

## 9. Out of scope

- 真实产品截图（占位图先行，用户后补）
- 多语言（仅 zh-CN）
- 评论 / 订阅 UI（保留 `/rss.xml` 静态端点）
- 复杂动效（仅 hover 200ms 过渡）
- 性能微调（图片优化、字体子集化等放后续）

## 10. 实施顺序

1. 删除旧文件（themes/ / decorations/ / site-stats / scroll-year-track / theme-switcher 等）
2. 新建 `lib/color-scheme.ts` + `lib/get-color-scheme.ts`
3. 重写 `app/globals.css`
4. 新增 `components/site/*` 8 个新组件
5. 改 `app/layout.tsx`（两栏 grid + color-scheme 注入）
6. 改 5 个 page.tsx 去 dispatch
7. 删 / 新写测试
8. `pnpm lint && pnpm test && pnpm build:next` 三件套校验
9. 浏览器手动验证（dev server + dark/light 切换 + 5 页面）
