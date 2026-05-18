---
title: 记一次学习 orDone 模式爬坑经历
date: 2021-04-25
slug: go-or-done
original_url: https://afreecoder.cn/2021/04/25/go-or-done/
source_file: /Users/afreecoder/Nutstore Files/工作空间/我的笔记/40_outbox/published/记一次学习 orDone 模式爬坑经历.md
platforms:
  - 微信公众号
bodyFormat: markdown
---
> Go 并发系列是根据我对晁岳攀老师的《Go 并发编程实战课》的吸收和理解整理而成，如有偏差，欢迎指正~

看了下上次 Go 技术学习的文章 《Go 并发之原子操作 atomic》发布时间: 3月27，一个月之前。再想一想最初立的 flag：每周一篇 Go 技术学习的文章。霍，脸真疼！

最近在看 channel 。作为 Go 核心的数据结构和 goroutine 之间的通信方式，channel 是支撑 Go 语言高性能并发编程模型的重要数据结构。

今天就来聊一聊 channel 实现的 Go 的并发模式 orDone 以及我在学习这个模式中不断跳坑出坑的经历。

## 任务编排之 orDone 模式

先介绍一下 orDone 模式。

orDone 模式是信号通知模式中应用比较广泛的一种模式。

什么是信号通知模式呢？信号通知模式实现了某个任务执行完成后的通知机制。在实现的时候，通常使用 channel strcut{} 类型，如果任务完成就 close 这个 channel，其它 receiver 就会收到这个信号。

orDone 模式是说我们有一个任务可以发送给 n 个处理方来执行，只要有一个处理方完成，就返回任务完成的信号。

如果 n 已知，实现方式很简单，用 select-case 语句就行。但是有些时候，你并不知道有多少个处理者，有可能是10个，也有可能是100个，所以没办法直接使用 select-case 。

在 《Go 并发编程实战》的 channel 相关的章节中，orDone 模式的代码实现如下（这段代码其实是有问题的，后面会说）：

```Go 
func or(channels ...<-chan interface{}) <-chan interface{} {
    // 特殊情况，只有零个或者1个chan
    switch len(channels) {
    case 0:
        return nil
    case 1:
        return channels[0]
    }

    orDone := make(chan interface{})
    go func() {
        defer close(orDone)

        switch len(channels) {
        case 2: // 2个也是一种特殊情况
            select {
            case <-channels[0]:
            case <-channels[1]:
            }
        default: //超过两个，二分法递归处理
            m := len(channels) / 2
            select {
            case <-or(channels[:m]...):
            case <-or(channels[m:]...):
            }
        }
    }()

    return orDone
}
```

该示例代码中，采取二分递归的方式来监听任务的完成信号。

附带测试代码如下 ：

```Go
func sig(after time.Duration) <-chan interface{} {
    c := make(chan interface{})
    go func() {
        defer close(c)
        time.Sleep(after)
    }()
    return c
}

func main() {
    start := time.Now()

    <-or(
        sig(20*time.Second),
        sig(10*time.Second),
        sig(30*time.Second),
        sig(40*time.Second),
        sig(50*time.Second),
        sig(01*time.Minute),
    )

    fmt.Printf("done after %v", time.Since(start))
}
```

测试结果完美符合预期，10s 之后，printf 语句成功打印。

## 问题1：goroutine 泄露问题

上面的代码乍看之下很合理，但是仔细想一想，却有两个问题：
1. 变量 orDone 在函数中的作用到底是什么？ 
2. case 2 所说的特殊情况到底是什么？能否在 case 2 处就递归？

带着这两个问题，一顿搜索，搜到了《Concurrency in Go》这本书。在这本书中，orDone 模式的代码示例如下：

```Go
func or(channels ...<-chan interface{}) <-chan interface{} { //1

	switch len(channels) {
	case 0: //2
		return nil
	case 1: //3
		return channels[0]
	}

	orDone := make(chan interface{})
	go func() { //4
		defer close(orDone)

		switch len(channels) {
		case 2: //5
			select {
			case <-channels[0]:
			case <-channels[1]:
			}
		default: //6
			select {
			case <-channels[0]:
			case <-channels[1]:
			case <-channels[2]:
			case <-or(append(channels[3:], orDone)...): //6
			}
		}
	}()
	return orDone
}
```

对比发现，这两种写法最主要的一个区别就是变量 orDone 有没有作为参数传递给子函数中。

在 or 函数执行结束前，orDone 会被 close，递归子函数的 case 分支接收到这个信号后，在立即退出的同时会将新 orDone 的 close 信号传递给它的递归子函数。也就是说，变量 orDone 的作用是用来通知其它协程退出。

在《Concurrency in Go》一书中，有如下解释：

> Here we recursively create an or-channel from all the channels in our slice after the third index, and then select from this. This recurrence relation will destructure the rest of the slice into or-channels to form a tree from which the first sig‐ nal will return. **We also pass in the orDone channel so that when goroutines up the tree exit, goroutines down the tree also exit**.

到这里，基本可以确认，晁老师的二分递归版本的代码是有问题的。这个版本没有传递 orDone 信号，通知其它协程退出，**会造成 goroutine 泄露问题**！

谨慎起见，我还是大胆的联系了晁老师，进行确认。

*注：为了方便起见，下文中用二分递归版代指晁老师的代码示例，用直接递归版代指《Concurrency in Go》中的示例。*

## 问题2：slice 切片问题

在和晁老师确认的过程中，我先根据自己的理解，对他的代码进行了一番修改，改动点（default 分支）如下：

```Go
default: //超过两个，二分法递归处理
    m := len(channels) / 2
    select {
    case <-or(append(channels[:m], orDone)...):
    case <-or(append(channels[m:], orDone)...):
    }
```

用上文的测试代码测试发现，程序在30s末的时候，才执行了 print 语句，不符合预期！

这个时候，晁老师回复了，先是夸了一通我看的仔细，然后确认这个地方确实遗漏了 orDone 信号的传递，并给出了修改版代码，改动如下：

```Go
default:
    m := len(channels) / 2
    select {
    case <-or(append(channels[:m:m], orDone)...): // must append orDone to avoid leak!!!!
    case <-or(append(channels[m:], orDone)...):
    }
```

我一看，这不和我改的一样嘛。再一想，晁老师不可能未经测试就给出代码，于是我跑了一遍测试代码，不出所料，这个结果是正确的！

问题出在哪呢？

逐字对比后，发现这两份代码在 slice 切片上有细微差别。晁老师版本指定了切片容量 m。

经过一番查阅，发现 slice 切片的时候，如果不指定容量，直接 append，仍然会对底层的 slice 产生影响。这里的影响就是 channels[m:] 的第一个元素 sig(10*time.Second) 被 orDone 覆盖了。

**注：slice 切片的知识点其实很基础，各位读者稍微一搜就知道，我就不详细介绍了，不要像我一样犯这个错误😂。**

## 问题3：二分递归无法退出问题

到这里，问题已经得到了解决，接下来的剧情本应是和大佬客气几句然后愉快的结束讨论，继续接下来的学习。

但是！转折来了！

在执行二分递归版代码的过程中，电脑的风扇总是发出“呼呼”的噪音，而执行直接递归版代码的时候，就没有这个问题。

似乎有哪里不对🤔？

带着这个疑问，我写了下面的测试代码：

```Go
func main() {
	start := time.Now()
	go func() {
		time.Sleep(time.Second)
		fmt.Println("任务进行中，当前协程数:", runtime.NumGoroutine())
	}()
	//测试 orDone 模式
	<-or(
		sig(20*time.Second),
		sig(10*time.Second),
		sig(30*time.Second),
		sig(40*time.Second),
		sig(50*time.Second),
		sig(01*time.Minute),
	)
	fmt.Printf("done after %v\n", time.Since(start))
	fmt.Println("任务结束后，当前协程数:", runtime.NumGoroutine())
}
```

*注：sig 函数的实现和原来一样。*

二分递归版代码的测试结果如下：

```bash
任务进行中，当前协程数: 233059
done after 10.011710905s
任务结束后，当前协程数: 1248213
```

直接递归版代码测试结果如下：
```bash
任务进行中，当前协程数: 11
done after 10.002369341s
任务结束后，当前协程数: 6
```

对比之下，问题很明显：二分递归版本创建的协程数巨多！且任务执行结束后，协程数翻了6倍！

根据这个结果，我们大胆的猜测一下：二分递归的代码陷入了无穷递归。

在纸上画一下测试 case 的递归树，发现 len(channels) == 3 的情况下，左右子树 len(channels) 分别是 1 和 2，但是加上退出信号 orDone 之后，变成了2和3。这里长度为 3 的这个分支发生了无穷递归。

这也解答了**问题1**最开始的第2个疑问：case2 为什么是特殊情况？能不能省掉，直接递归？

答案是 case len(channels)\=\=2 如果直接递归，会发生无穷递归，所以不能省掉。并且 case len(channels)\=\=3 也应该作为特殊情况处理，避免无穷递归。

所以二分递归版正确的写法是：
```Go
go func() {
		defer close(orDone)

		switch len(channels) {
		case 2:
			select {
			case <-channels[0]:
			case <-channels[1]:
			}
		case 3:
			select {
			case <-channels[0]:
			case <-channels[1]:
			case <-channels[2]:
			}
		default:
			m := len(channels) / 2
			select {
			case <-or(append(channels[:m:m], orDone)...): // must append orDone to avoid leak!!!!
			case <-or(append(channels[m:], orDone)...):
			}
		}
	}()
```

再次和晁老师沟通后，得到了肯定的答复！

## 问题4：二分递归的效率问题

如果你不怕麻烦，在跑一遍二分递归的最终版代码：

```bash
任务进行中，当前协程数: 15
done after 10.002655818s
任务结束后，当前协程数: 6
```

结果没有异常，任务结束后，剩余协程数是6，说明任务结束信号正常传递，递归出来的协程都正常退出了。但是任务进行中的协程数比直接递归多4个！

难道二分递归的效率反而更低些？

随便测试几组 case 就能发现，随着 len(channels) 的上升，二分递归版衍生出来的协程数与直接递归衍生出来的协程数的差值也在上升。

这是因为二分递归版每递归一次，len(channels) 就会加2，而直接递归版 len(channels) 只会加1。而且为了减少递归衍生出的协程数，直接递归版把 case 2 单独拎了出来进行处理​。

## 结尾

本文记录了学习 channel 的应用场景 orDone 模式中一次又一次的跳坑出坑的经历，虽然痛苦，却苦尽甘来。

文末留个开放性问题吧，二分递归和直接递归衍生出来的协程数似乎能用数学表达式写出来，你知道怎么写吗？

我反正是干不动，躺下了。

下期再见。

----
