"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  COLOR_SCHEME_COOKIE,
  type ColorScheme,
} from "@/lib/color-scheme";

type Props = { current: ColorScheme };

export function ColorSchemeToggle({ current }: Props) {
  const [scheme, setScheme] = useState<ColorScheme>(current);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next: ColorScheme = scheme === "dark" ? "light" : "dark";
    const yearSec = 60 * 60 * 24 * 365;
    document.cookie = `${COLOR_SCHEME_COOKIE}=${next}; path=/; max-age=${yearSec}; samesite=lax`;
    document.documentElement.setAttribute("data-color-scheme", next);
    setScheme(next);
    startTransition(() => router.refresh());
  }

  const label = scheme === "dark" ? "切换到明色" : "切换到暗色";

  return (
    <button
      type="button"
      className="scheme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {scheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
