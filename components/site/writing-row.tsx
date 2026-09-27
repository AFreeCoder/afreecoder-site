import Link from "next/link";
import type { WritingMeta } from "@/lib/types";
import { formatDate } from "@/lib/format-date";

type Props = {
  post: WritingMeta;
  /** 年度序号（文章页）；不传时只显示标题和日期（首页列表） */
  index?: number;
};

export function WritingRow({ post, index }: Props) {
  const numbered = index !== undefined;
  return (
    <Link
      href={`/writing/${post.slug}`}
      className={numbered ? "writing-row" : "writing-row writing-row--plain"}
    >
      {numbered && (
        <span className="writing-row-num">{String(index + 1).padStart(2, "0")}</span>
      )}
      <span className="writing-row-title">{post.title}</span>
      <span className="writing-row-date">{formatDate(post.date)}</span>
    </Link>
  );
}
