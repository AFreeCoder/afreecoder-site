import { getCurrentTheme } from "@/lib/get-current-theme";
import { renderThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";

export const metadata = {
  title: "关于我",
  description: "关于 AFreeCoder",
};

export default async function AboutPage() {
  const [theme, stats] = await Promise.all([getCurrentTheme(), getSiteStats()]);
  return renderThemedPage(theme, "about", { theme, stats });
}
