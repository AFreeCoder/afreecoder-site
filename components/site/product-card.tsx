import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const inner = (
    <div className="group rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 px-[22px] transition-colors hover:border-[var(--color-card-border-hover)]">
      <h3 className="mb-2 text-[16px] font-semibold tracking-[-0.2px] text-white">
        {product.name}
      </h3>
      <p className="mb-[14px] text-[13px] leading-relaxed text-[var(--color-muted)]">
        {product.description}
      </p>
      <ul className="flex flex-wrap gap-[6px]">
        {product.tags.map((t) => (
          <li
            key={t}
            className="rounded font-mono text-[10px] text-[#999]"
            style={{
              background: "#1a1a1a",
              padding: "3px 8px",
            }}
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
