import Link from "next/link";
import type { WritingMeta } from "@/lib/types";

export function WritingItem({ post }: { post: WritingMeta }) {
  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group grid grid-cols-[90px_1fr] items-center gap-4 border-b border-[var(--color-border)] py-[16px] sm:grid-cols-[110px_1fr] sm:gap-5"
    >
      <span className="font-mono text-[12px] text-[var(--color-faint)]">
        {post.date}
      </span>
      <span className="text-[15px] text-[#ddd] group-hover:text-white">
        {post.title}
      </span>
    </Link>
  );
}
