import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { Product } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { Frontispiece } from "./frontispiece";
import { Colophon } from "./colophon";
import { ChapterHead } from "./chapter-head";
import { ProductEntry } from "./product-entry";

type Props = { theme: ThemeId; products: Product[]; stats: Stats };

export function ProductsPage({ theme, products, stats }: Props) {
  const d = annualDecoration;
  const active = products.filter((p) => p.status === "active");
  const archived = products.filter((p) => p.status === "archived");

  return (
    <>
      <Masthead theme={theme} decoration={d} stats={stats} active="products" />
      <Frontispiece
        roman={d.frontispieceProducts.roman}
        title={fillTemplate(d.frontispieceProducts.title, stats)}
        caption={fillTemplate(d.frontispieceProducts.caption, stats)}
      />
      <div className="annual-layout">
        <div />
        <div className="annual-content">
          <section>
            <ChapterHead num="— 在线运行" title="RUNNING" />
            <div className="annual-ledger">
              {active.map((p, i) => <ProductEntry key={p.name} product={p} index={i} />)}
            </div>
          </section>
          {archived.length > 0 && (
            <section className="annual-archived">
              <ChapterHead num="— 已归档" title="ARCHIVED" />
              <div className="annual-ledger">
                {archived.map((p, i) => <ProductEntry key={p.name} product={p} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </div>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
