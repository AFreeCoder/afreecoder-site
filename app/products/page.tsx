import { getCurrentTheme } from "@/lib/get-current-theme";
import { renderThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { products } from "@/content/products";

export const metadata = {
  title: "产品",
  description: "AFreeCoder 的产品与项目",
};

export default async function ProductsPage() {
  const [theme, stats] = await Promise.all([getCurrentTheme(), getSiteStats()]);
  return renderThemedPage(theme, "products", { theme, products, stats });
}
