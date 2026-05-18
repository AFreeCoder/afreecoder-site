import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("avatar assets", () => {
  it("uses the exact same PNG for the profile avatar and site icon", () => {
    expect(existsSync("public/avatar.png")).toBe(true);
    expect(existsSync("app/icon.png")).toBe(true);
    expect(sha256("public/avatar.png")).toBe(sha256("app/icon.png"));
  });

  it("does not keep the generated SVG avatar or favicon", () => {
    expect(existsSync("public/avatar.svg")).toBe(false);
    expect(existsSync("app/icon.svg")).toBe(false);
  });

  it("renders the homepage avatar from the original PNG", () => {
    const hero = readFileSync("components/site/hero.tsx", "utf8");
    expect(hero).toContain('src="/avatar.png"');
    expect(hero).toContain("object-contain");
    expect(hero).not.toContain('src="/avatar.svg"');
    expect(hero).not.toContain("object-cover");
  });
});

describe("social image assets", () => {
  it("does not expose a dedicated Open Graph image route", () => {
    expect(existsSync("app/opengraph-image.png")).toBe(false);
    expect(existsSync("app/opengraph-image.tsx")).toBe(false);
  });
});
