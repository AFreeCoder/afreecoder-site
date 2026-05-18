import type { WritingFrontmatter } from "@/lib/types";

export type WritingSource = WritingFrontmatter & {
  body: string;
};

export const writingPosts: WritingSource[] = [
  {
    title: "Hello, World",
    date: "2026-04-15",
    slug: "hello-world",
    summary: "个人站点开张的第一篇文章 — 关于为什么开始，以及打算写什么。",
    body: String.raw`这是 AFreeCoder 个人站点的第一篇文章。

## 为什么开这个站

简单说，就是想要一个**真正属于自己**的内容沉淀和展示的地方。

公众号、知乎、X 都是借来的房子；这里才是地基。

## 接下来打算写什么

- AI 工具与 Agent 系统的实战观察
- 独立开发的方法论与具体产品
- 投资理财的长期思考
- 一些不那么"正经"的随笔

---

> 用 Next.js + MDX 搭建，部署在 Cloudflare Workers。源码在 GitHub。`,
  },
];
