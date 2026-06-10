import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FeaturedProductCard } from "./featured-product-card";
import type { Product } from "@/lib/types";

const sample: Product = {
  name: "APIPool",
  description: "AI API 聚合与转发服务。",
  screenshot: "/product-screenshots/apipool-card.png",
  role: "SaaS",
  phase: "线上运行",
  highlight: "把多模型 API、账户池和请求排查收束成一套可维护的服务入口。",
  tags: ["API", "AI", "SaaS"],
  link: "https://apipool.dev",
  status: "active",
};

describe("FeaturedProductCard", () => {
  it("renders name, badge, highlight and hostname link", () => {
    const html = renderToStaticMarkup(<FeaturedProductCard product={sample} />);
    expect(html).toContain("APIPool");
    expect(html).toContain("主打");
    expect(html).toContain("把多模型 API");
    expect(html).toContain("apipool.dev ↗");
    expect(html).toContain('href="https://apipool.dev"');
  });

  it("renders the screenshot inside the framed shot area", () => {
    const html = renderToStaticMarkup(<FeaturedProductCard product={sample} />);
    expect(html).toContain("feat-product-shot");
    expect(html).toContain("APIPool 产品截图");
  });

  it("caps tags at 3", () => {
    const html = renderToStaticMarkup(
      <FeaturedProductCard product={{ ...sample, tags: ["A", "B", "C", "D"] }} />,
    );
    expect(html).toContain(">C<");
    expect(html).not.toContain(">D<");
  });

  it("falls back to a div when no link", () => {
    const html = renderToStaticMarkup(
      <FeaturedProductCard product={{ ...sample, link: undefined }} />,
    );
    expect(html).not.toContain("href=");
  });
});
