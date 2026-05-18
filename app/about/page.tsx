import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ArticleColumn, PageShell } from "@/components/site/page-shell";
import { Mdx } from "@/lib/mdx";
import { aboutMdx } from "@/content/about";

export const metadata = {
  title: "关于我",
  description: "关于 AFreeCoder",
};

export default async function AboutPage() {
  return (
    <PageShell>
      <Nav />
      <ArticleColumn className="py-10">
        <Mdx source={aboutMdx} />
      </ArticleColumn>
      <Footer />
    </PageShell>
  );
}
