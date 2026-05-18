import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { WritingItem } from "@/components/site/writing-item";
import { PageShell } from "@/components/site/page-shell";
import { getAllWriting } from "@/lib/writing";

export const metadata = {
  title: "文章",
  description: "AFreeCoder 写作存档",
};

export default async function WritingPage() {
  const posts = await getAllWriting();
  return (
    <PageShell>
      <Nav />
      <header className="py-10">
        <h1 className="text-[36px] font-bold tracking-[-0.5px] text-[var(--color-fg)]">
          文章
        </h1>
        <p className="mt-2 text-[15px] text-[var(--color-muted)]">
          {posts.length} 篇文章 · 按时间倒序
        </p>
      </header>
      <div>
        {posts.map((p) => (
          <WritingItem key={p.slug} post={p} />
        ))}
      </div>
      <Footer />
    </PageShell>
  );
}
