---
title: two sum问题(-)
date: 2020-01-05
slug: two-sum(%E4%B8%80)
original_url: https://afreecoder.cn/2020/01/05/two-sum(%E4%B8%80)/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 前言

> 两数之和问题，简而言之就是从数组中找到两个数的和等于某个特定的值，考察的主要思想是空间换时间。同时它还有许多变种，如三数之和、四数之和问题。

## 题目集合

**two sum及其变种如下**：

| 题目 | 难度等级 | 备注 |
| --- | --- | --- |
| [two sum](https://leetcode.com/problems/two-sum/) | easy |  |
| [Two Sum II - Input array is sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) | easy |  |
| [Two Sum III - Data structure design](https://leetcode.com/problems/two-sum-iii-data-structure-design/) | easy | 要订阅，暂时放弃。。。 |
| [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) | medium |  |
| [Two Sum IV - Input is a BST](https://leetcode.com/problems/two-sum-iv-input-is-a-bst/) | easy |  |
| [Two Sum Less Than K](https://leetcode.com/problems/two-sum-less-than-k/) | easy |  |

### 1、经典原题: two sum

> Given an array of integers, return indices of the two numbers such that they add up to a specific target.You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example**

> Given nums = [2, 7, 11, 15], target = 9,Because nums[0] + nums[1] = 2 + 7 = 9,
> return [0, 1].

#### 解法一：暴力破解

```go
func twoSum(nums []int, target int) []int {
    for i := 0; i  Runtime: 36 ms, faster than **31.90%** of Go online submissions for Two Sum.

**memory distribution**

> Memory Usage: 3 MB, less than **100.00%** of Go online submissions for Two Sum.

**思考**

> 暴力破解是最容易想到的方法，它的时间复杂度是O(n^2)。虽然很多时候我们都对暴力解法嗤之以鼻，但是从上面的时间分布和内存分布看，优点还是很明显的，即内存消耗很小。在计算机里面，增加内存的成本远远小于提高计算能力的成本，所以我们需要考虑如何通过空间来换时间。

#### 解法二：哈希表法

```go
func twoSum(nums []int, target int) []int {
    var numsMap = make(map[int]int)
    for i := 0; i  Runtime: 4 ms, faster than **95.00%** of Go online submissions for Two Sum.

**memory distribution**

> Memory Usage: 3.8 MB, less than **11.54%** of Go online submissions for Two Sum.

如果把代码中numsMap的定义改成：

```golang
var numsMap = make(map[int]int, len(nums))
```

**memory distribution**

> Memory Usage: 3.4 MB, less than **42.31%** of Go online submissions for Two Sum.

**思考**

> 暴力解法中，比较耗时的操作是第二个for循环，第二个for循环的作用是判断第二个数加第一个数是不是等于目标值，这是一个凑数的过程。如果我们反过来想，在已知第一个数的情况下，判断我们需要找的数是不是在剩下的数的集合里面，时间复杂度就变成了O(1)。从时间分布看，超过了95%的人(说明还能继续优化)；从内存分布看，只超过了11.54%的人。但是如果在初始化numsMap的时候指定了长度，消耗的内存就会少0.4M，由此可见，Go中map类型数据指定长度初始化是有必要的。这里面需要注意的是，如果数组中有两个元素一致，那哈西表中存的索引就是第二个元素的索引值。但是因为我们是从前往后遍历的，所以结果不影响。至于有三个及以上的元素相同的情况是不用考虑的，因为题目说只有唯一解。

#### 解法三：哈希表法升级版

```go
func twoSum(nums []int, target int) []int {
    numsMap := make(map[int]int, len(nums))
    for i, v := range nums {
        if pre, ok := numsMap[target - v]; ok {
            return []int{pre, i}
        }
        numsMap[v] = i
    }
    return nil
}
```

**runtime distribution**

> Runtime: 4 ms, faster than **95.00%** of Go online submissions for Two Sum.

**memory distribution**

> Memory Usage: 3.4 MB, less than **48.08%** of Go online submissions for Two Sum.

**思考**

> 解法二中，出现了两个遍历，一次是numsMap赋值的时候，一次是查找的时候。但实际上这两次是可以合并的，即一边赋值，一边查找。至于为什么runtime排名还是小于**95%**，应该是网站的bug，时间最少的那个人的耗时是0ms，显然不可能。测试发现，如果重复提交多次，有可能出现这种情况。

### 2、变种一：Two Sum II - Input array is sorted

> Given an array of integers that is already sorted in ascending order, find two numbers such that they add up to a specific target number.The function twoSum should return indices of the two numbers such that they add up to the target, where index1 must be less than index2.

**Note:**

> Your returned answers (both index1 and index2) are not zero-based.You may assume that each input would have exactly one solution and you may not use the same element twice.

**Examples**

> **Input:** numbers = [2,7,11,15], target = 9
> **Output:** [1,2]
> **Explanation:** The sum of 2 and 7 is 9. Therefore index1 = 1, index2 = 2.

#### 解法

```go
func twoSum(numbers []int, target int) []int {
    i := 0
    j := len(numbers) - 1

    for i  target {
            j--
        } else {
            i++
        }
    }
    return nil
}
```

**思考**

> 这个变种比较简单，数据按升序排好，只需要使用双指针，向中间靠拢即可

### 变种二：Two Sum IV - Input is a BST

> Given a Binary Search Tree and a target number, return true if there exist two elements in the BST such that their sum is equal to the given target.

**Example:**

```properties
Input:
    5
   / \
  3   6
 / \   \
2   4   7

Target = 9

Output: True
```

#### 解法一

```go
/**
 * Definition for a binary tree node.
 * type TreeNode struct {
 *     Val int
 *     Left *TreeNode
 *     Right *TreeNode
 * }
 */
func findTarget(root *TreeNode, k int) bool {
list := printTree(root)
hashSet := make(map[int]int)
for i := 0; i  0 {
list = append(list, queue[0].Val)
left := queue[0].Left
right := queue[0].Right
if left != nil {
queue = append(queue, left)
}
if right != nil {
queue = append(queue, right)
}
queue = queue[1:]
}
return list
}
```

**Runtime distribution**

> Runtime: 24 ms, faster than 86.52% of Go online submissions for Two Sum IV - Input is a BST.

**memory distribution**

> Memory Usage: 7.6 MB, less than 50.00% of Go online submissions for Two Sum IV - Input is a BST.

**思考**

> 通过层序遍历，将二叉搜索树转成数组，然后再通过哈希表法判断是否存在两个数的和等于目标值

#### 解法二

```go

```
