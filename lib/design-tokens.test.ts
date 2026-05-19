import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_IDS } from "./themes";

const REQUIRED_TOKENS = [
  "color-bg",
  "color-fg",
  "color-muted",
  "color-faint",
  "color-accent",
  "color-accent-soft",
  "color-card",
  "color-border",
  "color-border-strong",
  "color-card-border",
  "color-card-border-hover",
] as const;

function loadCss(): string {
  return readFileSync("app/globals.css", "utf8");
}

/** 提取选择器内的属性值。selector 例：":root" / "[data-theme=\"ink\"]" / "@theme" */
function extractBlock(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`);
  const match = re.exec(css);
  if (!match) throw new Error(`Missing CSS block: ${selector}`);
  return match[1];
}

function getHexToken(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block);
  if (!match) throw new Error(`Missing token --${name} (hex) in block`);
  return match[1];
}

function hasShadowToken(block: string, name: string): boolean {
  return new RegExp(`--${name}:\\s*[^;]+;`).test(block);
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

/** sand 主题的 tokens 来自 @theme 默认值；其他主题来自 [data-theme="id"] 覆盖块。 */
function blockFor(css: string, id: string): string {
  return id === "sand"
    ? extractBlock(css, "@theme")
    : extractBlock(css, `[data-theme="${id}"]`);
}

describe("design tokens · 6 themes", () => {
  const css = loadCss();

  it.each(THEME_IDS)("%s 主题定义全部必需 color token", (id) => {
    const block = blockFor(css, id);
    for (const name of REQUIRED_TOKENS) {
      expect(getHexToken(block, name)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it.each(THEME_IDS)("%s 主题定义 shadow-soft 与 shadow-soft-hover", (id) => {
    const block = blockFor(css, id);
    expect(hasShadowToken(block, "shadow-soft")).toBe(true);
    expect(hasShadowToken(block, "shadow-soft-hover")).toBe(true);
  });

  it.each(THEME_IDS)("%s 主题 accent 和 faint 对 bg 满足 4.5:1 对比度（小字 AA）", (id) => {
    const block = blockFor(css, id);
    const bg = getHexToken(block, "color-bg");
    expect(contrastRatio(getHexToken(block, "color-accent"), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(getHexToken(block, "color-faint"), bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(THEME_IDS)("%s 主题正文 fg 对 bg 满足 7:1 对比度（正文 AAA）", (id) => {
    const block = blockFor(css, id);
    const bg = getHexToken(block, "color-bg");
    expect(contrastRatio(getHexToken(block, "color-fg"), bg)).toBeGreaterThanOrEqual(7);
  });

  it("声明 color-scheme 分组规则", () => {
    expect(css).toMatch(/html\[data-theme="ink"\][\s\S]*?\bcolor-scheme:\s*dark/);
    expect(css).toMatch(/html\[data-theme="sand"\][\s\S]*?\bcolor-scheme:\s*light/);
  });
});
