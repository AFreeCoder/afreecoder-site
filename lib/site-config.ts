export const siteConfig = {
  name: "AFreeCoder",
  domain: "https://afreecoder.dev",
  description:
    "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
  slogan: ["// Observing", "// Building", "// Iterating"] as const,
  intro: "Independent Developer / AI · 投资理财",
  socials: [
    { label: "GitHub", href: "https://github.com/AFreeCoder" },
    { label: "Email", href: "mailto:hello@afreecoder.dev" },
  ],
  nav: [
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Writing", href: "/writing" },
  ],
} as const;
