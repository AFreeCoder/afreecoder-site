---
title: go 性能优化之 benchmark + pprof
date: 2020-12-06
slug: go-benchmark-pprof
original_url: https://afreecoder.cn/2020/12/06/go-benchmark-pprof/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
> testing 是go自带的一个轻量级的测试框架，主要有三个用途：单元测试(Test)，基准测试(Benchmark)以及示例测试(Example)。

## 起因

写go也有几个月了，一直没太关注类似 `benchmark` 之类的性能分析工具，只知道埋头写业务代码。直到前几天，工作上的一个项目遇到了性能瓶颈，需要分析一下原因，就用到了 `benchmark`。一顿分析，终于发现了程序中的”性能消耗大户“，颇有成就感。

## 测试case准备

平时写代码的过程中，会经常写一些 `print` 或者 `debug` 函数，谁又能想到，这些 `print` 偷偷摸摸的消耗了多少 `CPU` 和 内存资源呢？

AES对称加密是业务代码中经常会用到的一种加密方式，但是编码习惯如果不好，或者测试代码忘了删，就会导致加密性能急剧下降。

**大师兄写的AES加密函数**

```go
func AesEncryptA(aesKey, IV, origin []byte) []byte {
block, err := aes.NewCipher(aesKey)
if err != nil {
return nil
}
blocksize := block.BlockSize()
blockMode := cipher.NewCBCEncrypter(block, IV)
originData := PKCS5Pading(origin, blocksize)
crypted := make([]byte, len(originData))
blockMode.CryptBlocks(crypted, originData)
return crypted
}
```

**二师兄写的AES加密函数**

```go
func AesEncryptB(aesKey, IV, origin []byte) []byte {
block, err := aes.NewCipher(aesKey)
if err != nil {
return nil
}
blocksize := block.BlockSize()
blockMode := cipher.NewCBCEncrypter(block, IV)
originData := PKCS5Pading(origin, blocksize)
crypted := make([]byte, len(originData))
blockMode.CryptBlocks(crypted, originData)

    // 把加密结果打印到日志看看
f, _ := os.Create("temp.log")
defer f.Close()
log.SetOutput(f)
log.Println(fmt.Sprintf("encrypt res is %s", base64.StdEncoding.EncodeToString(crypted)))

return crypted
}
```

乍一看，大师兄和二师兄写的差不多，只是二师兄多了一个把加密结果写到日志中的操作。

***就这么一点点的区别，性能能差多少呢?让我们把悬念留到最后。***

## benchmark 实施

假设当前项目中的代码就是二师兄写的，我们就来分析一下，当前的性能瓶颈到底在什么地方。

### benchmark编写

**写benchmark几个注意点**：

- 文件名以 `_test.go` 结尾，如 `practice_test.go`
- 函数名统一以 `Benchmark` 开头，参数是 `*testing.B`
- 对于要测试的函数，函数外面套上一个 for 循环，for 循环次数的上限是 `b.N`
- 为了排除其它流程的干扰，一般会在 for 循环前加上 `b.ResetTimer`

**对二师兄的加密函数写个基准测试**

```go
func BenchmarkAesEncryptB(b *testing.B) {
aesKey := []byte("1234567890abcdef")
IV := []byte("7878676756564545")

originData := bytes.Repeat([]byte{28}, 1 testing 框架下的基准测试依赖 `go test` 工具

**benchmark 命令示例**

```bash
go test -bench BenchmarkAesEncryptB -run none -benchmem -cpuprofile cpuprofile.out -memprofile memprofile.out
```

这个命令中的参数比较多，我们一个个的解释。

- `-bench` 表示执行哪些基准测试函数，后面可以加需要执行的基准测试函数名称，也可以加 `.`，表示执行全部的基准测试函数。（其实 `-bench` 后面可以加正则表达式）
- `-run` 表示执行哪些单元测试和示例测试函数，一般会加none，表示都不执行
- `-benchmen` 表示打印函数执行过程中的内存分配
- `-cpuprofile` 表示将全过程的 `CPU` 的一些概要数据写到文件 `cpuprofile.out` 中
- `memprofile` 表示将全过程的内存的一些概要数据写到文件 `memprofile.out` 中

**执行结果分析**

```bash
goos: darwin
goarch: amd64
pkg: go_practice/benchmart_example
BenchmarkAesEncryptB-8                 1        8570217455 ns/op        6218811264 B/op       55 allocs/op
PASS
ok      go_practice/benchmart_example   9.985s
```

从执行结果中能看到，for 循环每执行一次，耗时 8570217455 纳秒，同时会有55次内存分配操作，每次操作 6218811264 字节。

到这里，我们其实已经完成了基准测试的一个基本流程，也对二师兄的加密函数的性能和内存使用状况有了一个初步的认识。

**但是，我们还是不知道性能瓶颈在哪！！**

## 终极杀器：benchmark + pprof

> pprof 是 go 自带的 `CPU` 分析器，常用来分析性能瓶颈。

在前面的基准测试中，我们生成了 `CPU` 概要文件 `cpuprofile.out` 以及内存概要文件 `memprofile.out`，现在可以派上大用场了。

pprof 既可以通过命令行交互的方式查看CPU（内存）的概要数据，也可以通过web的方式查看直观的图形化展示。这里我们主要通过web的方式来展示。

***当然，使用pprof工具前，你需要先安装 `graphviz`，如果是mac，执行 `brew install graphviz` 就行。***

### pprof 分析 CPU

**执行命令**

```bash
go tool pprof -http=":8081" cpuprofile.out
```

通过地址 `http://localhost:8081/ui/` 能看到

![cpuprofile.png](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/go-benchmark-pprof/cpuprofile.png)

从这个截图中，我们很容易看到，加密部分总共耗时5.11s，完全用在加密上的耗时才0.76s，其它时间都是用在日志打印上和字符串转化上，

### pprof 分析内存

```bash
go tool pprof -http=":8081" memprofile.out
```

通过地址 `http://localhost:8081/ui/` 能看到

![memprofile.png](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/go-benchmark-pprof/memprofile.png)

从这个截图图中，我们很容易看到，5930.71MB的内存使用，真正用在加密上的才512MB以及对原始字符串padding操作的640MB，其它内存都耗费在字符串转化和各种 `print` 操作上。

很直观的，我们就知道了二师兄的代码问题就在那一段日志打印的操作上。

### 优化二师兄的代码

根据上面的分析，我们需要优化的就是日志打印的那部分代码。二师兄的代码优化后其实就是大师兄的代码。

我们把大师兄和二师兄的代码放一起跑一遍基准测试：

```bash
go test -bench . -run none -benchmem -cpuprofile cpuprofile.out -memprofile memprofile.out
```

**得到**

```bash
goos: darwin
goarch: amd64
pkg: go_practice/benchmart_example
BenchmarkAesEncryptA-8                 1        1174023307 ns/op        1207968624 B/op       13 allocs/op
BenchmarkAesEncryptB-8                 1        7496300203 ns/op        6218810296 B/op       50 allocs/op
PASS
ok      go_practice/benchmart_example   9.508s
```

从 `CPU` 耗时上看，大师兄的代码耗时只有二师兄的 1/7，单次内存消耗只有二师兄的 1/5，并且内存分配次数也只有二师兄的 1/4 左右。

## 结尾

二师兄在追赶大师兄的道路上，又前进了一大步，可喜可贺~~

## 参考

[1] [go benchmark 性能测试](https://my.oschina.net/solate/blog/3034188)

[2] [go testing](https://golang.org/cmd/go/#hdr-Testing_flags)
