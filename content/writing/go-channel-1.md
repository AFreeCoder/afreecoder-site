---
title: Go 并发基石之 channel（一）
date: 2021-05-02
slug: go-channel-1
original_url: https://afreecoder.cn/2021/05/02/go-channel-1/
source_file: /Users/afreecoder/Nutstore Files/工作空间/我的笔记/40_outbox/published/Go 并发基石之 channel（一）.md
platforms:
  - 微信公众号
bodyFormat: markdown
---
> Go 并发系列是根据我对晁岳攀老师的《Go 并发编程实战课》的吸收和理解整理而成，如有偏差，欢迎指正~

作为 Go 的核心数据结构以及 goroutine 之间的通信方式，channel 是支撑 Go 语言高性能并发编程模型的重要数据结构。

学习 Go，channel 是无论如何都无法绕过的特性。因此本篇就和大家一起看下 channel 的由来、基本用法以及常犯的一些错误。

## 1. channel 的发展

要了解 channel 的设计思想，就得追溯到 CSP 理论。

CSP 是 Communication Sequential Process 的简称，最早由计算机科学家 Tony Hoare 在 1978 年发表的同名论文提出。最开始的 CSP 其实是一种并发编程语言，之后经过一系列发展和演化，才变成了现在的 CSP 理论。

作者认为，并发场景中，**输入**和**输出**是被忽略的两个原语。在最初的 CSP 中，Hoare 创造了 **!** 和 **?** 命令，分别表示输入和输出，并展示了如何用通信的方式来解决并发问题！

![-w1047](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/05/16/16198628955968.jpg)

在上图的最后一个例子中，描述了从 west 进程不断读取字符到变量 c 并发送给 east 进程的通信过程。

此外，CSP 中还使用了守护命令 **—>**，命令左边的语句是 false 或者退出，那么命令的右边就不会执行。

这和 channel 的用法是何其的相似！

CSP 描述了一种多个任务之间通过通信来进行信息交互的处理问题的方案，这也构成了 Go 并发哲学的基础。

## 2. channel 和 sync

前面一系列的文章介绍了 Go sync 包下的并发原语，如 Mutex，WaitGroup，Once，Cond 等。在 Go 中，它们和 channel 其实是竞争关系。

![channel和sync](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/05/16/channel-hesync.jpg)

> Don’t communicate by sharing memory, share memory by communicating.

学习 Go 的过程中，总是时不时的看到这句话。直白的翻译就是：不要通过共享内存来通信，而要通过通信来共享内存。

sync 和 channel 就分别代表了这两种解决并发问题的方式。

以最常见的计数器为例，看一下这两种方式分别是如何处理的。

### 1) sync 的解决方案

sync 的解决方式很直观，就是通过 Mutex 来确保同一时刻只有一个 goroutine 在修改数据。

```Go
//countByShareMemory
func countByShareMemory() {
	count := 0
	var w sync.WaitGroup // 用于确保100个 goroutine 都执行完毕
	var m sync.Mutex
	for i := 0; i < 100; i++ {
		w.Add(1)
		go func() {
			m.Lock()
			defer w.Done()
			defer m.Unlock()
			count++
		}()
	}
	w.Wait()
	fmt.Println(count)
}
```

### 2) channel 的解决方案

```Go
// countByCommunicating
func countByCommunicating() {
	w := make(chan int, 100) // 用于确保100个 goroutine 都执行完毕
	ch := make(chan int, 1)
	ch <- 0
	for i := 0; i < 100; i++ {
		go func() {
			select {
			case count := <-ch:
				ch <- count + 1
			}
			w <- 0
		}()

	}
	for i := 0; i < 100; i++ {
		<-w
	}
	fmt.Println(<-ch)
}
```

并发场景下，需要保证 count++ 操作的原子性，也就是 count 变量独占权的问题。sync.Mutex 的解决方案中，通过**互斥锁**保证同一时刻只有一个 goroutine 对count 拥有所有权；channel 的解决方案中，则是通过管道**转移**对 count 的所有权。

### 3) 如何选择 sync 和 channel

尽管 Go 的设计者极力推荐使用 CSP 的方式来解决并发问题，但是 CSP 只是解决并发安全问题的其中一种途径，在某些场景，还是要具体问题具体分析。

该课程中给出的建议如下：

- 共享资源的并发访问使用传统并发原语；
- 复杂的任务编排和消息传递使用 Channel；
- 消息通知机制使用 Channel，除非只想 signal 一个 goroutine，才使用 Cond；
- 简单等待所有任务的完成用 WaitGroup，也有 Channel 的推崇者用 Channel，都可以；
- 需要和 Select 语句结合，使用 Channel；
- 需要和超时配合时，使用 Channel 和 Context。

## 3. channel 的基本用法

你既可以往 channel 中发送数据，也可以从 channel 中接收数据，所以，channel 的类型有如下三种：

```Go
chan    // 既可以发送数据，又可以接收数据的 channel
chan<-  // 只能接收数据的 channel
<-chan  // 只能发送数据的 channel
```

channel 是管道，因此一个传输具体类型数据的 channel 声明方式如下：

```Go
var ch chan string      // 既可以往 ch 中写，也可以从 ch 中读 string 类型数据
var ch chan<- struct{}  // 只能往 ch 中发送 struct{} 类型数据
var ch <-chan int       // 只能从 ch 中读取 int 数据
```

channel 的初始化和 slice 类似，都是使用关键字 make，未初始化的 channel 零值是 nil。具体的声明方式如下：

```Go
ch := make(chan int, 5)
```

其中 5 是 channel 的容量。也可以不指定 channel 的容量，即容量为 0，这样的 channel 一般叫做 unbuffered channel。

### 1) 发送数据

往 channel 中发送数据使用 "ch<-"，示例如下：

```Go
ch <- 10
```

这里的 ch 的类型是 `chan int` 或者 `chan<- int`。

### 2) 接收数据

从 channel 中接收数据使用 "<-ch"，示例如下：

```Go
x := <-ch  // 把 ch 中接收到的一条数据赋值给 x
foo(<-ch) // 把 ch 中接收到的一条数据作为函数 foo 的参数
<-ch      // 丢弃一条从 ch 中接收到的数据
```

从 channel 中接收数据的时候，还可以接收两个值：

```Go
x, ok := <-ch
```

ok 是一个 bool 值，表示是否成功的从 channel 中接收到了数据。如果 ok 是 false，ch 已经被 close，且 ch 中没有缓存数据，那么 x 就是零值。所以，如果 x 是零值，有可能是接收到了零值，也有可能是空的且被 close 的 channel 产生的零值。

### 3) 其它操作

Go 的内建函数 close、cap、len 都可以操作 channel。close 可以关闭 channel，关闭之后的 channel 无法接收数据；cap 返回 channel 的容量；len 返回 channel 的长度。

发送和接收数据还可以作为 select 语句的 case clause，例如：

```Go
func main() {
    var ch = make(chan int, 10)
    for i := 0; i < 10; i++ {
        select {
        case ch <- i:
        case v := <-ch:
            fmt.Println(v)
        }
    }
}
```

channel 还可以用于 for-range 语句中：
```Go
for v := range ch {
    fmt.Println(v)
}
```

或者是忽略读取的值，只是清空 channel：
```Go
for range ch {
}
```

到这里，channel 的基本用法就介绍完了，下面说几种使用 channel 过程中常见的错误。

## 4. 使用 channel 常见的错误

使用 channel 最常见的错误就是 panic 和 goroutine 泄露。

### 1) panic 错误

常见的会导致 panic 的三种场景如下：
- close 为 nil 的 channel
- send 已经 close 的 channel
- recv 已经 close 的 channel

### 2) goroutine 泄露

这里的泄露指的是 channel 阻塞导致 goroutine 一直无法退出的情况。下面是课程中的一个例子：

```Go
func process(timeout time.Duration) bool {
    ch := make(chan bool)

    go func() {
        // 模拟处理耗时的业务
        time.Sleep((timeout + time.Second))
        ch <- true // block
        fmt.Println("exit goroutine")
    }()
    select {
    case result := <-ch:
        return result
    case <-time.After(timeout):
        return false
    }
}
```

该示例中，假设业务处理的时间大于超时时间，故 select 语句先接收超时的信号，返回 false，这导致第 7 行一直阻塞，goroutine 无法退出，进而造成泄露。

出现这种情况的原因是第二行初始化的 ch 是一个 unbuffered channel，向 unbuffered channel 发送数据的时候，由于容量为 0，必须同时存在接收方接收数据，发送方才能将数据发送出去，否则只能阻塞。

改进的方式也很简单，ch 初始化的时候，指定容量为 1 就行。

## 5. 结尾

这一篇，简单的介绍了 channel 的由来以及它的一些基本用法。CSP 理论那其实没怎么讲清楚，只是搬运了《Concurrency in Go》关于 CSP 的一些介绍，短期内也不打算深究，能明白大概意思就行。

下一篇，尝试写一下 channel 源码解析。

大家五一假期快乐~~

----
