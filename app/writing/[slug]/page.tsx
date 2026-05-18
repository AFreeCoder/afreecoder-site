import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ArticleColumn, PageShell } from "@/components/site/page-shell";
import { Mdx } from "@/lib/mdx";
import { getAllWriting, getWritingBySlug } from "@/lib/writing";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllWriting();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
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

  return (
    <PageShell>
      <Nav />
      <ArticleColumn className="py-10">
        <h1 className="mb-3 text-[38px] font-bold leading-tight tracking-[-0.5px] text-[var(--color-fg)]">
          {post.meta.title}
        </h1>
        <div className="mb-10 font-mono text-[12px] text-[var(--color-faint)]">
          {post.meta.date} · {post.meta.readingTime} 分钟阅读
        </div>
        <Mdx source={post.body} />
        <div className="mt-10">
          <Link
            href="/writing"
            className="font-mono text-[13px] text-[var(--color-accent)] hover:underline"
          >
            ← 返回文章列表
          </Link>
        </div>
      </ArticleColumn>
      <Footer />
    </PageShell>
  );
}
