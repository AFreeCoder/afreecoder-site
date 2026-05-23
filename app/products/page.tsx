import { products } from "@/content/products";
import { SectionHead } from "@/components/site/section-head";
import { ProductCard } from "@/components/site/product-card";

export const metadata = {
  title: "产品",
  description: "AFreeCoder 的产品与项目",
};

export default function ProductsPage() {
  const active = products.filter((p) => p.status === "active");
  const archived = products.filter((p) => p.status === "archived");

  return (
    <>
      <section className="section">
        <SectionHead title="我的产品" />
        <div className="products-grid">
          {active.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      {archived.length > 0 && (
        <section className="section" style={{ opacity: 0.65 }}>
          <SectionHead title="已归档" />
          <div className="products-grid">
            {archived.map((p) => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
