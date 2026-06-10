import { aboutLead, aboutMilestones, aboutFocus } from "@/content/about";
import { siteConfig } from "@/lib/site-config";
import { getAllWriting } from "@/lib/writing";
import { SectionHead } from "@/components/site/section-head";
import { AboutTimeline } from "@/components/site/about-timeline";

export const metadata = {
  title: "关于我",
  description: "关于 AFreeCoder",
};

export default async function AboutPage() {
  const posts = await getAllWriting();
  const lastYear = posts[0]?.date.slice(0, 4);
  const firstYear = posts[posts.length - 1]?.date.slice(0, 4);
  const writingMeta =
    posts.length > 0 ? `${firstYear}–${lastYear} · ${posts.length} 篇` : undefined;

  const milestones = aboutMilestones.map((m) => {
    if (m.title.includes("投资理财")) return { ...m, meta: writingMeta };
    if (m.now) return { ...m, meta: `正在构建 ${siteConfig.now.building}` };
    return m;
  });

  const contacts = siteConfig.socials.filter(
    (s) => s.icon === "github" || s.icon === "email",
  );

  return (
    <>
      <section className="section">
        <SectionHead title="关于" />
        <div className="about-block">
          {aboutLead.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="轨迹" num="01" />
        <AboutTimeline items={milestones} />
      </section>

      <section className="section">
        <SectionHead title="现在关注" num="02" tone="accent-2" />
        <ul className="about-focus">
          {aboutFocus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <SectionHead title="联系" num="03" />
        <ul className="about-contact">
          {contacts.map((c) => (
            <li key={c.icon}>
              <span className="about-contact-label">{c.label}</span>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {c.href.replace("mailto:", "").replace("https://", "")}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
