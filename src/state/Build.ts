import App from "@/App";
import { Role } from "@/common/Constant";
import { State } from "@/fsm/state";
import Singleton from "@/Singleton";

export default class Build extends Singleton {
    public run(creep: Creep) {
        switch (creep.memory.role) {
            case Role.Upgrader:
            case Role.Builder: {
                if (creep.store.getUsedCapacity() == 0) {
                    creep.memory.targetContainer = null;
                    App.fsm.changeState(creep, State.Withdraw);
                }
                if (!creep.memory.constructionId) {
                    let site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                    if (site) creep.memory.constructionId = site.id;
                    else App.fsm.changeState(creep, State.Upgrade);
                } else {
                    let site = Game.getObjectById(creep.memory.constructionId);
                    if (site) {
                        if (creep.build(site) == ERR_NOT_IN_RANGE) creep.customMove(site.pos);
                        if (creep.memory.path) creep.customMove(site.pos);
                    } else {
                        creep.memory.constructionId = null;
                        let site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                        if (site) creep.memory.constructionId = site.id;
                        else {
                            App.common.getStructrues(creep.room.name);
                            App.fsm.changeState(creep, State.Upgrade);
                        }
                    }
                }
                break;
            }
            case Role.HelpBuilder: {
                if (creep.store.getUsedCapacity() == 0) {
                    App.fsm.changeState(creep, State.Withdraw);
                    return;
                }
                if (!creep.memory.constructionId) {
                    let site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                    if (site) creep.memory.constructionId = site.id;
                    else {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        if (creep.room.controller.level >= 2 && creep.room.controller.progress >= 1000 && !creep.memory.ruinState) {
                            let target = Game.flags[`${creep.memory.roomFrom}_helpBuild`];
                            global.cc[creep.memory.roomFrom].helpBuilder = 0;
                            if (target) target.remove();
                        }
                    }
                } else {
                    let site = Game.getObjectById(creep.memory.constructionId);
                    if (site) {
                        if (creep.build(site) == ERR_NOT_IN_RANGE) creep.customMove(site.pos);
                        if (creep.memory.path) creep.customMove(site.pos);
                    } else {
                        creep.memory.constructionId = null;
                        let site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                        if (site) creep.memory.constructionId = site.id;
                        else {
                            let ruin = creep.pos.findClosestByPath(FIND_RUINS, {
                                filter: r => r.store.energy
                            })
                            if (ruin) creep.memory.ruinId = ruin.id;
                            else {
                                if (creep.room.controller.level >= 4 && creep.room.controller.progress >= 1000 && !creep.memory.ruinState) {
                                    let target = Game.flags[`${creep.memory.roomFrom}_helpBuild`];
                                    global.cc[creep.memory.roomFrom].helpBuilder = 0;
                                    if (target) target.remove();
                                }
                            }
                            App.common.getStructrues(creep.room.name);
                            App.fsm.changeState(creep, State.TransferToSpawn);
                        }
                    }
                }
                break;
            }
            case Role.Repairer: {
                if (creep.store.getUsedCapacity() == 0) {
                    App.fsm.changeState(creep, State.Withdraw);
                }
                if (!creep.memory.constructionId) {
                    let site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                        filter: e => e.structureType != STRUCTURE_RAMPART
                    });
                    if (site) creep.memory.constructionId = site.id;
                    else App.fsm.changeState(creep, State.Repair);
                } else {
                    let site = Game.getObjectById(creep.memory.constructionId);
                    if (site) {
                        if (creep.build(site) == ERR_NOT_IN_RANGE) creep.customMove(site.pos);
                        if (creep.memory.path) creep.customMove(site.pos);
                    } else {
                        creep.memory.constructionId = null;
                        let site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                            filter: e => e.structureType != STRUCTURE_RAMPART
                        });
                        if (site) creep.memory.constructionId = site.id;
                        else {
                            App.common.getStructrues(creep.room.name);
                            App.fsm.changeState(creep, State.Repair);
                        }
                    }
                }
            }
        }
    }
}