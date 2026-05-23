import Link from "next/link";
import type { WritingMeta } from "@/lib/types";

type Props = { post: WritingMeta; index: number };

export function TocRow({ post, index }: Props) {
  return (
    <Link href={`/writing/${post.slug}`} className="annual-toc-row">
      <span className="annual-toc-date">{post.date.replaceAll("-", "·")}</span>
      <span className="annual-toc-no">№ {String(index + 1).padStart(2, "0")}</span>
      <span className="annual-toc-title">{post.title}</span>
      <span className="annual-toc-rt">{post.readingTime} min</span>
    </Link>
  );
}
