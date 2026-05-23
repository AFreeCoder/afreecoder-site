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
  /** 页脚（品牌名 / slogan / 版权） */
  colophon: {
    brand: string;
    slogan: string;
    /** 支持 {{sinceYear}} 占位符 */
    copyright: string;
  };
  /** AboutSection 末尾的签名行；空字符串则不渲染 */
  signature: string;
};

export const annualDecoration: AnnualDecoration = {
  navLabels: {
    home: "索引",
    about: "关于",
    products: "产品·服务",
    writing: "文章",
  },
  pageHeads: {
    home: {
      num: "I · 索引",
      title: "一个追求自由的 Coder 的痕迹。",
      titleAccent: "追求自由",
      caption: "自 {{since}} 起记录至今。",
    },
    about: {
      num: "",
      title: "我，A-Free-Coder。",
      titleAccent: "A-Free-Coder",
      caption: "一个追求自由的 Coder 的自白。",
    },
    products: {
      num: "",
      title: "进行中的产品·服务",
      caption: "公开地址、长期可访问。",
    },
    writing: {
      num: "",
      title: "记录 · {{postCount}} 篇",
      titleAccent: "{{postCount}}",
      caption: "按年分卷，年内倒序。",
    },
  },
  chapters: {
    about:    { num: "", title: "关于",                  metaHref: "/about", metaLabel: "全部 →" },
    products: { num: "", title: "产品 / 业务" },
    writing:  { num: "", title: "记录 · {{postCount}} 篇", titleAccent: "{{postCount}}" },
  },
  colophon: {
    brand:     "AFreeCoder",
    slogan:    "一个追求自由的 Coder",
    copyright: "© {{sinceYear}}—当下 · AFreeCoder",
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
