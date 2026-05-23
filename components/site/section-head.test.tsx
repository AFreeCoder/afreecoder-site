import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SectionHead } from "./section-head";

describe("SectionHead", () => {
  it("renders title only when no meta", () => {
    const html = renderToStaticMarkup(<SectionHead title="关于" />);
    expect(html).toContain("关于");
    expect(html).not.toContain("section-head-meta");
  });

  it("renders meta link when href and label are both provided", () => {
    const html = renderToStaticMarkup(
      <SectionHead title="关于我" metaHref="/about" metaLabel="了解更多" />,
    );
    expect(html).toContain('href="/about"');
    expect(html).toContain("了解更多");
    expect(html).toContain("→");
  });

  it("skips meta when only one of href/label is provided", () => {
    const html = renderToStaticMarkup(
      <SectionHead title="关于" metaLabel="了解更多" />,
    );
    expect(html).not.toContain("section-head-meta");
  });
});
