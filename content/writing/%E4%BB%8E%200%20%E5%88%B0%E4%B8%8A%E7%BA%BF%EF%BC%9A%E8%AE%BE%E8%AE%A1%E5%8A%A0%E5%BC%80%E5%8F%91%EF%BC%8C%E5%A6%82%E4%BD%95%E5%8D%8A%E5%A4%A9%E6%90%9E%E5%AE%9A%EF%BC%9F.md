---
title: 从 0 到上线：设计加开发，如何半天搞定？
date: 2026-09-13
slug: %E4%BB%8E%200%20%E5%88%B0%E4%B8%8A%E7%BA%BF%EF%BC%9A%E8%AE%BE%E8%AE%A1%E5%8A%A0%E5%BC%80%E5%8F%91%EF%BC%8C%E5%A6%82%E4%BD%95%E5%8D%8A%E5%A4%A9%E6%90%9E%E5%AE%9A%EF%BC%9F
original_url: https://afreecoder.dev/writing/%E4%BB%8E%200%20%E5%88%B0%E4%B8%8A%E7%BA%BF%EF%BC%9A%E8%AE%BE%E8%AE%A1%E5%8A%A0%E5%BC%80%E5%8F%91%EF%BC%8C%E5%A6%82%E4%BD%95%E5%8D%8A%E5%A4%A9%E6%90%9E%E5%AE%9A%EF%BC%9F
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/551dbf29f860410770b382190f91dda91641abbdb13d502f234a566543f76039.png)

> 本篇是系列文章[《从 0 到 1：帮你把第一个产品发上线》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5NjU0MzU1Mg==&action=getalbum&album_id=4679431778296135687&scene=126&sessionid=#wechat_redirect)的第 3 篇，主要介绍有了产品需求文档和方案设计文档后，如何快速完成初版的开发。

前一篇文章[《从 0 到上线：别急着写代码，先去 GitHub 找轮子》](https://mp.weixin.qq.com/s/WQZaLRA0g8L06I09KVJb-w)介绍了有想法之后，如何站在巨人的肩膀上，快速完成一个及格线以上的产品需求文档和方案设计文档。

接下来介绍有了产品需求文档和方案设计文档后，如何借助 Codex 快速完成产品初版的开发，并在本地预览。

## 第一步，先做产品原型设计

前面出的方案只是技术方案，如果就这么让 Codex 进行开发的话，它会自由发挥，最后效果全看运气，何况早期 GPT 系列模型的审美公认一般。

在 Codex 中进行产品原型设计一般有两个方法。

第一个方法是使用 **Product Design** 插件（Codex 官方插件），这个插件的执行流程是先通过生图能力生成几版方案，然后将图片转成 HTML/React 的代码原型。

第二个方法是使用 **Figma** 这类专业设计工具的插件。Figma 是专业的设计工具，通过 Figma 插件可以先生成设计文件，确认后再将设计文件转成代码。

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/01f78c4d56331503e4f0086c06701c865fb0bdadc988de7f26ea371139b57447.png)

对于中小型的简单项目，直接用 Product Design 这种思路就可以。

不过在 Markdown 排版发布助手这个工具里，上面两种方法我都没有采用。因为大家都在说 GPT-6 Astra 的审美能力大幅提升，就让它一步到位直接出了 HTML 可交互原型。第一版就很惊艳，大大出乎我的意料。

提示词相当简单：

```
@dev-flow 设计稿制作：目前技术方案已经定稿：https://github.com/AFreeCoder/md-publisher/issues/5，在开始开发前，先根据这个技术方案出一版设计稿看看
```

设计稿效果如下：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/954a1912b68d775704a8d61652b1ca1181c2f3c25b25d4e008aaf8a1cdae6333.png)

Codex 说这是**新中式极简风格**，但我的提示词没有任何关于设计风格的描述，最终设计成这个样子，产品名**锦章**应该起了很大作用。

对，**锦章（Jinzhang）** 就是这个产品的正式名字。

## 第二步，使用目标模式一步到位完成开发

有了产品交互原型后，就可以使用 Codex 的目标模式完成开发了。

> 目标模式是你告诉 Codex 最终要做到什么，而不是每一步怎么做；它会围绕这个目标持续执行、检查和修正，直到达到完成条件。
> 普通模式是“做这个任务”，目标模式是“把这件事做到这个结果为止”。

具体到这里，就是在目标模式下告诉 Codex，让它根据已有的产品交互原型和详细的技术方案设计进行实施和测试。

开启目标模式有两种方式，一种是输入 `/goal` 命令，后面输入目标内容；另一种是输入 `@`，会自动弹出目标选项，选中后输入目标内容即可。

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/1a794576190e686e2706c84b5387bb2f3235981ff5e1ffb91a4ce4c1fdf17e81.png)

接下来 Codex 就会一项一项地完成功能开发，并自主进行单元测试、用户测试等等。

## 第三步，增加独立 Agent 评审

一般来说，使用目标模式完成开发后，你就会得到一个不错的成品，能在本地运行，能点击，能使用。

但是要注意，上面所有的环节都是由同一个模型完成的。尽管 GPT-6 Astra 是一个不错的模型，但是当局者迷，旁观者清，有一些问题只有让 Claude、Kimi 这样的第三方 Agent 来评审才能发现。

比如我让 Claude Code 对这一版代码、界面、交互进行了评审和测试：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/dbee3faff24669e68027f1e45d249c2e7bfa26a1349266960d756ddde5c921ec.png)

发现了不少问题：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/f748dbd86a935ed4a3d6568c4c9552462042da664f8f24a11503531442ed9d7b.png)

如此反复评审两三轮，问题就比较少了。

AI 评审能发现代码和交互层面的问题，但有些体验只有人用了才知道，所以最后还要自己深度使用一遍，把发现的问题继续交给 Codex 修复。

## 总结

对于锦章 Markdown 排版发布助手这样一个小型项目，上面三步实际耗时 4～5 小时，比网上所谓的一小时慢多了，但出来的东西是真能用的。

相信有了 AI 的帮助，你也能很快地开发一个产品，哪怕只是解决自己的一个小小的需求。

希望这篇文章对你有所帮助。

下一期预告：**《从 0 到上线：部署环节，服务器和部署平台怎么选？》**
