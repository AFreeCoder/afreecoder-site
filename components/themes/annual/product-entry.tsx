import type { Product } from "@/lib/types";

const ROMAN_LOWER = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

const STATUS_LABEL: Record<Product["status"], string> = {
  active:   "RUNNING",
  archived: "ARCHIVED",
};

type Props = { product: Product; index: number };

function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function ProductEntry({ product, index }: Props) {
  const host = hostOf(product.link);
  const inner = (
    <div className="annual-entry">
      <div className="annual-entry-idx">{ROMAN_LOWER[index] ?? String(index + 1)}</div>
      <div className="annual-entry-body">
        <h4 className="annual-entry-title"><span className="annual-entry-glyph">¶</span>{product.name}</h4>
        <p className="annual-entry-desc">{product.description}</p>
        <p className="annual-entry-pull">{product.highlight}</p>
      </div>
      <div className="annual-entry-meta">
        <span className="annual-entry-role">{product.role}</span>
        <span className="annual-entry-phase">{product.phase} · {STATUS_LABEL[product.status]}</span>
        <ul className="annual-entry-tags">
          {product.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
        {host && <span className="annual-entry-url">{host}</span>}
      </div>
    </div>
  );

  if (product.link) {
    return <a href={product.link} target="_blank" rel="noreferrer" className="annual-entry-link">{inner}</a>;
  }
  return inner;
}
