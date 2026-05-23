import Link from "next/link";
import type { WritingMeta } from "@/lib/types";
import { formatDate } from "@/lib/format-date";

type Props = {
  post: WritingMeta;
  index: number;
};

export function WritingRow({ post, index }: Props) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <Link href={`/writing/${post.slug}`} className="writing-row">
      <span className="writing-row-num">{num}</span>
      <span className="writing-row-title">{post.title}</span>
      <span className="writing-row-date">{formatDate(post.date)}</span>
    </Link>
  );
}
