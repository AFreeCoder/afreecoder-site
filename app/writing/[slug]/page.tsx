import { notFound } from "next/navigation";
import { getCurrentTheme } from "@/lib/get-current-theme";
import { renderThemedPage } from "@/components/themes/dispatch";
import { getSiteStats } from "@/lib/site-stats";
import { getAllWriting, getWritingBySlug } from "@/lib/writing";

type Params = { slug: string };

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllWriting();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getWritingBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.summary,
  };
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getWritingBySlug(slug);
  if (!post) notFound();
  const [theme, stats] = await Promise.all([getCurrentTheme(), getSiteStats()]);
  return renderThemedPage(theme, "writingPost", {
    theme,
    stats,
    meta: post.meta,
    body: post.body,
  });
}
