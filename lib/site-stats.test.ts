import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/content/products", () => ({
  products: [
    { name: "A", description: "", role: "", phase: "", highlight: "", tags: [], link: "", status: "active" },
    { name: "B", description: "", role: "", phase: "", highlight: "", tags: [], link: "", status: "active" },
    { name: "C", description: "", role: "", phase: "", highlight: "", tags: [], link: "", status: "archived" },
  ],
}));

vi.mock("@/lib/writing", () => ({
  getAllWriting: async () => [
    { title: "x", date: "2022-12-06", slug: "x", summary: "", original_url: "", platforms: [], bodyFormat: "markdown", readingTime: 1 },
    { title: "y", date: "2019-06-05", slug: "y", summary: "", original_url: "", platforms: [], bodyFormat: "markdown", readingTime: 1 },
  ],
}));

import { getSiteStats, fillTemplate, toRoman } from "./site-stats";

describe("site-stats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T00:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes since / sinceYear / yearsActive", async () => {
    const s = await getSiteStats();
    expect(s.since).toBe("2019.06.05");
    expect(s.sinceYear).toBe(2019);
    expect(s.yearsActive).toBe(7);
  });

  it("counts posts and products", async () => {
    const s = await getSiteStats();
    expect(s.postCount).toBe(2);
    expect(s.productLiveCount).toBe(2);
    expect(s.productArchivedCount).toBe(1);
  });

  it("volRoman is toRoman(yearsActive + 1)", async () => {
    const s = await getSiteStats();
    expect(s.volRoman).toBe("VIII");
  });

  it("uptimeDays counts to today", async () => {
    const s = await getSiteStats();
    expect(s.uptimeDays).toBeGreaterThanOrEqual(2540);
    expect(s.uptimeDays).toBeLessThanOrEqual(2550);
  });

  it("fillTemplate replaces {{key}} tokens", async () => {
    const s = await getSiteStats();
    const out = fillTemplate("自 {{since}} 起 {{postCount}} 篇 {{productLiveCount}} 件 {{years}} 年", s);
    expect(out).toBe("自 2019.06.05 起 2 篇 2 件 7 年");
  });

  it("toRoman known values", () => {
    expect(toRoman(1)).toBe("I");
    expect(toRoman(4)).toBe("IV");
    expect(toRoman(7)).toBe("VII");
    expect(toRoman(8)).toBe("VIII");
    expect(toRoman(40)).toBe("XL");
  });
});
