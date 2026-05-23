import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";
import { getAboutLead } from "@/lib/about-summary";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingRow } from "@/components/site/writing-row";

export default async function HomePage() {
  const posts = await getAllWriting();
  const lead = getAboutLead(3);
  const featuredProducts = products
    .filter((p) => p.status === "active")
    .slice(0, 3);
  const recentPosts = posts.slice(0, 10);

  return (
    <>
      <section className="section">
        <SectionHead title="关于我" metaHref="/about" metaLabel="了解更多" />
        <div className="about-block">
          {lead.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      <section className="section">
        <SectionHead title="我的产品" metaHref="/products" metaLabel="查看全部" />
        <div className="products-grid">
          {featuredProducts.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="近期文章" metaHref="/writing" metaLabel="阅读更多" />
        <div className="writing-list">
          {recentPosts.map((p, i) => (
            <WritingRow key={p.slug} post={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
