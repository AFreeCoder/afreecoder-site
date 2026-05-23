import Link from "next/link";
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { Masthead } from "./masthead";
import { Colophon } from "./colophon";
import { ChapterHead } from "./chapter-head";
import { Mdx } from "@/lib/mdx";

type Props = {
  theme: ThemeId;
  stats: Stats;
  meta: WritingMeta;
  body: string;
};

export function WritingPostPage({ theme, stats, meta, body }: Props) {
  const d = annualDecoration;
  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="writing" />
      <article className="annual-article prose-annual">
        <header className="annual-article-head">
          <ChapterHead
            num={meta.date.replaceAll("-", "·")}
            title={meta.title}
            metaLabel={`${meta.readingTime} min`}
          />
        </header>
        <Mdx source={body} />
        <footer className="annual-article-foot">
          <Link href="/writing" className="annual-chapter-meta">← 返回实证目录</Link>
        </footer>
      </article>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
