import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";
import { WritingItem } from "@/components/site/writing-item";
import { PageShell } from "@/components/site/page-shell";
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export default async function HomePage() {
  const posts = (await getAllWriting()).slice(0, 4);
  const homeProducts = products.filter((p) => p.status === "active").slice(0, 4);

  return (
    <PageShell>
      <Nav />
      <Hero
        aboutSummary={
          <>
            <p>我是 AFreeCoder，A-Free-Coder，寓意是一个追求自由的 Coder。</p>
            <p>曾经是一名程序员，呆过互联网大厂，也呆过国企；研究过投资理财，现在关注 AI。目前是一名自由职业者（俗称灵活就业）。</p>
            <p>这里是我追求自由的痕迹。</p>
          </>
        }
      />

      <SectionHead
        title="产品"
        meta={`${homeProducts.length} 个项目 · 查看全部 →`}
        href="/products"
      />
      <div className="mb-12 grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {homeProducts.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>

      <SectionHead title="文章" meta="全部文章 →" href="/writing" />
      <div className="mb-4">
        {posts.map((p) => (
          <WritingItem key={p.slug} post={p} />
        ))}
      </div>

      <Footer />
    </PageShell>
  );
}
