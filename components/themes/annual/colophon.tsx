import type { AnnualDecoration } from "@/content/decorations/annual";
import type { Stats } from "@/lib/site-stats";
import { fillTemplate } from "@/lib/site-stats";

type Props = { decoration: AnnualDecoration; stats: Stats };

export function Colophon({ decoration, stats }: Props) {
  const c = decoration.colophon;
  return (
    <section className="annual-colophon">
      <div className="annual-shell annual-colophon-grid">
        <div className="contact">
          <a href="https://github.com/AFreeCoder">github</a>
          {" · "}
          <a href="mailto:hello@afreecoder.dev">hello@afreecoder.dev</a>
          {" · "}
          <a href="/rss.xml">rss</a>
          {" · "}
          <a href="/sitemap.xml">sitemap</a>
        </div>
        <div className="disclaimer">{fillTemplate(c.disclaimerLine, stats)}</div>
      </div>
    </section>
  );
}
