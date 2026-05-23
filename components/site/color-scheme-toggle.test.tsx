// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

import { ColorSchemeToggle } from "./color-scheme-toggle";

beforeEach(() => {
  refresh.mockClear();
  document.cookie = "color-scheme=; path=/; max-age=0";
  document.documentElement.removeAttribute("data-color-scheme");
});

afterEach(() => {
  cleanup();
});

describe("ColorSchemeToggle", () => {
  it("starts with the supplied scheme and shows the inverse-action label", () => {
    render(<ColorSchemeToggle current="dark" />);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-label")).toBe("切换到明色");
  });

  it("clicking toggles cookie + html attribute + triggers router refresh", () => {
    render(<ColorSchemeToggle current="dark" />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(document.cookie).toContain("color-scheme=light");
    expect(document.documentElement.getAttribute("data-color-scheme")).toBe("light");
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(btn.getAttribute("aria-label")).toBe("切换到暗色");
  });

  it("toggles back to dark on a second click", () => {
    render(<ColorSchemeToggle current="light" />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(document.cookie).toContain("color-scheme=dark");
    expect(document.documentElement.getAttribute("data-color-scheme")).toBe("dark");
  });
});
