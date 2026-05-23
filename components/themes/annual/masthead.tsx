import Link from "next/link";
import type { ThemeId } from "@/lib/themes";
import type { Stats } from "@/lib/site-stats";
import type { AnnualDecoration } from "@/content/decorations/annual";
import { ThemeSwitcher } from "@/components/site/theme-switcher";

type Props = {
  theme: ThemeId;
  decoration: AnnualDecoration;
  stats: Stats;
  active: "home" | "about" | "products" | "writing";
};

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function Masthead({ theme, decoration, stats, active }: Props) {
  const m = decoration.masthead;
  const volume = typeof m.volume === "function" ? m.volume(stats) : m.volume;
  const seriesLine = `Vol. ${volume} · ${new Date().getUTCFullYear()} ${m.series}`;

  return (
    <header className="annual-masthead">
      <div className="annual-shell">
        <div className="annual-masthead-row">
          <div className="annual-masthead-left">
            <span className="annual-masthead-issue">{seriesLine}</span>
            <span className="annual-masthead-date">Issue · {todayIso()}</span>
          </div>
          <nav className="annual-masthead-nav">
            <Link href="/"         className={active === "home"     ? "is-active" : ""}>{decoration.navLabels.home}</Link>
            <Link href="/about"    className={active === "about"    ? "is-active" : ""}>{decoration.navLabels.about}</Link>
            <Link href="/products" className={active === "products" ? "is-active" : ""}>{decoration.navLabels.products}</Link>
            <Link href="/writing"  className={active === "writing"  ? "is-active" : ""}>{decoration.navLabels.writing}</Link>
            <ThemeSwitcher current={theme} />
          </nav>
        </div>
        <div className="annual-masthead-title">
          <span className="annual-masthead-mt-left">{m.left}</span>
          <h1 className="annual-masthead-mt-center">
            {m.centerSegments[0]}<i>·</i>{m.centerSegments[1]}<i>·</i>{m.centerSegments[2]}
            <span className="annual-masthead-est">EST. {m.establishedYear}</span>
          </h1>
          <span className="annual-masthead-mt-right">{m.right}</span>
        </div>
      </div>
    </header>
  );
}
