import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("renders the NOW block from siteConfig", () => {
    const html = renderToStaticMarkup(<Sidebar scheme="light" />);
    expect(html).toContain("sidebar-now");
    expect(html).toContain("正在构建 APIPool");
    expect(html).toContain("对产品合作与交流开放");
  });

  it("renders stats line when provided", () => {
    const html = renderToStaticMarkup(
      <Sidebar scheme="light" stats={{ products: 4, posts: 67 }} />,
    );
    expect(html).toContain("产品 4 · 文章 67");
  });

  it("omits stats line when not provided", () => {
    const html = renderToStaticMarkup(<Sidebar scheme="light" />);
    expect(html).not.toContain("sidebar-stats");
  });
});
