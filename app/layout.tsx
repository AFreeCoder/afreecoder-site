import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { JetBrains_Mono } from "next/font/google";
import { getColorScheme } from "@/lib/get-color-scheme";
import { Sidebar } from "@/components/site/sidebar";
import "./globals.css";

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
  const scheme = await getColorScheme();
  return (
    <html
      lang="zh-CN"
      data-color-scheme={scheme}
      className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrains.variable}`}
    >
      <body>
        <div className="app-shell">
          <Sidebar scheme={scheme} />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
