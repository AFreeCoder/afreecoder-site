import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const inner = (
    <div className="group rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 px-[22px] shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all hover:border-[var(--color-card-border-hover)] hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
      <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.2px] text-[var(--color-fg)]">
        {product.name}
      </h3>
      <p className="mb-[14px] text-[14px] leading-relaxed text-[var(--color-muted)]">
        {product.description}
      </p>
      <ul className="flex flex-wrap gap-[6px]">
        {product.tags.map((t) => (
          <li
            key={t}
            className="rounded bg-[var(--color-bg)] px-[8px] py-[3px] font-mono text-[11px] text-[var(--color-muted)]"
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
