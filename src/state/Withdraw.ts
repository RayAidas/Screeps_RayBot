import App from "@/App";
import { Role, TerminalStoreNum } from "@/common/Constant";
import { State } from "@/fsm/state";
import { Factory, Glb } from "@/indexManager";
import Singleton from "@/Singleton";


export default class Withdraw extends Singleton {
    public withdrawRuin(creep: Creep) {
        if (!creep.room.memory.ruinEnergyState) return;
        let ruin = Game.getObjectById(creep.memory.ruinId);
        if (ruin && ruin.store.energy) {
            App.common.getResourceFromTargetStructure(creep, ruin);
            return;
        } else creep.memory.ruinId = null;
        if (!creep.memory.ruinId) {
            let ruin = creep.pos.findClosestByRange(FIND_RUINS, {
                filter: r => r.store.energy
            })
            if (ruin) {
                creep.room.memory.ruinEnergyState = true
                creep.memory.ruinId = ruin.id;
            }
            else {
                App.fsm.changeState(creep, State.Pick);
                creep.room.memory.ruinEnergyState = false
            }
        }
    }

    public run(creep: Creep) {
        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
        let centerLink = Game.getObjectById(creep.room.memory.centerLinkId);
        let controllerLink = Game.getObjectById(creep.room.memory.controllerLinkId);
        let factory = Game.getObjectById(creep.room.memory.factory?.id);
        let powerSpawn = Game.getObjectById(creep.room.memory.powerSpawnId);
        switch (creep.memory.role) {
            case Role.Filler: {
                App.common.createNew(creep, creep.body.length * 3 + 20);
                if (creep.ticksToLive < 20) {
                    if (creep.store.getUsedCapacity() == 0) {
                        creep.suicide();
                        return;
                    } else {
                        App.fsm.changeState(creep, State.TransferToStorage);
                        return;
                    }
                }
                if (centerLink && centerLink.store.energy) {
                    if (creep.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        return;
                    }
                    if (creep.store.getFreeCapacity() > 0) {
                        App.common.getResourceFromTargetStructure(creep, centerLink);
                    }
                    return;
                }
                if (creep.store.getFreeCapacity() > 0) {
                    if (storage?.store.energy) App.common.getResourceFromTargetStructure(creep, storage);
                    else if (terminal?.store.energy) App.common.getResourceFromTargetStructure(creep, terminal);
                }
                if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.TransferToSpawn);
                break;
            }
            case Role.CenterTransfer: {
                App.common.createNew(creep, creep.body.length * 3 + 20);
                if (creep.ticksToLive < 20) {
                    if (creep.store.getUsedCapacity() == 0) {
                        creep.suicide();
                        return;
                    } else {
                        App.fsm.changeState(creep, State.TransferToStorage);
                        return;
                    }
                }
                if (creep.room.memory.ruinState) {
                    let ruin = Game.getObjectById(creep.memory.ruinId);
                    if (ruin && Object.keys(ruin.store).length) {
                        let res = Object.keys(ruin.store)[0] as ResourceConstant;
                        App.common.getResourceFromTargetStructure(creep, ruin, res);
                        if (creep.store.getFreeCapacity() == 0) {
                            App.fsm.changeState(creep, State.TransferToStorage);
                            return;
                        }
                    } else creep.memory.ruinId = null;
                    if (!creep.memory.ruinId) {
                        let ruin = creep.pos.findClosestByRange(FIND_RUINS, {
                            filter: (r) => Object.keys(r.store).length
                        })
                        if (ruin) {
                            creep.room.memory.ruinState = true;
                            creep.memory.ruinId = ruin.id;
                        }
                        else {
                            creep.room.memory.ruinState = false;
                            App.fsm.changeState(creep, State.TransferToStorage);
                        }
                    }
                    return;
                }
                creep.memory.test = 1;
                // Boost
                let str = creep.room.memory.labs.boostType;
                if (str) {
                    let arr = str.split('-');
                    if (!Game.creeps[arr[0]]) creep.room.memory.labs.boostType = null;
                    let type = arr[1] as MineralBoostConstant;
                    let num = +arr[2];
                    if (terminal.store[type] < num) {
                        App.logistics.createTask(creep.room.name, type, num, 'lab');
                    }
                    let lab = Game.getObjectById(creep.room.memory.labs[0]);
                    if (lab.store[type] < num) {
                        if (creep.store.getFreeCapacity() < num && creep.store[type] < num) {
                            App.fsm.changeState(creep, State.TransferToStorage);
                            return;
                        }
                    }
                    let resources = Object.keys(lab.store).filter(e => e != 'energy' && e != type);
                    if (resources.length) {
                        if (creep.store.getFreeCapacity() == 0) {
                            App.fsm.changeState(creep, State.TransferToStorage);
                            return;
                        }
                        App.common.getResourceFromTargetStructure(creep, lab, resources[0] as ResourceConstant);
                        return;
                    }
                    if (creep.store[type] >= num && lab.store[type] < num) {
                        App.common.transferToTargetStructure(creep, lab, type, num);
                        return;
                    }
                    if (lab.store[type] < num) {
                        if (terminal.store[type] >= num) {
                            App.common.getResourceFromTargetStructure(creep, terminal, type, num);
                            return;
                        }
                        if (storage.store[type] >= num) {
                            App.common.getResourceFromTargetStructure(creep, storage, type, num);
                            return;
                        }
                    }
                }
                creep.memory.test = 2;
                // Lab
                if (creep.room.memory.labs.clear) {
                    if (creep.store.getFreeCapacity() > 0) {
                        for (let i = 0; i < creep.room.memory.labs.num; i++) {
                            let lab = Game.getObjectById(creep.room.memory.labs[i]);
                            if (lab.mineralType) {
                                App.common.getResourceFromTargetStructure(creep, lab, lab.mineralType);
                                break;
                            }
                            if (i == creep.room.memory.labs.num - 1) {
                                creep.room.memory.labs.clear = false;
                                App.fsm.changeState(creep, State.TransferToStorage);
                            }
                        }
                    } else App.fsm.changeState(creep, State.TransferToStorage);
                    return;
                }
                creep.memory.test = 3;
                let unboostContainer = Game.getObjectById(creep.room.memory.unboostContainer);
                if (unboostContainer?.store.getUsedCapacity() > 0) {
                    if (creep.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToStorage);
                        return;
                    }
                    App.common.getResourceFromTargetStructure(creep, unboostContainer, Object.keys(unboostContainer.store)[0] as ResourceConstant);
                    return;
                }
                if (creep.room.memory.labs.fillRes) {
                    creep.room.memory.labs.creepName = creep.name;
                    if (creep.store.getUsedCapacity() > 0 && !creep.store[creep.room.memory.labs.fillRes]) {
                        App.common.transferToTargetStructure(creep, storage);
                        return;
                    }
                    if (creep.store.getFreeCapacity() > 0) {
                        if (storage.store[creep.room.memory.labs.fillRes]) App.common.getResourceFromTargetStructure(creep, storage, creep.room.memory.labs.fillRes);
                        else App.common.getResourceFromTargetStructure(creep, terminal, creep.room.memory.labs.fillRes);
                    } else {
                        creep.memory.fillLabIndex = creep.room.memory.labs.fillTargetIndex;
                        App.fsm.changeState(creep, State.TransferToLab)
                    }
                    return;
                }
                creep.memory.test = 4;

                // powerSpawn
                if (powerSpawn && storage.store.energy > 300000 && powerSpawn.store.power == 0) {
                    if (creep.store.power >= 100) {
                        App.common.transferToTargetStructure(creep, powerSpawn, 'power', 100);
                        return;
                    }
                    if ((storage?.store.power || 0) + (terminal?.store.power || 0) >= 100) {
                        if (creep.store.getFreeCapacity() < 100) {
                            App.common.transferToTargetStructure(creep, storage);
                            return;
                        }
                        if (storage.store.power >= 100) App.common.getResourceFromTargetStructure(creep, storage, 'power', 100);
                        else if (storage.store.power) App.common.getResourceFromTargetStructure(creep, storage, 'power');
                        else if (terminal.store.power) App.common.getResourceFromTargetStructure(creep, terminal, 'power', 100 - creep.store.power);
                        return;
                    } else if (global.allRes['power'] > Memory.myrooms.length * 100) {
                        App.logistics.createTask(creep.room.name, 'power', 100, 'power');
                        if (global.allRes.power < 1000) global.autoDeal(creep.room.name, 'power', 400, 1000);
                    }
                }
                creep.memory.test = 5;

                if (terminal?.my && storage?.my) {
                    if (Game.time % (creep.room.memory.index + 15) == 0 && !creep.memory.toStorage && !creep.memory.toTerminal) {
                        if (storage.store.getFreeCapacity() > 3000) {
                            for (let res in terminal.store) {
                                if (terminal.store[res] > (TerminalStoreNum[res] ?? 3000)) {
                                    creep.memory.toStorage = res as ResourceConstant;
                                    break;
                                }
                            }
                        }
                        if (terminal.store.getFreeCapacity() > 3000) {
                            for (let res in storage.store) {
                                if (terminal.store[res] < (TerminalStoreNum[res] ?? 3000)) {
                                    creep.memory.toTerminal = res as ResourceConstant;
                                    break;
                                }
                            }
                        }
                    }

                    if (factory?.my) {
                        let lv = creep.room.memory.factory.lv || 0;
                        if (Game.time % (creep.room.memory.index + 15) == 0) {
                            for (let res in factory.store) {
                                if (creep.room.memory.factory.target) {
                                    if (!Object.keys(Factory.getMaterials(creep.room.memory.factory.target).components).includes(res)) {
                                        creep.memory.FtS = res as ResourceConstant;
                                        break;
                                    }
                                    else if (Factory.productCatalog[lv].includes(res as CommodityConstant)) {
                                        creep.memory.FtS = res as ResourceConstant;
                                        break;
                                    }
                                } else {
                                    if (factory.store[res] > 1000) {
                                        creep.memory.FtS = res as ResourceConstant;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                creep.memory.test = 6;
                if (controllerLink && controllerLink.store.energy < 400) {
                    if (creep.store.energy != creep.store.getUsedCapacity() && creep.store.getUsedCapacity() != 0) {
                        // App.fsm.changeState(creep, State.TransferToStorage);
                        if (App.common.getDis(creep.pos, storage.pos) == 1) App.common.transferToTargetStructure(creep, storage);
                        else creep.customMove(storage.pos, 1);
                    } else {
                        if (creep.store.getFreeCapacity() > 0) {
                            if (storage.store.energy) App.common.getResourceFromTargetStructure(creep, storage);
                            else if (terminal.store.energy) App.common.getResourceFromTargetStructure(creep, terminal);
                        } else App.common.transferToTargetStructure(creep, centerLink);
                    }
                    return;
                }
                creep.memory.test = 7;
                // centerLink
                if (centerLink && centerLink.store.energy) {
                    if (creep.store.getFreeCapacity() == 0) {
                        // App.fsm.changeState(creep, State.TransferToStorage);
                        if (storage.store.getFreeCapacity() < creep.store.getUsedCapacity()) {
                            App.fsm.changeState(creep, State.TransferToTerminal);
                            return
                        }
                        if (App.common.getDis(creep.pos, storage.pos) == 1) {
                            let res = Object.keys(creep.store).sort((a, b) => creep.store[b] - creep.store[a]) as ResourceConstant[];
                            App.common.transferToTargetStructure(creep, storage, res[0]);
                        }
                        else creep.customMove(storage.pos, 1);
                    }
                    if (creep.store.getFreeCapacity() > 0) {
                        App.common.getResourceFromTargetStructure(creep, centerLink);
                    }
                    return;
                }
                creep.memory.test = 8;
                // factory
                if (factory) {
                    let demand = creep.room.memory.factory.demand
                    if (demand) {
                        let num = creep.room.memory.factory.demandQuantity;
                        if (creep.store[demand] >= num) {
                            if (App.common.getDis(creep.pos, factory.pos) == 1) {
                                App.common.transferToTargetStructure(creep, factory, demand);
                                creep.room.memory.factory.demand = null;
                            }
                            else creep.customMove(factory.pos, 1);
                            return;
                        } else if (creep.store[demand] < num && creep.store.getFreeCapacity() < num && terminal.store[demand] >= num) {
                            App.fsm.changeState(creep, State.TransferToStorage);
                            return;
                        }
                        if (storage.store[demand] >= num && creep.store.getFreeCapacity() >= num) {
                            if (App.common.getDis(creep.pos, storage.pos) == 1) App.common.getResourceFromTargetStructure(creep, storage, demand, num);
                            else creep.customMove(storage.pos, 1);
                            return;
                        }
                        if (terminal.store[demand] >= num && creep.store.getFreeCapacity() >= num) {
                            if (App.common.getDis(creep.pos, terminal.pos) == 1) App.common.getResourceFromTargetStructure(creep, terminal, demand, num);
                            else creep.customMove(terminal.pos, 1);
                            return;
                        }
                        App.logistics.createTask(creep.room.name, demand, num, 'factory');
                    }
                }
                creep.memory.test = 9;
                let toStorage = creep.memory.toStorage;
                let toTerminal = creep.memory.toTerminal;
                let fts = creep.memory.FtS;
                if (toStorage) {
                    if (storage.store.getFreeCapacity() < creep.store.getUsedCapacity()) {
                        App.fsm.changeState(creep, State.TransferToTerminal);
                        return
                    }
                    if (terminal.store[toStorage] <= (TerminalStoreNum[toStorage] ?? 3000)) {
                        if (creep.store[toStorage]) {
                            if (App.common.getDis(creep.pos, storage.pos) == 1) {
                                App.common.transferToTargetStructure(creep, storage, toStorage);
                                creep.memory.toStorage = null;
                            }
                            else creep.customMove(storage.pos, 1);
                            return;
                        } else creep.memory.toStorage = null;
                        return;
                    }
                    let count = terminal.store[toStorage] - (TerminalStoreNum[toStorage] ?? 3000);
                    if (count > 0) {
                        if (count >= creep.store.getUsedCapacity()) App.common.getResourceFromTargetStructure(creep, terminal, toStorage);
                        else App.common.getResourceFromTargetStructure(creep, terminal, toStorage, count);
                    }
                    if (App.common.getDis(creep.pos, storage.pos) == 1) App.common.transferToTargetStructure(creep, storage);
                    else creep.customMove(storage.pos, 1);

                    return;
                }
                if (toTerminal) {
                    if (terminal.store[toTerminal] >= (TerminalStoreNum[toTerminal] ?? 3000) || !storage.store[toTerminal]) {
                        if (creep.store[toTerminal]) {
                            if (App.common.getDis(creep.pos, terminal.pos) == 1) {
                                App.common.transferToTargetStructure(creep, terminal, toTerminal);
                                creep.memory.toTerminal = null;
                            }
                            else creep.customMove(terminal.pos, 1);
                            return;
                        } else creep.memory.toTerminal = null;
                        return;
                    }
                    let count = (TerminalStoreNum[toTerminal] ?? 3000) - terminal.store[toTerminal];
                    if (count > 0) {
                        if (count >= creep.store.getUsedCapacity()) App.common.getResourceFromTargetStructure(creep, storage, toTerminal);
                        else App.common.getResourceFromTargetStructure(creep, storage, toTerminal, count);
                    }
                    if (App.common.getDis(creep.pos, terminal.pos) == 1) App.common.transferToTargetStructure(creep, terminal);
                    else creep.customMove(terminal.pos, 1);

                    return;
                }
                creep.memory.test = 10;
                if (fts) {
                    if (creep.store.getUsedCapacity()) {
                        if (App.common.getDis(creep.pos, terminal.pos) == 1) App.common.transferToTargetStructure(creep, terminal);
                        else creep.customMove(terminal.pos, 1);
                    } else {
                        if (App.common.getDis(creep.pos, factory.pos) == 1) App.common.getResourceFromTargetStructure(creep, factory, fts);
                        else creep.customMove(factory.pos, 1);
                    }
                    if (factory.store[fts] < 1000 && !creep.store[fts]) creep.memory.FtS = null;
                    return;
                }
                break;
            }
            case Role.Carrier: {
                let container = Game.getObjectById(creep.memory.targetContainer);
                if (creep.memory.targetContainer == creep.room.memory.mineral.container) {
                    if (creep.ticksToLive < 50) {
                        if (creep.store.getUsedCapacity() > 0) App.fsm.changeState(creep, State.TransferToStorage);
                        else creep.suicide();
                    }
                    if (container && container.store.getUsedCapacity() >= creep.store.getCapacity()) {
                        let res = Object.keys(container.store) as ResourceConstant[];
                        App.common.getResourceFromTargetStructure(creep, container, res[0]);
                    }
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.TransferToStorage);
                    return;
                }
                else {
                    if (creep.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        return;
                    }
                    if (creep.room.memory.ruinEnergyState) {
                        this.withdrawRuin(creep);
                        return;
                    }
                    if (creep.ticksToLive < 50) {
                        if (creep.store.energy) App.fsm.changeState(creep, State.TransferToSpawn);
                        else creep.suicide();
                    }
                    if (container && container.store.energy >= creep.store.getCapacity()) {
                        if (creep.store.getFreeCapacity() > 0) App.common.getResourceFromTargetStructure(creep, container);
                    }
                    else App.fsm.changeState(creep, State.Pick);
                }
                break;
            }
            case Role.Builder: {
                if (creep.store.getFreeCapacity() == 0) {
                    App.fsm.changeState(creep, State.Build);
                    return;
                }
                if (creep.room.memory.ruinEnergyState) {
                    this.withdrawRuin(creep);
                    return;
                }
                if (storage?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, storage);
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.Build);
                    return;
                }
                if (terminal?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, terminal);
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.Build);
                    return;
                }
                if (!creep.memory.targetContainer) {
                    let containers: StructureContainer[] = creep.room.find(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.energy
                    })
                    if (containers.length) {
                        let container = containers.sort((a, b) => b.store.energy - a.store.energy)[0];
                        creep.memory.targetContainer = container.id;
                    } else {
                        this.withdrawRuin(creep);
                        return;
                    }
                } else {
                    let container = Game.getObjectById(creep.memory.targetContainer);
                    App.common.getResourceFromTargetStructure(creep, container);
                }
                break;
            }
            case Role.Upgrader: {
                if (creep.store.getFreeCapacity() == 0) {
                    App.fsm.changeState(creep, State.Build);
                    return;
                }
                if (creep.room.memory.ruinEnergyState) {
                    this.withdrawRuin(creep);
                    return;
                }
                let upgradePlusFlag = Game.flags[`${creep.memory.roomFrom}_upgradePlus`];
                if (!upgradePlusFlag) {
                    if (!creep.memory.constructionId) {
                        let controllerLink = Game.getObjectById(creep.room.memory.controllerLinkId);
                        if (controllerLink) {
                            this._moveToAndRetrieveEnergy(creep, controllerLink);
                            return;
                        }
                    }
                }
                // 如果是冲级模式则优先判断判断controllerLink有无能量，其次从controllerContainer等建筑中获取能量
                if (upgradePlusFlag) {
                    let controllerLink = Game.getObjectById(creep.room.memory.controllerLinkId);
                    if (controllerLink && controllerLink.store[RESOURCE_ENERGY] >= 500) {
                        this._moveToAndRetrieveEnergy(creep, controllerLink);
                        return;
                    }
                    let controllerContainers: Id<StructureContainer>[] = creep.room.memory.controllerContainerId;
                    let target: StructureContainer;
                    for (let id of controllerContainers) {
                        let container = Game.getObjectById(id);
                        if (container.store[RESOURCE_ENERGY] >= 500) {
                            target = container;
                            break;
                        }
                    }
                    if (target) {
                        this._moveToAndRetrieveEnergy(creep, target);
                        return;
                    }
                }


                if (storage?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, storage);
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.Upgrade);
                    return;
                }
                if (terminal?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, terminal);
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.Upgrade);
                    return;
                }
                if (!creep.memory.targetContainer) {
                    let containers: StructureContainer[] = creep.room.find(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.energy
                    })
                    if (containers.length) {
                        let container = containers.sort((a, b) => b.store.energy - a.store.energy)[0];
                        creep.memory.targetContainer = container.id;
                    } else {
                        this.withdrawRuin(creep);
                        return;
                    }
                } else {
                    let container = Game.getObjectById(creep.memory.targetContainer);
                    App.common.getResourceFromTargetStructure(creep, container);
                }
                break;
            }
            case Role.HelpUpgrader: {
                if (creep.store.getFreeCapacity() == 0) {
                    App.fsm.changeState(creep, State.Upgrade);
                    return;
                }
                if (creep.room.storage?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, creep.room.storage);
                    return;
                } else App.fsm.changeState(creep, State.Harvest);
                break;
            }
            case Role.HelpBuilder: {
                if (creep.store.getFreeCapacity() == 0) {
                    App.fsm.changeState(creep, State.Build);
                    return;
                }
                let ruin = Game.getObjectById(creep.memory.ruinId);
                if (ruin && ruin.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, ruin);
                    return;
                } else creep.memory.ruinId = null;
                if (!creep.memory.ruinId) {
                    let ruin = creep.pos.findClosestByPath(FIND_RUINS, {
                        filter: r => r.store.energy
                    })
                    if (ruin) {
                        creep.memory.ruinId = ruin.id;
                        creep.memory.ruinState = true;
                    }
                    else {
                        App.fsm.changeState(creep, State.Pick);
                        creep.memory.ruinState = false;
                    }
                }
                break;
            }
            case Role.Repairer: {
                if (storage?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, storage);
                    if (creep.store.getFreeCapacity() == 0) {
                        if (!creep.room.memory.unboostContainer && creep.room.memory.unboostContainerPos) {
                            let { x, y, roomName } = creep.room.memory.unboostContainerPos;
                            let site = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, new RoomPosition(x, y, roomName));
                            if (!site.length) creep.room.createConstructionSite(x, y, STRUCTURE_CONTAINER);
                            else creep.memory.constructionId = site[0].id;
                        }
                        App.fsm.changeState(creep, State.Build);
                    }
                    return;
                }
                if (terminal?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, terminal);
                    if (creep.store.getFreeCapacity() == 0) {
                        if (!creep.room.memory.unboostContainer && creep.room.memory.unboostContainerPos) {
                            let { x, y, roomName } = creep.room.memory.unboostContainerPos;
                            let site = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, new RoomPosition(x, y, roomName));
                            if (!site.length) creep.room.createConstructionSite(x, y, STRUCTURE_CONTAINER);
                            else creep.memory.constructionId = site[0].id;
                        }
                        App.fsm.changeState(creep, State.Build);
                    }
                    return;
                }
                break;
            }
            case Role.Transfer2Container: {
                if (creep.store.getFreeCapacity() == 0) {
                    App.fsm.changeState(creep, State.TransferToControllerContainer);
                    return;
                }
                if (creep.room.memory.ruinEnergyState) {
                    this.withdrawRuin(creep);
                    return;
                }
                if (storage?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, storage);
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.TransferToControllerContainer);
                    return;
                }
                if (terminal?.store.energy) {
                    App.common.getResourceFromTargetStructure(creep, terminal);
                    if (creep.store.getFreeCapacity() == 0) App.fsm.changeState(creep, State.TransferToControllerContainer);
                    return;
                }
                if (!creep.memory.targetContainer) {
                    let containers: StructureContainer[] = creep.room.find(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.energy
                    })
                    if (containers.length) {
                        let container = containers.sort((a, b) => b.store.energy - a.store.energy)[0];
                        creep.memory.targetContainer = container.id;
                    } else {
                        this.withdrawRuin(creep);
                        return;
                    }
                } else {
                    let container = Game.getObjectById(creep.memory.targetContainer);
                    App.common.getResourceFromTargetStructure(creep, container);
                }
                break;
            }
        }
    }

    /**
     * 移动到目标位置并获取能量
     * @param creep 
     * @param target 
     * @returns 
     */
    private _moveToAndRetrieveEnergy(creep: Creep, target: AnyStructure | Ruin | Tombstone) {
        let dis = App.common.getDis(creep.pos, target.pos);
        if (dis > 1) {
            if (!creep.memory.targetPos) {
                let targetPos = App.common.findPos(target.pos);
                if (targetPos) creep.memory.targetPos = targetPos;
            } else {
                creep.customMove(creep.memory.targetPos, 0);
                if (creep.pos.x == creep.memory.targetPos.x &&
                    creep.pos.y == creep.memory.targetPos.y) creep.memory.targetPos = null;
                return;
            }
        } else if (dis == 1) {
            if (creep.memory.targetPos) {
                if (creep.pos.x == creep.memory.targetPos.x &&
                    creep.pos.y == creep.memory.targetPos.y) creep.memory.targetPos = null;
                else creep.customMove(creep.memory.targetPos, 0)
            }
        }
        App.common.getResourceFromTargetStructure(creep, target);
        return;
    }
}