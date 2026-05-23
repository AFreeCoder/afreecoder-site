// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NavItem } from "@/lib/site-config";

let currentPath = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
}));

import { SidebarNav } from "./sidebar-nav";

const items: NavItem[] = [
  { label: "关于", href: "/about",   icon: "about" },
  { label: "产品", href: "/products", icon: "products" },
  { label: "文章", href: "/writing",  icon: "writing" },
];

afterEach(() => {
  cleanup();
  currentPath = "/";
});

describe("SidebarNav", () => {
  it("highlights the link whose href matches pathname", () => {
    currentPath = "/products";
    render(<SidebarNav items={items} />);
    const products = screen.getByRole("link", { name: /产品/ });
    expect(products.getAttribute("aria-current")).toBe("page");
    const about = screen.getByRole("link", { name: /关于/ });
    expect(about.getAttribute("aria-current")).toBeNull();
  });

  it("highlights writing parent when on a writing detail route", () => {
    currentPath = "/writing/foo-bar";
    render(<SidebarNav items={items} />);
    const writing = screen.getByRole("link", { name: /文章/ });
    expect(writing.getAttribute("aria-current")).toBe("page");
  });

  it("renders no aria-current when pathname matches nothing", () => {
    currentPath = "/";
    render(<SidebarNav items={items} />);
    for (const item of items) {
      const link = screen.getByRole("link", { name: new RegExp(item.label) });
      expect(link.getAttribute("aria-current")).toBeNull();
    }
  });
});
