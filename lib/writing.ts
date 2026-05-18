import readingTime from "reading-time";
import { writingPosts, type WritingSource } from "@/content/writing-posts";
import type { WritingMeta } from "./types";

function toWritingEntry(post: WritingSource): { meta: WritingMeta; body: string } {
  const { body, ...frontmatter } = post;
  const rt = readingTime(body);
  return {
    meta: {
      ...frontmatter,
      readingTime: Math.max(1, Math.round(rt.minutes)),
    },
    body,
  };
}

export async function getAllWriting(): Promise<WritingMeta[]> {
  const items = writingPosts.map((post) => toWritingEntry(post).meta);
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getWritingBySlug(
  slug: string,
): Promise<{ meta: WritingMeta; body: string } | null> {
  const post = writingPosts.find((item) => item.slug === slug);
  return post ? toWritingEntry(post) : null;
}
