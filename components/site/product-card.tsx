import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "./product-placeholder";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const tags = product.tags.slice(0, 3);
  const inner = (
    <>
      <div className="product-card-frame">
        <ProductPlaceholder name={product.name} />
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-sub">{product.description}</div>
        {tags.length > 0 && (
          <div className="product-card-tags">
            {tags.map((t) => (
              <span key={t} className="product-card-tag">{t}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (product.link) {
    return (
      <a
        href={product.link}
        target="_blank"
        rel="noreferrer"
        className="product-card"
        aria-label={`${product.name} — ${product.description}`}
      >
        {inner}
      </a>
    );
  }
  return <div className="product-card">{inner}</div>;
}
