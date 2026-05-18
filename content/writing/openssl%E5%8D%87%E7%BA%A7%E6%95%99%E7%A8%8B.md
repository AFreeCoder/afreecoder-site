---
title: openssl升级教程
date: 2020-01-09
slug: openssl%E5%8D%87%E7%BA%A7%E6%95%99%E7%A8%8B
original_url: https://afreecoder.cn/2020/01/09/openssl%E5%8D%87%E7%BA%A7%E6%95%99%E7%A8%8B/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 前言

**openssl版本号的含义**

> OpenSSL version numbers are formatted as n1.n2.n3x, where n1-3 are numbers and x, if present, is one or more letters. These can change depending on the release type:Major releases that change one/both of the first two digits, which can break compatibility with previous versionsMinor releases that change the last digit, e.g. 1.1.0 vs. 1.1.1, can and are likely to contain new features, but in a way that does not break binary compatibility. This means that an application compiled and dynamically linked with 1.1.0 does not need to be recompiled when the shared library is updated to 1.1.1. It should be noted that some features are transparent to the application such as the maximum negotiated TLS version and cipher suites, performance improvements and so on. There is no need to recompile applications to benefit from these features.Letter releases, such as 1.0.2a, exclusively contain bug and security fixes and no new features.

后面的字母表示bug的修复记录，那显然选字母越靠后，版本越稳定。

## openssl升级步骤

#### 版本选择

[下载地址](https://www.openssl.org/source/)

#### 解压编译

```bash
tar -xzf openssl-1.1.1d.tar.gz
cd openssl-1.1.1d
# --prefix是安装路径，--openssl是配置文件路径
./config shared --prefix=/opt/openssl --openssldir=/usr/local/ssl -D_GNU_SOURCE
make clean
make
make install
```

`-D_GNU_SOURCE`并不是必须的，只有当出现错误提示 `'pthread_mutex_recursive' undeclared (first use in this function)` 才需要带上，这个一般是因为系统太老。([相关问题链接](https://github.com/openssl/openssl/issues/2261))

#### 检查动态链接

```bash
ldd /opt/openssl/bin/openssl
```

**如果提示**

```bash
libssl.so.1.1 => not found
libcrypto.so.1.1 => not found
libdl.so.2 => /lib64/libdl.so.2 (0x0000003f0b300000)
libpthread.so.0 => /lib64/tls/libpthread.so.0 (0x0000003f0b900000)
libc.so.6 => /lib64/tls/libc.so.6 (0x0000003f0b000000)
/lib64/ld-linux-x86-64.so.2 (0x0000003f0ae00000)
```

说明 `libssl.so.1.1` 等没有链接上，执行：

```bash
ln -s /opt/openssl/lib/libssl.so.1.1 /usr/lib64/libssl.so.1.1
sudo ln -s /opt/openssl/lib/libcrypto.so.1.1 /opt/openssl/lib/libcrypto.so.1.1
```

#### 测试是否安装成功

执行：

```bash
/opt/openssl/bin/openssl version
```

显示：

```bash
OpenSSL 1.1.1d  10 Sep 2019
```

## PHP下升级openssl

**php下添加openss扩展有两种方式**

1. PHP源码编译安装的时候，带上 `--with-openssl[=DIR]` ,
2. 如果php已经安装完成了，不支持openssl，但是又不想重新编译，可以下载对应版本的php源码，解压进入到php/ext/openssl目录，执行 php/bin/phpize，生成configure文件，然后指定编译配置 `./configure --with-openssl[=DIR] --with-php-config=/php/bin/php-config`，`make`编译，生成 openssl.so，再在php.ini中开启即可。

## PHP如何实现SM3签名算法？

> SM2、SMS3等加密签名算法是国密算法，openssl从1.1.1版本开始支持

由于希望能在PHP中实现`SM3`算法，想着能否通过升级openssl的方式实现，调研了一天发现，仅通过`openssl`的升级，无法快速实现。

**原因如下**

> openssl1.1.1d的安装只是说在系统层面增加了openssl这个工具，安转完之后即可通过命令行的方式实现各种加密算法php实现openssl扩展，其原理是通过php/ext/openssl下面的源码，编译实现从openssl工具到php中使用的加密函数的一个映射，检查php/ext/openssl下面的openssl.c文件发现，并没有包含openssl源码中实现SMS3等算法的头文件，所以不管怎么编译，生成的php下的openssl扩展都没有SM3函数

**那如何实现在PHP中使用SMS3算法？**

1. 修改php/ext/openssl下面的代码，增加SM3等算法的映射，重新编译生成openssl.so （工程量较大，需要熟悉源码）
2. 使用openssl的一个分支版本Gmssl。Gmssl在openssl的基础上实现了对一般国密算法的支持，同时提供了用于编译openssl.so的php/ext/openssl源码，编译生成openssl.so即可 (**该方法尚未验证成，怀疑和PHP版本有关**)
3. 安装完openssl工具后，在PHP代码中直接执行linux命令：`echo -n "abc" | /opt/openssl/bin/openssl dgst -SM3`
