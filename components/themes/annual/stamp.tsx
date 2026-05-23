type Props = {
  primary: readonly [string, string];
  arcTop: string;
  arcBottom: string;
  size?: number;
  className?: string;
};

export function Stamp({ primary, arcTop, arcBottom, size = 148, className }: Props) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ width: size, height: size, transform: "rotate(-7deg)" }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
        <defs>
          <path id="annual-stamp-arc-top" d="M 30,100 A 70,70 0 0 1 170,100" />
          <path id="annual-stamp-arc-bot" d="M 30,100 A 70,70 0 0 0 170,100" />
        </defs>
        <text fill="var(--color-accent)" fontFamily='"JetBrains Mono", monospace' fontSize="10" letterSpacing="0.3em">
          <textPath href="#annual-stamp-arc-top" startOffset="50%" textAnchor="middle">{arcTop}</textPath>
        </text>
        <text fill="var(--color-accent)" fontFamily='"JetBrains Mono", monospace' fontSize="10" letterSpacing="0.3em">
          <textPath href="#annual-stamp-arc-bot" startOffset="50%" textAnchor="middle">{arcBottom}</textPath>
        </text>
        <text x="100" y="92" textAnchor="middle" fill="var(--color-accent)" fontFamily='"Noto Serif SC","Fraunces", serif' fontWeight="700" fontSize="34" letterSpacing="0.04em">{primary[0]}</text>
        <text x="100" y="128" textAnchor="middle" fill="var(--color-accent)" fontFamily='"Noto Serif SC","Fraunces", serif' fontWeight="700" fontSize="34" letterSpacing="0.04em">{primary[1]}</text>
      </svg>
    </div>
  );
}
