type Props = { startYear: number; currentYear: number };

export function TimelineSpine({ startYear, currentYear }: Props) {
  const years: number[] = [];
  for (let y = startYear; y <= currentYear; y++) years.push(y);
  return (
    <aside aria-hidden className="annual-timeline">
      <div className="annual-timeline-track">
        {years.map((y) => (
          <span key={y} className={`annual-timeline-year${y === currentYear ? " is-active" : ""}`}>{y}</span>
        ))}
        <span className="annual-timeline-now">NOW</span>
      </div>
    </aside>
  );
}
