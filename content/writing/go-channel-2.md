---
title: Go 并发基石之 channel (二) —— 源码初探
date: 2021-05-16
slug: go-channel-2
original_url: https://afreecoder.cn/2021/05/16/go-channel-2/
source_file: /Users/afreecoder/Nutstore Files/工作空间/我的笔记/40_outbox/published/Go 并发基石之 channel (二) —— 源码初探.md
platforms:
  - 微信公众号
bodyFormat: markdown
---
> Go 并发系列是根据我对晁岳攀老师的《Go 并发编程实战课》的吸收和理解整理而成，如有偏差，欢迎指正~

在上一篇 [Go 并发基石之 channel（一）](https://mp.weixin.qq.com/s/PBL0MAoIf3ulur4TswV0bw) 中简单介绍了 channel 的由来、基本用法以及几种容易出错的场景。

这一篇，尝试通过 channel 源码的阅读，了解 channel 的实现思路。

*说明：以下源码均基于 go1.16。*

## channel 的定义

channel 的数据类型是 [runtime.hchan](https://github.com/golang/go/blob/release-branch.go1.16/src/runtime/chan.go)，其详细定义如下：

```Go
type hchan struct {
	qcount   uint           // channel中元素的个数
	dataqsiz uint           // channel的容量
	buf      unsafe.Pointer // 指向底层循环队列的指针
	elemsize uint16         // 元素的大写
	closed   uint32         // 是否关闭的标志
	elemtype *_type // 元素的类型
	sendx    uint   // 已发送元素在队列中的索引
	recvx    uint   // 已接收元素在队列中的索引
	recvq    waitq  // 等待接收数据的协程队列
	sendq    waitq  // 等待发送数据的协程队列

	// 锁，保护hchan中所有字段
	lock mutex
}
```

整体上，channel 的设计思路可以概述为用一个循环队列存储数据，send 索引和 recv 索引记录发送和接收数据的节点。向 channel 发送的数据会被添加循环队列尾部；从 channel 接收的数据来自于队列的首部。

## channel 的创建

创建 channel 的语句如下：

```Go
ch := make(chan int)       // 无缓冲的channel
ch := make(chan int, 2)    // 有缓冲的channel
```

make 函数的实现如下：

```Go
// walkMakeChan walks an OMAKECHAN node.
func walkMakeChan(n *ir.MakeExpr, init *ir.Nodes) ir.Node {
	// When size fits into int, use makechan instead of
	// makechan64, which is faster and shorter on 32 bit platforms.
	size := n.Len
	fnname := "makechan64"
	argtype := types.Types[types.TINT64]

	if size.Type().IsKind(types.TIDEAL) || size.Type().Size() <= types.Types[types.TUINT].Size() {
		fnname = "makechan"
		argtype = types.Types[types.TINT]
	}
	return mkcall1(chanfn(fnname, 1, n.Type()), n.Type(), init, reflectdata.TypePtr(n.Type()), typecheck.Conv(size, argtype))
}
```

仅仅看注释，也能猜出来，make 的时候，编译器会根据系统的位数选择对应的函数： makechan64 还是 makechan。makechan64 底层直接调用的 makechan。所以我们直接看 makechane 的实现：

```Go
const (
  // maxAlign 用来设置内存最大对齐值
	maxAlign  = 8
	// hchanSize 是大于 Sizeof(hchan{}) 的且为8的倍数中最小的一个
	hchanSize = unsafe.Sizeof(hchan{}) + uintptr(-int(unsafe.Sizeof(hchan{}))&(maxAlign-1))
)

func makechan(t *chantype, size int) *hchan {
	elem := t.elem

	// 元素最大不能超过64K
	if elem.size >= 1<<16 {
		throw("makechan: invalid channel element type")
	}

	if hchanSize%maxAlign != 0 || elem.align > maxAlign {
		throw("makechan: bad alignment")
	}

	mem, overflow := math.MulUintptr(elem.size, uintptr(size))
	if overflow || mem > maxAlloc-hchanSize || size < 0 {
		panic(plainError("makechan: size out of range"))
	}

  // 下面这个注释没太看明白，先放着，等以后看完 gc 再重新了解。 
	// Hchan does not contain pointers interesting for GC when elements stored in buf do not contain pointers.
	// buf points into the same allocation, elemtype is persistent.
	// SudoG's are referenced from their owning thread so they can't be collected.
	var c *hchan
	switch {
	case mem == 0:
		// 无缓冲
		c = (*hchan)(mallocgc(hchanSize, nil, true))
		c.buf = c.raceaddr()
	case elem.ptrdata == 0:
		// 非指针类型元素内存申请方式
		c = (*hchan)(mallocgc(hchanSize+mem, nil, true))
		c.buf = add(unsafe.Pointer(c), hchanSize)
	default:
		// 指针类型元素内存申请方式
		c = new(hchan)
		c.buf = mallocgc(mem, elem, true)
	}

	c.elemsize = uint16(elem.size)
	c.elemtype = elem
	c.dataqsiz = uint(size)
	lockInit(&c.lock, lockRankHchan)

	return c
}
```

梳理 makechan 的逻辑之前，先看下常量 maxAlign 和 hchanSize。

*maxAlign*： 内存对齐最大值，这里8表示64位对齐。
*hchanSize*： 大于 Sizeof(hchan{}) 且为8的倍数中最小的一个，其目的是提高 CPU 存取的速度（**CPU 按块存取数据，块的大小可以是8、16、24等字节**）。

第 20 行，计算需要给循环队列 buf 分配的内存，如果超过最大限制，则抛出异常。

接下来的内存分配流程比较清晰。

如果 mem == 0，说明是无缓冲 channel，只需要分配 hchan 本身的内存；如果缓冲数据是值类型，则分配 hchanSize+mem 大小的连续内存，buf 指向循环队列；如果缓冲数据是指针类型，则分别分配 hchan 和循环队列的内存。

## 往 channel 发送数据

以下是往 channel 发送数据的语句：

```Go
ch <- 1
```

其对应源码如下（解释见注释）：

```Go
// entry point for c <- x from compiled code
//go:nosplit
func chansend1(c *hchan, elem unsafe.Pointer) {
	chansend(c, elem, true, getcallerpc())
}

func chansend(c *hchan, ep unsafe.Pointer, block bool, callerpc uintptr) bool {
	if c == nil {
	   // 发送操作有个是否阻塞的判断，如果是非阻塞模式，直接返回false，不会被挂起（如果是select case 语句，block 就是 false）。
		if !block {
			return false
		}
		// waitReasonChanSendNilChan: "chan send (nil chan)"
		gopark(nil, nil, waitReasonChanSendNilChan, traceEvGoStop, 2)
		throw("unreachable")
	}
   // 非阻塞模式，缓冲区满了，直接返回false
	if !block && c.closed == 0 && full(c) {
		return false
	}

	var t0 int64
	// 控制协程信息的输出比例，具体可执行 go doc runtime.SetBlockProfileRate 看详细的解释。
	if blockprofilerate > 0 {
		t0 = cputicks()
	}

	lock(&c.lock)
  // 如果 channel 被关闭，抛出异常
	if c.closed != 0 {
		unlock(&c.lock)
		panic(plainError("send on closed channel"))
	}
  
  // 如果这会有正在等待接收数据的协程，则直接把数据传过去
	if sg := c.recvq.dequeue(); sg != nil {
		send(c, sg, ep, func() { unlock(&c.lock) }, 3)
		return true
	}

  // 如果缓冲队列还有空位，就把要发送的数据拷贝到 sendx 处
	if c.qcount < c.dataqsiz {
		qp := chanbuf(c, c.sendx)
		if raceenabled {
			racenotify(c, c.sendx, nil)
		}
		typedmemmove(c.elemtype, qp, ep)
		c.sendx++
		if c.sendx == c.dataqsiz {
			c.sendx = 0
		}
		c.qcount++
		unlock(&c.lock)
		return true
	}

	if !block {
		unlock(&c.lock)
		return false
	}

	// 如果缓冲区满了，将发送数据的协程挂起
	// 构造一个 mysg:sudog(goroutine 的封装)
	gp := getg()
	mysg := acquireSudog()
	mysg.releasetime = 0
	if t0 != 0 {
		mysg.releasetime = -1
	}
	
	mysg.elem = ep
	mysg.waitlink = nil
	mysg.g = gp
	mysg.isSelect = false
	mysg.c = c
	gp.waiting = mysg
	gp.param = nil
	// 将发送协程放到发送队列中
	c.sendq.enqueue(mysg)

	atomic.Store8(&gp.parkingOnChan, 1)
	gopark(chanparkcommit, unsafe.Pointer(&c.lock), waitReasonChanSend, traceEvGoBlockSend, 2)
	
	KeepAlive(ep)

	// 发送协程被唤醒
	if mysg != gp.waiting {
		throw("G waiting list is corrupted")
	}
	gp.waiting = nil
	gp.activeStackChans = false
	closed := !mysg.success
	gp.param = nil
	if mysg.releasetime > 0 {
		blockevent(mysg.releasetime-t0, 2)
	}
	mysg.c = nil
	releaseSudog(mysg)
	if closed {
		if c.closed == 0 {
			throw("chansend: spurious wakeup")
		}
		// 如果不巧，channel 已经被关闭了，抛出异常
		panic(plainError("send on closed channel"))
	}
	return true
}
```

不深究细节，只看流程，chansend 还比较好理解，只是 if 分支比较多，不容易厘清，可以对着下面的流程图一起看：

![chansend](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/05/16/chansend.png)

## 从 channel 接收数据

从 channel 接收数据的写法有两种：

```Go
a := <-ch
a, ok := <-ch
```

分别对应如下两个函数：

```Go
// entry points for <- c from compiled code
//go:nosplit
func chanrecv1(c *hchan, elem unsafe.Pointer) {
	chanrecv(c, elem, true)
}

// 处理带 ok 的情形
//go:nosplit
func chanrecv2(c *hchan, elem unsafe.Pointer) (received bool) {
	_, received = chanrecv(c, elem, true)
	return
}
```

这两个函数都是通过调用 chanrecv 实现（主要解释见注释）：

```Go
func chanrecv(c *hchan, ep unsafe.Pointer, block bool) (selected, received bool) {

	if c == nil {
	   // 非阻塞模式下，直接返回false
		if !block {
			return
		}
		// 否则挂起
		gopark(nil, nil, waitReasonChanReceiveNilChan, traceEvGoStop, 2)
		throw("unreachable")
	}

  // 非阻塞模式，且chanel缓冲队列为空的情况下，不涉及加锁解锁操作，故优先处理
	if !block && empty(c) {
		if atomic.Load(&c.closed) == 0 {
			return
		}
		
		// empty 是在其它地方实现的，两种情况下会为true：
		// 1) 无缓冲且无发送协程
		// 2) 有缓冲但循环队列为空
		// 故非阻塞情况下，可以直接返回false
		// 这里channel已经被关闭，再次检查channel是否empty
		if empty(c) {
		   // 从关闭的channel中接收同样类型的零值
			if ep != nil {
				typedmemclr(c.elemtype, ep)
			}
			return true, false
		}
	}

	var t0 int64
	if blockprofilerate > 0 {
		t0 = cputicks()
	}

	lock(&c.lock)

  // 阻塞模式下，如果channel已经被关闭，并且缓冲队列中为空
	if c.closed != 0 && c.qcount == 0 {
		if raceenabled {
			raceacquire(c.raceaddr())
		}
		unlock(&c.lock)
		// 从关闭的channel中接收同样类型的零值
		if ep != nil {
			typedmemclr(c.elemtype, ep)
		}
		return true, false
	}
  
  // 有等待的发送者，说明：
  // 1) 无缓冲：直接将发送者的数据传给接收者
  // 2) 缓冲已满：将队列首位数据给接收者，并将发送者的数据放到队列尾部
  // 3) channnel 没有被关闭
	if sg := c.sendq.dequeue(); sg != nil {
		recv(c, sg, ep, func() { unlock(&c.lock) }, 3)
		return true, true
	}

  // 缓冲队列不为空
  // 对recv而言，接下来只需要关心缓冲队列有没有元素，不需要关心channel有没有被关闭
	if c.qcount > 0 {
		// Receive directly from queue
		qp := chanbuf(c, c.recvx)
		if raceenabled {
			racenotify(c, c.recvx, nil)
		}
		// 将队列头部数据拷贝给接收者
		if ep != nil {
			typedmemmove(c.elemtype, ep, qp)
		}
		// 发送完之后，清空，同时 recv 往后挪一位
		typedmemclr(c.elemtype, qp)
		c.recvx++
		if c.recvx == c.dataqsiz {
			c.recvx = 0
		}
		c.qcount--
		unlock(&c.lock)
		return true, true
	}

  // 缓冲队列容量为0，且非阻塞，直接返回false
	if !block {
		unlock(&c.lock)
		return false, false
	}

	// 阻塞模式下，缓冲队列容量为0，将发送数据的协程挂起
	// 构造一个 mysg:sudog(goroutine 的封装)
	gp := getg()
	mysg := acquireSudog()
	mysg.releasetime = 0
	if t0 != 0 {
		mysg.releasetime = -1
	}

	mysg.elem = ep
	mysg.waitlink = nil
	gp.waiting = mysg
	mysg.g = gp
	mysg.isSelect = false
	mysg.c = c
	gp.param = nil
	c.recvq.enqueue(mysg)

	atomic.Store8(&gp.parkingOnChan, 1)
	gopark(chanparkcommit, unsafe.Pointer(&c.lock), waitReasonChanReceive, traceEvGoBlockRecv, 2)

	// 接收数据的协程被唤醒
	if mysg != gp.waiting {
		throw("G waiting list is corrupted")
	}
	gp.waiting = nil
	gp.activeStackChans = false
	if mysg.releasetime > 0 {
		blockevent(mysg.releasetime-t0, 2)
	}
	success := mysg.success
	gp.param = nil
	mysg.c = nil
	releaseSudog(mysg)
	return true, success
}
```

chanrecv 的 if 判断可以对着下面的流程图看：
![chanrecv](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/05/16/chanrecv.jpg)

## close 一个 channel

关闭 一个 channel 的语法如下：

```Go
func closechan(c *hchan) {
	if c == nil {
		panic(plainError("close of nil channel"))
	}

	lock(&c.lock)
	if c.closed != 0 {
		unlock(&c.lock)
		panic(plainError("close of closed channel"))
	}

	c.closed = 1

	var glist gList

	// release all readers
	for {
		sg := c.recvq.dequeue()
		if sg == nil {
			break
		}
		if sg.elem != nil {
		   // close之后，读到的都是零值
			typedmemclr(c.elemtype, sg.elem)
			sg.elem = nil
		}
		if sg.releasetime != 0 {
			sg.releasetime = cputicks()
		}
		gp := sg.g
		gp.param = unsafe.Pointer(sg)
		sg.success = false
		if raceenabled {
			raceacquireg(gp, c.raceaddr())
		}
		glist.push(gp)
	}

	// release all writers (they will panic)
	for {
		sg := c.sendq.dequeue()
		if sg == nil {
			break
		}
		sg.elem = nil
		if sg.releasetime != 0 {
			sg.releasetime = cputicks()
		}
		gp := sg.g
		gp.param = unsafe.Pointer(sg)
		sg.success = false
		if raceenabled {
			raceacquireg(gp, c.raceaddr())
		}
		glist.push(gp)
	}
	unlock(&c.lock)

	// Ready all Gs now that we've dropped the channel lock.
	for !glist.empty() {
		gp := glist.pop()
		gp.schedlink = 0
		goready(gp, 3)
	}
}
```

close 一个 channel 之前，如果这是 channel 是 nil 或者已经被 close ，则抛出异常。

接下来，close 的动作有三块：

1）修改 c.closed 标志位
2）唤醒所有读协程：读到的都是零值
3）唤醒所有写协程：chansend 中会抛出异常

## 结尾

粗略的过了一遍 channel 的源码，还是有不少细节没看明白，但是目前水平所限，只能看到这一步。期待对 Go 有了进一步的了解之后，再回过头来重温，能有新的认识。

下一期过一遍基于 channel 的几种并发模式。

就这样，下一期再见~

----
