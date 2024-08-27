import App from "@/App";
import { Role } from "@/common/Constant";
import { State } from "@/fsm/state";
import Singleton from "@/Singleton";

export default class Upgrade extends Singleton {
    public run(creep: Creep) {
        switch (creep.memory.role) {
            case Role.Builder:
            case Role.Upgrader: {
                // 判断冲级模式下creep存活时间是否小于等于10,如果满足则将能量放入合适的容器中并
                let upgradePlusFlag = Game.flags[`${creep.memory.roomFrom}_upgradePlus`];
                if (upgradePlusFlag) {
                    let controllerContainers: Id<StructureContainer>[] = creep.room.memory.controllerContainerId;
                    let storeTarget: StructureContainer;
                    for (let id of controllerContainers) {
                        let container = Game.getObjectById(id);
                        if (container.store.getFreeCapacity() >= 500) {
                            storeTarget = container;
                            break;
                        }
                    }
                    if (creep.ticksToLive <= 10) {
                        if (creep.store.getUsedCapacity() == 0) {
                            creep.suicide();
                            return;
                        } else if  (creep.room.terminal) {
                            App.common.transferToTargetStructure(creep, creep.room.terminal);
                            return;
                        } else {
                            App.common.transferToTargetStructure(creep, storeTarget);
                            return;
                        }
                    }
                }
                let pos = creep.memory.upgradePos;
                let res = creep.upgradeController(creep.room.controller);
                if (res == OK) {
                    if (pos) {
                        creep.customMove(new RoomPosition(pos.x, pos.y, pos.roomName), 0);
                        if (App.common.isPosEqual(creep.pos, pos)) creep.memory.upgradePos = null;
                    }
                }
                if (res == ERR_NOT_IN_RANGE) {
                    if (pos) creep.customMove(new RoomPosition(pos.x, pos.y, pos.roomName), 0, false);
                    else App.common.setUpgradePos(creep.room.name, creep.name);
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creep.memory.targetContainer = null;
                    App.fsm.changeState(creep, State.Withdraw);
                }
                break;
            }
            case Role.HelpUpgrader: {
                let target = Game.flags[`${creep.memory.roomFrom}_helpUpgrade`];
                if (target) {
                    if (creep.room.controller.level == 8) target.remove();
                }
            }
            case Role.HelpBuilder: {
                let pos = creep.memory.upgradePos;
                let res = creep.upgradeController(creep.room.controller);
                if (res == OK) {
                    if (pos) {
                        creep.customMove(new RoomPosition(pos.x, pos.y, pos.roomName), 0);
                        if (App.common.isPosEqual(creep.pos, pos)) creep.memory.upgradePos = null;
                    }
                }
                if (res == ERR_NOT_IN_RANGE) {
                    if (pos) creep.customMove(new RoomPosition(pos.x, pos.y, pos.roomName), 0, false);
                    else App.common.setUpgradePos(creep.room.name, creep.name);
                }

                if (creep.store.getUsedCapacity() == 0) {
                    creep.memory.targetContainer = null;
                    App.fsm.changeState(creep, State.Withdraw);
                }
                break;
            }
        }
    }
}
