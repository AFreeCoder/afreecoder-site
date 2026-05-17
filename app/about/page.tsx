import fs from "node:fs/promises";
import path from "node:path";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Mdx } from "@/lib/mdx";

export const metadata = {
  title: "About",
  description: "关于 AFreeCoder",
};

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), "content", "about.mdx");
  const source = await fs.readFile(filePath, "utf-8");
  return (
    <main className="mx-auto max-w-[760px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <article className="py-10">
        <Mdx source={source} />
      </article>
      <Footer />
    </main>
  );
}
