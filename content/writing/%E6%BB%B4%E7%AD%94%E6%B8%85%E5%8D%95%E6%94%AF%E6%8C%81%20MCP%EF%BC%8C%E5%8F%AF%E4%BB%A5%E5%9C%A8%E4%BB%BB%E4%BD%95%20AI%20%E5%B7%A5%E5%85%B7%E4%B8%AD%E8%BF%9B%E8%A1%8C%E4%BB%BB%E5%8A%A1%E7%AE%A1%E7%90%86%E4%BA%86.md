---
title: 滴答清单支持 MCP，可以在任何 AI 工具中进行任务管理了
date: 2026-06-12
slug: %E6%BB%B4%E7%AD%94%E6%B8%85%E5%8D%95%E6%94%AF%E6%8C%81%20MCP%EF%BC%8C%E5%8F%AF%E4%BB%A5%E5%9C%A8%E4%BB%BB%E4%BD%95%20AI%20%E5%B7%A5%E5%85%B7%E4%B8%AD%E8%BF%9B%E8%A1%8C%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86%E4%BA%86
original_url: https://afreecoder.dev/writing/%E6%BB%B4%E7%AD%94%E6%B8%85%E5%8D%95%E6%94%AF%E6%8C%81%20MCP%EF%BC%8C%E5%8F%AF%E4%BB%A5%E5%9C%A8%E4%BB%BB%E4%BD%95%20AI%20%E5%B7%A5%E5%85%B7%E4%B8%AD%E8%BF%9B%E8%A1%8C%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86%E4%BA%86
platforms:
  - AFreeCoder.dev
bodyFormat: markdown
---
才知道滴答清单在 3 月份就支持了 MCP，现在可以在各个 AI 工具中管理滴答清单上的任务清单。

等这个功能等太久了，以至于 5 月 7 日会员到期后，都不打算续费了。（当然，知道它支持 MCP 后，当天就续费了）。

# 我的需求

随着 AI 的发展，我现在工作的入口已经变成了 ChatGPT、Codex、Claude、Claude Code，还有 OpenClaw、Hermes 等。

在用这些工具的时候，我有个很强烈的需求：让它们共享同一份工作进展。我不想每换一个 AI 工具，就把手上的任务、进度重新交代一遍；不管打开哪个，我希望它看到的都是同一份待办、同一个进度。这就要求像滴答清单这样的工具，能按统一的协议对接各类 AI 工具。

国内做得比较好的是飞书，它开放了各种 API，还发布了专用 CLI 工具，可以在各类 AI 工具中直接调用。飞书的待办虽然不好用，但我当时还是打算迁过去。

但是现在滴答清单支持 MCP，就完全不用纠结了。

# 如何接入滴答清单 MCP

在介绍如何接入前，简单介绍下 MCP（Model Context Protocol）。

MCP 是由 Anthropic 提出的一种第三方工具和 AI 工具（在 MCP 协议里叫「客户端」）进行数据交互的开放协议。简单来说，支持了 MCP 的工具，都可以接入 ChatGPT、Codex、Claude 等 AI 工具中，然后在这些 AI 工具里通过对话来和第三方工具交互。

接入方式比较简单，绝大部分 AI 工具都提供单独的 MCP 配置入口，以 ChatGPT 和 Codex 这两个典型产品为例：

## ChatGPT 接入

### 打开开发人员模式

ChatGPT 默认已经接了一批第三方应用，比如 Canva、Gmail、GitHub 等，不在清单中的应用需要先打开开发人员模式，配置方式：

登录网页版，点击【设置】→【应用】→【高级设置】→【开发人员模式】
![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/b22a972c812163356d18e3a360327bd365a8fedc96cf21c0824cb2429a17efa6.png)
![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/4c4392c998f72364ed98a9ca650b40d0829b6d9134b3b151a23e6679d20bb328.png)

### 添加滴答清单 MCP 服务

开发人员模式打开之后，就可以添加滴答清单了，步骤如下：

点击【应用】→【高级设置】→【创建应用】，填入相关配置：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/4a03df5e54f68265452f7863bf4e398cb698e8c9b647c60aa7aefb2fa888d9c1.png)

连接配置中选【服务器 URL】，地址：https://mcp.dida365.com，身份验证选【OAuth】，然后点击创建，会跳转到滴答清单的授权页面，点同意即可。

接下来再对已经创建好的应用，打开【参考记忆与对话】开关，就可以在 ChatGPT 中访问滴答清单的任务了。
![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/cbdd5292bda0d953a26a9df9658e80ac4f3926fc4b3d08a44491bd74d2845f25.png)

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/a0b848d9d360d7282dda08cdf98635dac3c32f33aa6598a3f5a309015ed12804.png)

## Codex 接入

ChatGPT 中接入有点繁琐，在 Codex 中接入就很方便了，一句话就行：

```
参考官方文档：https://help.dida365.com/articles/7438132116019216384，通过 MCP 的方式接入滴答清单。
```

当然，也可以按照官方文档执行命令：

```
codex mcp add dida365 --url https://mcp.dida365.com
```

其他 AI 工具的接入大同小异，具体可以参考官方文档：https://help.dida365.com/articles/7438132116019216384。

# 接入之后，能干什么

官方 MCP 支持任务的查、增、改，再加上清单、习惯、专注记录、纪念日这些。光看功能列表没感觉，下面是我接入之后立刻干的两个事情。

## 迁移飞书待办到滴答清单

我前两天已经在飞书新增过一批任务，现在想倒回滴答清单。很简单，Codex 中一句话就可以：

> 把飞书待办中的任务迁移到滴答清单中

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/7d3fc2bc970b46ffea00178ab70e6cbfb9e41af264a82c5c7bcbb361147a174d.png)

四分钟后它跑完了。不仅完整地迁移了任务，还做了两次校验。同时还贴心地提醒我该升级飞书 CLI。

**这种机械的活交给 AI 真的是太合适了。**

## 对现有的任务清单进行分析

除了迁移任务，我认为还有一个比较实用的地方，就是对现有的任务清单进行分析和梳理。

很多时候我添加任务时，并没有想太清楚，任务拆分粒度也不够合理，甚至我现在还把任务收集箱当成了稍后读的收藏夹。

下面是 Codex 的部分分析结果：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/f8cfcc9d23af7cd157b27c4281e7d81e75980c513e4a6bea750151d7fdbd5811.png)

收集箱堆了 200 篇文章，名义上是「稍后读」，实际是个永远不会再打开的杂物间，本该让我安心的任务系统，反倒成了一打开就焦虑的来源。给的方向也具体：收集箱该和真待办分家，旧书单这种长期停滞的直接归档，迁回来的 15 条真任务才值得花力气拆细。

这些建议我还没来得及一条条落实。但光是把这团乱麻摊开、分好类、告诉我从哪儿下手，焦虑就去了一半。

这还只是一个初步的分析，我能想到的更深度的使用场景是把任务的添加、拆分和流转都通过 Codex 来管理，依托滴答清单，实现一种轻量的项目管理。

更深一步的使用我还在探索中，也欢迎在评论区发表你的看法。

# 最后，说一点我的看法，和滴答清单无关

我差点离开滴答清单，倒不是它做得差，是它当时跟我那些 AI 工具不通。能不能接入 ChatGPT、Codex 这些 AI 工具，已经成了我选工具的一条标准。

移动互联网时代，每一个工具类的软件都有一个 APP，都有自己单独的入口。在这个入口里面，可以完成数据的添加、修改，基于数据的决策，对数据的统计和展示。软件的使用主体是人。

在 AI 时代，像 Codex、Claude 这种能自己干活的通用 AI Agent，凭借强大的基础能力，已经成为人机交互事实上的入口，各种软件，尤其是工具类软件的入口，正在被它们迅速吞噬。

从用户的角度，这当然是一件好事：软件入口收敛，要打开的软件越来越少；软件使用越来越简单，原来需要熟悉每一个软件的使用方式，现在只需要通过对话的形式就可以完成各种操作。

但是从开发者的角度，这真是一个灾难。简单的软件，AI 分分钟就能手搓一个；复杂的软件，入口在 AI 那头，软件本身退守成后台服务，间接提供能力。而且随着 AI 能力不断发展，原本实现不了的功能，现在也容易了很多。开发者必须想清楚：AI 和软件的能力边界到底在哪，软件的核心价值又在哪里。

我也没有答案。
