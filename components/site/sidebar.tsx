import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import type { ColorScheme } from "@/lib/color-scheme";
import { SocialRow } from "./social-row";
import { ColorSchemeToggle } from "./color-scheme-toggle";

type Props = { scheme: ColorScheme };

export function Sidebar({ scheme }: Props) {
  const year = new Date().getFullYear();
  return (
    <aside className="app-sidebar">
      <Link href="/" aria-label={siteConfig.name} className="sidebar-avatar">
        <Image
          src="/avatar.png"
          alt={`${siteConfig.name} 头像`}
          width={248}
          height={248}
          priority
        />
      </Link>

      <Link href="/" className="sidebar-name">
        {siteConfig.name}
      </Link>

      <p className="sidebar-bio">{siteConfig.taglines.primary}</p>
      <p className="sidebar-tagline">{siteConfig.taglines.secondary}</p>

      <SocialRow socials={siteConfig.socials} />

      <div className="sidebar-colophon">
        <span>© {year} afreecoder.dev</span>
        <ColorSchemeToggle current={scheme} />
      </div>
    </aside>
  );
}
