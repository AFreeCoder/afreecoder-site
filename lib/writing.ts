import { writingPosts, type WritingSource } from "@/content/writing-posts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { WritingMeta } from "./types";

function toWritingMeta(post: WritingSource): WritingMeta {
  return {
    title: post.title,
    date: post.date,
    slug: post.slug,
    summary: post.summary,
    original_url: post.original_url,
    platforms: post.platforms,
    bodyFormat: post.bodyFormat,
    source_file: post.source_file,
    readingTime: post.readingTime,
  };
}

function stripFrontmatter(source: string): string {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function readWritingBody(post: WritingSource): string {
  const filePath = join(process.cwd(), "content", "writing", post.bodyFile);
  return stripFrontmatter(readFileSync(filePath, "utf8"));
}

export async function getAllWriting(): Promise<WritingMeta[]> {
  const items = writingPosts.map(toWritingMeta);
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getWritingBySlug(
  slug: string,
): Promise<{ meta: WritingMeta; body: string } | null> {
  const post = writingPosts.find((item) => item.slug === slug);
  return post ? { meta: toWritingMeta(post), body: readWritingBody(post) } : null;
}
