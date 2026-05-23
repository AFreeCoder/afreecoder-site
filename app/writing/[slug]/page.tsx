import Link from "next/link";
import { notFound } from "next/navigation";
import { Mdx } from "@/lib/mdx";
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

function formatDate(d: string): string {
  return d.replaceAll("-", "/");
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
    <article className="article">
      <div className="article-meta">
        {formatDate(post.meta.date)} · {post.meta.readingTime} min read
      </div>
      <h1 className="article-title">{post.meta.title}</h1>
      <div className="prose">
        <Mdx source={post.body} />
      </div>
      <footer className="article-foot">
        <Link href="/writing">← 返回文章列表</Link>
      </footer>
    </article>
  );
}
