import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Mdx } from "@/lib/mdx";
import { aboutMdx } from "@/content/about";

export const metadata = {
  title: "About",
  description: "关于 AFreeCoder",
};

export default async function AboutPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-7 sm:px-8 sm:py-9">
      <Nav />
      <article className="py-10">
        <Mdx source={aboutMdx} />
      </article>
      <Footer />
    </main>
  );
}
