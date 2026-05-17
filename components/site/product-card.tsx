import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const inner = (
    <div className="group rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 px-[22px] transition-colors hover:border-[var(--color-card-border-hover)]">
      <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.2px] text-white">
        {product.name}
      </h3>
      <p className="mb-[14px] text-[14px] leading-relaxed text-[var(--color-muted)]">
        {product.description}
      </p>
      <ul className="flex flex-wrap gap-[6px]">
        {product.tags.map((t) => (
          <li
            key={t}
            className="rounded bg-[var(--color-border)] px-[8px] py-[3px] font-mono text-[11px] text-[#aaa]"
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
