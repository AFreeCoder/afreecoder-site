import type { ReactNode } from "react";

export type AnnualDecoration = {
  /** 顶部 masthead 的中文 nav 标签 */
  navLabels: { home: string; about: string; products: string; writing: string };
  /** 4 页通用的 PageHead —— 每页一行章号 + 标题 + 一句 caption */
  pageHeads: {
    home:     { num: string; title: string; titleAccent?: string; caption: string };
    about:    { num: string; title: string; titleAccent?: string; caption: string };
    products: { num: string; title: string; titleAccent?: string; caption: string };
    writing:  { num: string; title: string; titleAccent?: string; caption: string };
  };
  /** 首页内嵌的 ChapterHead（关于 / 产品 / 文章 三段） */
  chapters: {
    about:    { num: string; title: string; titleAccent?: string; metaHref: string; metaLabel: string };
    products: { num: string; title: string; titleAccent?: string };
    writing:  { num: string; title: string; titleAccent?: string };
  };
  /** 页脚两列文案（联络 / 声明） */
  colophon: {
    contactLine: string;
    disclaimerLine: string;
  };
  /** AboutSection 末尾的签名行；空字符串则不渲染 */
  signature: string;
};

export const annualDecoration: AnnualDecoration = {
  navLabels: {
    home: "索引",
    about: "关于",
    products: "在线",
    writing: "实证",
  },
  pageHeads: {
    home: {
      num: "I · 索引",
      title: "一个追求自由的 Coder 的痕迹。",
      titleAccent: "追求自由",
      caption: "自 {{since}} 起记录至今。",
    },
    about: {
      num: "II · 关于",
      title: "我，A-Free-Coder。",
      titleAccent: "A-Free-Coder",
      caption: "一个追求自由的 Coder 的自白。",
    },
    products: {
      num: "III · 在线",
      title: "仍在运转的 {{productLiveCount}} 件事。",
      caption: "公开地址、长期可访问。",
    },
    writing: {
      num: "IV · 实证",
      title: "{{postCount}} 篇连续记录。",
      caption: "按年分卷，年内倒序。",
    },
  },
  chapters: {
    about:    { num: "关于",     title: "我，A-Free-Coder", titleAccent: "A-Free-Coder", metaHref: "/about", metaLabel: "→ 完整自白" },
    products: { num: "在线运行", title: "仍在运转的四件事", titleAccent: "运转" },
    writing:  { num: "实证目录", title: "已记录的 {{postCount}} 篇", titleAccent: "{{postCount}} 篇" },
  },
  colophon: {
    contactLine:    "GitHub · AFreeCoder · hello@afreecoder.dev",
    disclaimerLine: "自 {{since}} 持续撰写。© {{sinceYear}}—当下 · A-Free-Coder",
  },
  signature: "— A.F.C.",
};

/** 给字符串里 accent 子串包 <em> */
export function renderWithAccent(text: string, accent?: string): ReactNode {
  if (!accent || !text.includes(accent)) return text;
  const parts = text.split(accent);
  const nodes: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0) nodes.push(<em key={`em-${i}`}>{accent}</em>);
    nodes.push(<span key={`s-${i}`}>{p}</span>);
  });
  return nodes;
}
