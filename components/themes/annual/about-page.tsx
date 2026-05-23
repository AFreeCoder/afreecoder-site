import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
import { Colophon } from "./colophon";
import { Mdx } from "@/lib/mdx";
import { aboutMdx } from "@/content/about";

type Props = { theme: ThemeId; stats: Stats };

export function AboutPage({ theme, stats }: Props) {
  const d = annualDecoration;
  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="about" />
      <Frontispiece
        roman={d.frontispieceAbout.roman}
        title={d.frontispieceAbout.title}
        titleAccent={d.frontispieceAbout.titleAccent}
        caption={fillTemplate(d.frontispieceAbout.caption, stats)}
      />
      <article className="annual-article prose-annual">
        <Mdx source={aboutMdx} />
      </article>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
