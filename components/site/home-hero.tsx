import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { WritingMeta } from "@/lib/types";

type Props = { latestPost?: WritingMeta };

export function HomeHero({ latestPost }: Props) {
  return (
    <header className="hero">
      <h1 className="hero-title">
        构建 AI 产品，
        <br />
        用代码追求<em className="hero-k">自由</em>。
      </h1>
      <p className="hero-sub">
        我是 {siteConfig.name}，一名独立开发者。这里记录我正在构建的产品，和构建过程中的思考。
      </p>
      <p className="hero-status">
        <span className="hero-status-dot" aria-hidden="true" />
        <span>
          正在构建{" "}
          <a href={siteConfig.now.link} target="_blank" rel="noreferrer">
            {siteConfig.now.building}
          </a>
        </span>
        {latestPost && (
          <>
            <span className="hero-status-sep">·</span>
            <span>
              最近写了《
              <Link href={`/writing/${latestPost.slug}`} className="hero-status-post">
                {latestPost.title}
              </Link>
              》
            </span>
          </>
        )}
      </p>
    </header>
  );
}
