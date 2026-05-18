---
title: Go Modules 简介
date: 2020-06-27
slug: Go-Modules-md
original_url: https://afreecoder.cn/2020/06/27/Go-Modules-md/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 前言

> In Go 1.14, module support is considered ready for production use, and all users are encouraged to migrate to modules from other dependency management systems.

在go1.14中，模块支持被认为已经可以在生产环境中使用，因此鼓励所有用户将项目中的依赖管理系统都迁移到Go Mudules中。

## 环境准备

### Go 版本升级

**查看Go版本**

```bash
go env
```

如果显示版本低于1.14，则需要升级。

**下载Go最新版本**

官网地址：[https://golang.org/dl/](https://golang.org/dl/) ，下载对应版本。这里以 `go1.14.4.darwin-amd64.tar.gz` 为例。

**删除旧版本**

- 通过 `go env` 获取安装路径（即 `GOROOT` ），一般是 `/usr/local/go` 。
- `rm -rf /usr/local/go`

**安装新版本**

```bash
sudo tar -C /usr/local -xzf go1.14.4.darwin-amd64.tar.gz
```

至此，Go1.14 升级完成，so easy~

### 设置代理

由于一些原因，下载Go的各种依赖包的时候，速度很慢，通过一些镜像网站下载的话，可以获得如丝滑般的下载体验。

**常见的Go Modules镜像网站：**
1、[https://proxy.golang.org/](https://proxy.golang.org/)
GOPROXY 的默认值，这是一个在大陆无法访问的地址。。
2、[https://goproxy.io/](https://goproxy.io/)
一个开源的为 Go Modules 而生的全球代理。国内开发者使用的较多，维护者是个人。
3、[https://goproxy.cn/](https://goproxy.cn/)
Goproxy 中国，最初开发者是 [@盛傲飞](https://aofeisheng.com/)，目前是七牛云托管和维护。你甚至可以像 goproxy.baidu.com 一样将该服务用作上游代理。

**如何设置**

```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

**趣闻**：[goproxy.io 和 goproxy.cn 是什么关系?](https://github.com/goproxy/goproxy.cn/issues/61)

## 快速开始

> 如果使用 Go Modules 来管理依赖，那么你的项目就没有必要在 `GOPATH` 中了。

### Example

1、随便创建一个项目目录

```bash
mkdir -p /tmp/scratchpad/repo
cd /tmp/scratchpad/repo
```

2、go mod 准备

```bash
go mod init xxx/repo
```

其中 `xxx` 是你项目托管的目录。如果是在github上，则是 `github.com/yourname/repo` 。

3、测试代码

repo 下 main.go 中添加如下测试代码

```golang
package main

import (
"net/http"

"github.com/labstack/echo"
)

func main() {
e := echo.New()
e.GET("/", func(c echo.Context) error {
return c.String(http.StatusOK, "Hello, World!")
})
e.Logger.Fatal(e.Start(":1323"))
}
```

4、go mod xxx 相关命令

| xxx | 解释 |
| --- | --- |
| download | download modules to local cache |
| edit | edit go.mod from tools or scripts |
| graph | print module requirement graph |
| init | initialize new module in current directory |
| tidy | add missing and remove unused modules |
| vendor | make vendored copy of dependencies |
| verify | verify dependencies have expected content |
| why | explain why packages or modules are needed |

### 日常工作流程

使用 go mod 之后，你的**日常工作流程**应该是这样：

1. 在代码文件中写好 `import` 语句
2. 执行 `go run` or `go build` or `go test`，或者一些其它的标准命令时，会自动下载依赖以及更新 `go.mod` 文件。
3. 当你需要指定依赖的版本的时候，你可以使用命令 `go get foo@v1.2.3`， `go get foo@master` ，`go get foo@e3702bed2` 直接下载指定版本（这些命令都会直接更新go.mod），或者直接修改 go.mod 文件。

一些你可能会用到的其它功能：

1. `go list -m all` — 查看全部直接或者间接的依赖
2. `go list -u -m all` — 查看全部直接或者间接的依赖版本及最新版本
3. `go get -u ./...` or `go get -u=patch ./...` ,，更新全部直接或者间接依赖到最新 `minor` 版本或者 `patch` 版本
4. `go build ./...` or `go test ./...`
5. `go mod tidy` 精简不必要的依赖，同时增加任何必要的依赖。
6. `go mod vendor` — 创建 vendor 目录，并复制依赖到其中。

## 一些基本概念

### Modules

> A module is a collection of related Go packages that are versioned together as a single unit.

仓库（repository）、模块（module）和 包（package）之间的关联：

- 一个仓库包含了一个或多个 Go Modules
- 每个模块包含了一个或多个 Go Packages
- 每个包 包含了某个路径下的一个或多个 Go Source 文件

Modules 必须被语义版本化 （遵循 [semver](https://semver.org/) 协议），其版本描述格式如 `v(major).(minor).(patch)`

> major (主版本号)：当你做了不兼容的 API 修改，minor (次版本号)：当你做了向下兼容的功能性新增patch (修订号)：当你做了向下兼容的问题修正

### go.mod

`go.mod` 文件中有4个命令：`module`， `require`，`replace`，`exclude`。

**example**

```golang
module github.com/my/thing

require (
    github.com/some/dependency v1.2.3
    github.com/another/dependency/v4 v4.0.0
)
```

`module` 命令声明了当前模块的名称以及导入路径。

`require` 命令标明了当前模块所依赖的模块。

`replace` 和 `exclude` 命令仅对当前模块生效，即 build 主模块时，其它依赖模块中的 `replace` 和 `exclude` 命令都会被忽略掉。

### 版本选择

如果当前模块依赖的一个模块名是 M，当你还没有将 M 添加到 `go.mod` 中的时候，如果执行 `go build` 或者 `go test` 等命令，会自动拉取 M 并将其添加到 `go.mod` 中，拉取规则如下：

- 拉取 M 最新的发行版本 v1.2.3，如果没有发行版本，则拉取最新的master的commit
- 如果当前模块中的依赖 A 依赖 M v1.0.0，B 依赖 M v1.2.3，那么会选择 M v1.2.3 (最小版本选择算法)

### 语义导入版本控制

这里说的是导入模块的时候，包的路径应该与模块版本相符。

具体规则如下：

- 模块的版本命令应该遵从 [semver](https://semver.org/) 协议。
- 如果该模块的版本是 v2 或者更高，那么 `go.mod` 中声明该模块的时候，需要加上 `/v2` 的后缀，如 `module github.com/my/mod/v2` 或者 `require github.com/my/mod/v2 v2.0.1`。这种用法也被用在 `go get` 命令中，如 `go get github.com/my/mod/v2@v2.0.1`

## FAQs

**1、go.mod 中模块被标记成 `incompatible` 是什么意思**

**答：** 如果 `Module` 的名字没有遵循 Golang 的规范，即在模块名中附带版本信息，那这就是一个不规范的模块，就会提示 `incompatible`。以 `github.com/labstack/echo` 为例，如果其当前版本是 `v3.3.10` ，那么 go.mod 中会这样显示：`github.com/labstack/echo v3.3.10+incompatible` 。

想象一下，如果 `github.com/labstack/echo` 更新到了 `v4.1.1` ，如果你的模块依赖它，并且执行了更新全部依赖的命令会怎么样？ `github.com/labstack/echo` 会更新到 `v4.1.1`，但是根据 [semver](https://semver.org/) 协议，v4 是不兼容 v3 的，这个时候你的模块就会出问题。如果依赖符合规范，如 `github.com/labstack/echo/v3` ，那你更新全部依赖后，也只是将版本更新到 `v3.9.9` 或者小于 `v4` 的最大一个版本，不会出现兼容性的问题。

当模块的版本小于等 v1 的时候，模块名默认不需附带版本信息。

**2、为什么 `go mod tidy` 会记录 `inderect` （非直接）依赖和测试依赖？**

**答：** `go mod dity` 会尽可能的反应出所需要的全部环境下（有可能是系统、处理器架构或者build tags）的依赖，而 `go build` 和 `go test` 仅仅是更新 `go.mod` ，添加当前环境的依赖。

**3、如何在不支持 Module 的模块 A 中导入支持 Module 的 v2+ 的 模块 B?**

**答：** 这需要看 module B 是如何发布 v2+ module 的。

1. 如果是在主分支，在 go.mod 中通过 `module` 声明 `/v3` 模块 A 中不需要修改导入路径 （即使改了编译的时候也会忽略路径中的版本信息），在 `GOPATH` 模式下运行的时候，会选择 `GOPATH` 中的模块 B 的版本编译。
2. 如果 B 是在 子目录中创建了一个 `./v3` 目录，然后将 `go.mod` 文件放在 `./v3` 中A 中使用 `import github.com/xxx/B/v3` 是没有问题的。

## 参考文章

1. [Go Modules 官方文档](https://github.com/golang/go/wiki/Modules)
2. [干货满满的 Go Modules 和 goproxy.cn](https://juejin.im/post/5d8ee2db6fb9a04e0b0d9c8b)
3. [Go 专家编程-incompatible](https://rainbowmango.gitbook.io/go/chapter12/3-foreword/3.7-module-incompatible)
