import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingItem } from "@/components/site/writing-item";
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export default async function HomePage() {
  const posts = (await getAllWriting()).slice(0, 4);
  const homeProducts = products.filter((p) => p.status === "active").slice(0, 4);

  return (
    <main className="mx-auto max-w-[960px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <Hero
        aboutSummary={
          <>
            <p>独立开发者，目前主要关注 AI 工具开发、自动化系统和长期投资理财方向。</p>
            <p>过去几年陆续做过一些产品和小工具，现在更专注于探索如何用 AI 系统性地放大个人的杠杆。</p>
            <p>这里是我的产品、文章和长期记录的地方。</p>
          </>
        }
      />

      <SectionHead
        title="Products"
        meta={`${homeProducts.length} active · view all →`}
        href="/products"
      />
      <div className="mb-12 grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {homeProducts.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>

      <SectionHead title="Writing" meta="all posts →" href="/writing" />
      <div className="mb-4">
        {posts.map((p) => (
          <WritingItem key={p.slug} post={p} />
        ))}
      </div>

      <Footer />
    </main>
  );
}
