[TOC]

# ACFun更新说明
&emsp;每个标题后面跟的是commit标签
## 新增自动购买能量功能

## 优化boost顺序混乱bug
&emsp;利用队列思路每次取出boost列表中的第一个creep进行boost，等待时间为**100**tick 。超过**100**tick则清空boost内容取消boost，否则等待进行boost。
## 新增冲级模式
### 使用方法
&emsp;需要手动在controller距离**5**之内建造container,然后插旗 Game.flags[`${creep.memory.roomFrom}_upgradePlus`]

## 增加centerTransfer填充核弹功能
### commit标签
- 8023ab5fb6282b2f35d42519c38d894f077aa227
- ec2a33b8d8175ef6ebed62fca4aa25af90c76e4f

