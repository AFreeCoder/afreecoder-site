import { siteConfig } from "@/lib/site-config";
import Image from "next/image";

type Props = {
  aboutSummary: React.ReactNode;
  aboutHref?: string;
};

export function Hero({ aboutSummary, aboutHref = "/about" }: Props) {
  return (
    <section className="grid grid-cols-1 gap-12 py-4 pb-14 md:grid-cols-[1fr_3fr]">
      {/* LEFT: identity */}
      <div className="pt-1">
        <div className="relative mb-4 h-[104px] w-[116px] overflow-hidden rounded-[24px] border border-[var(--color-border-strong)] bg-[var(--color-card)] shadow-[var(--shadow-soft-hover)]">
          <Image
            src="/avatar.png"
            alt="AFreeCoder 头像"
            width={1242}
            height={1124}
            priority
            className="h-full w-full object-contain"
          />
        </div>
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
                className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-[11px] py-[5px] text-[11px] text-[var(--color-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
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
          — 关于
        </div>
        <div className="max-w-[720px] space-y-[14px] text-[16px] leading-[1.85] text-[var(--color-fg)]">
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
