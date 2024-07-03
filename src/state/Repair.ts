import App from "@/App";
import Singleton from "@/Singleton";
import { State } from "@/fsm/state";

export default class Repair extends Singleton {
    public run(creep: Creep) {
        if (creep.ticksToLive < 70) {
            if (creep.store.getUsedCapacity() == 0) {
                App.fsm.changeState(creep, State.Unboost);
                return;
            } else {
                App.fsm.changeState(creep, State.TransferToStorage);
                return;
            }
        }
        if (creep.store.getUsedCapacity() == 0) {
            App.fsm.changeState(creep, State.Withdraw);
            creep.memory.constructionId = null;
            creep.memory.repairTarget = null;
            return;
        }
        if (creep.memory.constructionId) {
            let site = Game.getObjectById(creep.memory.constructionId);
            if (site) {
                if (creep.build(site) == ERR_NOT_IN_RANGE) {
                    creep.customMove(site.pos, 3);
                }
            } else creep.memory.constructionId = null;
            return;
        }
        if (creep.memory.repairTarget) {
            let rampart = Game.getObjectById(creep.memory.repairTarget);
            if (rampart) {
                if(rampart.hits==300000000) {
                    creep.memory.repairTarget = null;
                    return;
                }
                if (creep.repair(rampart) == ERR_NOT_IN_RANGE) {
                    creep.customMove(rampart.pos, 3);
                }
            } else creep.memory.repairTarget = null;
            return;
        }
        let target = this._getStructurce(creep);
        if (target instanceof ConstructionSite) {
            creep.memory.constructionId = target.id;
        } else if (target instanceof StructureRampart) {
            creep.memory.repairTarget = target.id;
        }
    }

    private _getStructurce(creep: Creep): ConstructionSite | StructureRampart {
        let poses = creep.room.memory.customRampartSites;
        for (let i = 0; i < poses.length; i++) {
            let { x, y, roomName } = poses[i];
            let ramparts = creep.room.lookForAt(LOOK_STRUCTURES, new RoomPosition(x, y, roomName)).filter(e => e.structureType == STRUCTURE_RAMPART);
            if (ramparts.length) {
                if (ramparts[0].structureType == STRUCTURE_RAMPART &&
                    ramparts[0].hits < creep.room.memory.wallHits) return ramparts[0] as StructureRampart;
            } else {
                let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, new RoomPosition(x, y, roomName));
                if (sites.length) return sites[0];
                creep.room.createConstructionSite(x, y, STRUCTURE_RAMPART);
                return null;
            }
        }
        creep.room.memory.wallHits += 20000;
        if(creep.room.memory.wallHits >= 300000000) creep.room.memory.lastRepairTick = Game.time;
        return null;
    }

}