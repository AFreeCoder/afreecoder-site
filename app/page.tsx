import { getCurrentTheme } from "@/lib/get-current-theme";
import { renderThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export default async function HomePage() {
  const [theme, posts, stats] = await Promise.all([
    getCurrentTheme(),
    getAllWriting(),
    getSiteStats(),
  ]);
  return renderThemedPage(theme, "home", { theme, posts, products, stats });
}
