---
title: MySQL 日志之 redolog
date: 2020-04-13
slug: mysql%E4%B9%8Bredolog
original_url: https://afreecoder.cn/2020/04/13/mysql%E4%B9%8Bredolog/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 一、redolog 概述

`mysql` 有多种日志，每种日志都有其特定的用途。 `redolog` 是 `mysql` 存储引擎为 `innodb` 时，特有的日志。 `innodb` 是 `mysql` 最常用的存储引擎，它的事务的持久性就是通过 `redolog`保证的。

## 二、redolog 介绍

为了更清晰的将 `redolog` 讲清楚，本文会围绕以下几个方面逐层展开。

- `redolog` 是什么？
- `redolog` 存储形式
- `redolog` 是怎么产生的？
- `redolog` 的格式
- 为什么用 `redolog` 来保证事务的持久性？

### 2.1 redolog 是什么

`redolog` 是存储引擎 `innodb` 特有的、在引擎层生成的（ `binlog` 是在 `server` 层产生的，不管用任何引擎都会生成），用于保证事务持久性的日志。 `redolog` 采用了 `WAL` ( `Write-Ahead Logging` ) 机制，即日志优先落盘，也就是说，一个事务发生之后， `innodb` 会先将数据页的变动写到 `redolog` 中，而不是实际的数据文件中，一旦 `redolog` 写入完成，就认为这个事务的操作记录完成了。之后mysql会有一套更新机制，定期的将 `redolog` 中的内容写入到数据文件中。

在 `mysql` 中， `redolog` 不会用来做物理上的主从复制，它主要的应用场景是 `crash-recovery` (崩溃恢复).

无论mysql有没有发生异常，重新启动的时候，mysql都会通过 `redolog` 恢复，确保数据没有问题。

### 2.2 redolog 的存储形式

我们可以执行如下 `mysql` 命令查看 `redolog` 相关的部分信息：

```plaintext
show variables like "%innodb_log%”;
```

执行结果如下：

```gherkin
+------------------------------------+----------+
| Variable_name                      | Value    |
+------------------------------------+----------+
| innodb_log_buffer_size             | 16777216 |
| innodb_log_checksums               | ON       |
| innodb_log_compressed_pages        | ON       |
| innodb_log_file_size               | 50331648 |
| innodb_log_files_in_group          | 2        |
| innodb_log_group_home_dir          | ./       |
| innodb_log_spin_cpu_abs_lwm        | 80       |
| innodb_log_spin_cpu_pct_hwm        | 50       |
| innodb_log_wait_for_flush_spin_hwm | 400      |
| innodb_log_write_ahead_size        | 8192     |
+------------------------------------+----------+
```

一些参数的解释：

```avrasm
innodb_log_buffer_size: redolog缓存区的大小，即16m
innodb_log_file_size: redolog文件的大小，即48m
innodb_log_files_in_group: 日志文件组中文件数量
innodb_log_group_home_dir: 日志文件组路径即 mysql/data
```

如果 `mysql` 的安装路径是默认路径，那么：

```bash
cd /usr/local/mysql
ls data
```

形如 `ib_logfile0`、 `ib_logfile1` 之类的文件就是 `redolog file`。为什么这里会出现两个 `ib_logfile` ？这是因为 `redolog file` 其实指的是一个文件组，由多个 `ib_logfile` 合并起来共同表示。

![redolog checkpoint](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/redolog_checkpoint.png)

`redolog` 的大小是在配置中设置好的，不能无限制写入。 `innodb` 采用了循环写入的方式，图中 `checkpoint` 和 `writepos` 就是用来区分哪些数据已经从日志文件中刷新到数据文件中。`writepos` -> `checkpoint` 之间的数据是已经写入到数据文件中的，是可以删除的，`checkpoint` -> `writepos` 之间的数据是已经写入到日志文件中，但是还没有写入到数据文件中，是不可以擦除的。

如果有新的数据写入到日志文件上，`writepos` 的位置就会顺时钟挪动，如果发现超过了 `checkpoint` 的位置，就会强制将一部分 `checkpoint` 右边的数据刷如磁盘中的数据文件上，然后将 `checkpoint` 顺时针移动一定的位置。

### 2.3 redolog 是怎么产生的

#### 2.3.1 事务的执行引起 redolog 的更新

`redolog` 更新的依据是事务的执行。每一次事务执行完毕之后，所引起的数据页的变化都会先写到 `redolog` 中（当然，如果事务中是先 `insert` 再 `delete`，实际不对数据页做出改变的话， `redolog` 是不会更新的）。

*注：`innodb` 中 `insert` 或者 `update` 语句默认都是事务。*

#### 2.3.2 redolog 的写入流程

并不是事务一执行，数据页就被写入到 `redolog` 中。 `redolog` 本身是文件，频繁的写文件，会导致性能的降低，所以 `redolog` 的写入流程如下，以一个 update 操作为例：

![redolog 刷新流程](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/redolog_wiriting_process.png)

在最后一步，将数据从缓存刷入文件的时候，其实中间还有一步，缓存中的数据会先刷到 `linux` 的文件缓存中，然后才会再被刷入到日志文件中。如果 `Linux` 机器忽然重启，就有可能丢失这部分数据， `redolog file` 就会更新失败。

`redolog buffer` 何时刷入日志文件，是否需要强制刷新 `Linux` 文件缓存？ `innodb` 主要通过下面这两个参数控制：

```plaintext
+--------------------------------+-------+
| Variable_name                  | Value |
+--------------------------------+-------+
| innodb_flush_log_at_timeout    | 1     |
| innodb_flush_log_at_trx_commit | 1     |
+--------------------------------+-------+
```

`innodb_flush_log_at_trx_commit` 配置的详细说明如下：

```livecodeserver
Controls the balance between strict ACID compliance for commit operations and higher performance that is possible when commit-related I/O operations are rearranged and done in batches. You can achieve better performance by changing the default value but then you can lose transactions in a crash.
* The default setting of 1 is required for full ACID compliance. Logs are written and flushed to disk at each transaction commit.
* With a setting of 0, logs are written and flushed to disk once per second. Transactions for which logs have not been flushed can be lost in a crash.
* With a setting of 2, logs are written after each transaction commit and flushed to disk once per second. Transactions for which logs have not been flushed can be lost in a crash.
* For settings 0 and 2, once-per-second flushing is not 100% guaranteed. Flushing may occur more frequently due to DDL changes and other internal InnoDB activities that cause logs to be flushed independently of the innodb_flush_log_at_trx_commit setting, and sometimes less frequently due to scheduling issues. If logs are flushed once per second, up to one second of transactions can be lost in a crash. If logs are flushed more or less frequently than once per second, the amount of transactions that can be lost varies accordingly.
* Log flushing frequency is controlled by innodb_flush_log_at_timeout, which allows you to set log flushing frequency to N seconds (where N is 1 ... 2700, with a default value of 1). However, any mysqld process crash can erase up to N seconds of transactions.
* DDL changes and other internal InnoDB activities flush the log independently of the innodb_flush_log_at_trx_commit setting.
* InnoDB crash recovery works regardless of the innodb_flush_log_at_trx_commit setting. Transactions are either applied entirely or erased entirely.
```

根据上面的解释，`innodb_flush_log_at_trx_commit = 1` 时， `logbuffer` 实时刷入，且系统缓存也会实时刷入文件，此时数据库的四大特性：ACID 能够严格保证。 `innodb_flush_log_at_trx_commit` 等于其它值的时候，可以通过 `innodb_flush_log_at_timeout` 来控制缓存刷新的频率。

[相关配置的详细解释](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_flush_log_at_timeout)

### 2.4 redolog 文件格式

#### 2.4.1 redolog 文件存储地址

根据上文中 `innodb_log` 的配置 `innodb_log_group_home_dir = ./` (这里的当前目录即mysql的数据文件目录，如果你是安装在默认路径，一般数据文件目录为 `/usr/local/mysql/data` )，文件目录如下:

```shell
drwxr-x---   12 _mysql  _mysql       384 Mar 13 00:31 #innodb_temp
drwxr-x---    3 _mysql  _mysql        96 Apr  4 22:10 appengine_common
-rw-r-----    1 _mysql  _mysql        56 Aug 28  2019 auto.cnf
-rw-r-----    1 _mysql  _mysql      7062 Mar  6 20:58 binlog.000014
-rw-r-----    1 _mysql  _mysql       178 Mar  7 01:47 binlog.000015
-rw-r-----    1 _mysql  _mysql       178 Mar  7 02:10 binlog.000016
-rw-r-----    1 _mysql  _mysql       178 Mar  7 02:34 binlog.000017
-rw-r-----    1 _mysql  _mysql       178 Mar 12 11:24 binlog.000018
-rw-r-----    1 _mysql  _mysql       178 Mar 12 12:25 binlog.000019
-rw-r-----    1 _mysql  _mysql       178 Mar 13 00:31 binlog.000020
-rw-r-----    1 _mysql  _mysql  51286298 Apr  4 22:26 binlog.000021
-rw-r-----    1 _mysql  _mysql       128 Mar 13 00:31 binlog.index
-rw-------    1 _mysql  _mysql      1680 Aug 28  2019 ca-key.pem
-rw-r--r--    1 _mysql  _mysql      1112 Aug 28  2019 ca.pem
-rw-r--r--    1 _mysql  _mysql      1112 Aug 28  2019 client-cert.pem
-rw-------    1 _mysql  _mysql      1680 Aug 28  2019 client-key.pem
-rw-r-----    1 _mysql  _mysql      4110 Mar 13 00:31 ib_buffer_pool
-rw-r-----    1 _mysql  _mysql  50331648 Apr  4 22:26 ib_logfile0
-rw-r-----    1 _mysql  _mysql  50331648 Apr  4 22:26 ib_logfile1
-rw-r-----    1 _mysql  _mysql  12582912 Apr  4 22:26 ibdata1
-rw-r-----    1 _mysql  _mysql  12582912 Mar 13 00:31 ibtmp1
drwxr-x---    8 _mysql  _mysql       256 Nov  8 23:52 mysql
-rw-r-----    1 _mysql  _mysql  24117248 Apr  4 22:26 mysql.ibd
-rw-r-----    1 _mysql  _mysql     19195 Mar 13 00:31 mysqld.local.err
-rw-r-----    1 _mysql  _mysql         4 Mar 13 00:31 mysqld.local.pid
drwxr-x---  105 _mysql  _mysql      3360 Nov  8 23:52 performance_schema
-rw-------    1 _mysql  _mysql      1680 Aug 28  2019 private_key.pem
-rw-r--r--    1 _mysql  _mysql       452 Aug 28  2019 public_key.pem
-rw-r--r--    1 _mysql  _mysql      1112 Aug 28  2019 server-cert.pem
-rw-------    1 _mysql  _mysql      1676 Aug 28  2019 server-key.pem
drwxr-x---    3 _mysql  _mysql        96 Nov  8 23:52 sys
drwxr-x---    3 _mysql  _mysql        96 Mar 30 23:15 test
-rw-r-----    1 _mysql  _mysql  12582912 Apr  4 22:26 undo_001
-rw-r-----    1 _mysql  _mysql  12582912 Apr  4 22:26 undo_002
```

其中前缀是 `ib_logfile` 的文件就是。

如果你想看一下文件中的具体内容，可以通过命令：

```shell
strings ib_logfile0
```

大概感知一下。在文件中，我们能搜到诸如 `thread_id`，`space_id` 之类的字段。

#### 2.4.2 redolog 格式简介

尽管一个 `redolog` 有多个文件，但是每个文件的格式是一致的，只是有一些数据只会存在第一个文件中。

第一个文件 `ib_logfile0` 的格式如下：

![ib_logfile0](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/indb_file0_overview.png)

从图中可以看到，日志文件中包含了文件头信息和具体的日志信息，这些日志信息分别写在每一个日志块中。

其它文件 `ib_logfile*` 的格式如下：

![ib_logfile*](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/indb_file1_overview.png)

其它的日志文件内容格式基本一样，主要区别在 `checkpoint` 信息（ `checkpoint` 记录的是已经更新到数据文件中的 LSN）。

在深刻理解 `checkpoint` 的含义前，首先需要理解 `LSN`（ `og sequence number` ）的概念。

**什么是LSN？**

`LSN` 表示日志记录创建开始到特定的日志记录已经写入的字节数。 `mysql` 通过 `LSN` 来判断是否需要刷新 `buffer` 到 `redolog` 上以及是否需要将 `redolog` 写到磁盘上。`LSN` 是单调递增的。

以我本地的数据库为例。

第一步，查看 `innodb` 的状态：

```plaintext
show engine innodb status\G;
```

部分结果如下(后面的数据就是 `LSN` )：

```pgsql
---
LOG
---
Log sequence number          85755920
Log buffer assigned up to    85755920
Log buffer completed up to   85755920
Log written up to            85755920
Log flushed up to            85755920
Added dirty pages up to      85755920
Pages flushed up to          85755920
Last checkpoint at           85755920
```

然后我删除了 `MySQL` 中的一个数据库，再次查看 innodb 的状态，如下：

```pgsql
---
LOG
---
Log sequence number          85755974
Log buffer assigned up to    85755974
Log buffer completed up to   85755974
Log written up to            85755974
Log flushed up to            85755974
Added dirty pages up to      85755974
Pages flushed up to          85755920
Last checkpoint at           85755920
```

可以看到， `buffer` 中的 `LSN` 已经更新了，`redolog` 中日志记录的 `LSN` 也已经更新到最新，但是 `checkpoint` 还是之前的记录，因为 `checkpoint` 小于 `redolog` 最新的 `LSN` ，所以 `mysql` 认为需要将 `checkpoint` 之后的数据继续更新到数据文件中。

继续查看 `innodb` 的状态，如下：

```pgsql
LOG
---
Log sequence number          85755974
Log buffer assigned up to    85755974
Log buffer completed up to   85755974
Log written up to            85755974
Log flushed up to            85755974
Added dirty pages up to      85755974
Pages flushed up to          85755974
Last checkpoint at           85755974
```

这次可以看到，`checkpoin`t 已经更新成最新的 `LSN` 了，这表明之前没来的及更新到数据文件中 `redolog` 也已经更新进去了。所以最终全部的 `LSN` 是保持一致的。

再细的日志格式就不在这里展开了，我看的也不深，如果你想更深入的了解，一是可以去参考 `mysql` 的源码，或者参考下面的这两篇文章。

**注**：这一节内容主要参考了文章 [MySQL InnoDB redo Log 浅析](https://blog.51cto.com/wangwei007/2287431) 和 [MySQL · 源码分析 · Innodb 引擎Redo日志存储格式简介](http://mysql.taobao.org/monthly/2017/09/07/)。

### 2.5 为什么用 redolog 来保证事务的持久性？

> 事务的持久性是指事务一旦提交就会永久生效

`redolog` 采用的机制是 `WAL` (Write-Ahead Logging) 机制，因此事务的持久性是通过日志的持久性实现的，即每次事务提交，在持久化一个数据页的时候，首先将数据页内容持久化到日志中。

为什么要采用 `WAL` 机制？因为将数据页写到日志中的时间要远远快于写到数据存储文件中。我们知道，`innodb` 底层的存储实现是 `B+Tree`，对数据页的寻址是通过指针决定的。如果执行多条 `update` 语句，影响的数据页在不同的磁盘块上，那么对计算机来说磁盘块的寻址会消耗很多时间；而如果是将这些数据页的变动直接写到日志文件中，因为是顺序写入，消耗的时间远远小于前者。

从 IO 次数来说，`WAL` 刷新是少量 IO，DaTa 刷新是大量 IO， `WAL` 刷新次数少得多；
从 IO 花销来说， `WAL` 刷新是连续IO，Data 刷新是随机IO， `WAL` 刷新花销小得多.

因此WAL机制在保证事务持久性和数据完整性的同时，成功地提升了系统性能。

**Tips**

redolog 除了用来保证事务的持久性，它所采用的 **两阶段提交** 机制也保证了事务的一致性。**两阶段提交** 涉及到 `binlog`，后续讲 `binlog` 的时候，会重点讲解下。

参考课程：[https://time.geekbang.org/column/intro/100020801?code=rNEW29DDq73FD01HP-2AEicuNieaJ24KUQ9tYhCk1Ow%3D](https://time.geekbang.org/column/intro/100020801?code=rNEW29DDq73FD01HP-2AEicuNieaJ24KUQ9tYhCk1Ow%3D)

## 三、结语

相信经过上面的讲解，你应该对 `redolog` 的概念、用处有了一个清晰的认识，并且能根据不同的生产环境对相关的配置做出合适的调整。如果你希望对 `redolog` 的具体格式以及实现有更深入的理解，可以结合上文提到文章和源码继续深入了解。
