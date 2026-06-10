import Link from "next/link";

type Props = {
  title: string;
  num?: string;
  tone?: "accent" | "accent-2";
  metaHref?: string;
  metaLabel?: string;
};

export function SectionHead({ title, num, tone = "accent", metaHref, metaLabel }: Props) {
  return (
    <header className="section-head">
      <h2 className="section-head-title">
        {num && (
          <span className={`section-head-num section-head-num--${tone}`}>{num}</span>
        )}
        {title}
      </h2>
      {metaHref && metaLabel && (
        <Link href={metaHref} className="section-head-meta">
          {metaLabel} →
        </Link>
      )}
    </header>
  );
}
