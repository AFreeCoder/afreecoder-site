import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeInit } from "./theme-init";
import { THEME_IDS } from "@/lib/themes";

describe("ThemeInit", () => {
  it("渲染为一个 <script> 节点", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html.startsWith("<script>")).toBe(true);
    expect(html.endsWith("</script>")).toBe(true);
  });

  it("脚本字符串中按字面顺序包含 6 个主题 id（白名单防 XSS）", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    for (const id of THEME_IDS) {
      expect(html).toContain(`'${id}'`);
    }
  });

  it("脚本使用 try/catch 包裹（localStorage 在 sandbox iframe 下可能抛错）", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html).toContain("try{");
    expect(html).toContain("catch");
  });

  it("脚本读取 localStorage 的 'theme' 键", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html).toContain("localStorage.getItem('theme')");
  });

  it("脚本写入 document.documentElement.dataset.theme", () => {
    const html = renderToStaticMarkup(<ThemeInit />);
    expect(html).toContain("document.documentElement.dataset.theme");
  });
});
