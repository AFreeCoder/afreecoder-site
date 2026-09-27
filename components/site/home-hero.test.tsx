import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeHero } from "./home-hero";

describe("HomeHero", () => {
  it("renders the statement with its accent keyword and a one-line lead", () => {
    const html = renderToStaticMarkup(<HomeHero />);
    expect(html).toContain("hero-title");
    expect(html).toContain('<em class="hero-k">自由</em>');
    expect(html).toContain("这里记录我正在构建的产品");
  });

  it("does not repeat the identity and now-building status shown in the sidebar", () => {
    const html = renderToStaticMarkup(<HomeHero />);
    expect(html).not.toContain("我是 AFreeCoder");
    expect(html).not.toContain("正在构建 ");
    expect(html).not.toContain("hero-status");
  });
});
