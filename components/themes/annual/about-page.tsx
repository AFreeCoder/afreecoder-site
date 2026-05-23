import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { PageHead } from "./page-head";
import { Colophon } from "./colophon";
import { Mdx } from "@/lib/mdx";
import { aboutMdx } from "@/content/about";

type Props = { theme: ThemeId; stats: Stats };

export function AboutPage({ theme, stats }: Props) {
  const d = annualDecoration;
  return (
    <>
      <Masthead theme={theme} decoration={d} active="about" />
      <PageHead
        num={d.pageHeads.about.num}
        title={d.pageHeads.about.title}
        titleAccent={d.pageHeads.about.titleAccent}
        caption={fillTemplate(d.pageHeads.about.caption, stats)}
      />
      <article className="annual-article prose-annual">
        <Mdx source={aboutMdx} />
      </article>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
