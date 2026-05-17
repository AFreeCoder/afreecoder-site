import { siteConfig } from "@/lib/site-config";

type Props = {
  aboutSummary: React.ReactNode;
  aboutHref?: string;
};

export function Hero({ aboutSummary, aboutHref = "/about" }: Props) {
  return (
    <section className="grid grid-cols-1 gap-12 py-3 pb-14 md:grid-cols-[1fr_3fr]">
      {/* LEFT: identity */}
      <div className="pt-1">
        <div className="relative mb-5 h-[88px] w-[88px]">
          <div
            className="h-full w-full rounded-full border border-[var(--color-border-strong)]"
            style={{
              background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
            }}
            aria-label="avatar"
          />
          <div
            className="pointer-events-none absolute -inset-1 -z-10 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(251,146,60,0.18), transparent 60%)",
            }}
          />
        </div>
        <h1 className="mb-[10px] text-[26px] font-bold leading-tight tracking-[-0.5px] text-white">
          {siteConfig.name}
        </h1>
        <div className="mb-3 space-y-[2px] font-mono text-[12px] leading-[1.4] text-[var(--color-accent)]">
          {siteConfig.slogan.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <p className="mb-[18px] text-[13px] leading-[1.55] text-[var(--color-muted)]">
          {siteConfig.intro}
        </p>
        <ul className="flex flex-wrap gap-[6px]">
          {siteConfig.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                className="inline-block rounded-full border border-[var(--color-border-strong)] px-[11px] py-[5px] text-[11px] text-[#aaa] transition-colors hover:text-white"
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: about summary */}
      <div className="pt-1">
        <div className="mb-[18px] font-mono text-[11px] uppercase tracking-[2px] text-[var(--color-faint)]">
          — ABOUT
        </div>
        <div className="max-w-[720px] space-y-[14px] text-[16px] leading-[1.85] text-[#d4d4d4]">
          {aboutSummary}
        </div>
        <a
          href={aboutHref}
          className="mt-4 inline-block font-mono text-[13px] text-[var(--color-accent)] hover:underline"
        >
          → 更多关于我
        </a>
      </div>
    </section>
  );
}
