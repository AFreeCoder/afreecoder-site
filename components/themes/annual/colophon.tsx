import type { AnnualDecoration } from "@/content/decorations/annual";
import type { Stats } from "@/lib/site-stats";
import { fillTemplate } from "@/lib/site-stats";

type Props = { decoration: AnnualDecoration; stats: Stats };

export function Colophon({ decoration, stats }: Props) {
  const c = decoration.colophon;
  return (
    <footer className="annual-colophon">
      <div className="annual-shell annual-colophon-inner">
        {c.brand && <div className="annual-colophon-brand">{c.brand}</div>}
        {c.slogan && <div className="annual-colophon-slogan">{c.slogan}</div>}
        {c.copyright && (
          <div className="annual-colophon-copy">{fillTemplate(c.copyright, stats)}</div>
        )}
      </div>
    </footer>
  );
}
