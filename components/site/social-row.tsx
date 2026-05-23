import type { SocialIconKey, SocialLink } from "@/lib/site-config";

type Props = {
  socials: readonly SocialLink[];
};

export function SocialRow({ socials }: Props) {
  return (
    <div className="social-row" role="list" aria-label="社交链接">
      {socials.map((s) => {
        const isExternal = /^https?:\/\//.test(s.href);
        return (
          <a
            key={s.icon + s.href}
            href={s.href}
            className="social-link"
            aria-label={s.label}
            title={s.label}
            role="listitem"
            {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            <SocialIcon icon={s.icon} />
          </a>
        );
      })}
    </div>
  );
}

function SocialIcon({ icon }: { icon: SocialIconKey }) {
  switch (icon) {
    case "github":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.55v-2.02c-3.2.69-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.77 1.05.77 2.13v3.16c0 .31.21.67.8.55 4.56-1.53 7.85-5.84 7.85-10.93C23.5 5.65 18.35.5 12 .5z"/>
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.78l-4.94-6.45L5.6 22H2.34l8.01-9.16L1.5 2h6.94l4.46 5.9L18.24 2zm-1.18 18h1.86L7.06 4H5.12l11.94 16z"/>
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2"/>
          <path d="m3 7 9 6 9-6"/>
        </svg>
      );
    case "rss":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 4.5C15.05 4.5 19.5 8.95 19.5 20H17C17 10.34 13.66 7 4 7V4.5zM4 11.5c4.69 0 8 3.31 8 8H9.5c0-3.04-2.46-5.5-5.5-5.5v-2.5zM5.6 16.4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
        </svg>
      );
    case "jike":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="currentColor"/>
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="700" fill="var(--color-bg)">即</text>
        </svg>
      );
    case "wechat":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9.5 4C5.36 4 2 6.91 2 10.5c0 2 1.05 3.78 2.7 4.97L4 18l2.66-1.43c.6.15 1.22.25 1.84.31a5.94 5.94 0 0 1-.5-2.38c0-3.59 3.36-6.5 7.5-6.5.36 0 .72.02 1.07.07C16 5.6 13 4 9.5 4zM7 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3.5 2c-3.3 0-6 2.3-6 5.13 0 1.6.9 3.02 2.3 3.96L11.4 21l2.16-1.18c.66.16 1.34.24 2.04.24 3.3 0 6-2.3 6-5.13 0-2.83-2.7-5.13-6-5.13zm-2 4.13a.85.85 0 1 1 0-1.7.85.85 0 0 1 0 1.7zm4 0a.85.85 0 1 1 0-1.7.85.85 0 0 1 0 1.7z"/>
        </svg>
      );
  }
}
