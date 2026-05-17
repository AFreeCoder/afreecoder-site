import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--color-border)] pb-5 text-[15px]">
      <Link
        href="/"
        className="text-[17px] font-semibold tracking-[0.5px] text-[var(--color-fg)]"
      >
        {siteConfig.name}
      </Link>
      <ul className="flex items-center gap-[18px] text-[var(--color-muted)]">
        {siteConfig.nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="transition-colors hover:text-[var(--color-fg)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
