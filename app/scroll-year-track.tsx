"use client";

import { useEffect } from "react";

/**
 * 监听滚动，把 scrollY * 0.35 写到 :root --year-offset CSS var。
 * globals.css 中 body::before/after 的年份 SVG 背景 y 位置用 calc 消费该 var，
 * 实现"年份装饰随页面滚动反向偏移"的翻阅感。
 */
export function ScrollYearTrack() {
  useEffect(() => {
    function update() {
      document.documentElement.style.setProperty(
        "--year-offset",
        `${window.scrollY * 0.35}px`,
      );
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return null;
}
