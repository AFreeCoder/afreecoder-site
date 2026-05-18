import { existsSync, readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { getAllWriting, getWritingBySlug } from "./writing";

describe("getAllWriting", () => {
  it("loads the published knowledge-base articles", async () => {
    const posts = await getAllWriting();
    expect(posts.length).toBeGreaterThanOrEqual(60);
    expect(posts.length).toBeLessThanOrEqual(80);
    expect(posts.map((post) => post.title)).toContain("财务自由实证#26——高层火灾如何逃生？");
  });

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
      expect(p.original_url).toMatch(/^https:\/\/afreecoder\.cn\//);
      expect((p as { bodyFormat?: string }).bodyFormat).toBe("markdown");
      expect(typeof p.readingTime).toBe("number");
    }
  });

  it("keeps restored Markdown source files under content/writing", async () => {
    const posts = await getAllWriting();
    expect(existsSync("content/writing/invest-practice-26.md")).toBe(true);
    expect(posts.length).toBeGreaterThanOrEqual(60);
  });

  it("keeps article bodies out of the generated content module", () => {
    const index = readFileSync("content/writing-posts.ts", "utf8");

    expect(index).not.toContain('"body":');
    expect(index).not.toContain('"source_file":');
    expect(index).not.toContain("/Users/afreecoder");
    expect(index).not.toContain('"bodyPath":');
    expect(index).toContain('"bodyFile": "invest-practice-26.md"');
    expect(existsSync("content/writing/invest-practice-26.md")).toBe(true);
    expect(existsSync("public/content/writing/invest-practice-26.md")).toBe(false);

    const loader = readFileSync("lib/writing.ts", "utf8");
    expect(loader).toContain('join(process.cwd(), "content", "writing", post.bodyFile)');
  });
});

describe("getWritingBySlug", () => {
  it("returns the post + restored Markdown body for a known GitHub Pages article", async () => {
    const post = await getWritingBySlug("invest-practice-26");

    expect(post).not.toBeNull();
    expect(post!.meta.title).toBe("财务自由实证#26——高层火灾如何逃生？");
    expect(post!.meta.date).toBe("2022-12-06");
    expect(post!.body).toContain("## 1、实证进展");
    expect(post!.body).toContain("- 长赢等跟投组合：1700");
    expect(post!.body).toContain("![IMG_4834](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2022/12/06/img4834.PNG)");
    expect(post!.body).not.toContain("<p>");
    expect(post!.body).not.toContain("公众号二维码");
    expect(post!.body).not.toContain("都看到这里了");
    expect(post!.body).not.toContain("gongzhonghaopic");
  });

  it("returns null for unknown slug", async () => {
    const post = await getWritingBySlug("does-not-exist");
    expect(post).toBeNull();
  });
});

describe("restored Markdown files", () => {
  it("includes frontmatter and Markdown syntax in the local article file", () => {
    const source = readFileSync(
      "content/writing/invest-practice-26.md",
      "utf8",
    );
    expect(source).toContain("---\n");
    expect(source).toContain("title: 财务自由实证#26——高层火灾如何逃生？");
    expect(source).toContain("## 1、实证进展");
    expect(source).toContain("- 长赢等跟投组合：1700");
    expect(source).toContain("![IMG_4834](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2022/12/06/img4834.PNG)");
    expect(source).not.toContain("公众号二维码");
    expect(source).not.toContain("都看到这里了");
    expect(source).not.toContain("gongzhonghaopic");
  });

  it("does not include WeChat subscription calls-to-action in generated articles", async () => {
    const posts = await getAllWriting();

    for (const post of posts) {
      const source = readFileSync(
        `content/writing/${post.slug}.md`,
        "utf8",
      );
      expect(source).not.toContain("公众号二维码");
      expect(source).not.toContain("gongzhonghaopic");
      expect(source).not.toContain("赞/在看");
      expect(source).not.toContain("加个关注");
    }
  });
});
