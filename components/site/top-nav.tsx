"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/site-config";

type Props = {
  items: readonly NavItem[];
};

export function TopNav({ items }: Props) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const measuredRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);

  // 把墨条移动到指定链接下方（通过 CSS 变量驱动 transform/width 过渡）
  const moveInkTo = useCallback((el: HTMLElement | null) => {
    const nav = navRef.current;
    if (!nav) return;
    if (!el) {
      nav.style.setProperty("--ink-w", "0px");
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    nav.style.setProperty("--ink-x", `${box.left - navBox.left}px`);
    nav.style.setProperty("--ink-w", `${box.width}px`);
    if (!measuredRef.current) {
      measuredRef.current = true;
      // 强制 reflow，让首次定位先生效，再开启过渡，避免首帧从左侧滑入
      void nav.offsetWidth;
    }
    nav.classList.add("is-measured");
  }, []);

  const moveInkToActive = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    moveInkTo(nav.querySelector<HTMLElement>(".top-nav-link.is-active"));
  }, [moveInkTo]);

  useEffect(() => {
    moveInkToActive();
  }, [pathname, moveInkToActive]);

  useEffect(() => {
    const remeasure = () => moveInkToActive();
    window.addEventListener("resize", remeasure);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      observer = new ResizeObserver(remeasure);
      observer.observe(navRef.current);
    }
    // 字体加载完成后宽度会变化，需要重新测量
    document.fonts?.ready.then(remeasure).catch(() => {});
    return () => {
      window.removeEventListener("resize", remeasure);
      observer?.disconnect();
    };
  }, [moveInkToActive]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`top-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="top-nav-path" aria-hidden="true">
        {formatPath(pathname)}
        <span className="top-nav-caret" />
      </div>
      <nav
        className="top-nav-inner"
        aria-label="主导航"
        ref={navRef}
        onMouseLeave={moveInkToActive}
      >
        {items.map((item, index) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`top-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onMouseEnter={(e) => moveInkTo(e.currentTarget)}
              onFocus={(e) => moveInkTo(e.currentTarget)}
              onBlur={moveInkToActive}
            >
              <span className="top-nav-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="top-nav-label">{item.label}</span>
            </Link>
          );
        })}
        <span className="top-nav-ink" aria-hidden="true" />
      </nav>
    </header>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** 把 pathname 转成终端风格路径：/ -> ~/，/writing/x -> ~/writing/… */
export function formatPath(pathname: string | null): string {
  if (!pathname || pathname === "/") return "~/";
  const segments = pathname.split("/").filter(Boolean);
  return `~/${segments[0]}${segments.length > 1 ? "/…" : ""}`;
}
