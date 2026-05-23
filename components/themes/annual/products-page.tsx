import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { Product } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { PageHead } from "./page-head";
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
      <Masthead theme={theme} decoration={d} active="products" />
      <PageHead
        num={d.pageHeads.products.num}
        title={fillTemplate(d.pageHeads.products.title, stats)}
        caption={d.pageHeads.products.caption}
      />
      <main className="annual-shell annual-section">
        <section>
          <ChapterHead num="在线运行" title="RUNNING" />
          <div className="annual-ledger">
            {active.map((p) => <ProductEntry key={p.name} product={p} />)}
          </div>
        </section>
        {archived.length > 0 && (
          <section>
            <ChapterHead num="已归档" title="ARCHIVED" />
            <div className="annual-ledger" style={{ opacity: 0.7 }}>
              {archived.map((p) => <ProductEntry key={p.name} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
