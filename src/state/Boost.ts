import App from "@/App";
import Singleton from "@/Singleton";
import { State } from "@/fsm/state";

export default class Boost extends Singleton {
    public static SetBoostType(creepName: string, types: {
        type: MineralBoostConstant;
        num: number;
    }[]) {
        let creep = Game.creeps[creepName];
        if (!creep) return;
        if (!creep.room.terminal) return;
        if (!creep.room.memory.labs[0]) return;
        if (creep.memory.isSetBoost) return;
        for (let i = 0; i < types.length; i++) {
            if (global.allRes[types[i].type] < types[i].num * 30 * Memory.myrooms.length) {
                creep.memory.isSetBoost = true;
                return;
            }
        }
        creep.memory.isSetBoost = true;
        let roomName = creep.room.name;
        if (!Memory.boostList[roomName]) Memory.boostList[roomName] = {};
        if (!Memory.boostList[roomName][creep.name]) {
            Memory.boostList[roomName][creep.name] = types;
            // App.fsm.changeState(creep, State.Boost);
            console.log(JSON.stringify(types));
        }
        for (let name in Memory.boostList[roomName]) {
            if (!Game.creeps[name]) delete Memory.boostList[roomName][name]
        }
    }

    public run(creep: Creep) {
        // console.log(`当前房间为[${creep.room.name}] 正在boost creep[${creep.name}]`);
        let room = creep.room;
        let target = Game.getObjectById(room.memory.labs[0]);
        if (target) {
            if (!Memory.boostList[creep.memory.roomFrom]) Memory.boostList[creep.memory.roomFrom] = {}
            if (creep.ticksToLive < 1400) {
                creep.memory.state = null;
                creep.room.memory.labs.boostType = null;
                delete Memory.boostList[creep.memory.roomFrom][creep.name];
            }
            let types = Memory.boostList[creep.memory.roomFrom][creep.name];
            if (types?.length) {
                if (!room.memory.labs.boostType) room.memory.labs.boostType = `${creep.name}-${types[0].type}-${30 * types[0].num}`;
                if (!Game.creeps[room.memory.labs.boostType.split('-')[0]]) {
                    room.memory.labs.boostType = null;
                    return;
                }
                if (room.memory.labs.boostType != `${creep.name}-${types[0].type}-${30 * types[0].num}`) return;
                if (App.common.getDis(creep.pos, target.pos) <= 1) {
                    if (target.store[types[0].type]) {
                        console.log(JSON.stringify(Memory.boostList[creep.room.name][creep.name]));
                        let res = target.boostCreep(creep);
                        if (res == OK) {
                            creep.room.memory.labs.boostType = null;
                            types.shift();
                        }
                    }
                } else creep.customMove(target.pos, 1);
            } else {
                creep.memory.state = null;
                creep.room.memory.labs.boostType = null;
                delete Memory.boostList[creep.memory.roomFrom][creep.name];
            }
        } else {
            creep.memory.state = null;
            delete Memory.boostList[creep.memory.roomFrom][creep.name];
        }
    }
}