---
title: FAQBot 实践系列#1 —— 从开源语料入手
date: 2020-09-19
slug: faq-bot-1
original_url: https://afreecoder.cn/2020/09/19/faq-bot-1/
platforms:
  - AFreeCoder.github.io
bodyFormat: markdown
---
## 语料

FAQBot构建的基础是有一份高质量的问答语料。通过不断的搜索和查找，找到一份 `保险行业` 的问答语料：[insuranceqa-corpus-zh](https://github.com/chatopera/insuranceqa-corpus-zh)

### 语料背景

该语料库包含从网站 [Insurance Library](https://www.insurancelibrary.com/) 收集的问题和答案。
以下是官方介绍：

> 该语料库的内容由现实世界的用户提出，高质量的答案由具有深度领域知识的专业人士提供。 所以这是一个具有真正价值的语料，而不是玩具。在上述论文中，语料库用于答复选择任务。 另一方面，这种语料库的其他用法也是可能的。 例如，通过阅读理解答案，观察学习等自主学习，使系统能够最终拿出自己的看不见的问题的答案。数据集分为两个部分“问答语料”和“问答对语料”。问答语料是从原始英文数据翻译过来，未经其他处理的。问答对语料是基于问答语料，又做了分词和去标去停，添加label。所以，”问答对语料”可以直接对接机器学习任务。如果对于数据格式不满意或者对分词效果不满意，可以直接对”问答语料”使用其他方法进行处理，获得可以用于训练模型的数据。

### 语料格式

训练数据之前，我们先仔细看下语料的格式。

#### 原始语料

原始语料的目录是 `/corpus/pool`。

**问题**

train，test，valid 是存放问题的文件，分别对应着训练集、测试集和验证集。对应的 txt 文件中是中英对照的问题，json 文件中的信息比较全，包含了中英对照的问题，问题的领域（类别），对应的答案以及错误的答案（负样本）。示例如下：

```json
{
    "0": {
        "zh": "医疗保险拿起公司支付吗？",
        "en": "Does  Medicare  Pick  Up  Co  Pays?",
        "domain": "medicare-insurance",
        "answers": [
            "4436"
        ],
        "negatives": [
            "1650",
            "14016",
            "24487",
            "18224",
            "15953",
            "16740"
        ]
    }
}
```

`zh` 是根据答案原文翻译过来的，翻译质量一般。比如示例中英文的意思其实是问【医疗保险会承担挂号费吗】（ `co-pay` 是看医生前需要支付的定额费用，类似挂号费），如果直接看翻译就不知所云了。`answers` 和 `negatives` 中的数字表示对应答案的id，下面会提到。

**答案**

`answers` 中包含了答案的id和答案的中英文对照。

```json
{
    "0": {
        "zh": " 汽车跟随着。示例1：如果你被给了一辆汽车（借给），那辆车没有保险，你可以在汽车上买保险，你的保险将是主要的。另一个选择，有人帮你买车。例如，您的信用评分不足以融资，因此您的朋友在您的贷款下签署了主要付款人。您可以根据您的姓名获得保险，甚至将您的朋友列为保险单，作为损失赔偿人。在这种情况下，我们总是建议您获得贷款差距：汽车的实际现金价值与其仍然拥有的金额之间的差额。例2：你借的车有保险。您可以以您的名义购买政策，列出该政策的车辆，如果发生事故，您的政策将成为次要或超额。一旦主要汽车保险的限制用尽，您的保险将踢入，并希望支付其余费用。我特意用了这个词，因为每个事故都是独一无二的，没有实际的索赔情况就很难解释这个覆盖面。即使在给定的索赔情况下，有时索赔有两个可能的结果。",
        "en": " Coverage follows the car. Example 1: If you were given a car (loaned) and the car has no insurance, you can buy insurance on the car and your insurance will be primary. Another option, someone helped you to buy a car. For example your credit score isn't good enough to finance, so a friend of yours signed under your loan as a primary payor. You can get insurance under your name and even list your friend on the policy as a loss payee. In this case, we always suggest you get a loan gap coverage: the difference between the car's actual cash value and the amount still owned on it. Example 2: The car you are loaned has insurance. You can buy a policy under your name, list the car on that policy and in case of the accident, your policy will become a secondary or excess. Once the limits of the primary car insurance are exhausted, your coverage would kick in and hopefully pay for the rest. I specifically used the word hopefully, because each accident is unique and it's hard to interpret the coverage without the actual claim scenario. And even with a given claim scenario, sometimes there are 2 possible outcomes of a claim."
    }
}
```

#### 加工语料

> 使用原始语料，还需要做很多工作才能进入机器学习的模型，比如分词，去停用词，去标点符号，添加label标记。所以，在原始语料的基础上，，insuranceqa-corpus-zh提供了一个使用HanLP分词和去标，去停，添加label的数据集，这个数据集完全是基于原始语料

加工语料的目录是：`corpus/pairs`

**词表**
`vocab_data` 包含`word2id` (dict, 从word到id), `id2word` (dict, 从id到word),`tf` (dict, 词频统计)和 `total` (单词总数)。 其中，未登录词的标识为 `UNKNOWN`，未登录词的id为0。

**数据格式**
train、test、valid中的数据格式一直。示例中 `qid` 对应原始语料中问题的 `id`。 `question` 中的数值表示分词后，该词对应的`id`，即 `word2id` 的查表结果。`utterance` 是回复，`label` 如果是 `[1,0]` 代表回复是正确答案，`[0,1]` 代表回复不是正确答案，所以 `utterance` 包含了正例和负例的数据。每个问题含有10个负例和1个正例。该项目并没有说明负样本的采集方式。

```json
{
    "qid":"344",
    "question":[
        2462,3206,8878,17449,11331
    ],
    "utterance":[
        8878,17449,11331,3206,9757,21338,4757,11331,13381,10310,10114,6069,5231,13346,4185,12750,6568,5425,3206,10114,11705,6194,13402,23991,11273,8231,490,10299,9757,9843,18157,13334,23611,1907,10099,6568,7344,1704,16818,2311,6683,12268,7197,9757,11869,23800,10617,1134,22430,23810,9843,14297,10227,14005,5526,12360,13467,16917,22724,22086,24346,20333,12268
    ],
    "label":[1,0]
}
```

### 语料统计

| 语料集 | 类别（Q/A） | 最大长度 | 平均长度 |
| --- | --- | --- | --- |
| train | Q | 42 | 5 |
| train | A | 878 | 162 |
| test | Q | 33 | 5 |
| test | A | 878 | 161 |
| valid | Q | 31 | 5 |
| 878 | A | 878 | 165 |

## Baseline复现

### 环境准备+训练

```bash
// git clone
git clone git@github.com:chatopera/insuranceqa-corpus-zh.git

// 安装环境依赖
pip install -r Requirements.txt

// 更新数据处理的代码
pip install --upgrade insuranceqa_data

// 模型训练
python3 deep_qa_1/network.py
```

训练的过程中可能会出现以下错误：

1. ssl.SSLError 问题原因是 insuranceqa_data 加载数据的时候，读取数据的路径是绝对路径，读不到数据文件，触发下载，需要修改 insuranceqa_data 中的加载路径为：`curdir = os.getcwd()`
2. 本质原因是 Python3 请求https时，会对ssl进行校验，要么安装证书，要么关闭校验，具体方法百度即可。
3. ImportError: Python is not installed as a framework. mac 下使用matplotlib画图可能会出现这个问题。根据报错提示，在涉及画图的代码中加上 `import matplotlib; matplotlib.use('TkAgg')` 即可

### 训练结果

**主要训练参数**

```ini
hidden_layers = [100, 50]
question_max_length = 20
utterance_max_length = 99
lr = 0.001
epoch = 50
batch_size = 100
```

**准确率**

![accuracy](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/insuranceqa_baseline_accuracy.png)

**loss变化**

![loss](https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/insuranceqa_baseline_loss.png)

可以看到，准确率到了0.9之后几乎就不变了，loss开始下降的很快，之后在0.8附近剧烈波动，说明这个时候再进行更多的迭代训练并不会对准确率的提升有显著的效果，baseline的方法已经到了极限，需要寻找更好的算法了。

## 后续

至此，baseline 已经复现完毕。接下来的文章准备以此为基础，不断优化算法，在此基础之上尽可能的提高准确率。
