import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { Product, WritingMeta } from "@/lib/types";
import { annualDecoration } from "@/content/decorations/annual";
import { fillTemplate } from "@/lib/site-stats";
import { Masthead } from "./masthead";
import { PageHead } from "./page-head";
import { ChapterHead } from "./chapter-head";
import { AboutSection } from "./about-section";
import { ProductEntry } from "./product-entry";
import { TocRow } from "./toc-row";
import { Colophon } from "./colophon";

type Props = {
  theme: ThemeId;
  posts: WritingMeta[];
  products: Product[];
  stats: Stats;
};

export function HomePage({ theme, posts, products, stats }: Props) {
  const d = annualDecoration;
  const liveProducts = products.filter((p) => p.status === "active").slice(0, 4);
  const recentPosts = posts.slice(0, 6);

  return (
    <>
      <Masthead theme={theme} decoration={d} active="home" />
      <PageHead
        num={d.pageHeads.home.num}
        title={d.pageHeads.home.title}
        titleAccent={d.pageHeads.home.titleAccent}
        caption={fillTemplate(d.pageHeads.home.caption, stats)}
      />
      <main className="annual-shell annual-section">
        <section id="about">
          <ChapterHead
            num={d.chapters.about.num}
            title={fillTemplate(d.chapters.about.title, stats)}
            titleAccent={d.chapters.about.titleAccent}
            metaHref={d.chapters.about.metaHref}
            metaLabel={d.chapters.about.metaLabel}
          />
          <AboutSection signature={d.signature} />
        </section>
        <section id="products">
          <ChapterHead
            num={d.chapters.products.num}
            title={fillTemplate(d.chapters.products.title, stats)}
            titleAccent={d.chapters.products.titleAccent}
            metaHref="/products"
            metaLabel={`${stats.productLiveCount} 件 · 全部 →`}
          />
          <div className="annual-ledger">
            {liveProducts.map((p) => <ProductEntry key={p.name} product={p} />)}
          </div>
        </section>
        <section id="writing">
          <ChapterHead
            num={d.chapters.writing.num}
            title={fillTemplate(d.chapters.writing.title, stats)}
            titleAccent={fillTemplate(d.chapters.writing.titleAccent ?? "", stats)}
            metaHref="/writing"
            metaLabel={`${stats.postCount} 篇 · 全部 →`}
          />
          <div className="annual-toc">
            {recentPosts.map((p) => <TocRow key={p.slug} post={p} />)}
          </div>
        </section>
      </main>
      <Colophon decoration={d} stats={stats} />
    </>
  );
}
