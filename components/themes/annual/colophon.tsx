import type { AnnualDecoration } from "@/content/decorations/annual";
import type { Stats } from "@/lib/site-stats";
import { fillTemplate } from "@/lib/site-stats";

type Props = { decoration: AnnualDecoration; stats: Stats };

export function Colophon({ decoration, stats }: Props) {
  const c = decoration.colophon;
  return (
    <section className="annual-colophon">
      <div className="annual-colophon-grid">
        <div>
          <b>奥版 · Colophon</b>
          {fillTemplate(c.fontsLine, stats)}
        </div>
        <div>
          <b>联络</b>
          <a href="https://github.com/AFreeCoder">github · AFreeCoder</a><br/>
          <a href="mailto:hello@afreecoder.dev">hello@afreecoder.dev</a>
        </div>
        <div>
          <b>订阅</b>
          <a href="/rss.xml">RSS 全文</a><br/>
          <a href="/sitemap.xml">站点地图</a>
        </div>
        <div>
          <b>声明</b>
          {fillTemplate(c.disclaimerLine, stats)}
        </div>
      </div>
    </section>
  );
}
