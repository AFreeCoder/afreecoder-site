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
    expect(html).toContain('href="https://apipool.dev"');
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
