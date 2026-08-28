---
title: Codex 还是 Claude Code ？这是一个问题。
date: 2026-08-08
slug: codex-vs-claude-code
original_url: https://afreecoder.dev/writing/codex-vs-claude-code
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
自从准备出来单干之后，我就把 ChatGPT 和 Claude 订阅直接拉满。毕竟是我的两大主力数字员工，粮草不能少。

作为 ChatGPT Pro 和 Claude Max 双持用户，今天聊一聊这俩怎么选。

先说结论：

**优先选 Codex，不怕封号可以再叠加 Claude Code。**

注：以下均为个人感受（主要为编程场景），非全方位评测，如果不同意见，欢迎评论区留言，谢谢～

----

对比之前，先解释几个基本概念：

**Codex**：ChatGPT 对应的 Agent 工具，共享同一套会员体系。
**Claude Code**：Claude 对应的 Agent 工具，共享同一套会员体系。

## 一、能力对比

对于 Codex 和 Claude Code 这一类 Agent 工具而言，最终能发挥出的能力等于：

**模型能力 + Agent 工具能力 + 用户水平 = 最终效果**

### **1.1 模型层面**

自从 GPT-5.4 和 Claude Opus 4.6 发布以来，我就有一个观点：

**当前模型的智能上限远远超出普通人能理解的极限，绝大部分人只发挥了模型很小一部分的能力。**

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/5fa2de256b1818876c9885c890741bba530fb497a88a8ccb7d02fd06d5d8ab8e.png)

在如今各家旗舰模型各领风骚三五周的时代，谁能感受到这些榜单里那几个点的差异？反正我是感受不到。

很多时候我们说哪个模型更强，其实是在说我们**更喜欢、更适应**哪个。

截止目前，地球上最厉害的两个模型是 **GPT-5.5 和 Claude Opus 4.7**。就目前各类榜单和社区反馈来说，GPT-5.5 略胜一筹。

这也比较符合我的日常体验。很多时候，Claude Code 对 Codex 的评审或开发的回复都是“Codex 评审质量很高，切中要害”、“Codex 开发质量很高，可以直接上线”等；而Codex 对于 Claude Code 的评审总是能找出不少问题，并说服Claude Code。

所以模型能力这一层，**GPT-5.5 小胜 Claude Opus 4.7。**

### ** 1.2 Agent 工具体验层面**

模型是基础，上一层是规范和约束，也就是现在比较火的 **harness engineering**。这一点上，Claude Code 一直是王者。

典型的例子，GLM5.1 放到 Claude Code 中，效果就是比在其它工具中使用要好。

不过前一段时间，Claude Code 工具源码泄露，相信要不了多久，各家的 Agent 工具能力都会提升一大截。

另外单说 Codex，一直以来，Codex 都以“能力强”、“产品体验差”著称。不过随着最近两个月的密集更新，“computer use”——电脑操作、“Chronicle”——记忆系统、内置浏览器、一大波工具插件补齐等，产品体验提升很快。

当然，目前公认 Claude Code 的产品仍然更甚一筹，所以工具层面，目前还是 **Claude Code 小胜 Codex**。

### ** 1.3 用户水平**

相比于前两层有大量的评测和社区案例的反馈，用户能力这一层可能才是限制 Codex 和 Claude Code 能力发挥的最大瓶颈。

一个显而易见的事实是，我用 Codex 或者 Claude Code 的水平肯定远不如 Codex 或者 Claude Code 内部研究员。

无论是对模型的理解，还是对 Agent工具的使用，都远远不如。

能否 “**发现问题，定义问题，表达问题**”，直接决定了模型以及工具的使用效果。

## 二、开放性

这一点指的是能否在第三方工具中使用 Codex 或者 Claude 的订阅会员。

**这个维度的比较中，Codex 完胜！**

无论是早期的 OpenCode 还是后来火的一塌糊涂的小龙虾（OpenClaw），只要用户量一上去，Claude 立刻就会封杀，一旦检测到用户使用，立刻封号。

而 Codex 则相反，经常第一时间支持授权登录，并鼓励社区适配。

虽然不排除可能是因为在之前的竞争中，Codex 暂时处于劣势，需要通过这种方式来赢得用户好感，扩大使用规模，但至少从结果上来看，Codes 的开放性要比 Claude 好很多

 我现在的小龙虾和 Hermes 就是通过 Codex 授权登录使用的。
 
 一个订阅，三个产品在用，太爽了。

## 三、支付问题

支付上，这俩难度一样，都很难。

官方支持的正规的支付渠道有三个：

- 官网
- 苹果商店
- 谷歌商店

官网支付需要海外信用卡；苹果商店和谷歌商店类似，都是需要一个海外账号，然后用礼品卡或者外币卡间接支付。之前没有折腾过的话，还是比较复杂的。

值得一提的是，如果通过应用商店订阅 Claude Max 会员，需要额外支付 25% 。这是把应用商店的抽成直接转嫁给了用户。只能说 Claude 不缺用户。

所以支付这个维度上，**Codex 小胜 Claude。**

另外，如果不知道怎么支付，可以看下：https://gpt101.org，都是走的正规渠道，无封号风险，质保，并且支持开具发票。

## 四、封号问题

虽然上面说了那么多，但真正决定选哪个的其实是封号问题。

众所周知， Claude 封号极其变态，从 ip，到设备，到支付，到使用习惯，每个环节都有可能被封号。春节期间，我就被封掉了 2 个 max 和 2 个 Pro。

我还加了下面这种群：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/696922a5cb41f000898d22771023e05189de966219b31b8d093540d0cb76c39a.png)

OpenAI 则被大家亲切地称之为“大善人”，几乎不封号，额度给的也十分慷慨，近期还动不动就重置额度。

这个维度上，**Codex 完胜**。

## 五、一个Claude Code 和 Codex 协作的案例

以上只是一些充满个人偏见的理解。下面是今天我的一个项目的需求， 供大家参考。

主要流程如下：
![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/4a9c96886b3642406ce0c28d2cc641091c2e0959e27e65bf8ff57206b6cd40b3.png)
下面是整个实施过程的一些截图：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/c45865b317345e8ab85a273dd679533eb5205990ab661e23cf5060b2d28f8f98.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/15ab8320d033ca5686f149674ad1fa4393a6a5db9b4bdfee4969915eeebba5c6.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/5b5917a75573fc4e314fb97ac3c06d5fcf718a501cd596c4ef56980e29d59107.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/46300729f3f4d2845b443a9de5f88476356922eab79563c18db98077b515171f.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/742e66654f837572ca5ee0743e9c176df542ebaae6cd5ced7dea156b362415d9.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/961ed5938a2ecc141fc2c849062b285a5651ceadcf99d47077dbd0294c16baaf.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/c897ae409f612be0287755bc4d203877369dee63e8f1149eabf401f8a96e451f.png)

上面的过程基本就是我现在的工作流：
- 设计阶段：Claude Code 主笔，Codex 评审，直至双方达成一致。
- 实施阶段：Codex 主刀，开发、测试、部署一条龙。

之前实施阶段的流程是 Codex 主刀，Claude Code评审，直至双方达成一致。现在觉得 Codex 的实施质量很高，小改动就图省事，直接 Codex 一条龙了。

## 结尾

Codex 还是 Claude Code？这其实不是一个问题。

能力范围内，能用哪个喜欢用哪个，都可以。如果有更高的要求，可以两个都用，多轮相互评审通常会带来更好的结果。

当然，还是期待国产模型能迅速地跟上来。

----
