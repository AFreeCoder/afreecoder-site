import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * 主题系统重做后的"网站脚手架"集成断言。
 * 旧版断言绑死了 components/site/{hero,footer,page-shell,product-card}.tsx
 * 与 page.tsx 中的 SectionHead title 文案，主题阶段一全部不再适用。
 *
 * 这里改为：所有 page.tsx 走 renderThemedPage 而不是直接 import 旧组件，
 * 关键中文文案保留在装饰文案配置 + Annual 组件内。
 */
describe("site layout · themed dispatch", () => {
  const PAGES = [
    "app/page.tsx",
    "app/about/page.tsx",
    "app/products/page.tsx",
    "app/writing/page.tsx",
    "app/writing/[slug]/page.tsx",
  ];

  it("every page.tsx delegates to renderThemedPage", () => {
    for (const file of PAGES) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("renderThemedPage");
      expect(source).toContain("getCurrentTheme");
    }
  });

  it("no page.tsx still imports the deprecated site-shell components", () => {
    const DEPRECATED = [
      "components/site/hero",
      "components/site/nav",
      "components/site/footer",
      "components/site/page-shell",
      "components/site/section-head",
      "components/site/writing-item",
      "components/site/product-card",
    ];
    for (const file of PAGES) {
      const source = readFileSync(file, "utf8");
      for (const mod of DEPRECATED) {
        expect(source, `${file} should not import ${mod}`).not.toContain(mod);
      }
    }
  });

  it("Annual decoration carries Chinese nav labels for the masthead", () => {
    const source = readFileSync("content/decorations/annual.ts", "utf8");
    expect(source).toContain('home: "索引"');
    expect(source).toContain('about: "关于"');
    expect(source).toContain('products: "在线"');
    expect(source).toContain('writing: "实证"');
  });

  it("Annual AboutSection still wires the local avatar image", () => {
    const source = readFileSync("components/themes/annual/about-section.tsx", "utf8");
    expect(source).toContain('src="/avatar.png"');
  });

  it("writing detail page wires Annual WritingPostPage via dispatch", () => {
    const source = readFileSync("app/writing/[slug]/page.tsx", "utf8");
    expect(source).toContain('"writingPost"');
    expect(source).toContain("meta: post.meta");
    expect(source).toContain("body: post.body");
  });

  it("Cookie-driven layout is async and sets data-theme from getCurrentTheme", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain("async function RootLayout");
    expect(layout).toContain("getCurrentTheme");
    expect(layout).toContain("data-theme={theme}");
  });

  it("legacy ThemeInit防闪脚本不应再被 layout 引用", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).not.toContain("ThemeInit");
    // 旧脚本文件可能仍存在等待 Task 18 清理；不在此处断言其消失
  });

  it("旧 site-config.ts 暂时可保留（阶段二可能复用），但不再被 page 引用", () => {
    // 当前实施只保证 page.tsx 不再 import 它；文件本身留不留由清理步骤决定
    for (const file of PAGES) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain('@/lib/site-config');
    }
    // sanity：文件还在
    expect(existsSync("lib/site-config.ts")).toBe(true);
  });
});
