import App from "@/App";
import { Role } from "@/common/Constant";
import { GenNonDuplicateID } from "@/common/utils";
import { Boost } from "@/indexManager";
import Singleton from "@/Singleton";

export default class Mineral extends Singleton {
    public run(roomName: string) {
        let room = Game.rooms[roomName];
        let mineralMem = room.memory.mineral;

        if (!mineralMem) return;

        let mineral = Game.getObjectById(mineralMem.id);
        if (!mineralMem.harvestPos) {
            mineralMem.harvestPos = App.common.getPosNear(mineral.pos);
            return;
        }

        if (!Game.getObjectById(mineralMem.container)) {
            let { x, y, roomName } = mineralMem.harvestPos;
            let container = room.lookForAt(LOOK_STRUCTURES, new RoomPosition(x, y, roomName)).filter(e => e.structureType == STRUCTURE_CONTAINER)[0];
            if (container) mineralMem.container = container.id as Id<StructureContainer>;
            else {
                if (room.controller.level >= 5) {
                    let sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, new RoomPosition(x, y, roomName));
                    if (!sites.length) room.createConstructionSite(x, y, STRUCTURE_CONTAINER);
                }
            }
            return;
        }

        if (!mineralMem.extractor) return;
        if (!mineral.mineralAmount) return;
        if (room.storage && room.storage.store[mineralMem.type] > 300000) return;

        if (!mineralMem.harvester) {
            let creepName = GenNonDuplicateID();
            App.spawn.run(mineral.room.name, Role.Harvester, creepName);
            mineralMem.harvester = creepName;
            return
        }

        let harvester = Game.creeps[mineralMem.harvester];
        if (!harvester) {
            App.spawn.run(mineral.room.name, Role.Harvester, mineralMem.harvester);
            return;
        }

        if (global.allRes["UHO2"] >= 10000) {
            Boost.SetBoostType(harvester.name, [{
                type: "UHO2",
                num: Game.creeps[harvester.name].getActiveBodyparts(WORK)
            }])
        }

        if (!harvester.memory.targetSource) harvester.memory.targetMineral = mineral.id;

        if (!mineralMem.carrier) {
            let creepName = GenNonDuplicateID();
            App.spawn.run(mineral.room.name, Role.Carrier, creepName);
            mineralMem.carrier = creepName;
            return;
        }

        let carrier = Game.creeps[mineralMem.carrier];
        if (!carrier) {
            App.spawn.run(mineral.room.name, Role.Carrier, mineralMem.carrier);
            return;
        }

        if (!carrier.memory.targetContainer && mineralMem.container) carrier.memory.targetContainer = mineralMem.container;
    }
}