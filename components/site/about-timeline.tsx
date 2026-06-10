export type TimelineItem = {
  label: string;
  title: string;
  description: string;
  meta?: string;
  now?: boolean;
};

type Props = { items: TimelineItem[] };

export function AboutTimeline({ items }: Props) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li
          key={item.title}
          className={`timeline-item${item.now ? " timeline-item--now" : ""}`}
        >
          <span className="timeline-label">{item.label}</span>
          <h3 className="timeline-title">{item.title}</h3>
          <p className="timeline-desc">{item.description}</p>
          {item.meta && <p className="timeline-meta">{item.meta}</p>}
        </li>
      ))}
    </ol>
  );
}
