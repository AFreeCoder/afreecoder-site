export const siteConfig = {
  name: "AFreeCoder",
  domain: "https://afreecoder.dev",
  description:
    "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
  slogan: ["// A-Free-Coder", "// 自由痕迹", "// 公开构建"] as const,
  intro: "自由职业者 / AI / 独立产品",
  socials: [
    { label: "GitHub", href: "https://github.com/AFreeCoder" },
    { label: "邮箱", href: "mailto:hello@afreecoder.dev" },
  ],
  nav: [
    { label: "关于", href: "/about" },
    { label: "产品", href: "/products" },
    { label: "文章", href: "/writing" },
  ],
} as const;
