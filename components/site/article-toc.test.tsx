// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TocItem } from "@/lib/mdx";
import { ArticleToc } from "./article-toc";

const items: TocItem[] = [
  { id: "为什么写这篇", text: "为什么写这篇", level: 2 },
  { id: "背景", text: "背景", level: 3 },
  { id: "小结", text: "小结", level: 2 },
];

afterEach(cleanup);

describe("ArticleToc", () => {
  it("renders a nav with anchor links for every item", () => {
    render(<ArticleToc items={items} />);
    const nav = screen.getByRole("navigation", { name: "目录" });
    expect(nav).toBeTruthy();
    const link = screen.getByRole("link", { name: "背景" });
    expect(link.getAttribute("href")).toBe("#背景");
  });

  it("indents h3 items and marks the first item active by default", () => {
    render(<ArticleToc items={items} />);
    expect(
      screen.getByRole("link", { name: "为什么写这篇" }).className,
    ).toContain("is-active");
    expect(screen.getByRole("link", { name: "背景" }).className).toContain(
      "article-toc-link--lv3",
    );
  });
});
