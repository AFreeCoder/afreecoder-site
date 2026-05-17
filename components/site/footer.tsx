import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-9 flex items-center justify-between border-t border-[var(--color-border)] pt-5 font-mono text-[12px] text-[var(--color-faint)]">
      <span>© {new Date().getFullYear()} {siteConfig.name}</span>
      <span>
        <a href="/rss.xml" className="hover:text-white">RSS</a>
        {" · "}
        <a href="/sitemap.xml" className="hover:text-white">Sitemap</a>
      </span>
    </footer>
  );
}
