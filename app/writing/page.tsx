import { getAllWriting } from "@/lib/writing";
import { SectionHead } from "@/components/site/section-head";
import { WritingRow } from "@/components/site/writing-row";
import type { WritingMeta } from "@/lib/types";

export const metadata = {
  title: "文章",
  description: "AFreeCoder 写作存档",
};

function groupByYear(posts: WritingMeta[]): Array<[number, WritingMeta[]]> {
  const map = new Map<number, WritingMeta[]>();
  for (const p of posts) {
    const y = Number(p.date.slice(0, 4));
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(p);
  }
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

export default async function WritingPage() {
  const posts = await getAllWriting();
  const grouped = groupByYear(posts);

  return (
    <section className="section">
      <SectionHead title="写作" />
      {grouped.map(([year, yearPosts]) => (
        <div key={year}>
          <div className="writing-year-head">{year} · {yearPosts.length} 篇</div>
          <div className="writing-list">
            {yearPosts.map((p, i) => (
              <WritingRow key={p.slug} post={p} index={i} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
