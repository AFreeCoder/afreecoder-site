import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { ColorScheme } from "@/lib/color-scheme";
import { SocialRow } from "./social-row";
import { ColorSchemeToggle } from "./color-scheme-toggle";

type Props = {
  scheme: ColorScheme;
  stats?: { products: number; posts: number };
};

export function Sidebar({ scheme, stats }: Props) {
  const year = new Date().getFullYear();
  return (
    <aside className="app-sidebar">
      <Link href="/" aria-label={siteConfig.name} className="sidebar-avatar">
        <Image
          src="https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/d9e4a82551ddb98f330af6322da3d958e67dc607ed06c1b621759eaa19634d25.png?x-oss-process=image/resize,w_496/quality,q_80/format,webp"
          alt={`${siteConfig.name} 头像`}
          width={248}
          height={248}
          unoptimized
          preload
        />
      </Link>

      <Link href="/" className="sidebar-name">
        {siteConfig.name}
      </Link>

      <p className="sidebar-bio">{siteConfig.taglines.primary}</p>
      <p className="sidebar-tagline">{siteConfig.taglines.secondary}</p>

      <div className="sidebar-now">
        <span className="sidebar-now-label">NOW</span>
        <span className="sidebar-now-line">正在构建 {siteConfig.now.building}</span>
        <span className="sidebar-now-sub">{siteConfig.now.note}</span>
      </div>
      {stats && (
        <p className="sidebar-stats">
          产品 {stats.products} · 文章 {stats.posts}
        </p>
      )}

      <SocialRow socials={siteConfig.socials} />

      <div className="sidebar-colophon">
        <span>© {year} afreecoder.dev</span>
        <ColorSchemeToggle current={scheme} />
      </div>
    </aside>
  );
}
