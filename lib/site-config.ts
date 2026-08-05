export type SocialIconKey = "github" | "x" | "email" | "rss";

export type SocialLink = {
  icon: SocialIconKey;
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "AFreeCoder",
  domain: "https://afreecoder.dev",
  description:
    "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
  taglines: {
    primary: "独立开发者，关注 AI 产品与写作。",
    secondary: "用代码记录追求自由的过程。",
  },
  now: {
    building: "APIPool",
    link: "https://apipool.dev",
    note: "对产品合作与交流开放",
  },
  socials: [
    { icon: "github", label: "GitHub", href: "https://github.com/AFreeCoder" },
    { icon: "x",      label: "X / Twitter", href: "https://x.com/" },
    { icon: "email",  label: "Email", href: "mailto:hello@afreecoder.dev" },
    { icon: "rss",    label: "RSS",   href: "/rss.xml" },
  ] as SocialLink[],
  nav: [
    { label: "主页", href: "/"        },
    { label: "关于", href: "/about"   },
    { label: "产品", href: "/products" },
    { label: "文章", href: "/writing"  },
  ] as NavItem[],
} as const;
