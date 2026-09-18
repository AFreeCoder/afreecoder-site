import { describe, expect, it } from "vitest";
import { products } from "./products";

describe("products content", () => {
  it("uses the current public product lineup", () => {
    expect(products.map((product) => product.name)).toEqual([
      "APIPool",
      "GPT101",
      "RemoveAIWatermark",
      "WigglyPaint",
    ]);
    expect(products.map((product) => product.link)).toEqual([
      "https://apipool.dev",
      "https://gpt101.org",
      "https://removeaiwatermark.org",
      "https://wigglypaint.co",
    ]);
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
