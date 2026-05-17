import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    name: "API Pool",
    description: "AI 接口聚合与转发服务，支持多模型统一调用。",
    tags: ["SaaS", "Next.js", "AI"],
    link: "https://example.com/api-pool",
    status: "active",
  },
  {
    name: "Index Watch",
    description: "指数基金估值与定投信号监控工具。",
    tags: ["Finance", "Tool"],
    link: "https://example.com/index-watch",
    status: "active",
  },
];
