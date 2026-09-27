import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductRow } from "./product-row";
import type { Product } from "@/lib/types";

const sample: Product = {
  name: "APIPool",
  description: "AI API 聚合与转发服务。",
  screenshot:
    "https://example.oss-cn-beijing.aliyuncs.com/a.png?x-oss-process=image/resize,w_1080/quality,q_80/format,webp",
  role: "SaaS / API 网关",
  phase: "线上运行",
  highlight: "把多模型 API 收束成一个入口。",
  tags: ["API", "AI", "SaaS"],
  link: "https://apipool.dev",
  status: "active",
};

describe("ProductRow", () => {
  it("renders name, purpose, role and an external hostname link", () => {
    const html = renderToStaticMarkup(<ProductRow product={sample} />);
    expect(html).toContain("APIPool");
    expect(html).toContain("AI API 聚合与转发服务");
    expect(html).toContain("SaaS / API 网关");
    expect(html).toContain("apipool.dev ↗");
    expect(html).toContain('href="https://apipool.dev"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
  });

  it("requests a small OSS thumbnail instead of the 1080px screenshot", () => {
    const html = renderToStaticMarkup(<ProductRow product={sample} />);
    expect(html).toContain("resize,w_320/quality,q_80/format,webp");
    expect(html).not.toContain("w_1080");
  });

  it("keeps non-OSS screenshot URLs unchanged", () => {
    const html = renderToStaticMarkup(
      <ProductRow product={{ ...sample, screenshot: "/product-screenshots/apipool-card.png" }} />,
    );
    expect(html).toContain("/product-screenshots/apipool-card.png");
  });

  it("marks only the featured product with a badge", () => {
    expect(renderToStaticMarkup(<ProductRow product={sample} featured />)).toContain("主打");
    expect(renderToStaticMarkup(<ProductRow product={sample} />)).not.toContain("主打");
  });

  it("falls back to a placeholder and a plain block without screenshot or link", () => {
    const html = renderToStaticMarkup(
      <ProductRow product={{ ...sample, screenshot: undefined, link: undefined }} />,
    );
    expect(html).toContain("product-placeholder");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("↗");
  });
});
