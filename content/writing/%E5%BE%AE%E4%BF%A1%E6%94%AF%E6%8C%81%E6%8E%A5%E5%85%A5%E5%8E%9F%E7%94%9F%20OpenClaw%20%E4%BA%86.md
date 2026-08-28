---
title: 微信支持接入原生 OpenClaw 了
date: 2026-05-13
slug: %E5%BE%AE%E4%BF%A1%E6%94%AF%E6%8C%81%E6%8E%A5%E5%85%A5%E5%8E%9F%E7%94%9F%20OpenClaw%20%E4%BA%86
original_url: https://afreecoder.dev/writing/%E5%BE%AE%E4%BF%A1%E6%94%AF%E6%8C%81%E6%8E%A5%E5%85%A5%E5%8E%9F%E7%94%9F%20OpenClaw%20%E4%BA%86
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
这两天一直在忙我的新项目 API 站的事情，本来打算等后台运营工作交接 给小龙虾后，就来写一篇文章正式介绍下。

今天早上忽然看到消息，**微信支持接入原生 OpenClaw**了，有点吃惊，比我想象中要快很多。

原本以为微信这种十几亿用户的国民级应用怎么也会等 OpenClaw 稳定一些才跟进的。

------

## 微信接入 OpenClaw 步骤

下面是微信支持接入原生 OpenClaw 的一些点：

**哪个版本可以接入**

微信 8.0.70

**支持的平台**

暂时只支持 IOS，安卓还没放开

**接入方式**

目前只支持原生 OpenClaw。

第一步：进入微信-我-设置-插件页面，查看 ClawBot 插件详情，点击连接

第二步：打开终端输入：`npx -y @tencent-weixin/openclaw-weixin-cli@latest install`，会弹出二维码，扫码即可。

**使用方式**

连接成功后，微信里就多了一个小伙伴，叫做 **微信 ClawBot**

**看不到插件 ClawBot 怎么办**

微信还在灰度中，重启下就能看到了，或者再等等。

## 最后

最近一直有点焦虑，倒不是焦虑辞职后项目失败怎么办，经济收入哪里来，而是对于这一轮 AI 革命中巨大的不确定性的焦虑：

**在这一轮 AI 革命中，如何找到自己的位置？**

没有答案，只能不停的拥抱不确定性了。

----

最后再介绍下我的新项目 API 站吧：**https://apipool.dev** ，支持GPT5.4，支持 Claude Opus 4.6，支持一键接入 OpenClaw。

当然项目还在内测期，有问题在所难免，网站右上角联系技术支持就行（就是我）。
