import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import { getCurrentTheme } from "@/lib/get-current-theme";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afreecoder.dev"),
  title: { default: "AFreeCoder", template: "%s · AFreeCoder" },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getCurrentTheme();
  return (
    <html
      lang="zh-CN"
      data-theme={theme}
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
