import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function getToken(css: string, name: string) {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!match) throw new Error(`Missing CSS token: ${name}`);
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

function contrastRatio(foreground: string, background: string) {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

describe("design tokens", () => {
  it("small-text semantic colors meet accessible contrast on the light background", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const background = getToken(css, "color-bg");

    expect(contrastRatio(getToken(css, "color-accent"), background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(getToken(css, "color-faint"), background)).toBeGreaterThanOrEqual(4.5);
  });
});
