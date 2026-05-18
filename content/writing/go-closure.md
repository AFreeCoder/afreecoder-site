---
title: Go 闭包问题
date: 2021-12-14
slug: go-closure
original_url: https://afreecoder.cn/2021/12/14/go-closure/
source_file: /Users/afreecoder/Nutstore Files/工作空间/我的笔记/40_outbox/published/Go 闭包问题.md
platforms:
  - 微信公众号
bodyFormat: markdown
---
前几天在机械的堆砌业务代码时，不小心掉进了 Go 循环中使用闭包的一个坑，因此借这个机会总结一下 Go 闭包问题相关的知识。

## 1. 什么是闭包？

> 一个函数和对其周围状态（词法环境）的引用捆绑在一起，这样的组合就是闭包。

直接看定义，很难理解闭包到底什么。所以我画了下面这张图：

![闭包](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/12/13/bi-bao.jpg)

这张图中，自由变量 i 和函数 f 构成了闭包。

由此，可以总结闭包的几个关键点：
1. 自由变量 i 和函数 f 同属于一个局部环境
2. 函数 f 内部直接使用了自由变量 i

在外部环境无法直接访问自由变量，通过执行函数 f 能实现对 i 的操作。

需要注意的是，自由变量**不一定是在局部环境中定义**的，也有可能是以参数的形式传进局部环境；另外在 Go 中，**函数也可以作为参数传递**，因此函数也可能是自由变量。

## 2. 闭包的应用场景

### 2.1 数据隔离

**需求:**
> 统计一个函数的执行次数，并打印出来（其实就是计数器）

不考虑闭包，短平快的一种实现方式是声明一个全局变量，函数每执行一次，变量值加一，并打印。

这种方法的一个缺点是全局变量容易被修改，安全性较差。闭包可以解决这个问题：

```go
func newCounter() func() {
    i := 0
    return func() {
        i++
        fmt.Println(i)
    }
}

func main() {
    counter := newCounter()
    counter()
    counter()
}
```

由于 `i` 是 newCounter 内部变量，无法从外部修改，因此在实现计数器的同时，也实现了数据隔离的效果。

### 2.2 中间件

Go 中的中间件和 Python 中的装饰器十分类似。

在 Go 中，函数是 **一等公民**，即函数可以像普通类型一样，被赋值给变量，作为参数传递，作为返回值。

因此在闭包中，除了动态创建函数，还可以通过参数传递的方式，将函数穿进去，实现闭包。

典型的应用场景是中间件。

**需求:**
> 计算任意函数（函数签名一致）的执行耗时。

具体实现如下：

```go

type funcSign func(int)

func timer(f func(int)) func(int) {
	return func(n int) {
		start := time.Now()
		f(n)
		end := time.Now()
		fmt.Println("This operation take ", end.Sub(start))
	}
}

func printN(n int) {
	fmt.Println("printN is running, n is ", n)
}

func main() {
	printNWithTimer := timer(printN)
	printNWithTimer(1)
	printNWithTimer(10)
}

```
在这个例子中，函数 printN 是自由变量。

printN 原本是普通的函数，但是通过 timer 的包裹，返回的 printNWithTimer 不仅具备 printN 的全部功能（且不需要了解实现），还能计算 printN 的执行耗时。

### 2.3 访问原本访问不到的数据

在一些场景下，只能传递参数类型固定的函数，这个时候如果要访问额外的数据，就可以使用闭包。

比如 Go 内置的 `net/http` 包，启动一个 webserver 时候，每个路由都需要注册一个 handlerFunc 类型的函数。

```go
type Database struct {
  Url string
}

func NewDatabase(url string) Database {
  return Database{url}
}

func main() {
  db := NewDatabase("localhost:5432")

  http.HandleFunc("/hello", hello(db))
  http.ListenAndServe(":3000", nil)
}

func hello(db Database) func(http.ResponseWriter, *http.Request) {
  return func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, db.Url)
  }
}
```

http.HandleFunc 的第二个参数只接受函数签名如下的函数：

```go
type handlerFunc func(w http.ResponseWriter, r *http.Request)
```

在不使用全局变量的情况下，我们可以通过闭包实现对 db 的访问。

当然，这种情况我们通常采取的是另一种解决方式：对结构体 Database 增加一个相同函数签名的成员函数。

### 2.4 二分查找

Go 的基础库 `sort` 中使用闭包的场景随处可见。

**需求:**
> 对任意一个有序列表，查找大于指定值的索引。注意，有序列表的元素是自定义类型。

由于是自定义类型，常见的做法是每个自定义类型都实现自己的查找方法，但是如果使用的闭包的话，就简单很多。

```go
func main() {
  numbers := []int{1, 11, -5, 8, 2, 0, 12}
  sort.Ints(numbers)
  fmt.Println("Sorted:", numbers)

  index := sort.Search(len(numbers), func(i int) bool {
    return numbers[i] >= 7
  })
  fmt.Println("The first number >= 7 is at index:", index)
  fmt.Println("The first number >= 7 is:", numbers[index])
}
```

`sort.Search` 内部实现了二分查找。二分查找的关键是列表有序、能比较大小。在类型未知的情况下，比较大小可以通过闭包实现。

```go
func(i int) bool {
    return numbers[i] >= 7
}
```

上面这个作为参数传递的闭包，绑定了自由变量 numbers 和指定比较的对象 7，匿名函数实现了比较大小的功能。

下面是 `sort.Search` 的源码：

```go
func Search(n int, f func(int) bool) int {
	i, j := 0, n
	for i < j {
		h := int(uint(i+j) >> 1) // avoid overflow when computing h
		// i ≤ h < j
		if !f(h) {
			i = h + 1 // preserves f(i-1) == false
		} else {
			j = h // preserves f(j) == true
		}
	}
	// i == j, f(i-1) == false, and f(j) (= f(i)) == true  =>  answer is i.
	return i
}
```

### 2.5 defer

Go 中 defer 常常和闭包结合在一起用，常见的一种用法就是在函数返回后关闭文件。

```go
func handleFile() {
    fPtr, err := os.Open("you file!")
    if err != nil {
        fmt.Println("open file failed, ", err)
    }
    defer fPtr.Close()
    return
}
```

defer 的机制是将后面的函数注册到 defer 的函数栈中，当前函数 handleFile 执行完成之后，defer 将函数栈的中函数取出来，一个一个的执行。

在这里，fPtr.Close() 其实是一个闭包（携带自由变量 fPtr），因此，即使 handleFile 执行结束，Close 函数仍然能对 fPtr 进行关闭操作。

## 3. 闭包的几个注意点

### 3.1 值还是引用?

闭包对自由变量的修改是引用的方式。

```go
func newFunc() (func(), func()) {
	i := 0
	f1 := func() {
		i++
		fmt.Println(i)
		return
	}
	f2 := func() {
		i++
		fmt.Println(i)
		return
	}
	return f1, f2
}

func main() {
	f1, f2 := newFunc()
	f1()
	f2()
}
```

输出结果：

```bash
1
2
```

因为是引用，f1() 修改了 i 的值后，f2() 中 i 的初始值变成了1。

### 3.2 自由变量的生命周期

闭包中，自由变量的生命周期等同于闭包函数的生命周期，和局部环境的周期无关。

借用参考文章[3]中的一张图：

![](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/2021/12/13/16393217690693.jpg)

闭包函数第一次调用之后，自由变量即进入堆内存上，后续闭包函数的每一次调用，都是对自由变量的引用。

## Go 循环中使用闭包的一个坑

前一段时间，在业务代码中写出了如下的代码：

```go
func main() {
	for i := 0; i < 6; i++ {
		go func() {
			fmt.Println(i)
		}()
	}
	time.Sleep(1*time.Second)
}
```

这段代码能编译通过，也能运行，但是如果执行检查 `go vet main.go` 其实是会报错的。

这段代码的输出结果如下：

```bash
3
6
6
6
6
6
```

每次输出都不一定一样，但是都不符合预期。

这是因为 for 循环中开启的协程其实是闭包，6个并发协程读的都是同一个变量。

修改方式也很简单，不直接引用变量 i，而是通过传参的方式读取 i 的副本。

```go
func main() {
	for i := 0; i < 6; i++ {
		go func() {
			fmt.Println(i)
		}()
	}
	time.Sleep(1*time.Second)
}
```

## 参考文章

1. [5 Useful Ways to Use Closures in Go](https://www.calhoun.io/5-useful-ways-to-use-closures-in-go/)
2. [Go语言高级编程](https://chai2010.cn/advanced-go-programming-book/ch5-web/ch5-03-middleware.html)
3. [Go语言闭包问题](https://segmentfault.com/a/1190000021560558)

----
