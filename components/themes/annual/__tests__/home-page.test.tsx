// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { HomePage } from "../home-page";

afterEach(() => cleanup());

vi.mock("next/link", () => ({
  default: ({ children, ...rest }: { children: React.ReactNode; href: string }) => (
    <a {...rest}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...rest }: { alt: string; src: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...rest} />
  ),
}));

vi.mock("@/components/site/theme-switcher", () => ({
  ThemeSwitcher: () => null,
}));

const stats = {
  since: "2019.06.05",
  sinceYear: 2019,
  yearsActive: 7,
  volRoman: "VIII",
  postCount: 67,
  productLiveCount: 4,
  productArchivedCount: 0,
  uptimeDays: 2548,
};

const products = [
  {
    name: "APIPool",
    description: "desc-apipool",
    role: "SaaS",
    phase: "线上运行",
    highlight: "hl-apipool",
    tags: ["API"],
    link: "https://apipool.dev",
    status: "active" as const,
  },
];

const posts = [
  {
    title: "TITLE-ONE",
    date: "2022-12-06",
    slug: "p1",
    summary: "",
    original_url: "",
    platforms: [],
    bodyFormat: "markdown" as const,
    readingTime: 14,
  },
];

describe("Annual.HomePage", () => {
  it("renders 3 masthead nav labels from decoration (home link removed)", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("关于");
    expect(text).toContain("产品·服务");
    expect(text).toContain("文章");
  });

  it("renders product data", () => {
    const { getByText } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    expect(getByText("APIPool")).toBeTruthy();
    expect(getByText("desc-apipool")).toBeTruthy();
    expect(getByText("hl-apipool")).toBeTruthy();
  });

  it("renders post title from data", () => {
    const { getByText } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    expect(getByText("TITLE-ONE")).toBeTruthy();
  });

  it("fills stats placeholders in chapter titles and colophon copyright", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    // chapters.writing.title 含 {{postCount}}
    expect(text).toContain("67");
    // colophon.copyright 含 {{sinceYear}}
    expect(text).toContain("2019");
    // 未替换的占位符不应残留
    expect(text).not.toContain("{{");
  });

  it("masthead shows brand AFreeCoder", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("AFreeCoder");
  });

  it("home page does NOT render the top index PageHead", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    expect(text).not.toContain("I · 索引");
    // Home page goes straight from masthead into the first chapter (关于)
    expect(text).toContain("关于");
  });

  it("masthead does NOT show home link", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    // navLabels.home is "索引"; masthead should NOT include it (A·F·C logo is the home link)
    const navLinks = container.querySelectorAll(".annual-masthead-nav a");
    const linkTexts = Array.from(navLinks).map((a) => a.textContent?.trim());
    expect(linkTexts).not.toContain("索引");
    expect(linkTexts).toContain("关于");
    expect(linkTexts).toContain("产品·服务");
    expect(linkTexts).toContain("文章");
  });
});
