---
title: https升级教程
date: 2019-06-26
slug: https%E5%8D%87%E7%BA%A7%E6%95%99%E7%A8%8B
original_url: https://afreecoder.cn/2019/06/26/https%E5%8D%87%E7%BA%A7%E6%95%99%E7%A8%8B/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 升级前准备

上一章详细讲解了https的原理之后，本章节将以本博客为对象，实践https升级。

**升级准备工作**

1. CA 选择： [Let’s Encrypt](https://letsencrypt.org/)
2. 安装工具选择：[certbot](https://certbot.eff.org/)
3. 实践对象：本博客: [www.afreecoder.cn](www.afreecoder.cn)
4. 博客托管的vps配置：OS：CentOs 6, x86_64
5. RAM: 0.5G

确保有ssh权限，即能通过ssh远程访问你的web host

**[Let’s Encrypt](https://letsencrypt.org/)是电子前哨基金会EFF为了推广https协议，提供的免费的、自动化的和开放的CA(Certificate Authority)。[Let’s Encrypt](https://letsencrypt.org/)的一个贡献是ACME协议，ACME协议旨在确保域名验证、发布和管理方法是完全自动化、一致、符合合规性和安全的。**

**支持ACME协议的工具有很多([https://letsencrypt.org/docs/client-options/)，本文选择的推荐的[certbot](https://certbot.eff.org/](https://letsencrypt.org/docs/client-options/)，本文选择的推荐的[certbot](https://certbot.eff.org/))**。

## 升级教程

**首先，进入[certbot](https://certbot.eff.org/)网站，选择对应的web服务器软件（nginx，apache等）和操作系统版本（CentOs 6）,网站会给出对应的操作指令**

**1. 获取cerbot执行脚本**

```bash
wget https://dl.eff.org/certbot-auto
```

`certbot-auto` 实际上是一个shell执行脚本

**2. 放到习惯的路径下**

```bash
sudo mv certbot-auto /usr/local/bin/certbot-auto
```

**3. 修改执行脚本的所有者**

```bash
sudo chown root /usr/local/bin/certbot-auto
```

由于certbot需要验证你就是改域名的持有者，所以3、4两步都需要在root权限下进行

**4. 修改执行脚本的权限**
`sudo chmod 0755 /usr/local/bin/certbot-auto`

**5. 自动获取证书，同时修改nginx配置文件**

```bash
sudo /usr/local/bin/certbot --nginx --nginx-server-root=/usr/local/nginx/conf
```

这里有个坑，网站给出的命令是 `sudo /usr/local/bin/certbot --nginx`，这条命令默认ngxin安装在/etc/nginx，所以有可能会报错：

```stata
nginx: [emerg] open() "/etc/nginx/nginx.conf" failed (2: No such file or directory)
nginx: configuration file /etc/nginx/nginx.conf test failed
```

所以需要用 `--nginx-server-root` 指定nginx.conf的路径

接下来的操作，按照提示操作即可。

**6、添加定时任务**
[Let’s Encrypt](https://letsencrypt.org/)证书的有效期是90天，90天之后就需要重新更新证书，因此需要设置一个定时任务自动更新证书

```bash
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && /usr/local/bin/certbot-auto renew" | sudo tee -a /etc/crontab > /dev/null
```

上面这行命令是网站提供的，意思是每天12点和0点自动更新证书。至于为什么需要time.sleep(random.random() * 3600)，猜测是为了让大家错开时间，降低证书请求的压力

**相关配置文件**
新的配置文件目录, 同之前的nginx.conf目录

```bash
/usr/local/nginx/conf/vhost/
```

证书目录

```bash
/etc/letsencrypt/
```

## 参考文章

[HTTPS 升级指南](http://www.ruanyifeng.com/blog/2016/08/migrate-from-http-to-https.html)

[Linux下使用acme.sh申请和管理Let’s Encrypt证书](https://zhuanlan.zhihu.com/p/29507417)
