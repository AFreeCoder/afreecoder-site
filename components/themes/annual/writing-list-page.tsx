import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { PageHead } from "./page-head";
import { Colophon } from "./colophon";
import { ChapterHead } from "./chapter-head";
import { TocRow } from "./toc-row";

type Props = { theme: ThemeId; posts: WritingMeta[]; stats: Stats };

function groupByYear(posts: WritingMeta[]): Map<number, WritingMeta[]> {
  const m = new Map<number, WritingMeta[]>();
  for (const p of posts) {
    const y = Number(p.date.slice(0, 4));
    if (!m.has(y)) m.set(y, []);
    m.get(y)!.push(p);
  }
  return m;
}

export function WritingListPage({ theme, posts, stats }: Props) {
  const d = annualDecoration;
  const grouped = groupByYear(posts);
  const years = Array.from(grouped.keys()).sort((a, b) => b - a);

  return (
    <>
      <Masthead theme={theme} decoration={d} active="writing" />
      <PageHead
        num={d.pageHeads.writing.num}
        title={fillTemplate(d.pageHeads.writing.title, stats)}
        titleAccent={fillTemplate(d.pageHeads.writing.titleAccent ?? "", stats)}
        caption={d.pageHeads.writing.caption}
      />
      <main className="annual-shell annual-section">
        {years.map((year) => {
          const yearPosts = grouped.get(year)!;
          return (
            <section key={year}>
              <ChapterHead num={String(year)} title={`${yearPosts.length} 篇`} />
              <div className="annual-toc">
                {yearPosts.map((p) => <TocRow key={p.slug} post={p} />)}
              </div>
            </section>
          );
        })}
      </main>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
