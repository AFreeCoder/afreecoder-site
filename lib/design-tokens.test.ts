import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_IDS } from "./themes";

const REQUIRED_TOKENS = [
  "color-bg", "color-bg-soft", "color-fg", "color-fg-soft",
  "color-muted", "color-faint",
  "color-accent", "color-accent-soft",
  "color-rule", "color-rule-soft",
] as const;

function loadCss(): string {
  return readFileSync("app/globals.css", "utf8");
}

function extractBlock(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`);
  const match = re.exec(css);
  if (!match) throw new Error(`Missing CSS block: ${selector}`);
  return match[1];
}

function getHexToken(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block);
  if (!match) throw new Error(`Missing token --${name} (hex)`);
  return match[1];
}

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => {
      const channel = Number.parseInt(value, 16) / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(fg: string, bg: string) {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("design tokens · annual reference", () => {
  const css = loadCss();
  const annual = extractBlock(css, "@theme");

  it("annual token block defines all required tokens as hex", () => {
    for (const name of REQUIRED_TOKENS) {
      expect(getHexToken(annual, name)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("annual fg vs bg >= 7:1 (AAA body)", () => {
    expect(contrastRatio(getHexToken(annual, "color-fg"), getHexToken(annual, "color-bg")))
      .toBeGreaterThanOrEqual(7);
  });

  it("annual accent vs bg >= 4.5:1 (AA)", () => {
    expect(contrastRatio(getHexToken(annual, "color-accent"), getHexToken(annual, "color-bg")))
      .toBeGreaterThanOrEqual(4.5);
  });

  it("annual muted vs bg >= 4.5:1 (AA)", () => {
    expect(contrastRatio(getHexToken(annual, "color-muted"), getHexToken(annual, "color-bg")))
      .toBeGreaterThanOrEqual(4.5);
  });

  const SCHEMES: Record<(typeof THEME_IDS)[number], "light" | "dark"> = {
    annual: "light",
    workshop: "light",
    nocturne: "dark",
    telegraph: "dark",
  };

  it.each(THEME_IDS)("%s declares color-scheme", (id) => {
    const scheme = SCHEMES[id];
    const re = new RegExp(`html\\[data-theme="${id}"\\][^}]*\\bcolor-scheme:\\s*${scheme}`);
    expect(css).toMatch(re);
  });
});
