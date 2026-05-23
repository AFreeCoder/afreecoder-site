"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site-config";

type Props = {
  items: readonly NavItem[];
};

export function TopNav({ items }: Props) {
  const pathname = usePathname();
  return (
    <header className="top-nav">
      <nav className="top-nav-inner" aria-label="主导航">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`top-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
