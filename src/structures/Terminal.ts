import Singleton from '@/Singleton';
import { colorful } from '@/common/utils';

export default class Terminal extends Singleton {
    run(roomName: string) {

        // 自动购买能量
        if (Game.time % 10 == 0) {
            this._autoBuyEnergy(roomName);
        }

        let room = Game.rooms[roomName];
        let terminal = room.terminal;
        if (!terminal) return;
        if (terminal.cooldown) return;
        if (terminal.store.energy >= 60000 &&
            terminal.room.storage?.store.getFreeCapacity() < 10000 &&
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
        // TODO 有BUG待修复，下单失败的情况也return了，导致后续的订单没有机会下单
        if (Game.time % (terminal.room.memory.index + 20) == 0) {
            if (terminal.room.name == 'E19S21') return;
            if (global.allRes.XGH2O < 2000) {
                global.autoDeal(terminal.room.name, "XGH2O", 1940, 2000);
            }
            if (terminal.room.controller.level < 8) return;
            if (terminal.room.storage.store.power < 10000) {
                global.autoDeal(terminal.room.name, 'power', 1200);
                return;
            }
            if (global.allRes.XGH2O < 20000) {
                global.autoDeal(terminal.room.name, "XGH2O", 1940, 2000)
            }
            if (global.allRes.KH2O < 100000) {
                global.autoDeal(terminal.room.name, "KH2O", 700, 1000);
                return;
            }
            if (global.allRes.LH < 100000) {
                global.autoDeal(terminal.room.name, "LH", 350, 1000);
                return;
            }
            if (terminal.room.controller.level < 8) return;
            let type: MineralConstant = room.memory.mineral.type;
            if (global.allRes[type] < 4000 * Memory.myrooms.length) {
                global.autoDeal(terminal.room.name, type, 80);
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

    /**
     * 自动购买
     *     获取玩家所有的订单，删除非活跃订单并将活跃订单维护在内存中。对于活跃的订单根据市场调整购买价格，
     *  对于没有购买能量订单且有terminal的房间，如果房间的能量低于某个阈值则创建订单并维护到内存中。
     *     合理的价格和订单容量，避免出现抬价的情况。 
     */
    private _autoBuyEnergy(roomName: string): void {

        // 检查能量存储情况
        let room = Game.rooms[roomName];
        if (!room) return;
        if (room.controller.level < 6 && !room.terminal) return;
        // 获取在市场中活跃 (activated) 和非活跃 (deactivated) 的购买能量的订单存到Memory中
        const orders = Game.market.getAllOrders({ resourceType: 'energy', type: ORDER_BUY });
        // const averagePrice = orders.reduce((acc, order) => acc + order.price, 0) / orders.length;
        // console.log(`市场平均价格为 averagePrice: [${averagePrice}]`);

        // 获取当前市场上的最高出价
        orders.sort((a, b) => b.price - a.price);
        const highestPrice = orders.length > 0 ? orders[0].price : 0;

        // 获取购买能量的房间并清除非活跃订单并删除非活跃订单
        for (let order in Game.market.orders) {
            const _order = Game.market.orders[order];
            if (_order.roomName !== roomName) return;
            const orderId = _order.id;
            const orderStatus = _order.active;
            if (!orderStatus) {
                // 将订单从内存中移除
                Game.rooms[_order.roomName].memory.energyOrder = undefined;
                Game.market.cancelOrder(orderId);
                return;
            }
            // 获取活跃的订单根据订单所属房间并将其存入到内存中
            if (orderStatus) {
                // 将能量订单存储到内存中
                if (_order.resourceType == RESOURCE_ENERGY && !Game.rooms[_order.roomName].memory.energyOrder) {
                    // 将订单id存到内存中
                    Game.rooms[_order.roomName].memory.energyOrder = _order.id;
                    return;
                }
            }
        }

        // 检查房间的能量存储量
        const energyInTerminal = room.terminal ? room.terminal.store.energy : 0;
        const energyInStorage = room.storage ? room.storage.store.energy : 0;
        const totalEnergy = energyInTerminal + energyInStorage;
        // console.log(`当前房间[${room}], energyInTerminal:[${energyInTerminal}], energyInStorage[${energyInStorage}], totalEnergy[${totalEnergy}]`);

        // 如果能量低于阈值，则创建或更新购买订单
        let energyThreshold = 400000; // 定义的能量阈值
        if (highestPrice <= 10) {
            energyThreshold = 600000;
            // TODO 待优化，根据storage容量来设定阈值，8M设置为6000000
            if (roomName == 'W55S48') {
                energyThreshold = 6000000;
            }
        }
        if (totalEnergy < energyThreshold && energyThreshold - totalEnergy >= 10000) {
            const roomEnergyOrder = Game.market.getOrderById(room.memory.energyOrder);
            if (roomEnergyOrder) {
                // 更新价格 每100tick执行一次, 价格高于25则不进行更新
                if (Game.time % 100 == 0 && highestPrice <= 25 && roomEnergyOrder.price !== (highestPrice - 0.01)) {
                    const newPrice = Math.max(roomEnergyOrder.price, highestPrice - 0.01);
                    Game.market.changeOrderPrice(roomEnergyOrder.id, newPrice);
                    console.log(colorful(`change`, 'yellow'), `room `, colorful(room.name, 'blue'), `order`, `[${roomEnergyOrder.id}]`, `price success, new price [${newPrice}]`);
                }
            } else {
                // 如果已经有一笔订单则不再创建
                if (Game.rooms[room.name].memory.energyOrder !== undefined) {
                    // console.log(`room`, colorful(room.name, 'blue'), `energyOrder already`, colorful(`exists`, 'red'), `[${Game.rooms[room.name].memory.energyOrder}]`);
                    return;
                }
                // 创建新订单 最多创建20K的订单,价格高于25则不进行创建
                if (highestPrice > 25) return;
                if (room.terminal.store.getFreeCapacity() <= 50000) return;
                Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: highestPrice - 0.001,
                    totalAmount: Math.min(20000, energyThreshold - totalEnergy),
                    roomName: room.name
                });
                console.log(colorful('create', 'green'), `energy order in room`, colorful(room.name, 'blue'), `success`, `price [${highestPrice - 0.001}]`);
                
                return;
            }
        }
    }

    // TODO 增加自动售卖Pixels及原料功能
}