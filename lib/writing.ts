import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { WritingFrontmatter, WritingMeta } from "./types";

const WRITING_DIR = path.join(process.cwd(), "content", "writing");

async function listMdxFiles(): Promise<string[]> {
  const entries = await fs.readdir(WRITING_DIR);
  return entries.filter((f) => f.endsWith(".mdx"));
}

async function readWriting(file: string): Promise<{ meta: WritingMeta; body: string }> {
  const filePath = path.join(WRITING_DIR, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as WritingFrontmatter & { date: unknown };
  // gray-matter parses unquoted YAML dates as Date objects; normalize to YYYY-MM-DD string
  if (fm.date instanceof Date) {
    fm.date = fm.date.toISOString().slice(0, 10);
  }
  const rt = readingTime(content);
  const meta: WritingMeta = {
    ...(fm as WritingFrontmatter),
    readingTime: Math.max(1, Math.round(rt.minutes)),
  };
  return { meta, body: content };
}

export async function getAllWriting(): Promise<WritingMeta[]> {
  const files = await listMdxFiles();
  const items = await Promise.all(files.map(async (f) => (await readWriting(f)).meta));
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getWritingBySlug(
  slug: string,
): Promise<{ meta: WritingMeta; body: string } | null> {
  const files = await listMdxFiles();
  for (const f of files) {
    const item = await readWriting(f);
    if (item.meta.slug === slug) return item;
  }
  return null;
}
