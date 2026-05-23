"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site-config";

type Props = {
  items: readonly NavItem[];
};

export function SidebarNav({ items }: Props) {
  const pathname = usePathname();
  return (
    <nav className="sidebar-nav" aria-label="主导航">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <NavIcon kind={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavIcon({ kind }: { kind: NavItem["icon"] }) {
  switch (kind) {
    case "about":
      return (
        <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5"/>
          <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
        </svg>
      );
    case "products":
      return (
        <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3"  width="8" height="8" rx="1.5"/>
          <rect x="13" y="3" width="8" height="8" rx="1.5"/>
          <rect x="3" y="13" width="8" height="8" rx="1.5"/>
          <rect x="13" y="13" width="8" height="8" rx="1.5"/>
        </svg>
      );
    case "writing":
      return (
        <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5h16M4 10h16M4 15h11M4 20h7"/>
        </svg>
      );
  }
}
