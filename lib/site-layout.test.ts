import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { siteConfig } from "./site-config";

describe("site layout", () => {
  it("keeps the top nav as the only visible AFreeCoder brand on the homepage", () => {
    const hero = readFileSync("components/site/hero.tsx", "utf8");

    expect(hero).toContain('src="/avatar.png"');
    expect(hero).not.toContain("<h1");
    expect(hero).not.toContain("{siteConfig.name}");
  });

  it("keeps writing detail pages aligned with the site shell", () => {
    const page = readFileSync("app/writing/[slug]/page.tsx", "utf8");

    expect(page).toContain("<PageShell>");
    expect(page).toContain("<ArticleColumn");
    expect(page).not.toContain("本文同步发布于");
  });

  it("uses a wider site shell to reduce desktop side whitespace", () => {
    const shell = readFileSync("components/site/page-shell.tsx", "utf8");
    const pageFiles = [
      "app/page.tsx",
      "app/about/page.tsx",
      "app/products/page.tsx",
      "app/writing/page.tsx",
      "app/writing/[slug]/page.tsx",
    ];

    expect(shell).toContain("max-w-[1180px]");
    expect(shell).toContain("px-4");
    expect(shell).toContain("sm:px-6");
    expect(shell).toContain("max-w-[820px]");

    for (const file of pageFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("max-w-[960px]");
      expect(source).not.toContain("max-w-[760px]");
    }
  });

  it("keeps navigation and visible section labels in Chinese", () => {
    expect(siteConfig.nav.map((item) => item.label)).toEqual([
      "关于",
      "产品",
      "文章",
    ]);

    expect(readFileSync("app/page.tsx", "utf8")).toContain('title="产品"');
    expect(readFileSync("app/page.tsx", "utf8")).toContain('title="文章"');
    expect(readFileSync("app/products/page.tsx", "utf8")).toContain("产品");
    expect(readFileSync("app/writing/page.tsx", "utf8")).toContain("文章");
    expect(readFileSync("app/writing/[slug]/page.tsx", "utf8")).toContain(
      "分钟阅读",
    );
    expect(readFileSync("app/writing/[slug]/page.tsx", "utf8")).toContain(
      "返回文章列表",
    );
    expect(readFileSync("components/site/hero.tsx", "utf8")).toContain("关于");
    expect(readFileSync("components/site/footer.tsx", "utf8")).toContain(
      "站点地图",
    );
    expect(readFileSync("components/site/product-card.tsx", "utf8")).toContain(
      "运行中",
    );
  });
});
