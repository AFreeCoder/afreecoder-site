import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
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
    <main className="mx-auto max-w-[760px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <article className="py-10">
        <h1 className="mb-3 text-[34px] font-bold leading-tight tracking-[-0.5px] text-white">
          {post.meta.title}
        </h1>
        <div className="mb-10 font-mono text-[11px] text-[var(--color-faint)]">
          {post.meta.date} · {post.meta.readingTime} min read
        </div>
        <Mdx source={post.body} />
        {post.meta.platforms && post.meta.platforms.length > 0 && (
          <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-[13px] text-[var(--color-muted)]">
            本文同步发布于 {post.meta.platforms.join(" / ")}
            {post.meta.original_url && (
              <>
                {" · "}
                <a
                  href={post.meta.original_url}
                  className="text-[var(--color-accent)] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  原文
                </a>
              </>
            )}
          </div>
        )}
        <div className="mt-10">
          <Link
            href="/writing"
            className="font-mono text-[12px] text-[var(--color-accent)] hover:underline"
          >
            ← 返回 Writing
          </Link>
        </div>
      </article>
      <Footer />
    </main>
  );
}
