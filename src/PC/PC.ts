import App from "@/App";
import Singleton from "@/Singleton";

export default class PC extends Singleton {
    public static PCTaskName = {
        reNew: 'reNew',
        operate_factory: 'operate_factory',
        operate_storage: 'operate_storage',
        operate_source: 'operate_source',
        operate_extension: 'operate_extension',
        operate_spawn: 'operate_spawn',
        operate_lab: 'operate_lab',
        operate_power: 'operate_power',
        clearStore: 'clearStore'
    }
    // TODO 修改为一个PC可以给多个房间扩容storage，增加提高powerSpawn效率功能
    public static addPCTask(roomName: string, taskName: string, opsNum: number = 0, targetId?: string) {
        let powerCreep = Game.powerCreeps[Memory.pcConfig[roomName]];
        if (powerCreep?.ticksToLive) {
            switch (taskName) {
                case "operate_factory":
                    if (global.allRes.ops < 1000) return;
                    if (!powerCreep.powers[PWR_OPERATE_FACTORY]) return;
                    break;
                case "operate_storage":
                    if (global.allRes.ops < 1000) return;
                    if (!powerCreep.powers[PWR_OPERATE_STORAGE]) return;
                    break;
                case "operate_source":
                    if (!powerCreep.powers[PWR_REGEN_SOURCE]) return;
                    if (powerCreep.powers[PWR_REGEN_SOURCE].cooldown) return;
                    break;
                case "operate_extension":
                    if (!powerCreep.powers[PWR_OPERATE_EXTENSION]) return;
                    if (powerCreep.powers[PWR_OPERATE_EXTENSION].cooldown) return;
                    break;
                case "operate_spawn":
                    if (global.allRes.ops < 1000) return;
                    if (!powerCreep.powers[PWR_OPERATE_SPAWN]) return;
                    if (powerCreep.powers[PWR_OPERATE_SPAWN].cooldown) return;
                    break;
                case "operate_lab":
                    if (!powerCreep.powers[PWR_OPERATE_LAB]) return;
                    if (powerCreep.powers[PWR_OPERATE_LAB].cooldown) return;
                    break;
                case "operate_power":
                    if (!powerCreep.powers[PWR_OPERATE_POWER]) return;
                    break;
            }
            if (!powerCreep.memory.task) powerCreep.memory.task = {};
            if (powerCreep.memory[taskName]) return;
            powerCreep.memory.task[taskName] = {
                taskName: taskName,
                time: Game.time,
                opsNum: opsNum,
                targetId: targetId,
            }
        }
    }

    public run(room: string) {
        if (!Memory.pcConfig[room]) return;

        let powerCreep = Game.powerCreeps[Memory.pcConfig[room]];
        if (powerCreep?.ticksToLive) {
            if (powerCreep.pos.x == 0 || powerCreep.pos.x == 49 || powerCreep.pos.y == 0 || powerCreep.pos.y == 49) {
                powerCreep.customMove(Game.rooms[room].storage.pos);
                return;
            }
            if (powerCreep.room.memory?.factory.lv == void 0 && powerCreep.powers[PWR_OPERATE_FACTORY]) {
                powerCreep.room.memory.factory.lv = powerCreep.powers[PWR_OPERATE_FACTORY].level;
            }
            if (this.enableRoom(powerCreep)) return;
            if (this.generate_ops(powerCreep)) return;
            if (powerCreep.ticksToLive < 4000) PC.addPCTask(room, PC.PCTaskName.reNew);
            if (powerCreep.room.energyCapacityAvailable - powerCreep.room.energyAvailable > 5000) PC.addPCTask(room, PC.PCTaskName.operate_extension, 2);
            if (powerCreep.room.storage.store.getFreeCapacity() < 10000) {
                let storage = powerCreep.room.storage;
                if (!storage.effects || !storage.effects.length || storage.effects[0].ticksRemaining <= 10) {
                    PC.addPCTask(room, PC.PCTaskName.operate_storage, 100);
                }
            }
            if (powerCreep.store.getFreeCapacity() <= 100) PC.addPCTask(room, PC.PCTaskName.clearStore);
            let taskList = Object.keys(powerCreep.memory.task ?? {});
            powerCreep.memory.currentTask = taskList[0];
            if (!powerCreep.memory.currentTask) this.idle(powerCreep);
            else {
                let task = powerCreep.memory.task[powerCreep.memory.currentTask];
                if (powerCreep.store.getUsedCapacity('ops') < task.opsNum) {
                    let target = null;
                    if (powerCreep.room.terminal?.store.ops >= task.opsNum) target = powerCreep.room.terminal;
                    else if (powerCreep.room.storage?.store.ops >= task.opsNum) target = powerCreep.room.storage;
                    else App.logistics.createTask(powerCreep.room.name, 'ops', task.opsNum, 'power');
                    if (target) {
                        App.common.getResourceFromTargetStructure(powerCreep, target, 'ops', task.opsNum);
                    }
                    return;
                }
                this[powerCreep.memory.currentTask](powerCreep, task.targetId);
            }
        }
        else this.spawn(room);
    }

    public deleteTask(powerCreep: PowerCreep, taskId: string) {
        if (powerCreep) {
            delete powerCreep.memory.task[taskId];
            powerCreep.memory.currentTask = null;
        }
    }

    public spawn(room: string) {
        if (Game.getObjectById(Game.rooms[room].memory.powerSpawnId)) Game.powerCreeps[Memory.pcConfig[room]].spawn(Game.getObjectById(Game.rooms[room].memory.powerSpawnId));
    }

    public enableRoom(powerCreep: PowerCreep) {
        if (powerCreep.room.controller.isPowerEnabled) return false;
        if (powerCreep.enableRoom(powerCreep.room.controller) == ERR_NOT_IN_RANGE) {
            powerCreep.customMove(powerCreep.room.controller.pos, 1)
        }
        return true;
    }

    public generate_ops(powerCreep: PowerCreep) {
        if (!powerCreep.powers[PWR_GENERATE_OPS]) return false;
        return powerCreep.usePower(PWR_GENERATE_OPS) === OK;
    }

    public idle(powerCreep: PowerCreep) {
        if (powerCreep.hits < powerCreep.hitsMax) global.towerTask[powerCreep.room.name]?.injured.push(powerCreep.id)
    }

    public reNew(powerCreep: PowerCreep) {
        let target: StructurePowerSpawn = Game.getObjectById(powerCreep.room.memory.powerSpawnId);
        if (powerCreep.renew(target) == ERR_NOT_IN_RANGE) {
            powerCreep.customMove(target.pos, 1);
        }
        if (powerCreep.ticksToLive >= 4900) this.deleteTask(powerCreep, PC.PCTaskName.reNew);
    }

    public clearStore(powerCreep: PowerCreep) {
        App.common.transferToTargetStructure(powerCreep, powerCreep.room.terminal);
        if (powerCreep.store.getUsedCapacity() == 0) this.deleteTask(powerCreep, PC.PCTaskName.clearStore);
    }

    public operate_extension(powerCreep: PowerCreep) {
        let terminal: StructureTerminal = powerCreep.room.terminal;
        let storage: StructureStorage = powerCreep.room.storage;
        if (storage.store.energy > 20000) {
            let res = powerCreep.usePower(PWR_OPERATE_EXTENSION, storage);
            if (res == ERR_NOT_IN_RANGE) powerCreep.customMove(storage.pos, 3)
            else if (res == OK) this.deleteTask(powerCreep, PC.PCTaskName.operate_extension);
        } else {
            let res = powerCreep.usePower(PWR_OPERATE_EXTENSION, terminal);
            if (res == ERR_NOT_IN_RANGE) powerCreep.customMove(terminal.pos, 3)
            else if (res == OK) this.deleteTask(powerCreep, PC.PCTaskName.operate_extension);
        }
    }

    public operate_factory(powerCreep: PowerCreep) {
        let target = Game.getObjectById(powerCreep.room.memory.factory.id);
        if (App.common.getDis(powerCreep.pos, target.pos) > 3) powerCreep.customMove(target.pos, 3);
        else if (!target.effects || !target.effects.length || target.effects[0].ticksRemaining == 1) {
            if (powerCreep.usePower(PWR_OPERATE_FACTORY, target) == OK) this.deleteTask(powerCreep, PC.PCTaskName.operate_factory);
        }
    }

    public operate_storage(powerCreep: PowerCreep) {
        let target = powerCreep.room.storage;
        if (App.common.getDis(powerCreep.pos, target.pos) > 3) powerCreep.customMove(target.pos, 3);
        else if (!target.effects || !target.effects.length || target.effects[0].ticksRemaining == 1) {
            if (powerCreep.usePower(PWR_OPERATE_STORAGE, target) == OK) this.deleteTask(powerCreep, PC.PCTaskName.operate_storage);
        }
    }

    public operate_source(powerCreep: PowerCreep, targetId: Id<Source>) {
        let target = Game.getObjectById(targetId);
        if (App.common.getDis(powerCreep.pos, target.pos) > 3) powerCreep.customMove(target.pos, 3);
        else if (!target.effects || !target.effects.length || target.effects[0].ticksRemaining == 1) {
            if (powerCreep.usePower(PWR_REGEN_SOURCE, target) == OK) this.deleteTask(powerCreep, PC.PCTaskName.operate_source);
        }
    }

    public operate_spawn(powerCreep: PowerCreep) {
        this.deleteTask(powerCreep, PC.PCTaskName.operate_spawn);
    }

    public operate_lab(powerCreep: PowerCreep) {
        this.deleteTask(powerCreep, PC.PCTaskName.operate_lab);
    }

    public operate_power(powerCreep: PowerCreep) {
        this.deleteTask(powerCreep, PC.PCTaskName.operate_power);
    }
}