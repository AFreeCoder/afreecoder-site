import { describe, it, expect } from "vitest";
import { getAllWriting, getWritingBySlug } from "./writing";

describe("getAllWriting", () => {
  it("returns posts sorted by date desc", async () => {
    const posts = await getAllWriting();
    expect(posts.length).toBeGreaterThan(0);
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date >= posts[i].date).toBe(true);
    }
  });

  it("each post has required frontmatter fields", async () => {
    const posts = await getAllWriting();
    for (const p of posts) {
      expect(p.title).toBeTruthy();
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.slug).toBeTruthy();
      expect(typeof p.readingTime).toBe("number");
    }
  });
});

describe("getWritingBySlug", () => {
  it("returns the post + raw mdx body for a known slug", async () => {
    const post = await getWritingBySlug("hello-world");
    expect(post).not.toBeNull();
    expect(post!.meta.title).toBe("Hello, World");
    expect(post!.body).toContain("个人站点的第一篇文章");
  });

  it("returns null for unknown slug", async () => {
    const post = await getWritingBySlug("does-not-exist");
    expect(post).toBeNull();
  });
});
