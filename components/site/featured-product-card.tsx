import Image from "next/image";
import type { Product } from "@/lib/types";

type Props = { product: Product };

export function FeaturedProductCard({ product }: Props) {
  const tags = product.tags.slice(0, 3);
  const inner = (
    <>
      <div className="feat-product-frame">
        <div className="feat-product-shot">
          {product.screenshot && (
            <Image
              src={product.screenshot}
              alt={`${product.name} 产品截图`}
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              loading="eager"
              className="feat-product-image"
            />
          )}
        </div>
      </div>
      <div className="feat-product-body">
        <span className="feat-product-name">
          {product.name}
          <span className="feat-product-badge">主打</span>
        </span>
        <p className="feat-product-desc">{product.highlight}</p>
        {tags.length > 0 && (
          <div className="product-card-tags">
            {tags.map((t) => (
              <span key={t} className="product-card-tag">{t}</span>
            ))}
          </div>
        )}
        {product.link && (
          <span className="feat-product-link">{new URL(product.link).hostname} ↗</span>
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
        className="feat-product"
        aria-label={`${product.name} — ${product.description}`}
      >
        {inner}
      </a>
    );
  }
  return <div className="feat-product">{inner}</div>;
}
