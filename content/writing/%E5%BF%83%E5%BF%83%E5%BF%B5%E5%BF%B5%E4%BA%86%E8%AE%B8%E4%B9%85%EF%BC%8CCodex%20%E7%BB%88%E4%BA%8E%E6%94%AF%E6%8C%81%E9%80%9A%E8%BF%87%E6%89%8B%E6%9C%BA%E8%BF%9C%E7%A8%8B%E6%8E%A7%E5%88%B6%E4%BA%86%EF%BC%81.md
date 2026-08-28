---
title: 心心念念了许久，Codex 终于支持通过手机远程控制了！
date: 2026-07-12
slug: %E5%BF%83%E5%BF%83%E5%BF%B5%E5%BF%B5%E4%BA%86%E8%AE%B8%E4%B9%85%EF%BC%8CCodex%20%E7%BB%88%E4%BA%8E%E6%94%AF%E6%8C%81%E9%80%9A%E8%BF%87%E6%89%8B%E6%9C%BA%E8%BF%9C%E7%A8%8B%E6%8E%A7%E5%88%B6%E4%BA%86%EF%BC%81
original_url: https://afreecoder.dev/writing/%E5%BF%83%E5%BF%83%E5%BF%B5%E5%BF%B5%E4%BA%86%E8%AE%B8%E4%B9%85%EF%BC%8CCodex%20%E7%BB%88%E4%BA%8E%E6%94%AF%E6%8C%81%E9%80%9A%E8%BF%87%E6%89%8B%E6%9C%BA%E8%BF%9C%E7%A8%8B%E6%8E%A7%E5%88%B6%E4%BA%86%EF%BC%81
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
凌晨 4 点，OpenAI 发了一条帖子，正式宣布 Codex 支持通过手机远程控制了。

帖子第一句话 “You've been asking for this one...”——“你们一直在等的这个功能来了...”。

真的是等了好久，昨天我还在搜 Codex 最新的远程控制方案来着😂

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/9bf88dddd5dede0a73b639aca472daeb2d3be3e72d98b5c2ba1ac5db314c95b7.jpg)

一句话概括就是：**从今天开始，你可以在手机上的 ChatGPT 中，远程控制电脑上的 Codex App 了**。

Codex 终于变成完成体了。

**注：**
1. *需要使用官方 ChatGPT / Codex 登录方式，不支持第三方 API 接入。*
2. *桌面端目前暂时只支持 macOS。*

## 开启方式

步骤很简单：

1. 手机上 ChatGPT 升级到最新版
2. 电脑上 Codex 更新到最新版

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/91d13767de4c2d083d918c4c285d5d9e5bb25be461a811784215bc9ba7fcb108.png)

这一步有可能需要授权登录。登录完就会查找其他已经登录的桌面端 Codex 并自动建立链接。

另外，也可以在桌面端 Codex App 中点击 **设置 Codex 移动版**，然后在 ChatGPT 中授权就行。

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/b6f8f433dd93824584b40049a489d99059aff7c00568b0dc377606f1079cc96b.png)

看了一下其他人发的，具体步骤可能有一些差异，实际操作过程中按提示说明就行。

连接成功后，就能在手机端看到项目列表了。

不过我似乎遇到了一些 bug，有一些项目没有在手机这边显示，问了 Codex，说是一些历史线程元数据缺少远程同步标记、或者预览版索引没有回填某些旧会话。同一个项目创建一个新线程就可以了。

## 初步体验

和 Claude Code 的远程控制方案类似，手机上只是消息中转，最终所有的任务执行、文件操作、工具调用都是由电脑上的 Codex 完成。

使用了一段时间，我感觉体验比 Happy Code 和 Claude Code 要好很多。

早期我用 Happy Code 远程控制 Codex 和 Claude Code，开始很惊艳，但是后来发现还是有很多使用上不便，尤其是权限设置，很不方便。

后来 Claude Code 发布了远程控制功能，但是 Claude 的风控策略你懂的，每次在手机端用，都如履薄冰。并且小 bug 也很多，经常出现无法访问的情况。

Codex 就不一样了。

一是不担心封号，心理上没有负担；二是体验很丝滑。打开之后直接能看到项目和线程，随便点开一个，都能继续干活，也能新建线程。

这篇短文写完后，正好有事要出门，我就直接在手机上让 Codex 帮我审了一遍：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/a3ce721ea63f66ccf8a3f53ba07e178efc56aa519ab8de3723678baec73eca79.jpg)

这才是我心目中 Codex 理想的样子。

> 如果你有更多的问题想咨询，公众号后台发送 **Codex** 即可。
