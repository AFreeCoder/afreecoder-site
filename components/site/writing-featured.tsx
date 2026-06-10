import Link from "next/link";
import type { WritingMeta } from "@/lib/types";
import { formatDate } from "@/lib/format-date";

type Props = { post: WritingMeta };

const EXCERPT_LIMIT = 80;

function excerptOf(summary: string | undefined): string | null {
  if (!summary) return null;
  const text = summary.trim();
  return text.length > EXCERPT_LIMIT ? `${text.slice(0, EXCERPT_LIMIT)}…` : text;
}

export function WritingFeatured({ post }: Props) {
  const excerpt = excerptOf(post.summary);
  return (
    <Link href={`/writing/${post.slug}`} className="feat-post">
      <span className="feat-post-eyebrow">最新文章</span>
      <h3 className="feat-post-title">{post.title}</h3>
      {excerpt && <p className="feat-post-excerpt">{excerpt}</p>}
      <span className="feat-post-meta">
        <span className="feat-post-tag">约 {post.readingTime} 分钟</span>
        <span className="feat-post-date">{formatDate(post.date)}</span>
      </span>
    </Link>
  );
}
