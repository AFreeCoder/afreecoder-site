import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingRow } from "@/components/site/writing-row";
import { HomeHero } from "@/components/site/home-hero";
import { FeaturedProductCard } from "@/components/site/featured-product-card";
import { WritingFeatured } from "@/components/site/writing-featured";

export default async function HomePage() {
  const posts = await getAllWriting();
  const active = products.filter((p) => p.status === "active");
  const [featuredProduct, ...restProducts] = active;
  const [latestPost, ...restPosts] = posts;
  const listPosts = restPosts.slice(0, 9);

  return (
    <>
      <HomeHero latestPost={latestPost} />

      <section className="section">
        <SectionHead title="产品" num="01" metaHref="/products" metaLabel="查看全部" />
        {featuredProduct && <FeaturedProductCard product={featuredProduct} />}
        <div className="products-grid products-grid--secondary">
          {restProducts.slice(0, 3).map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead
          title="写作"
          num="02"
          tone="accent-2"
          metaHref="/writing"
          metaLabel="阅读更多"
        />
        {latestPost && <WritingFeatured post={latestPost} />}
        <div className="writing-list">
          {listPosts.map((p, i) => (
            <WritingRow key={p.slug} post={p} index={i + 1} />
          ))}
        </div>
      </section>
    </>
  );
}
