import Link from "next/link";

type Props = {
  title: string;
  meta?: string;
  href?: string;
};

export function SectionHead({ title, meta, href }: Props) {
  return (
    <div className="mb-[22px] flex items-baseline justify-between border-t border-[var(--color-border)] pt-7">
      <h2 className="text-[24px] font-semibold tracking-[-0.5px] text-[var(--color-fg)]">
        {title}
      </h2>
      {meta && (
        href ? (
          <Link
            href={href}
            className="font-mono text-[12px] text-[var(--color-faint)] hover:text-[var(--color-fg)]"
          >
            {meta}
          </Link>
        ) : (
          <span className="font-mono text-[12px] text-[var(--color-faint)]">
            {meta}
          </span>
        )
      )}
    </div>
  );
}
