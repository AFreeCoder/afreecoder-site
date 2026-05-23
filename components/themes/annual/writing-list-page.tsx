import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate, toRoman } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
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
      <Masthead theme={theme} decoration={d} stats={stats} active="writing" />
      <Frontispiece
        roman={d.frontispieceWriting.roman}
        title={fillTemplate(d.frontispieceWriting.title, stats)}
        caption={fillTemplate(d.frontispieceWriting.caption, stats)}
      />
      <div className="annual-layout">
        <div />
        <div className="annual-content">
          {years.map((year) => {
            const yearPosts = grouped.get(year)!;
            return (
              <section key={year}>
                <ChapterHead
                  num={`Vol. ${toRoman(year - stats.sinceYear + 1)} · ${year}`}
                  title={`${year} · ${yearPosts.length} 篇`}
                />
                <div className="annual-toc">
                  {yearPosts.map((p, i) => <TocRow key={p.slug} post={p} index={i} />)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
