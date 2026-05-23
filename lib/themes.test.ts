import { describe, it, expect } from "vitest";
import { THEME_IDS, THEMES, DEFAULT_THEME, isThemeId, type ThemeId } from "./themes";

describe("themes", () => {
  it("exposes 4 theme ids in expected order", () => {
    expect(THEME_IDS).toEqual(["annual", "workshop", "nocturne", "telegraph"]);
  });

  it("DEFAULT_THEME is annual", () => {
    expect(DEFAULT_THEME).toBe("annual");
  });

  it("provides a metadata entry per id with label/swatch/blurb/available", () => {
    expect(THEMES.map((t) => t.id)).toEqual([...THEME_IDS]);
    for (const t of THEMES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.blurb.length).toBeGreaterThan(0);
      expect(t.swatch).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof t.available).toBe("boolean");
    }
  });

  it("only annual is available in stage one", () => {
    const available = THEMES.filter((t) => t.available).map((t) => t.id);
    expect(available).toEqual(["annual"]);
  });

  it("isThemeId narrows correctly", () => {
    expect(isThemeId("annual")).toBe(true);
    expect(isThemeId("workshop")).toBe(true);
    expect(isThemeId("sand")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(isThemeId(42)).toBe(false);
  });

  it("ThemeId type contains exactly the documented ids", () => {
    const ids: ThemeId[] = ["annual", "workshop", "nocturne", "telegraph"];
    expect(new Set(ids).size).toBe(4);
  });
});
