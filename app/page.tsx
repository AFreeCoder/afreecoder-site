import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";
import { SectionHead } from "@/components/site/section-head";
import { ProductRow } from "@/components/site/product-row";
import { WritingRow } from "@/components/site/writing-row";
import { HomeHero } from "@/components/site/home-hero";
import { WritingFeatured } from "@/components/site/writing-featured";

// 最新一篇之外再列几篇，让文章栏与四个产品行的高度大致齐平
const HOME_POST_ROWS = 6;

export default async function HomePage() {
  const posts = await getAllWriting();
  const active = products.filter((p) => p.status === "active");
  const [latestPost, ...restPosts] = posts;

  return (
    <>
      <HomeHero />

      <div className="home-lanes">
        <section className="home-lane home-lane--products">
          <SectionHead title="产品" metaHref="/products" metaLabel="全部产品" />
          <div className="product-rows">
            {active.map((p, i) => (
              <ProductRow key={p.name} product={p} featured={i === 0} />
            ))}
          </div>
        </section>

        <section className="home-lane home-lane--writing">
          <SectionHead
            title="文章"
            metaHref="/writing"
            metaLabel={`全部 ${posts.length} 篇`}
          />
          {latestPost && <WritingFeatured post={latestPost} />}
          <div className="writing-list">
            {restPosts.slice(0, HOME_POST_ROWS).map((p) => (
              <WritingRow key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
