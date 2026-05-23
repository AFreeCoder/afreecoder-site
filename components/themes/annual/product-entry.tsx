import type { Product } from "@/lib/types";

type Props = { product: Product };

function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function ProductEntry({ product }: Props) {
  const host = hostOf(product.link);
  const inner = (
    <div className="annual-entry">
      <div className="annual-entry-body">
        <h3 className="annual-entry-title">{product.name}</h3>
        <p className="annual-entry-desc">{product.description}</p>
        <p className="annual-entry-pull">{product.highlight}</p>
      </div>
      <div className="annual-entry-meta">
        <ul className="annual-entry-tags">
          {product.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
      {host && (
        <div className="annual-entry-foot">→ {host}</div>
      )}
    </div>
  );

  if (product.link) {
    return <a href={product.link} target="_blank" rel="noreferrer" className="annual-entry-link">{inner}</a>;
  }
  return inner;
}
