import { describe, expect, it } from "vitest";
import { products } from "./products";

describe("products content", () => {
  it("uses the current public product lineup", () => {
    expect(products.map((product) => product.name)).toEqual([
      "GPT101",
      "APIPool",
      "锦章",
      "RemoveAIWatermark",
      "WigglyPaint",
    ]);
    expect(products.map((product) => product.link)).toEqual([
      "https://gpt101.org",
      "https://app.apipool.dev",
      "https://jinzhang.ink",
      "https://removeaiwatermark.org",
      "https://wigglypaint.co",
    ]);
  });

  it("features GPT101, APIPool and 锦章 on the homepage", () => {
    expect(
      products.filter((product) => product.homepage).map((product) => product.link),
    ).toEqual(["https://gpt101.org", "https://app.apipool.dev", "https://jinzhang.ink"]);
  });

  it("active products include presentation metadata for richer cards", () => {
    const active = products.filter((product) => product.status === "active");

    expect(active.length).toBeGreaterThan(0);
    for (const product of active) {
      expect(product.role).toBeTruthy();
      expect(product.phase).toBeTruthy();
      expect(product.highlight).toBeTruthy();
      const image = new URL(product.screenshot!);
      expect(image.protocol).toBe("https:");
      expect(image.hostname).toBe("tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com");
      expect(image.searchParams.get("x-oss-process")).toBe(
        "image/resize,w_1080/quality,q_80/format,webp",
      );
      expect(product.tags.length).toBeGreaterThanOrEqual(2);
    }
  });
});
