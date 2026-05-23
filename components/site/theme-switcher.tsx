"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, THEME_COOKIE_NAME, type ThemeId } from "@/lib/themes";

type Props = { current: ThemeId };

export function ThemeSwitcher({ current }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(id: ThemeId, available: boolean) {
    if (!available) return;
    if (id === current) {
      setOpen(false);
      return;
    }
    const yearSec = 60 * 60 * 24 * 365;
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `${THEME_COOKIE_NAME}=${id}; path=/; max-age=${yearSec}; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="annual-switcher">
      <button
        ref={buttonRef}
        type="button"
        aria-label="切换主题"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="theme-menu"
        onClick={() => setOpen((v) => !v)}
        className="annual-switcher-btn"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
          <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="15" r="1.2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ul
          id="theme-menu"
          role="menu"
          className="annual-switcher-menu"
        >
          {THEMES.map((t) => {
            const active = current === t.id;
            const disabled = !t.available;
            return (
              <li
                key={t.id}
                role="menuitem"
                aria-current={active}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => choose(t.id, t.available)}
                onKeyDown={(e) => {
                  if (disabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(t.id, t.available);
                  }
                }}
                className={`annual-switcher-item${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`}
                title={disabled ? `${t.blurb} · 预览中` : t.blurb}
              >
                <span
                  className="annual-switcher-swatch"
                  style={{ background: t.swatch }}
                  aria-hidden
                />
                <span className="annual-switcher-label">{t.label}</span>
                {disabled && <span className="annual-switcher-badge">预览</span>}
                {active && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
