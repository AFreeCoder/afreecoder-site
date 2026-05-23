// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NavItem } from "@/lib/site-config";

let currentPath = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
}));

import { TopNav } from "./top-nav";

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
});
