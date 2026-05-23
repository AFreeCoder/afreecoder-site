import { describe, it, expect } from "vitest";
import { pickThemedPage, type PageKey } from "./dispatch";
import { Annual } from "./annual";

describe("dispatch", () => {
  const keys: PageKey[] = ["home", "about", "products", "writingList", "writingPost"];

  it("annual returns Annual.* components", () => {
    for (const k of keys) {
      expect(pickThemedPage("annual", k)).toBe(Annual[k]);
    }
  });

  it("unavailable themes fall back to Annual.*", () => {
    for (const k of keys) {
      expect(pickThemedPage("workshop", k)).toBe(Annual[k]);
      expect(pickThemedPage("nocturne", k)).toBe(Annual[k]);
      expect(pickThemedPage("telegraph", k)).toBe(Annual[k]);
    }
  });
});
