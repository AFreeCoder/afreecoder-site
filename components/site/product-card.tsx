import type { Product } from "@/lib/types";

const statusLabels: Record<Product["status"], string> = {
  active: "运行中",
  archived: "已归档",
};

export function ProductCard({ product }: { product: Product }) {
  const inner = (
    <div className="group relative min-h-[210px] overflow-hidden rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 px-[22px] shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-card-border-hover)] hover:shadow-[var(--shadow-soft-hover)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="font-mono text-[11px] leading-[1.45] text-[var(--color-faint)]">
          {product.phase}
        </div>
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-2 py-1 font-mono text-[10px] uppercase leading-none text-[var(--color-accent)]">
          {statusLabels[product.status]}
        </span>
      </div>
      <h3 className="mb-2 text-[19px] font-semibold text-[var(--color-fg)]">
        {product.name}
      </h3>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-muted)]">
        {product.description}
      </p>
      <p className="mb-4 border-l-2 border-[var(--color-accent)] pl-3 text-[13px] leading-relaxed text-[var(--color-fg)]">
        {product.highlight}
      </p>
      <div className="mb-4 font-mono text-[11px] uppercase text-[var(--color-faint)]">
        {product.role}
      </div>
      <ul className="flex flex-wrap gap-[6px]">
        {product.tags.map((t) => (
          <li
            key={t}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-[8px] py-[3px] font-mono text-[11px] text-[var(--color-muted)]"
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  if (product.link) {
    return (
      <a href={product.link} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
