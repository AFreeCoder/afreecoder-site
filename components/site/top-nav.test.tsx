// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NavItem } from "@/lib/site-config";

let currentPath = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
}));

import { TopNav, formatPath } from "./top-nav";

const items: NavItem[] = [
  { label: "主页", href: "/"         },
  { label: "关于", href: "/about"    },
  { label: "产品", href: "/products" },
  { label: "文章", href: "/writing"  },
];

afterEach(() => {
  cleanup();
  currentPath = "/";
});

describe("TopNav", () => {
  it("home is active only on exact root pathname", () => {
    currentPath = "/";
    render(<TopNav items={items} />);
    expect(screen.getByRole("link", { name: "主页" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "关于" }).getAttribute("aria-current")).toBeNull();
  });

  it("non-home href is active on exact match", () => {
    currentPath = "/products";
    render(<TopNav items={items} />);
    expect(screen.getByRole("link", { name: "产品" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "主页" }).getAttribute("aria-current")).toBeNull();
  });

  it("non-home href is active on nested route", () => {
    currentPath = "/writing/some-slug";
    render(<TopNav items={items} />);
    expect(screen.getByRole("link", { name: "文章" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "主页" }).getAttribute("aria-current")).toBeNull();
  });

  it("home stays inactive when on a deeper route", () => {
    currentPath = "/about";
    render(<TopNav items={items} />);
    expect(screen.getByRole("link", { name: "主页" }).getAttribute("aria-current")).toBeNull();
  });

  it("renders zero-padded index numbers hidden from the accessible name", () => {
    render(<TopNav items={items} />);
    const num = screen.getByText("01");
    expect(num.getAttribute("aria-hidden")).toBe("true");
    // 编号不进入可访问名称，链接仍按纯标签命名
    expect(screen.getByRole("link", { name: "主页" })).toBeTruthy();
    expect(screen.getByText("04")).toBeTruthy();
  });
});

describe("formatPath", () => {
  it("renders ~/ for the root path", () => {
    expect(formatPath("/")).toBe("~/");
    expect(formatPath(null)).toBe("~/");
  });

  it("renders the first segment for top-level pages", () => {
    expect(formatPath("/writing")).toBe("~/writing");
  });

  it("collapses nested routes with an ellipsis", () => {
    expect(formatPath("/writing/some-slug")).toBe("~/writing/…");
  });
});
