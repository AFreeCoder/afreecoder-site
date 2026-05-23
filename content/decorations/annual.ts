import type { Stats } from "@/lib/site-stats";

export type AnnualDecoration = {
  masthead: {
    volume: string | ((s: Stats) => string);
    series: string;
    left: string;
    right: string;
    centerSegments: readonly [string, string, string];
    establishedYear: number;
  };
  navLabels: { home: string; about: string; products: string; writing: string; colophon: string };
  /** 首页（带朱砂印章）的章节扉页 */
  frontispieceHome: {
    roman: string;
    title: string;
    titleAccent?: string;
    caption: string;
    stamp: {
      primary: readonly [string, string];
      arcTop: string;
      arcBottom: string;
    };
  };
  /** about/products/writing 三页扉页（无印章） */
  frontispieceAbout:    { roman: string; title: string; titleAccent?: string; caption: string };
  frontispieceProducts: { roman: string; title: string; titleAccent?: string; caption: string };
  frontispieceWriting:  { roman: string; title: string; titleAccent?: string; caption: string };
  /** 首页内嵌的章节标题 */
  chapters: {
    about:    { num: string; title: string; titleAccent?: string; metaHref: string; metaLabel: string };
    products: { num: string; title: string; titleAccent?: string };
    writing:  { num: string; title: string; titleAccent?: string };
  };
  colophon: {
    fontsLine: string;
    contactLine: string;
    subscribeLine: string;
    disclaimerLine: string;
  };
  signature?: string;
};

export const annualDecoration: AnnualDecoration = {
  masthead: {
    volume: (s) => s.volRoman,
    series: "Series",
    left:  "A Coder · In Pursuit of Freedom",
    right: "自由痕迹 · 年鉴",
    centerSegments: ["A", "F", "C"],
    establishedYear: 2019,
  },
  navLabels: {
    home: "索引",
    about: "关于",
    products: "在线",
    writing: "实证",
    colophon: "奥版",
  },
  frontispieceHome: {
    roman: "I.",
    title: "这里是一个追求自由的 Coder 的痕迹。",
    titleAccent: "追求自由",
    caption:
      "— 自 {{since}} 起，连续记录 {{postCount}} 篇实证；同时把 {{productLiveCount}} 件还在运行的产品摆在公众可访问的地址下，作为长期可验证的证据。",
    stamp: {
      primary:    ["实", "证"],
      arcTop:     "A · FREE · CODER",
      arcBottom:  "EST · MMXIX",
    },
  },
  frontispieceAbout: {
    roman: "II.",
    title: "我，A-Free-Coder。",
    titleAccent: "A-Free-Coder",
    caption: "— 一个追求自由的 Coder 的自白。",
  },
  frontispieceProducts: {
    roman: "III.",
    title: "仍在运转的 {{productLiveCount}} 件事。",
    caption: "— 当前 {{productLiveCount}} 件运行中，{{productArchivedCount}} 件已归档。",
  },
  frontispieceWriting: {
    roman: "IV.",
    title: "已记录的 {{postCount}} 篇痕迹。",
    caption: "— 自 {{since}} 起按年成卷，倒序排列。",
  },
  chapters: {
    about:    { num: "— Chapter Two · 关于",             title: "我，A-Free-Coder", titleAccent: "A-Free-Coder", metaHref: "/about", metaLabel: "→ 完整自白" },
    products: { num: "— Chapter Three · 在线运行的产品", title: "仍在运转的四件事", titleAccent: "运转" },
    writing:  { num: "— Chapter Four · 实证目录",         title: "已记录的 {{postCount}} 篇痕迹",   titleAccent: "{{postCount}} 篇" },
  },
  colophon: {
    fontsLine:     "排版于 {{sinceYear}}—当下 · 主体字体 Fraunces / Newsreader / JetBrains Mono · 纸色仿宣纸。",
    contactLine:   "GitHub · AFreeCoder · hello@afreecoder.dev",
    subscribeLine: "RSS 全文 · 站点地图",
    disclaimerLine:"内容自 {{since}} 持续撰写。一切实证不构成投资建议。© {{sinceYear}} — 当下 · A-Free-Coder",
  },
  signature: "— A.F.C.",
};
