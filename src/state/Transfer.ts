import App from "@/App";
import { Role } from "@/common/Constant";
import { State } from "@/fsm/state";
import Singleton from "@/Singleton";

export default class Transfer extends Singleton {
    public ToSpawn(creep: Creep) {
        if (creep.store.getUsedCapacity() == 0) {
            switch (creep.memory.role) {
                case Role.Carrier:
                    App.fsm.changeState(creep, State.Pick);
                    break;
                case Role.Filler:
                case Role.HelpBuilder:
                    App.fsm.changeState(creep, State.Withdraw);
                    break;
            }
            return;
        }
        if (!creep.store.energy) {
            if (creep.store.getUsedCapacity() == 0) {
                switch (creep.memory.role) {
                    case Role.Carrier:
                        App.fsm.changeState(creep, State.Pick);
                        break;
                    case Role.Filler:
                    case Role.HelpBuilder:
                        App.fsm.changeState(creep, State.Withdraw);
                        break;
                }
            }
            else App.fsm.changeState(creep, State.TransferToStorage);
            return;
        }
        if (global.et[creep.room.name]) {
            let target: AnyStructure = App.common.getEmptySpawnAndExt(creep);
            if (target) {
                App.common.transferToTargetStructure(creep, target);
                return;
            } else {
                if (!Game.getObjectById(creep.memory.transferTargetId)) creep.memory.transferTargetId = null;
            }
            if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
                creep.memory.transferTargetId = null;
                global.et[creep.room.name] = false;
                if (creep.memory.role == Role.HelpBuilder) App.fsm.changeState(creep, State.Upgrade);
                else App.fsm.changeState(creep, State.TransferToTower);
            }
        } else {
            if (creep.memory.role == Role.HelpBuilder) App.fsm.changeState(creep, State.Upgrade);
            else App.fsm.changeState(creep, State.TransferToTower);
        }
    }

    public ToTower(creep: Creep) {
        if (creep.store.getUsedCapacity() == 0) {
            switch (creep.memory.role) {
                case Role.Carrier:
                    App.fsm.changeState(creep, State.Pick);
                    break;
                case Role.Filler:
                case Role.HelpBuilder:
                    App.fsm.changeState(creep, State.Withdraw);
                    break;

            }
            return;
        }
        if (!creep.store.energy) {
            if (creep.store.getUsedCapacity() == 0) {
                switch (creep.memory.role) {
                    case Role.Carrier:
                        App.fsm.changeState(creep, State.Pick);
                        break;
                    case Role.Filler:
                    case Role.HelpBuilder:
                        App.fsm.changeState(creep, State.Withdraw);
                        break;

                }
            }
            else App.fsm.changeState(creep, State.TransferToStorage);
            return;
        }
        let target = App.common.findTower(creep);
        if (creep.store.energy > 0 && target) App.common.transferToTargetStructure(creep, target);
        else App.fsm.changeState(creep, State.TransferToPowerSpawn);
    }

    public ToStorage(creep: Creep) {
        let target = creep.room.storage;
        if (target && target.store.getFreeCapacity() == 0) {
            App.fsm.changeState(creep, State.TransferToTerminal);
            return;
        }
        switch (creep.memory.role) {
            case Role.Filler: {
                if (!target?.my) {
                    App.fsm.changeState(creep, State.TransferToSpawn);
                    return;
                }
                else {
                    if (target.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        return;
                    }
                    App.common.transferToTargetStructure(creep, target);
                }
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Withdraw);
                break;
            }
            case Role.Carrier: {
                if (!target?.my) {
                    App.fsm.changeState(creep, State.TransferToSpawn);
                    return;
                }
                else {
                    if (target.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        return;
                    }
                    App.common.transferToTargetStructure(creep, target);
                }
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Pick);
                break;
            }
            case Role.CenterTransfer: {
                if (!target?.my) {
                    App.fsm.changeState(creep, State.TransferToTerminal);
                    return;
                }
                else {
                    App.common.transferToTargetStructure(creep, target);
                }
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Withdraw);
                break;
            }
            case Role.HelpBuilder: {
                if (!target?.my) App.fsm.changeState(creep, State.Upgrade);
                else App.common.transferToTargetStructure(creep, target);
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Upgrade);
                break;
            }
            case Role.Repairer: {
                if (!target?.my) App.fsm.changeState(creep, State.Unboost);
                else App.common.transferToTargetStructure(creep, target);
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Unboost);
                break;
            }
            case Role.DepositHarvester: {
                if (creep.ticksToLive < creep.memory.time * 2 + 50) creep.suicide();
                else App.fsm.changeState(creep, State.MoveTo);
                break
            }
        }
    }

    public ToTerminal(creep: Creep) {
        let target = creep.room.terminal
        if (target?.my) {
            switch (creep.memory.role) {
                case Role.DepositHarvester: {
                    if (creep.ticksToLive < creep.memory.time * 2 + 50) creep.suicide();
                    else App.fsm.changeState(creep, State.MoveTo);
                    break
                }
                default: {
                    if (target.store.getFreeCapacity() == 0) {
                        App.common.transferToTargetStructure(creep, creep.room.storage);
                        return;
                    }
                    App.common.transferToTargetStructure(creep, target);
                    if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Withdraw);
                    return;
                }
            }
        } else App.fsm.changeState(creep, State.TransferToStorage);
    }

    public ToFactory(creep: Creep) {
        let target = Game.getObjectById(creep.room.memory.factory.id);
        if (target?.my) {
            App.common.transferToTargetStructure(creep, target);
            return;
        } else App.fsm.changeState(creep, State.TransferToStorage);
    }

    public ToLab(creep: Creep) {
        let target;
        if (creep.memory.role == Role.CenterTransfer) target = Game.getObjectById(creep.room.memory.labs[creep.memory.fillLabIndex]);
        else {
            if (creep.memory.transferTargetId) target = Game.getObjectById(creep.memory.transferTargetId);
            else {
                for (let i = 0; i < 10; i++) {
                    let lab = Game.getObjectById(creep.room.memory.labs[i]);
                    if (lab && lab.store.energy < 2000) {
                        creep.memory.transferTargetId = lab.id;
                        break;
                    }
                }
            }
        }
        if (target instanceof StructureLab) {
            App.common.transferToTargetStructure(creep, target);
            if ((creep.store.energy && target.store.energy == 2000) ||
                creep.store.getUsedCapacity() == 0) {
                creep.memory.transferTargetId = null;
                App.fsm.changeState(creep, State.Withdraw);
                return
            }
            if (target.store[target.mineralType] == 3000 || creep.store.getUsedCapacity() == 0) {
                App.fsm.changeState(creep, State.Withdraw);
            }
        } else App.fsm.changeState(creep, State.TransferToStorage);
    }

    public ToPowerSpawn(creep: Creep) {
        let target = Game.getObjectById(creep.room.memory.powerSpawnId);
        if (creep.store.getUsedCapacity() == 0) {
            App.fsm.changeState(creep, State.Withdraw);
            return;
        }
        if (!creep.store.energy) {
            App.fsm.changeState(creep, State.TransferToStorage);
            return;
        }
        if (!target) {
            App.fsm.changeState(creep, State.TransferToLab);
            return
        }
        if (target.store.energy == 5000) {
            App.fsm.changeState(creep, State.TransferToLab);
            return;
        }
        App.common.transferToTargetStructure(creep, target);
    }

    /**
     * 冲级模式下负责向controller附近的container转运energy
     * @param creep 冲级模式专用
     * @returns 
     */
    public ToControllerContainer(creep: Creep) {
        if (creep.room.memory.controllerContainerId) {
            let controllerContainers: Id<StructureContainer>[] = creep.room.memory.controllerContainerId;
            let target: StructureContainer;
            for (let id of controllerContainers) {
                let container = Game.getObjectById(id);
                if (container.store.getFreeCapacity(RESOURCE_ENERGY) >= 500) {
                    target = container;
                    break;
                }
            }
            if (creep.ticksToLive <= 10) {
                if (creep.store.getUsedCapacity() == 0) {
                    creep.suicide();
                    return;
                } else if (creep.room.terminal) {
                    App.common.transferToTargetStructure(creep, creep.room.storage);
                    return;
                } else {
                    App.common.transferToTargetStructure(creep, target);
                    return;
                }
            }
            if (creep.store.getUsedCapacity() == 0) {
                App.fsm.changeState(creep, State.Withdraw);
                return;
            }
            if (target) {
                App.common.transferToTargetStructure(creep, target);
            } else {
                // 当controller附近有terminal时目标不存在转为向storage中转运能量
                if (creep.room.terminal?.store.getFreeCapacity() <= 50000) {
                    App.common.transferToTargetStructure(creep, creep.room.storage);
                }
                let transE2SFlag = Game.flags[`${creep.room.name}_transE2S`];
                if (transE2SFlag) {
                    App.common.transferToTargetStructure(creep, creep.room.storage);
                }
            }
        }
    }

    /**
     *   向核弹填充能量和G,判断当前房间是否需要填充能量或者G如果不需要则直接return,
     * 先进行填充能量，能量填充完毕之后再填充G
     * @param creep 
     */
    public ToNuker(creep: Creep) {
        if (creep.room.controller.level < 8) return;
        // 获取核弹发射器对象
        let nuker = Game.getObjectById(creep.room.memory.nuker) as StructureNuker;
        if (!nuker) {
            App.fsm.changeState(creep, State.Withdraw);
            return;
        }

        // 检查核弹发射器是否需要能量
        if (nuker.store.energy < nuker.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.store.getUsedCapacity() === 0) {
                App.common.getResourceFromTargetStructure(creep, creep.room.storage, RESOURCE_ENERGY);
                return;
            }
            // 转移能量到核弹发射器
            App.common.transferToTargetStructure(creep, nuker, RESOURCE_ENERGY);
            return;
        }
        // 检查核弹发射器是否需要Ghodium
        let roomGhodiumCount = creep.room.storage.store[RESOURCE_GHODIUM] + creep.room.terminal.store[RESOURCE_GHODIUM] + creep.store.getUsedCapacity(RESOURCE_GHODIUM);
        let needGhodiumQuantity = nuker.store.getCapacity(RESOURCE_GHODIUM) - nuker.store.getUsedCapacity(RESOURCE_GHODIUM);
        if (nuker.store[RESOURCE_GHODIUM] < nuker.store.getCapacity(RESOURCE_GHODIUM) && roomGhodiumCount >= needGhodiumQuantity) {
            if (!creep.store.getUsedCapacity(RESOURCE_GHODIUM) && creep.store.getFreeCapacity(RESOURCE_GHODIUM) == 0) {
                App.common.transferToTargetStructure(creep, creep.room.storage);
                return;
            } else if (creep.store.getUsedCapacity(RESOURCE_GHODIUM) == 0) {
                if (creep.room.storage.store[RESOURCE_GHODIUM] > 0) {
                    App.common.getResourceFromTargetStructure(creep, creep.room.storage, RESOURCE_GHODIUM);
                } else {
                    App.common.getResourceFromTargetStructure(creep, creep.room.terminal, RESOURCE_GHODIUM);
                }
                return;
            } else {
                // 转移Ghodium到核弹
                App.common.transferToTargetStructure(creep, nuker, RESOURCE_GHODIUM);
                return;
            }
        } else {
            if (global.allRes.G >= 10000) {
                App.logistics.createTask(creep.room.name, RESOURCE_GHODIUM, 3000, 'nuker');
            } else {
                global.autoDeal(creep.room.name, "G", 1000, Math.min(2000, needGhodiumQuantity));
            }
        }
        // 如果核弹发射器的能量和Ghodium都充足，转换creep到其他状态
        App.fsm.changeState(creep, State.Withdraw);
    }


}