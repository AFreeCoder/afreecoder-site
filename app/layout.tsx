import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Source_Serif_4 } from "next/font/google";
import { ThemeInit } from "./theme-init";
import "./globals.css";

const SourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afreecoder.dev"),
  title: {
    default: "AFreeCoder",
    template: "%s · AFreeCoder",
  },
  description:
    "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
  openGraph: {
    title: "AFreeCoder",
    description:
      "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
    url: "https://afreecoder.dev",
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
      data-theme="sand"
      className={`${GeistSans.variable} ${GeistMono.variable} ${SourceSerif.variable}`}
    >
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
