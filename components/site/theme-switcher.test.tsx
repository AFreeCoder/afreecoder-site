// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { ThemeSwitcher } from "./theme-switcher";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

beforeEach(() => {
  refresh.mockReset();
  document.cookie = "theme=; max-age=0; path=/;";
  cleanup();
});

describe("ThemeSwitcher", () => {
  it("opens menu showing 4 items", () => {
    const { getByLabelText, getByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    expect(getByText("年鉴 Annual")).toBeTruthy();
    expect(getByText("工坊 Workshop")).toBeTruthy();
    expect(getByText("夜灯 Nocturne")).toBeTruthy();
    expect(getByText("电报 Telegraph")).toBeTruthy();
  });

  it("unavailable themes show preview badge and don't trigger refresh", () => {
    const { getByLabelText, getByText, queryAllByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    const badges = queryAllByText("预览");
    expect(badges.length).toBe(3); // workshop / nocturne / telegraph
    fireEvent.click(getByText("工坊 Workshop"));
    expect(refresh).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("theme=workshop");
  });

  it("clicking current theme just closes menu", () => {
    const { getByLabelText, getByText, queryByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    fireEvent.click(getByText("年鉴 Annual"));
    expect(refresh).not.toHaveBeenCalled();
    expect(queryByText("工坊 Workshop")).toBeNull();
  });

  it("Esc closes menu", () => {
    const { getByLabelText, queryByText } = render(<ThemeSwitcher current="annual" />);
    fireEvent.click(getByLabelText("切换主题"));
    expect(queryByText("年鉴 Annual")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByText("年鉴 Annual")).toBeNull();
  });

  it("button aria-expanded reflects open state", () => {
    const { getByLabelText } = render(<ThemeSwitcher current="annual" />);
    const btn = getByLabelText("切换主题");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});
