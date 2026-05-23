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
  it("renders masthead nav labels from decoration", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    // nav labels 出现在 masthead 的 <a> 文本中
    const text = container.textContent ?? "";
    expect(text).toContain("索引");
    expect(text).toContain("关于");
    expect(text).toContain("在线");
    expect(text).toContain("实证");
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

  it("fills frontispiece caption with stats placeholders", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("2019.06.05"); // {{since}}
    expect(text).toContain("67"); // {{postCount}}
    expect(text).toContain("4"); // {{productLiveCount}}
    // 未替换的占位符不应残留
    expect(text).not.toContain("{{");
  });

  it("masthead shows brand A·F·C", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("A·F·C");
  });

  it("page-head shows chapter number I (home is volume one)", () => {
    const { container } = render(
      <HomePage theme="annual" stats={stats} products={products} posts={posts} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("I · 索引");
  });
});
