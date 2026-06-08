import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingRow } from "@/components/site/writing-row";

export default async function HomePage() {
  const posts = await getAllWriting();
  const featuredProducts = products
    .filter((p) => p.status === "active")
    .slice(0, 3);
  const recentPosts = posts.slice(0, 10);

  return (
    <>
      <section className="section">
        <SectionHead title="关于我" metaHref="/about" metaLabel="了解更多" />
        <div className="about-block about-block--home">
          <p>
            我是 AFreeCoder，一名独立开发者。这里是我的个人名片：记录正在构建的 AI 产品、发表过的文章，以及用代码追求自由的过程。
          </p>
          <p>
            如果你想快速了解我，先看产品和文章；更完整的经历、关注方向和联系方式放在关于页。
          </p>
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
