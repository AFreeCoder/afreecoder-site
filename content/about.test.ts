import { describe, expect, it } from "vitest";
import { aboutMdx } from "./about";

describe("about content", () => {
  it("uses the current AFreeCoder self-introduction", () => {
    expect(aboutMdx).toContain("A-Free-Coder");
    expect(aboutMdx).toContain("追求自由的 Coder");
    expect(aboutMdx).toContain("这里是我追求自由的痕迹");
  });
});
