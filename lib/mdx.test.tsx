import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Mdx, extractToc } from "./mdx";

describe("Mdx", () => {
  it("renders restored Markdown blocks used by Hexo articles", () => {
    const html = renderToStaticMarkup(
      <Mdx
        source={[
          "## 二级标题",
          "",
          "1. 第一项",
          "2. 第二项",
          "",
          "- 无序项",
          "",
          "![配图](https://example.com/a.png)",
          "",
          "| A | B |",
          "| --- | --- |",
          "| 1 | 2 |",
        ].join("\n")}
      />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("<ol");
    expect(html).toContain("<ul");
    expect(html).toContain("<img");
    expect(html).toContain("<table");
  });

  it("highlights known code fences with shiki dual themes", () => {
    const html = renderToStaticMarkup(
      <Mdx source={'```go\nfmt.Println("hi")\n```'} />,
    );
    expect(html).toContain("shiki");
    expect(html).toContain("--shiki-light:");
    expect(html).toContain("--shiki-dark:");
  });

  it("normalizes language aliases like Go and golang", () => {
    const upper = renderToStaticMarkup(<Mdx source={"```Go\na := 1\n```"} />);
    const alias = renderToStaticMarkup(<Mdx source={"```golang\na := 1\n```"} />);
    expect(upper).toContain("shiki");
    expect(alias).toContain("shiki");
  });

  it("falls back to plain pre/code for unknown languages", () => {
    const html = renderToStaticMarkup(
      <Mdx source={"```livecodeserver\nput 1\n```"} />,
    );
    expect(html).toContain("<pre><code>");
    expect(html).not.toContain("shiki");
  });

  it("assigns toc-matching ids to h2-h4 headings", () => {
    const source = "## 第一章 概述\n\n### 细节 A\n\n#### 更深\n\n# 一级不带 id";
    const html = renderToStaticMarkup(<Mdx source={source} />);
    expect(html).toContain('<h2 id="第一章-概述">');
    expect(html).toContain('<h3 id="细节-a">');
    expect(html).toContain('<h4 id="更深">');
    expect(html).toContain("<h1>一级不带 id</h1>");
  });
});

describe("extractToc", () => {
  it("collects h2/h3 with CJK-friendly slugs, skipping h1/h4", () => {
    const toc = extractToc(
      "# 标题\n\n## 为什么写这篇\n\n### 背景：2026 年\n\n#### 太深了",
    );
    expect(toc).toEqual([
      { id: "为什么写这篇", text: "为什么写这篇", level: 2 },
      { id: "背景2026-年", text: "背景：2026 年", level: 3 },
    ]);
  });

  it("dedupes repeated heading slugs with a counter", () => {
    const toc = extractToc("## 小结\n\n## 小结");
    expect(toc.map((t) => t.id)).toEqual(["小结", "小结-2"]);
  });

  it("strips inline markdown from toc text and ids", () => {
    const toc = extractToc("## 关于 **APIPool** 与 [链接](https://x.com)");
    expect(toc[0].text).toBe("关于 APIPool 与 链接");
    expect(toc[0].id).toBe("关于-apipool-与-链接");
  });
});
