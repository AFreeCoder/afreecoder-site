import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    name: "APIPool",
    description: "AI API 聚合与转发服务，面向多模型统一调用和运营排查。",
    role: "SaaS / API 网关",
    phase: "线上运行 · 持续迭代",
    highlight: "把多模型 API、账户池和请求排查收束成一套可维护的服务入口。",
    tags: ["API", "AI", "SaaS"],
    link: "https://apipool.dev",
    status: "active",
  },
  {
    name: "GPT101",
    description: "围绕 AI 工具、账号和使用流程搭建的服务入口。",
    role: "AI 服务",
    phase: "线上运行 · 稳定运营",
    highlight: "把 AI 工具的购买、使用和售后流程整理成更稳定的自助体验。",
    tags: ["AI", "服务", "运营"],
    link: "https://gpt101.org",
    status: "active",
  },
  {
    name: "RemoveAIWatermark",
    description: "AI 图片水印处理工具。",
    role: "图片工具",
    phase: "公开工具",
    highlight: "面向高频图片处理需求，提供更直接的在线工具入口。",
    tags: ["图片", "AI", "工具"],
    link: "https://removeaiwatermark.org",
    status: "active",
  },
  {
    name: "WigglyPaint",
    description: "轻量创意绘图工具。",
    role: "创意工具",
    phase: "公开工具",
    highlight: "把随手画、快速表达和轻量创作放在一个更轻松的产品形态里。",
    tags: ["画布", "创作", "工具"],
    link: "https://wigglypaint.co",
    status: "active",
  },
];
