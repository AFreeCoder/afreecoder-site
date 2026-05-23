import { renderWithAccent } from "@/content/decorations/annual";

type Props = {
  num: string;
  title: string;
  titleAccent?: string;
  caption?: string;
};

/** PageHead：4 页通用的"章号 + 标题 + 一句 caption"，替代原 Frontispiece。 */
export function PageHead({ num, title, titleAccent, caption }: Props) {
  return (
    <section className="annual-page-head">
      <div className="annual-shell">
        <div className="num">{num}</div>
        <h1 className="title">{renderWithAccent(title, titleAccent)}</h1>
        {caption && <p className="caption">{caption}</p>}
      </div>
    </section>
  );
}
