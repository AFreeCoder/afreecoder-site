export type AboutMilestone = {
  label: string;
  title: string;
  description: string;
  /** 可选的 mono 小字补充（由页面动态注入，如写作统计）。 */
  meta?: string;
  /** 标记「现在」节点，时间线上用青色节点呼应站点状态色。 */
  now?: boolean;
};

export const aboutLead: string[] = [
  "我是 AFreeCoder，A-Free-Coder，寓意是一个追求自由的 Coder。",
  "曾经是一名程序员，呆过互联网大厂，也呆过国企；研究过投资理财，现在关注 AI。目前是一名自由职业者（俗称灵活就业）。",
  "这里是我追求自由的痕迹。",
];

export const aboutMilestones: AboutMilestone[] = [
  {
    label: "起点",
    title: "程序员",
    description: "呆过互联网大厂，也呆过国企。",
  },
  {
    label: "探索",
    title: "投资理财研究",
    description: "系统研究投资理财，用「财务自由实证」等系列记录实践与思考。",
  },
  {
    label: "现在",
    title: "自由职业 · 独立开发",
    description: "关注 AI 产品与 Agent 工具，把想法做成可用的产品。",
    now: true,
  },
];

export const aboutFocus: string[] = [
  "AI 产品与 Agent 工具",
  "独立产品构建",
  "投资理财与自由职业记录",
];
