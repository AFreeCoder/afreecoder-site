---
title: 从 0 到上线：别急着写代码，先去 GitHub 找轮子
date: 2026-09-10
slug: %E4%BB%8E%200%20%E5%88%B0%E4%B8%8A%E7%BA%BF%EF%BC%9A%E5%88%AB%E6%80%A5%E7%9D%80%E5%86%99%E4%BB%A3%E7%A0%81%EF%BC%8C%E5%85%88%E5%8E%BB%20GitHub%20%E6%89%BE%E8%BD%AE%E5%AD%90
original_url: https://afreecoder.dev/writing/%E4%BB%8E%200%20%E5%88%B0%E4%B8%8A%E7%BA%BF%EF%BC%9A%E5%88%AB%E6%80%A5%E7%9D%80%E5%86%99%E4%BB%A3%E7%A0%81%EF%BC%8C%E5%85%88%E5%8E%BB%20GitHub%20%E6%89%BE%E8%BD%AE%E5%AD%90
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/e5e28fabf63d3faae38f4b50cee32f5ac88ad3a952780fc1624699055a79bf3f.png)

在上一篇文章[**《从 0 到上线：需求怎么找？》**](https://mp.weixin.qq.com/s/ZPh4vewciJB4q1ryBhRLsg)中，我介绍了几种挖掘需求的方法，比如从搜索中挖掘需求、从排行榜中挖掘需求、从日常工作中挖掘需求等。

有了需求，就可以借助 AI 开始快速开发产品了。那是不是就把需求扔给 AI，让它从 0 开始建一个文件夹，新建第一个文件，写第一行代码呢？

当然不是。如果这么做，最后大概只能得到一个 bug 巨多的玩具，然后你会不停地抱怨“某某 AI 太垃圾了，做出来的东西是一坨 xx！”

实际上很少有项目是真正从 0 开始的，大多都是站在 GitHub 这个巨人的肩膀上。借鉴 GitHub 上的优秀项目，可以轻松做出一个 60 分甚至 80 分的产品。

我的一个经验是，做任何一个产品之前，先去 GitHub 上找同类项目调研，参考它们的产品方案和技术方案，最终形成需求文档和设计文档。

> GitHub 是全球最大的在线源代码托管和协作开发平台，上面有无数优秀的开源项目。你能想到的产品，上面基本都有；想不到的，上面也有。

## 实战演示

在[《从 0 到上线：帮你把第一个产品发上线》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5NjU0MzU1Mg==&action=getalbum&album_id=4679431778296135687&scene=126&sessionid=#wechat_redirect)这个系列中，我打算选 Markdown 文章排版助手作为演示产品。

这个需求来自我自己。做自媒体，一篇文章写完之后要发布到多个平台，中间需要不停地调整排版、上传图片，十分耗时。如果有这样一个工具，就能节省很多精力（其实已经有很多了，只是都用得不顺手而已）。

### 借鉴 GitHub 上的同类产品，完善产品需求

这个需求本身很简单，但是细节比较多，比如需要能自定义排版、自定义开头和结尾的样式，支持自定义图床，适配公众号、知乎、博客等平台，还要能一键发布到草稿箱。很多工具或多或少都具备这些功能，但是都不尽如人意。

借助 GitHub，讨论需求的过程如下：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/2ecb2af23ebd9eabc8a937f80bd322c8dc1e714e73efe75b78659abc47c7946c.png)

下面是 Codex 找到的 7 个相关项目：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/a73ac40c189527f922276ea6dfe4734fc727f6d3262bb9fe3b7cb348625e66de.png)

结合这些竞品，Codex 帮我写了初版的功能清单。有了这个基础后，再和 Codex 逐项确认功能细节，并划定首版范围。

功能清单确认完后，就可以直接让 Codex 基于它写产品需求文档（PRD）了。

以上所有讨论内容都自动记录在：https://github.com/AFreeCoder/jinzhang-md-publisher/issues/1 ，感兴趣的朋友可以看一下。

*（如果好奇这些内容是如何被自动记录的，可以看之前写的文章[我用 Codex 一天提交了 80 次代码](https://mp.weixin.qq.com/s/0STWgRqWht8Hwnj4R3zWIg)）*

### 借鉴 GitHub 上的同类产品，完善方案设计

方案设计这一步也是一样。

这个需求的功能比较明确，但是技术层面要注意的细节很多。举个例子，排版适配公众号这件事，需求很明确，但实际效果千差万别，存在图片粘不进去、表格样式错乱、宽表放不下、序号错位等一堆兼容问题。

如果直接把产品需求文档扔给 AI，第一版大概率没法用。AI 并不完全知道这类产品开发的过程中有什么坑，各个平台有什么限制。AI 确实可以联网检索，但是网上的资料浩如烟海，在没有明确方向的情况下只能获取一些表层信息。

在这个环节，让 AI 重点参考前面挖掘出来的几个同类产品，再做方案设计，可行性、完成度就会高很多。

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/e950e43a4ad57d5b3bb23d220b01a7a40d990faa10dd76837a7b7e940fcc21f7.png)

当然，初版方案出来后，还是要和 AI 进行充分的讨论，才能最终定稿。

相关讨论过程见：https://github.com/AFreeCoder/jinzhang-md-publisher/issues/3

## 关于 GitHub 的一点看法

早期大家眼里的 GitHub 就是一个代码托管平台，辅以一些持续集成、持续部署的能力，所以它主要在程序员群体中流行。

但是我发现在 AI 时代，GitHub 特别适合当作和 AI 搭配的项目管理工具。它不仅有代码托管、任务记录、任务管理、知识库等功能，而且主流的 AI Agent 工具都集成了操作 GitHub 的能力。

举个例子，上面这个演示项目，代码库是这么建的：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/c1d5e2e4145974eead490b00f7bc0c7c30e971cd05d2d31c82f79b3318e939e1.png)

整个过程我没有手动操作一步，仓库就建好了。

还有 GitHub 的 issue，原本是指用户提出的问题，现在可以用作 AI 任务的记录载体。前面的截图也演示了，每次在 Codex 中开启一个任务，都会自动记录这个任务的讨论过程、方案以及结论。

这样做的好处十分明显，它可以作为多 Agent 协作的公共上下文，让多 Agent 基于同一个背景共同决策。在上面的 issue 链接中，可以看到有的讨论是 Codex 提出的，有的是 Claude Code 提出的。如果不借助 issue，本地两个 Agent 之间要通信还是比较麻烦的。

还有就是项目管理，GitHub 的 Project 集成了任务看板、甘特图等常用功能（见下图示例）。

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/97d3e12d4c813332f36d449edf6be59e8c0164f62eb680ccd0bd32b0b22f1e40.png)

所以如果你打算开始做第一个产品，我强烈建议用 GitHub 来管理。

## 最后

在传统的软件开发过程中，产品需求阶段通常要投入大量人力，大到整个产品的定位、功能架构、交互逻辑，小到配色、图片素材、按钮大小、用圆角还是直角，都要经过无数轮讨论和修改才能定下来。

对于个人开发者而言，在经验还不够的情况下，先借鉴优秀的项目，快速做到 70 分，再在这个基础上做微创新，我认为是一条务实而高效的路径。

希望这篇文章对你有所帮助。

**往期文章**

[《从 0 到上线：帮你把第一个产品发上线》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5NjU0MzU1Mg==&action=getalbum&album_id=4679431778296135687&scene=126&sessionid=#wechat_redirect)
