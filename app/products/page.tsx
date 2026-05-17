import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ProductCard } from "@/components/site/product-card";
import { products } from "@/content/products";

export const metadata = {
  title: "Products",
  description: "AFreeCoder 的产品与项目",
};

export default function ProductsPage() {
  const active = products.filter((p) => p.status === "active");
  const archived = products.filter((p) => p.status === "archived");

  return (
    <main className="mx-auto max-w-[960px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <header className="py-10">
        <h1 className="text-[36px] font-bold tracking-[-0.5px] text-white">
          Products
        </h1>
        <p className="mt-2 text-[15px] text-[var(--color-muted)]">
          {active.length} active · {archived.length} archived
        </p>
      </header>

      <section className="mb-12">
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
          {active.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      {archived.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-[18px] font-mono text-[13px] uppercase tracking-[2px] text-[var(--color-faint)]">
            Archived
          </h2>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 opacity-70">
            {archived.map((p) => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
