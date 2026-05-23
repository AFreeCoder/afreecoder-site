import { Stamp } from "./stamp";

type StampProps = { primary: readonly [string, string]; arcTop: string; arcBottom: string };

type Props = {
  roman: string;
  title: string;
  titleAccent?: string;
  caption: string;
  stamp?: StampProps;
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

export function Frontispiece({ roman, title, titleAccent, caption, stamp }: Props) {
  return (
    <section className="annual-frontispiece">
      <div className="annual-shell annual-frontispiece-grid">
        <div className="annual-frontispiece-roman">{roman}</div>
        <div>
          <h2 className="annual-frontispiece-title">{renderTitleWithAccent(title, titleAccent)}</h2>
          <p className="annual-frontispiece-caption">{caption}</p>
        </div>
        {stamp ? <Stamp primary={stamp.primary} arcTop={stamp.arcTop} arcBottom={stamp.arcBottom} className="annual-frontispiece-stamp" /> : <div />}
      </div>
    </section>
  );
}
