"use client";

import { useEffect } from "react";

/**
 * 监听滚动，把 scrollY * 0.35 写到 :root --year-offset CSS var。
 * globals.css 中 body::before/after 的年份 SVG 背景 y 位置用 calc 消费该 var，
 * 实现"年份装饰随页面滚动反向偏移"的翻阅感。
 *
 * 用 requestAnimationFrame 合并连续 scroll 事件，避免高频滚动时频繁触发
 * :root style 重计算导致两个 fixed 伪元素（含 SVG data-URI + repeating-
 * linear-gradient）反复合成抖动。
 */
export function ScrollYearTrack() {
  useEffect(() => {
    let rafId = 0;
    const root = document.documentElement;

    function apply() {
      rafId = 0;
      root.style.setProperty("--year-offset", `${window.scrollY * 0.35}px`);
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(apply);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
  return null;
}
