import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { WritingItem } from "@/components/site/writing-item";
import { getAllWriting } from "@/lib/writing";

export const metadata = {
  title: "Writing",
  description: "AFreeCoder 写作存档",
};

export default async function WritingPage() {
  const posts = await getAllWriting();
  return (
    <main className="mx-auto max-w-[960px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <header className="py-10">
        <h1 className="text-[32px] font-bold tracking-[-0.5px] text-white">
          Writing
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-muted)]">
          {posts.length} 篇文章 · 按时间倒序
        </p>
      </header>
      <div>
        {posts.map((p) => (
          <WritingItem key={p.slug} post={p} />
        ))}
      </div>
      <Footer />
    </main>
  );
}
