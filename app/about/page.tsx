import { aboutMdx } from "@/content/about";
import { SectionHead } from "@/components/site/section-head";
import { Mdx } from "@/lib/mdx";

export const metadata = {
  title: "关于我",
  description: "关于 AFreeCoder",
};

export default function AboutPage() {
  return (
    <>
      <section className="section">
        <SectionHead title="关于" />
        <article className="article prose">
          <Mdx source={aboutMdx} />
        </article>
      </section>
    </>
  );
}
