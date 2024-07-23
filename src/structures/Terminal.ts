import Singleton from '@/Singleton';

export default class Terminal extends Singleton {
    run(roomName: string) {
        let room = Game.rooms[roomName];
        let terminal = room.terminal;
        if (!terminal) return;
        if (terminal.cooldown) return;
        if (terminal.store.energy >= 60000 &&
            terminal.room.storage.store.getFreeCapacity() < 10000 &&
            terminal.room.controller.level == 8) {
            let orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: 'energy' })
                .sort((a, b) => b.price - a.price);
            let order = orders[0];
            if (order) {
                let num = order.amount > 25000 ? 25000 : order.amount;
                Game.market.deal(order.id, num, terminal.room.name);
                return;
            }
        }

        if (terminal.room.storage.store.energy > 500000 &&
            terminal.store.energy >= 50000) {
            for (let i = 0; i < Memory.myrooms.length; i++) {
                let room = Game.rooms[Memory.myrooms[i]];
                if (terminal.room.name == room.name && !room.terminal?.my) continue;
                if (room.storage?.store.energy < 500000 && room.terminal?.store.energy < 50000 && room.storage?.store.getFreeCapacity() > 50000) {
                    global.send(terminal.room.name, room.name, 'energy', 25000);
                    return;
                }
            }
        }

        if (Game.time % (terminal.room.memory.index + 20) == 0) {
            if (global.allRes.KH < 100000) {
                global.autoDeal(terminal.room.name, "KH", 120, 1000);
                return;
            }
            if (global.allRes.LH < 100000) {
                global.autoDeal(terminal.room.name, "LH", 300, 1000);
                return;
            }
            if (terminal.room.controller.level < 8) return;
            let type: MineralConstant = room.memory.mineral.type;
            if (global.allRes[type] < 4000 * Memory.myrooms.length) {
                global.autoDeal(terminal.room.name, type, 80);
                return;
            }
            if (terminal.store.power < 1000) {
                global.autoDeal(terminal.room.name, 'power', 500);
                return;
            }
        }

        if (Object.keys(global.demand).length) {
            for (let i in global.demand) {
                let task = global.demand[i];
                if (task.taskRoom && task.taskRoom != roomName) continue;
                if (terminal.room.name == task.roomName) continue;
                if (global.demand[`${roomName}-${task.res}`]) continue;
                if (task.type == 'lab' || task.type == 'power') {
                    if ((terminal.store[task.res] + terminal.room.storage?.store[task.res] ?? 0) >= task.num * 2) {
                        if (terminal.store[task.res] >= task.num) {
                            task.taskRoom = roomName;
                            global.send(terminal.room.name, task.roomName, task.res, task.num);
                            return;
                        }
                    }
                }
                if (task.type == 'factory') {
                    if ((terminal.store[task.res] + terminal.room.storage?.store[task.res] ?? 0) > task.num) {
                        if (terminal.store[task.res] > task.num) {
                            task.taskRoom = roomName;
                            global.send(terminal.room.name, task.roomName, task.res, task.num);
                            return;
                        }
                    } else if (terminal.store[task.res]) {
                        global.send(terminal.room.name, task.roomName, task.res, terminal.store[task.res]);
                        return;
                    }
                }
            }
        }
        if (Memory.sendTask) {
            for (let id in Memory.sendTask) {
                let task = Memory.sendTask[id];
                if (task.selfRoom) {
                    if (task.selfRoom != terminal.room.name) continue;
                }
                if (task.num >= 3000 && terminal.store[task.resource] >= 3000) {
                    let res = global.send(terminal.room.name, task.targetRoom, task.resource, 3000);
                    if (res == OK) {
                        Memory.sendTask[id].num -= 3000;
                        return
                    }
                } else if (task.num > 0 && terminal.store[task.resource] >= task.num) {
                    let res = global.send(terminal.room.name, task.targetRoom, task.resource, task.num);
                    if (res == OK) {
                        Memory.sendTask[id].num -= task.num;
                        delete Memory.sendTask[id];
                    }
                } else if (task.num <= 0) delete Memory.sendTask[id];
            }
        }
    }

    // TODO 完成自动购买功能
    /**
     * 自动购买
     *     获取玩家所有的订单，删除非活跃订单并将活跃订单维护在内存中。对于活跃的订单根据市场调整购买价格，
     *  对于没有购买能量订单且有terminal的房间，如果房间的能量低于某个阈值则创建订单并维护到内存中。
     *     合理的价格和订单容量，避免出现抬价的情况。 
     */
    private _autoBuyEnergy(): void {
        // 获取在市场中活跃 (activated) 和非活跃 (deactivated) 的购买能量的订单存到Memory中
        // 获取购买能量的房间并清除非活跃订单
        for (let i in Game.market.orders) {
            let order = Game.market.getOrderById(i);
            if (order.active) {

            } else {
                Game.market.cancelOrder(order.id);
            }
            
        }
        // 根据平均价格和最大购买订单价格计算出一个参考价格

        // 对于有terminal的房间如果存储量小于250000,则根据存储量调整购买价格并记录在Memory中

        // 对于没有购买能量的订单如果存储量小于250000,则创建一个订单

    }
}