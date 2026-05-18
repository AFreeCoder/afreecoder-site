import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Nav() {
  return (
    <nav className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 text-[15px] sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/"
        className="text-[17px] font-semibold text-[var(--color-fg)]"
      >
        {siteConfig.name}
      </Link>
      <ul className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-[var(--color-muted)] sm:w-auto">
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
