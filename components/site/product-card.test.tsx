import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

const sample: Product = {
  name: "APIPool",
  description: "AI API 聚合与转发服务。",
  role: "SaaS",
  phase: "线上运行",
  highlight: "把多模型 API 收束成一个入口。",
  tags: ["API", "AI", "SaaS"],
  link: "https://apipool.dev",
  status: "active",
};

describe("ProductCard", () => {
  it("renders name, description, tags and external link", () => {
    const html = renderToStaticMarkup(<ProductCard product={sample} />);
    expect(html).toContain("APIPool");
    expect(html).toContain("AI API 聚合与转发服务");
    expect(html).toContain("API");
    expect(html).toContain('href="https://apipool.dev"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("uses a div instead of an anchor when no link is provided", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={{ ...sample, link: undefined }} />,
    );
    expect(html).toContain('class="product-card"');
    expect(html).not.toContain('href=');
  });

  it("caps tags rendered inside the card at 3", () => {
    const many: Product = {
      ...sample,
      tags: ["A", "B", "C", "D", "E"],
    };
    const html = renderToStaticMarkup(<ProductCard product={many} />);
    expect(html).toContain(">A<");
    expect(html).toContain(">B<");
    expect(html).toContain(">C<");
    expect(html).not.toContain(">D<");
    expect(html).not.toContain(">E<");
  });

  it("renders an abstract placeholder with the product's first letter", () => {
    const html = renderToStaticMarkup(<ProductCard product={sample} />);
    expect(html).toContain("product-placeholder");
    expect(html).toContain(">A<"); // letter for "APIPool"
  });
});
