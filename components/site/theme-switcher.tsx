"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_THEME, THEMES, type ThemeId } from "@/lib/themes";

function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    THEMES.some((t) => t.id === value)
  );
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>(DEFAULT_THEME);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 挂载后从 <html data-theme> 同步当前值（防闪脚本已设置）
  useEffect(() => {
    const value = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isThemeId(value)) setCurrent(value);
  }, []);

  // 点击菜单外关闭 & Esc 关闭
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(id: ThemeId) {
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("theme", id);
    } catch {
      // sandbox iframe 等场景 localStorage 不可写——忽略
    }
    setCurrent(id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="切换主题"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="theme-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-fg)] transition-colors hover:border-[var(--color-card-border-hover)] hover:text-[var(--color-accent)]"
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
          className="absolute right-0 top-[42px] z-50 w-[200px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-card)] p-1.5 text-[13px] shadow-[var(--shadow-soft-hover)]"
        >
          {THEMES.map((t) => {
            const active = current === t.id;
            return (
              <li
                key={t.id}
                role="menuitem"
                aria-current={active}
                tabIndex={0}
                onClick={() => choose(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(t.id);
                  }
                }}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-fg)] hover:bg-[var(--color-accent-soft)]"
                }`}
              >
                <span
                  className="inline-block h-3.5 w-3.5 rounded border border-[var(--color-border)]"
                  style={{ background: t.swatch }}
                  aria-hidden
                />
                <span className="flex-1">{t.label}</span>
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
