import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Mdx } from "./mdx";

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
});
