---
title: Go 并发基石之 channel (三) —— 几种典型的应用模式
date: 2021-05-23
slug: go-channel-3
original_url: https://afreecoder.cn/2021/05/23/go-channel-3/
source_file: /Users/afreecoder/Nutstore Files/工作空间/我的笔记/40_outbox/published/Go 并发基石之 channel (三) —— 几种典型的应用模式.md
platforms:
  - 微信公众号
bodyFormat: markdown
---
> Go 并发系列是根据我对晁岳攀老师的《Go 并发编程实战课》的吸收和理解整理而成，如有偏差，欢迎指正~

在上一篇 [Go 并发基石之 channel (二) —— 源码初探](https://mp.weixin.qq.com/s/uS4jS26V7jfJW80Jpsh3RA) 中粗略的了一遍 channel 的源码，大致了解了背后的实现思路。

这一篇，主要介绍 channel 的几种经典的应用模式。

## channel 的五种应用场景

![channel 的五种应用场景](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/05/22/channel-de-wu-zhong-ying-yong-chang-jing.jpg)

## 消息交流

channel 的底层是一个循环队列，当队列的长度大于 0 的 时候，它会被当做线程安全队列和 buffer。利用这个特性，一个 goroutine 可以安全的往 channel 中存放数据，另一个 goroutine 可以安全的从 channel 中读取数据，这样就实现了 goroutine 之间的消息交流。

这个比较简单，就不展开了。

## 数据传递

数据传递类似游戏“击鼓传花”。鼓响时，花（或者其它物件）从一个人手里传到下一个人，数据就类似这里的花。

现在有下面这样一个任务：

> 有 4 个 goroutine，编号为 1、2、3、4。每秒钟会有一个 goroutine 打印出它自己的编号，要求你编写程序，让输出的编号总是按照 1、2、3、4、1、2、3、4……这个顺序打印出来。

```Go
func startTask(id, n int, chans []chan struct{}) {
	// 每个任务从对应的 chan 读取数据，并传递给下一个chan
	for {
		token := <-chans[id]
		fmt.Printf("%d \n", id+1)
		chans[(id+1)%n] <- token
		time.Sleep(time.Second)
	}
}

func main() {
	n := 4
	chans := []chan struct{}{}
	for i := 0; i < n; i++ {
		chans = append(chans, make(chan struct{}))
	}

	for i := 0; i < n; i++ {
		go startTask(i, n, chans)
	}
	chans[0] <- struct{}{}
	select {}
}
```

这段代码中，token 代指“击鼓传花”中的“花”，chans 代指围坐一圈的人。每个 chan（人）都是从上一个 chan（人）手中拿到 token，放在自己手上，从而实现顺序打印 1，2，3，4。

## 信号通知

channel 类型有这样一个特性：如果 channel 为空，那么 recevier 接收数据的时候就会阻塞，直到有新的数据进来或者 channel 被关闭。

利用这个特性，就可以实现 wait/notify 设计模式。另外还有一个经常碰到的场景，实现程序的 graceful shutdown。

```Go
func main() {
  go func() {
      ...... // 执行业务处理
    }()

  // 处理CTRL+C等中断信号
  termChan := make(chan os.Signal)
  signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)
  <-termChan 

  // 执行退出之前的清理动作
  doCleanup()
  
  fmt.Println("优雅退出")
}
```

当然，如果清理操作很耗时，需要增加超时限制，doClenup() 可以进行如下改写：
```Go
func main() {
    closed := make(chan struct{})
    
    ...... // 中间过程都一样
    
    // 执行退出之前的清理操作
    go doCleanup(closed)
    
    select {
    case <-closed:
    case <-time.After(time.Second):
        fmt.Println("清理超时，不等了！")
    }
    fmt.Println("优雅退出！")
}

func doCleanup(closed chan struct{}) {
    time.Sleep(time.Minute)
    close(closed)
}
```

## 锁

在这个系列最开始就介绍了 [Go 中 Mutex 设计原理详解（一）](https://mp.weixin.qq.com/s/gjXH9RU_8X_MASHMINHNVQ)。利用 channel 我们也能实现锁的功能。

sync.Mutex 通过修改持有锁标记位的状态达到占有锁的目的，因此 channel 可以通过转移这个标记位的所有权实现占有锁。

具体代码如下：
```Go
// 使用chan实现互斥锁
type Mutex struct {
    ch chan struct{}
}

// 使用锁需要初始化
func NewMutex() *Mutex {
    mu := &Mutex{make(chan struct{}, 1)}
    mu.ch <- struct{}{}
    return mu
}

// 请求锁，直到获取到
func (m *Mutex) Lock() {
    <-m.ch
}

// 解锁
func (m *Mutex) Unlock() {
    select {
    case m.ch <- struct{}{}:
    default:
        panic("unlock of unlocked mutex")
    }
}

// 尝试获取锁
func (m *Mutex) TryLock() bool {
    select {
    case <-m.ch:
        return true
    default:
    }
    return false
}

// 加入一个超时的设置
func (m *Mutex) LockTimeout(timeout time.Duration) bool {
    timer := time.NewTimer(timeout)
    select {
    case <-m.ch:
        timer.Stop()
        return true
    case <-timer.C:
    }
    return false
}

// 锁是否已被持有
func (m *Mutex) IsLocked() bool {
    return len(m.ch) == 0
}

func main() {
    m := NewMutex()
    ok := m.TryLock()
    fmt.Printf("locked v %v\n", ok)
    ok = m.TryLock()
    fmt.Printf("locked %v\n", ok)
}
```

这里实现锁主要利用了向满 channel 发送数组或从空 channel 接收数据会阻塞的特性。另外，利用 select 很容易实现 TryLock 和 Timeout 的功能。

## 任务编排

在前面的 [Go 并发任务编排利器之 WaitGroup](https://mp.weixin.qq.com/s/GhM-xnBWazxii2G0uvwOew) 中介绍了 sync.WaitGroup。通过 sync.WaitGroup，我们能很容易的实现 *等待一组 goroutine 完成任务* 这种任务编排需求。同样，我们也可以用 channel 实现。

但是如果任务编排再复杂一些呢？如果面试官出了下面这个题目：
> 有一批任务需要处理，但是机器资源有限，只能承受100的并发度，该如何实现？

一种解决方案就是使用 channel，代码如下：

```Go
func task(ch chan struct{}) {
	//执行任务
	time.Sleep(time.Second * 10)
	ch <- struct{}{}
	return
}

func concurrency100() {
	ch := make(chan struct{}, 100)

	for i := 0; i < 100; i++ {
		ch <- struct{}{}
	}

	for {
		<-ch
		go task(ch)
	}
}
```

利用 sender 给满员的 channel 发送数据会阻塞的特性，就实现了并发度始终维持在 100 的需求。

除此之外，下面再介绍几种常见的模式。

### or-Done 模式

or-Done 模式对应的场景很好理解，n 个任务，有一个完成就算完成。

看过之前文章 [记一次学习 orDone 模式爬坑经历](https://mp.weixin.qq.com/s/4Z2hhn1H6F95wPnFfMz1bA) 读者对 or-Done 应该不陌生，因为课程中关于 or-Done 模式的代码是**有问题的！**

正确的代码应该是下面这个：

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

在编写 or-Done 的代码时，有两个点需要注意：
1. 递归前，需要声明一个 orDone 变量，用来通知子函数退出。
2. len(channels) == 2 是一种特殊情况，否则会因为 append orDone 产生无限递归。

### 扇入模式

扇入（Fan-In）是一个术语，用于描述将多个结果组合到一个 channel 中的过程。扇入模式下，输入源有多个，输出目标只有一个。下面是扇入模式的一种实现：

```Go
func fanInRec(chans ...<-chan interface{}) <-chan interface{} {
    switch len(chans) {
    case 0:
        c := make(chan interface{})
        close(c)
        return c
    case 1:
        return chans[0]
    case 2:
        return mergeTwo(chans[0], chans[1])
    default:
        m := len(chans) / 2
        return mergeTwo( // 对多个数据进行合并处理
            fanInRec(chans[:m]...),
            fanInRec(chans[m:]...))
    }
}
```

### 扇出模式

扇出模式（Fan-Out）只有一个输入源，但是有多个输出目标。下面是一个扇出模式的实现，从源 channel 取出一个数据后，依次发送给多个目标 channel。发送的时候，既可以同步，也可以异步。

```Go
func fanOut(ch <-chan interface{}, out []chan interface{}, async bool) {
    go func() {
        defer func() { //退出时关闭所有的输出chan
            for i := 0; i < len(out); i++ {
                close(out[i])
            }
        }()

        for v := range ch { // 从输入chan中读取数据
            for i := 0; i < len(out); i++ {
                if async { //异步
                    go func() {
                        out[i] <- v // 放入到输出chan中,异步方式
                    }()
                } else {
                    out[i] <- v // 放入到输出chan中，同步方式
                }
            }
        }
    }()
}
```

### stream

stream 是把 channel 当做流式管道的方式。

```Go
// asStream 将一个 slice 转成流
func asStream(done <-chan struct{}, values ...interface{}) <-chan interface{} {
    s := make(chan interface{}) //创建一个unbuffered的channel
    go func() { // 启动一个goroutine，往s中塞数据
        defer close(s) // 退出时关闭chan
        for _, v := range values { // 遍历数组
            select {
            case <-done:
                return
            case s <- v: // 将数组元素塞入到chan中
            }
        }
    }()
    return s
}
```

转成流之后，如果要实现取前 N 个数的功能 TakeN，可以再创建一个输出流，从输入流中读取: 
```Go
func takeN(done <-chan struct{}, valueStream <-chan interface{}, num int) <-chan interface{} {
    takeStream := make(chan interface{}) // 创建输出流
    go func() {
        defer close(takeStream)
        for i := 0; i < num; i++ { // 只读取前num个元素
            select {
            case <-done:
                return
            case takeStream <- <-valueStream: //从输入流中读取元素
            }
        }
    }()
    return takeStream
}
```

### map-reduce

map-reduce 是一种面向大规模数据处理的并行计算模型和方法，但是这里要介绍的是一种单机版的 map-reduce 模式。

map-reduce 分为两个步骤，第一步是 map，将队列中的数据用 mapFn 函数处理；第二步是 reduce，将处理后的数据用 reduceFn 函数汇总。

map 逻辑实现如下：
```Go
func mapChan(in <-chan interface{}, mapFn func(interface{}) interface{}) <-chan interface{} {
    out := make(chan interface{}) //创建一个输出chan
    if in == nil { // 异常检查
        close(out)
        return out
    }

    go func() { // 启动一个goroutine,实现map的主要逻辑
        defer close(out)
        for v := range in { // 从输入chan读取数据，执行业务操作，也就是map操作
            out <- mapFn(v)
        }
    }()

    return out
}
```

reduce 逻辑实现如下：
```Go
func reduce(in <-chan interface{}, reduceFn func(r, v interface{}) interface{}) interface{} {
    if in == nil { // 异常检查
        return nil
    }

    out := <-in // 先读取第一个元素
    for v := range in { // 实现reduce的主要逻辑
        out = reduceFn(out, v)
    }

    return out
}
```

想象这样一个需求：将一组数据中每个数据乘以10，最后计算总和。为此，我们需要实现 mapFn (乘 10) 和 reduceFn （求和）。

```Go

// 生成一个数据流
func asStream(done <-chan struct{}) <-chan interface{} {
    s := make(chan interface{})
    values := []int{1, 2, 3, 4, 5}
    go func() {
        defer close(s)
        for _, v := range values { // 从数组生成
            select {
            case <-done:
                return
            case s <- v:
            }
        }
    }()
    return s
}

func main() {
    in := asStream(nil)

    // map操作: 乘以10
    mapFn := func(v interface{}) interface{} {
        return v.(int) * 10
    }

    // reduce操作: 对map的结果进行累加
    reduceFn := func(r, v interface{}) interface{} {
        return r.(int) + v.(int)
    }

    sum := reduce(mapChan(in, mapFn), reduceFn) //返回累加结果
    fmt.Println(sum)
}
```

## 总结

这一篇过了一遍基于 channel 的几种典型应用模式，这些模式都不复杂，但是要做到灵活运用却不容易，平时写代码过程中如果遇到相应场景，还要仔细留心体会，多加练习。

到这里，channel 相关的知识点就告一段落了。

喜极而泣~

下期开始新的章节，再见~

----
