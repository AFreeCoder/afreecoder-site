import Link from "next/link";
import type { WritingMeta } from "@/lib/types";

export function WritingItem({ post }: { post: WritingMeta }) {
  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group grid grid-cols-[80px_1fr] items-center gap-4 border-b border-[#161616] py-[14px] sm:grid-cols-[100px_1fr] sm:gap-5"
    >
      <span className="font-mono text-[11px] text-[var(--color-faint)]">
        {post.date}
      </span>
      <span className="text-[14px] text-[#ddd] group-hover:text-white">
        {post.title}
      </span>
    </Link>
  );
}
