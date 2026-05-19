import { describe, it, expect } from "vitest";
import { THEME_IDS, THEMES, type ThemeId } from "./themes";

describe("themes", () => {
  it("exposes 6 theme ids in expected order", () => {
    expect(THEME_IDS).toEqual([
      "sand",
      "ink",
      "mist",
      "moss",
      "editorial",
      "terminal",
    ]);
  });

  it("provides a metadata entry per id", () => {
    expect(THEMES.map((t) => t.id)).toEqual(THEME_IDS);
    for (const t of THEMES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("ThemeId type contains exactly the documented ids", () => {
    const ids: ThemeId[] = ["sand", "ink", "mist", "moss", "editorial", "terminal"];
    expect(new Set(ids).size).toBe(6);
  });
});
