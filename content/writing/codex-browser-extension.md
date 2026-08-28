---
title: Codex 浏览器插件发布：普通用户也能轻松执行浏览器自动化任务了
date: 2026-05-13
slug: codex-browser-extension
original_url: https://afreecoder.dev/writing/codex-browser-extension
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
5 月 7 日，Codex 发布了 Chrome 浏览器插件，插件名也叫 Codex。

通过这个插件，Codex 可以和你共用一个浏览器，在后台并行打开多个标签页，**重点是不影响你当前的工作**。

这不算特别新的功能，但使用体验很好。**对普通用户的日常办公、运营后台操作、数据统计、竞品信息批量收集整理等场景，十分实用**。

## 安装和使用步骤

**安装**

1. Codex 更新到最新版
2. 在 Codex 左侧的插件商店里搜索 Chrome，点击安装

也可以直接在 Chrome 网上应用店中搜索 Codex，点击安装。

**使用方式**

用法很简单，在 Codex 中输入 `@chrome` 即可。

比如我让 Codex 帮我统计某个网站订单信息：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/56265beac66d2c83c0ce45fff455f687acc98c4683ed588be04aeb05bd56b2c1.png)

这个过程中，我一直在浏览其他网站、处理别的事情。几乎无感，Codex 就把活干好了。

任务不复杂，体验十分丝滑。

## 几种浏览器控制方案对比

在这个插件出来之前，Codex 也有几种操作浏览器的方案，主要是下面三类：

1. MCP：Chrome DevTools、Playwright 等
2. in-app browser：Codex 内置浏览器
3. Computer Use 能力

MCP 工具有不少，功能各有侧重，但很多更偏开发场景，对普通用户不是很友好。而且浏览器操作通常发生在前台，会干扰用户正常使用。

in-app browser 是 Codex 前段时间新上的功能，相当于在 Codex 中内嵌一个浏览器。在一些开发场景下，做完整的交互测试很方便，但不能复用用户在各种网站的登录状态。

Computer Use 也是 Codex 前段时间新上的能力。它的路径更像是“屏幕截图 -> 图片识别 -> 推断 -> 点坐标”。简单任务还行，但遇到浏览器里的复杂场景，就不够稳定。

综合对比下来，新上的浏览器插件更适合一般办公场景。

## 最后

越来越喜欢用 Codex 了。

我同时开了 Claude Max 会员和 ChatGPT Pro 会员，但是近一周基本都在用 Codex，Claude Code 没有打开几次，已经在考虑下个月不续了。

认真起来的 OpenAI，即将夺回曾经的王座。

API 站：apipool.dev，支持 GPT-5.5 和 Codex。
