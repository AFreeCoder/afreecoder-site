import Link from "next/link";
import { renderWithAccent } from "@/content/decorations/annual";

type Props = {
  num: string;
  title: string;
  titleAccent?: string;
  metaLabel?: string;
  metaHref?: string;
};

export function ChapterHead({ num, title, titleAccent, metaLabel, metaHref }: Props) {
  return (
    <div className="annual-chapter-head">
      <div className="left">
        {num && <span className="annual-chapter-num">{num}</span>}
        {title && (
          <h2 className="annual-chapter-title">{renderWithAccent(title, titleAccent)}</h2>
        )}
      </div>
      {metaLabel && (
        metaHref
          ? <Link href={metaHref} className="annual-chapter-meta">{metaLabel}</Link>
          : <span className="annual-chapter-meta">{metaLabel}</span>
      )}
    </div>
  );
}
