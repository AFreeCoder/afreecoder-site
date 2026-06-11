"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/mdx";

type Props = {
  items: readonly TocItem[];
};

export function ArticleToc({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      // 判定线：sticky 导航下方；取最后一个越过判定线的标题
      const line = 96;
      let current = headings[0].id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <aside className="article-toc">
      <nav aria-label="目录">
        <div className="article-toc-label">目录</div>
        <ul className="article-toc-list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`article-toc-link article-toc-link--lv${item.level}${
                  activeId === item.id ? " is-active" : ""
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
