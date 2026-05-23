import Image from "next/image";
import { aboutMdx } from "@/content/about";

type Props = {
  signature?: string;
};

/** 从 aboutMdx 中提取前 3 段正文与 '现在关注' 列表（避免把整篇 MDX 渲染到首页摘要）。 */
function parseAboutSummary() {
  const lines = aboutMdx.split("\n");
  const paras: string[] = [];
  const pursuits: string[] = [];
  let inPursuits = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## 现在关注")) { inPursuits = true; continue; }
    if (line.startsWith("## ")) { inPursuits = false; continue; }
    if (inPursuits) {
      if (line.startsWith("- ")) pursuits.push(line.slice(2));
      continue;
    }
    if (/^[#-]/.test(line) || line === "") continue;
    if (paras.length < 3) paras.push(line);
  }
  return { paras, pursuits };
}

/** 每行 N 个字 + (N-1) 个圆点，flex justify-between 撑满行宽 */
function SloganLine({ text }: { text: string }) {
  const chars = Array.from(text);
  const items: React.ReactNode[] = [];
  chars.forEach((ch, i) => {
    items.push(<span key={`c${i}`} className="annual-slogan-char">{ch}</span>);
    if (i < chars.length - 1) {
      items.push(<span key={`d${i}`} className="annual-slogan-dot" aria-hidden>·</span>);
    }
  });
  return <div className="annual-slogan-line">{items}</div>;
}

export function AboutSection({ signature }: Props) {
  const { paras, pursuits } = parseAboutSummary();
  return (
    <div className="annual-about">
      <div className="annual-about-portrait">
        <div className="annual-about-frame">
          <Image src="/avatar.png" alt="AFreeCoder 头像" width={1242} height={1124} priority className="annual-about-avatar" />
        </div>
        <div className="annual-about-caption">
          <SloganLine text="道阻且长" />
          <SloganLine text="行则将至" />
        </div>
      </div>
      <div className="annual-about-prose">
        {paras.map((p, i) => <p key={i}>{p}</p>)}
        {signature && <div className="annual-about-sign">{signature}</div>}
        {pursuits.length > 0 && (
          <ul className="annual-about-pursuits">
            {pursuits.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
