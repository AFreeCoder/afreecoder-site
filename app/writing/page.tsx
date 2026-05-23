import { getCurrentTheme } from "@/lib/get-current-theme";
import { renderThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { getAllWriting } from "@/lib/writing";

export const metadata = {
  title: "文章",
  description: "AFreeCoder 写作存档",
};

export default async function WritingPage() {
  const [theme, posts, stats] = await Promise.all([
    getCurrentTheme(),
    getAllWriting(),
    getSiteStats(),
  ]);
  return renderThemedPage(theme, "writingList", { theme, posts, stats });
}
