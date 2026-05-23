import Link from "next/link";

type Props = {
  num: string;
  title: string;
  titleAccent?: string;
  metaLabel?: string;
  metaHref?: string;
};

function renderTitleWithAccent(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title;
  const parts = title.split(accent);
  const nodes: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0) nodes.push(<em key={`em-${i}`}>{accent}</em>);
    nodes.push(<span key={`s-${i}`}>{p}</span>);
  });
  return nodes;
}

export function ChapterHead({ num, title, titleAccent, metaLabel, metaHref }: Props) {
  return (
    <div className="annual-chapter-head">
      <div>
        <div className="annual-chapter-num">{num}</div>
        <h3 className="annual-chapter-title">{renderTitleWithAccent(title, titleAccent)}</h3>
      </div>
      {metaLabel && (
        metaHref
          ? <Link href={metaHref} className="annual-chapter-meta">{metaLabel}</Link>
          : <span className="annual-chapter-meta">{metaLabel}</span>
      )}
    </div>
  );
}
