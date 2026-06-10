import { describe, expect, it } from "vitest";
import { aboutLead, aboutMilestones, aboutFocus } from "./about";

describe("about content", () => {
  it("keeps the AFreeCoder self-introduction in the lead", () => {
    const joined = aboutLead.join("\n");
    expect(joined).toContain("A-Free-Coder");
    expect(joined).toContain("追求自由的 Coder");
    expect(joined).toContain("这里是我追求自由的痕迹");
  });

  it("describes the journey with three milestones ending at now", () => {
    expect(aboutMilestones).toHaveLength(3);
    expect(aboutMilestones[0].title).toContain("程序员");
    expect(aboutMilestones[1].title).toContain("投资理财");
    expect(aboutMilestones[2].now).toBe(true);
  });

  it("lists current focus areas", () => {
    expect(aboutFocus.length).toBeGreaterThanOrEqual(3);
    expect(aboutFocus.join("")).toContain("AI");
  });
});
