import { describe, expect, it } from "vitest";
import { getAboutLead } from "./about-summary";

describe("getAboutLead", () => {
  it("returns at least 1 paragraph for the current content/about.ts", () => {
    const lead = getAboutLead(3);
    expect(lead.length).toBeGreaterThanOrEqual(1);
    expect(lead.length).toBeLessThanOrEqual(3);
    for (const p of lead) {
      expect(p.length).toBeGreaterThan(0);
      expect(p).not.toMatch(/^#/);
      expect(p).not.toMatch(/^- /);
    }
  });

  it("caps at maxParagraphs", () => {
    const lead = getAboutLead(2);
    expect(lead.length).toBeLessThanOrEqual(2);
  });
});
