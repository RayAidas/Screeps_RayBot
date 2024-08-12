[TOC]



# ACFun更新说明
&emsp;每个标题后面跟的是commit标签
## 新增自动购买能量功能

## 优化boost顺序混乱bug
&emsp;利用队列思路每次取出boost列表中的第一个creep进行boost，等待时间为100tick。超过100tick则清空boost内容取消boost，否则等待进行boost。
## 新增冲级模式



# RayBot
需在根目录下自行创建 .secret.json 文件
文件格式如下：
{
    "main": {
        "token": "your token",
        "protocol": "https",
        "hostname": "screeps.com",
        "port": 443,
        "path": "/",
        "branch": "default"
    },
    ... ...
}
