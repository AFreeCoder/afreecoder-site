import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://afreecoder.com"),
  title: {
    default: "AFreeCoder",
    template: "%s · AFreeCoder",
  },
  description:
    "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
  openGraph: {
    title: "AFreeCoder",
    description:
      "Independent developer · AI · 投资理财. Observing. Building. Iterating.",
    url: "https://afreecoder.com",
    siteName: "AFreeCoder",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
