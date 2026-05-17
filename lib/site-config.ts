export const siteConfig = {
  name: "AFreeCoder",
  domain: "https://afreecoder.dev",
  description:
    "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
  slogan: ["// Observing", "// Building", "// Iterating"] as const,
  intro: "Independent Developer / AI · 投资理财",
  socials: [
    { label: "GitHub", href: "https://github.com/<your-handle>" },
    { label: "X", href: "https://x.com/<your-handle>" },
    { label: "公众号", href: "#" },
    { label: "Email", href: "mailto:hello@afreecoder.com" },
  ],
  nav: [
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Writing", href: "/writing" },
  ],
} as const;
