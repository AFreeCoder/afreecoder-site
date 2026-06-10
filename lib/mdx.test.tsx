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
});
