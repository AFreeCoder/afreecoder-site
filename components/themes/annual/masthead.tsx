import Link from "next/link";
import type { ThemeId } from "@/lib/themes";
import type { AnnualDecoration } from "@/content/decorations/annual";
import { ThemeSwitcher } from "@/components/site/theme-switcher";

type Props = {
  theme: ThemeId;
  decoration: AnnualDecoration;
  active: "home" | "about" | "products" | "writing";
};

export function Masthead({ theme, decoration, active }: Props) {
  return (
    <header className="annual-masthead">
      <div className="annual-shell annual-masthead-row">
        <Link href="/" className="annual-masthead-name">
          A<i>·</i>F<i>·</i>C
        </Link>
        <nav className="annual-masthead-nav">
          <Link href="/"         className={active === "home"     ? "is-active" : ""}>{decoration.navLabels.home}</Link>
          <Link href="/about"    className={active === "about"    ? "is-active" : ""}>{decoration.navLabels.about}</Link>
          <Link href="/products" className={active === "products" ? "is-active" : ""}>{decoration.navLabels.products}</Link>
          <Link href="/writing"  className={active === "writing"  ? "is-active" : ""}>{decoration.navLabels.writing}</Link>
          <ThemeSwitcher current={theme} />
        </nav>
      </div>
    </header>
  );
}
