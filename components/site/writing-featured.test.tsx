import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WritingFeatured } from "./writing-featured";
import type { WritingMeta } from "@/lib/types";

const post: WritingMeta = {
  title: "财务自由实证#26——高层火灾如何逃生？",
  date: "2022-12-06",
  slug: "invest-practice-26",
  summary: "追求财务自由，并不是希望大富大贵，而是希望能拥有自由选择生活方式的权利。",
  readingTime: 14,
};

describe("WritingFeatured", () => {
  it("renders eyebrow, title, excerpt, reading time and date", () => {
    const html = renderToStaticMarkup(<WritingFeatured post={post} />);
    expect(html).toContain("最新文章");
    expect(html).toContain("高层火灾如何逃生");
    expect(html).toContain("追求财务自由");
    expect(html).toContain("约 14 分钟");
    expect(html).toContain("2022/12/06");
    expect(html).toContain('href="/writing/invest-practice-26"');
  });

  it("truncates long summaries to 80 chars with ellipsis", () => {
    const long = { ...post, summary: "字".repeat(120) };
    const html = renderToStaticMarkup(<WritingFeatured post={long} />);
    expect(html).toContain("字".repeat(80) + "…");
    expect(html).not.toContain("字".repeat(81));
  });

  it("omits excerpt when summary missing", () => {
    const html = renderToStaticMarkup(
      <WritingFeatured post={{ ...post, summary: undefined }} />,
    );
    expect(html).not.toContain("feat-post-excerpt");
  });
});
