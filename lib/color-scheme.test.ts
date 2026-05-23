import { describe, expect, it } from "vitest";
import {
  COLOR_SCHEMES,
  COLOR_SCHEME_COOKIE,
  DEFAULT_COLOR_SCHEME,
  isColorScheme,
} from "./color-scheme";

describe("color-scheme", () => {
  it("exposes exactly dark and light", () => {
    expect([...COLOR_SCHEMES]).toEqual(["dark", "light"]);
  });

  it("defaults to dark", () => {
    expect(DEFAULT_COLOR_SCHEME).toBe("dark");
  });

  it("cookie name is color-scheme", () => {
    expect(COLOR_SCHEME_COOKIE).toBe("color-scheme");
  });

  it("isColorScheme narrows valid values", () => {
    expect(isColorScheme("dark")).toBe(true);
    expect(isColorScheme("light")).toBe(true);
    expect(isColorScheme("system")).toBe(false);
    expect(isColorScheme(undefined)).toBe(false);
    expect(isColorScheme(42)).toBe(false);
  });
});
