import Link from "next/link";

type Props = {
  title: string;
  metaHref?: string;
  metaLabel?: string;
};

export function SectionHead({ title, metaHref, metaLabel }: Props) {
  return (
    <header className="section-head">
      <h2 className="section-head-title">{title}</h2>
      {metaHref && metaLabel && (
        <Link href={metaHref} className="section-head-meta">
          {metaLabel} →
        </Link>
      )}
    </header>
  );
}
