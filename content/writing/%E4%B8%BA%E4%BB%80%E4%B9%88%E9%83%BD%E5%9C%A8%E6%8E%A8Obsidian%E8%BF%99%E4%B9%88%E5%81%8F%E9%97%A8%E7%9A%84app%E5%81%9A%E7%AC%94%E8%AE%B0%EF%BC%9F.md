---
title: 为什么都在推Obsidian这么偏门的app做笔记？
date: 2026-05-13
slug: %E4%B8%BA%E4%BB%80%E4%B9%88%E9%83%BD%E5%9C%A8%E6%8E%A8Obsidian%E8%BF%99%E4%B9%88%E5%81%8F%E9%97%A8%E7%9A%84app%E5%81%9A%E7%AC%94%E8%AE%B0%EF%BC%9F
original_url: https://afreecoder.dev/writing/%E4%B8%BA%E4%BB%80%E4%B9%88%E9%83%BD%E5%9C%A8%E6%8E%A8Obsidian%E8%BF%99%E4%B9%88%E5%81%8F%E9%97%A8%E7%9A%84app%E5%81%9A%E7%AC%94%E8%AE%B0%EF%BC%9F
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
问题地址：https://www.zhihu.com/question/2001604730540028239

> ob字体、大小、颜色都要靠代码和插件才能实现，为什么大行其道，网上见笔记，就说OB多好，真的那么好吗？

我是最近才开始使用 Obsidian 的，理由如下：

**AI 时代，文字记录最好的载体是 Markdown 文本，基于原生 Markdown 笔记软件，做的最好的就是 Obsidian。**

最近大火的 AI Agent 助手 openclaw（原 clawbot），最大显著的一个特色就是持久化记忆，它是怎么实现的呢？

就是依靠本地 Markdown 文本，记录每日活动，不断总结。

下面是之前我和 ChatGPT 讨论个人知识管理体系的时候，ChatGPT 给出的笔记软件建议，就是 Obsidian：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/8f40b7bffbca33d00c1ff3d4894a808086f1911383aca9c64c11fbbf1b64c164.png)

## 基于 Obsidian，我实现了哪些自动化？

### 1. 一键随时记录每日工作内容

当前，我的工作主力工具是 Codex 和 Claude Code，每天都会和 Codex 和 Claude Code 进行大量的沟通，完整地记录沟通过程，对日后的复盘是极其必要的，因此我用 Codex 创建了一个 Daily skill，随时随地能汇总：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/3abc22c2f4fbc4dd0f8399202529ec50052b9b4d37983d2ca8cb7104d83a3545.png)

### 2. 一键归档项目看板，并生成新的一周计划

对于项目管理，我在 Obsidian 中建立了一个项目文件夹，用一个 Dashboard 文档记录本周目标和关键任务拆分，并在每周一进行复盘归档上周看板，并按模板生成新的一周看板：

> 输入命令：/dashboard-renew

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/5112ff8bceafe06dab163280c57fac1de2ac39693df6403c0059b565895cd929.png)

### 3. 一键提交笔记变更，防止被改乱

Obsidian 基于原生 Markdown 文本，特别适合用 git 来进行版本管理。用 git 进行版本管理有很多好处，一是能记录一段时间内笔记变更内容，二是如果文档万一被 Codex 等工具改坏，能很方便地进行版本回退：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/96aab8c0377be72e26fbc00d518231f1847ea973cb9c83bce4d41bda5024ebb5.png)

## 结尾

目前我有一个初步的想法，就是将我工作的所有痕迹都沉淀到 Obsidian 中，不管是用日记，还是用项目文档都行。

然后借助 Codex 、Claude Code 等 Agent 对这些记录进行分析和挖掘，辅助分析、决策和内容创作。

就目前对我而言，Obsidian 就是实现这个思路最佳的载体。
