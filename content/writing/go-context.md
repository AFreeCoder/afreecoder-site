---
title: 聊一聊 golang 中的 Context 的实现
date: 2020-12-15
slug: go-context
original_url: https://afreecoder.cn/2020/12/15/go-context/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 编程语言中的 Context

Context 的直接翻译是上下文或环境。在编程语言中，翻译成运行环境更合适。

比如一段程序，在执行之初，我们可以设定一个环境参数：最大运行时间，一旦超过这个时间，程序也应该随之终止。

在 golang 中， Context 被用来在各个 goroutine 之间传递取消信号、超时时间、截止时间、key-value等环境参数。

## golang 中的 Context 的实现

golang中的Context包很小，除去注释，只有200多行，非常适合通过源码阅读来了解它的设计思路。

***注：本文中的golang 均指 go 1.14***

### 接口 Context 的定义

golang 中 Context 是一个接口类型，具体定义如下：

```go
type Context interface {
Deadline() (deadline time.Time, ok bool)
Done() <-chan struct{}
Err() error
Value(key interface{}) interface{}
}
```

**Deadline()**

Deadline() 返回的是当前 Context 生命周期的截止时间。

**Done()**

Done() 返回的是一个只读的 channel，如果能从这个 channel 中读到任何值，则表明context的生命周期结束。

**Err()**

这个比较简单，就是返回异常。

**Value(key interface{})**

Value(key interface{}) 返回的是 Context 存储的 key 对应的 value。如果在当前的 Context 中没有找到，就会从父 Context 中寻找，一直寻找到最后一层。

### 4种基本的context类型

| 类型 | 说明 |
| --- | --- |
| emptyCtx | 一个没有任何功能的 Context 类型，常用做 root Context。 |
| cancelCtx | 一个 cancelCtx 是可以被取消的，同时由它派生出来的 Context 都会被取消。 |
| timerCtx | 一个 timeCtx 携带了一个timer(定时器)和截止时间，同时内嵌了一个 cancelCtx。当 timer 到期时，由 cancelCtx 来实现取消功能。 |
| valueCtx | 一个 valueCtx 携带了一个 key-value 对，其它的 key-value 对由它的父 Context 携带。 |

### emptyCtx 定义及实现

```go
type emptyCtx int

func (*emptyCtx) Deadline() (deadline time.Time, ok bool) {
return
}

func (*emptyCtx) Done() <-chan struct{} {
return nil
}

func (*emptyCtx) Err() error {
return nil
}

func (*emptyCtx) Value(key interface{}) interface{} {
return nil
}
```

看 emptyCtx 很轻松，因为它什么都没做，仅仅是实现了 Context 这个接口。在 context 包中，有一个全局变量 background，值为 new(emptyCtx)，它的作用就是做个跟 Context。其它类型的 Context 都是在 background 的基础上扩展功能。

### cancelCtx 定义及实现

先看下 cancelCtx 的定义和创建。

```go
// 定义
type cancelCtx struct {
Context

mu       sync.Mutex            // protects following fields
done     chan struct{}         // created lazily, closed by first cancel call
children map[canceler]struct{} // set to nil by the first cancel call
err      error                 // set to non-nil by the first cancel call
}

// 创建
func WithCancel(parent Context) (ctx Context, cancel CancelFunc) {
c := newCancelCtx(parent)
propagateCancel(parent, &c)
return &c, func() { c.cancel(true, Canceled) }
}

// newCancelCtx returns an initialized cancelCtx.
func newCancelCtx(parent Context) cancelCtx {
return cancelCtx{Context: parent}
}
```

总体来说，cancelCtx 的创建就是把父 Context 复制到 cancelCtx 的成员 Context 上，然后把父 Context 的一些信号广播到子 Context 上。最后返回了 cancelCtx 的引用，以及一个 cancelFunc。

我们看一下 cancel 实现的细节：

```go
func (c *cancelCtx) cancel(removeFromParent bool, err error) {
if err == nil {
panic("context: internal error: missing cancel error")
}
c.mu.Lock()
if c.err != nil {
c.mu.Unlock()
return // already canceled
}
c.err = err
if c.done == nil {
c.done = closedchan
} else {
close(c.done)
}
for child := range c.children {
// NOTE: acquiring the child's lock while holding parent's lock.
child.cancel(false, err)
}
c.children = nil
c.mu.Unlock()

if removeFromParent {
removeChild(c.Context, c)
}
}
```

cancel 有两个参数，一个是 removeFromParent，表示当前的取消操作是否需要把自己从父 Context 中移除，第二个参数就是执行取消操作需要返回的错误提示。

根据 cancel 的流程，如果 c.done 是 nil (父 Context 是 emptyCtx 的情况)，就赋值 closedchan。（ closedchan 是一个被关闭的channel）；如果不是nil，就直接关闭。然后递归关闭子 Context。

这里注意一下，关闭子 Context 的时候，removeFromParent 参数传值是 false，这是因为当前 Context 在关闭的时候，把 child 置成了 nil，所以子 Context 就不用再执行一次从父 Context 移除自身的操作了。

最后，我们重点说一说 **propagateCancel** 函数。

```go

func propagateCancel(parent Context, child canceler) {
done := parent.Done()
if done == nil {
return // parent is never canceled
}

select {
case <-done:
// parent is already canceled
child.cancel(false, parent.Err())
return
default:
}

if p, ok := parentCancelCtx(parent); ok {
p.mu.Lock()
if p.err != nil {
// parent has already been canceled
child.cancel(false, p.err)
} else {
if p.children == nil {
p.children = make(map[canceler]struct{})
}
p.children[child] = struct{}{}
}
p.mu.Unlock()
} else {
atomic.AddInt32(&goroutines, +1)
go func() {
select {
case <-parent.Done():
child.cancel(false, parent.Err())
case <-child.Done():
}
}()
}
}
```

从函数名 propagateCancel 大概能看出看出来这个函数的功能，即 “传播取消（信号）”。回想一下，父 Context 是如何判断有没有收到取消信号的？是根据它的私有成员 ctx.done 来判断的。那子 Context 如何能接收到这个信号呢？这就是函数 propagateCancel 干的事情，把 ctx.done 赋值给子 Context 的私有成员 done，子 Context 就可以获取到取消的信号。

propagateCancel 的实际处理要更为复杂一些。首先是判断判断父 Context 有没有被 cancel 掉？如果已经 cancel 掉，那么直接 cancel 掉当前的子 Context；如果没有的话，就会**断言父 Context 是否是emptyCtx 类型**，如果是，就通过父 Context 的成员 children 把子 Context 挂在父 Context 下面；如果不是，就启一个协程监听父 Context 信号。

解释一下为什么会 **断言父 Context 是否是emptyCtx 类型** ？想象一下，如果是你来写这段逻辑，会怎么写？最简单的方法就是每个子 Context 启一个协程，监听取消信号。这种方式能确实能实现取消信号广播的功能，但缺点就是如果子 Context 过多，协程就会很多，一直占用系统资源；而如果父 Context 的类型是 cancelCtx，那么它就能通过成员 children 递归的取消子 Context。一边是 n 个协程监听取消信号，一遍是一个协程就能递归取消所有子 Context，哪种方式消耗资源少，一目了然。

### timerCtx 定义及实现

先看以下 timerCtx 的定义和创建：

```go
type timerCtx struct {
cancelCtx
timer *time.Timer // Under cancelCtx.mu.

deadline time.Time
}

func WithDeadline(parent Context, d time.Time) (Context, CancelFunc) {
if cur, ok := parent.Deadline(); ok && cur.Before(d) {
// The current deadline is already sooner than the new one.
return WithCancel(parent)
}
c := &timerCtx{
cancelCtx: newCancelCtx(parent),
deadline:  d,
}
propagateCancel(parent, c)
dur := time.Until(d)
if dur <= 0 {
c.cancel(true, DeadlineExceeded) // deadline has already passed
return c, func() { c.cancel(false, Canceled) }
}
c.mu.Lock()
defer c.mu.Unlock()
if c.err == nil {
c.timer = time.AfterFunc(dur, func() {
c.cancel(true, DeadlineExceeded)
})
}
return c, func() { c.cancel(true, Canceled) }
}

func WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc) {
return WithDeadline(parent, time.Now().Add(timeout))
}
```

有了前面的 cancelCtx 的基础后，看 timerCtx 会清晰很多。timerCtx 的结构简单一些。timeCtx 有三个成员，第一个是 cancelCtx，这意味这 timerCtx 的取消的操作其实是通过 cancelCtx 实现的；第二个成员是 timer，这是一个定时器，干的事情就是到 deadline 的时候，执行 cancel 操作；第三个成员就是 deadline。

当然，除了等定时器到期自动执行 cancel 操作，也可以主动执行：

```go
func (c *timerCtx) cancel(removeFromParent bool, err error) {
c.cancelCtx.cancel(false, err)
if removeFromParent {
// Remove this timerCtx from its parent cancelCtx's children.
removeChild(c.cancelCtx.Context, c)
}
c.mu.Lock()
if c.timer != nil {
c.timer.Stop()
c.timer = nil
}
c.mu.Unlock()
}
```

如果主动执行 cancel 操作，除了会递归取消子 Context，还是终止定时器。

### valueCtx 的定义和创建

```go
type valueCtx struct {
Context
key, val interface{}
}

func WithValue(parent Context, key, val interface{}) Context {
if key == nil {
panic("nil key")
}
if !reflectlite.TypeOf(key).Comparable() {
panic("key is not comparable")
}
return &valueCtx{parent, key, val}
}

func (c *valueCtx) Value(key interface{}) interface{} {
if c.key == key {
return c.val
}
return c.Context.Value(key)
}
```

valueCtx 也很简单，一个 Context 类型的成员，还有两个都是 interface{} 类型的成员 key，value。

从 valueCtx 的创建能看到，如果想给 Context 存储一个键值对，只能通过 WithValue 函数创建，且每个 Context 只能存储一对。取值的方式是递归寻找父 Context 存储的键值对，所以一个 Context 相当于存储了全部父节点的键值对。

另外可以看到，valueCtx 的成员是 Context 类型，不是 cancelCtx 类型，这一点需要注意。所以不同的业务场景需要选择不同的 Context。

## golang 中 Context 的使用

golang 中 Context 的使用套路是在最开始的时候，创建一个 root Context，这个 root Context 就是 emptyCtx 的一个实例。

```go
var (
background = new(emptyCtx)
)

func Background() Context {
return background
}
```

接着是根据各个场景，创建不同类型的 Context。

此外，官方博客也给出了 Context 使用的一些建议：

1. 不能在其它类型的结构下放 Context 类型的成员。
2. Context 类型应该作为函数的第一个参数使用，简写是 ctx
3. 不要用 nil 来代替本该传入的 Context，实在不行可以先传 context.Todo() (和 background 类似)。
4. 不要把函数内部的参数添加到 ctx 中。ctx 中应该存一些贯穿始终的数据。
5. Context 是并发安全的，所以不用担心多个线程同时使用。

## 结尾

golang 的 Context 就讲到这里，由于篇幅原因，总觉得还有不少地方没有讲清楚，下回有机会结合业务场景讲一下 Context 的具体使用。

## 参考

1. [深度解密Go语言之context](https://zhuanlan.zhihu.com/p/68792989)
2. [由浅入深聊聊Golang的context](https://blog.csdn.net/u011957758/article/details/82948750?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522160788294719726891176947%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=160788294719726891176947&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_v2~rank_v29-10-82948750.nonecase&utm_term=golang%E4%B8%AD%E7%9A%84context&spm=1018.2118.3001.4449)
