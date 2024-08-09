import App from "@/App";
import { Role } from "@/common/Constant";
import { GenNonDuplicateID } from "@/common/utils";
import PC from "@/PC/PC";
import Singleton from "@/Singleton";

export default class EnergySource extends Singleton {
    public run(roomName: string) {
        let room = Game.rooms[roomName];
        if (room.memory.sources) {
            for (let i = 0; i < Object.keys(room.memory.sources).length; i++) {
                let sourceMem = room.memory.sources[Object.keys(room.memory.sources)[i]];
                if (Game.getObjectById(sourceMem.link)) continue;
                if (sourceMem.linkPos) {
                    let { x, y, roomName } = sourceMem.linkPos;
                    let structures = room.lookForAt(LOOK_STRUCTURES, new RoomPosition(x, y, roomName));
                    if (structures.length && structures[0] instanceof StructureLink) {
                        sourceMem.link = structures[0].id as Id<StructureLink>;
                        continue;
                    }
                }
                if (i == 0 && sourceMem.linkPos) {
                    if (room.controller.level >= 5) {
                        if (!room.lookForAt(LOOK_CONSTRUCTION_SITES, sourceMem.linkPos).length) room.createConstructionSite(sourceMem.linkPos.x, sourceMem.linkPos.y, STRUCTURE_LINK);
                    }
                } else if (i == 1 && sourceMem.linkPos) {
                    if (room.controller.level >= 6) {
                        if (!room.lookForAt(LOOK_CONSTRUCTION_SITES, sourceMem.linkPos).length) room.createConstructionSite(sourceMem.linkPos.x, sourceMem.linkPos.y, STRUCTURE_LINK);
                    }
                }
            }
            for (let id in room.memory.sources) {
                let sourceMem = room.memory.sources[id];
                let source = Game.getObjectById(id as Id<Source>);

                if (room.controller.isPowerEnabled &&
                    (!source.effects || !source.effects.length || source.effects[0].ticksRemaining < 10))
                    PC.addPCTask(roomName, PC.PCTaskName.operate_source, 0, id);

                if (!Game.getObjectById(sourceMem.container)) sourceMem.container = null;
                if (!Game.getObjectById(sourceMem.link)) sourceMem.link = null;
                if (!sourceMem.harvestPos) sourceMem.harvestPos = App.common.getPosNear(source.pos);
                else if (!sourceMem.linkPos) sourceMem.linkPos = App.common.getPosNear(sourceMem.harvestPos);
                if (room.memory.spawns?.length && !sourceMem.harvester) {
                    let creepName = GenNonDuplicateID();
                    App.spawn.run(source.room.name, Role.Harvester, creepName);
                    sourceMem.harvester = creepName;
                    return
                }

                let harvester = Game.creeps[sourceMem.harvester];
                if (!harvester) {
                    App.spawn.run(source.room.name, Role.Harvester, sourceMem.harvester);
                    return;
                }

                if (!harvester.memory.targetSource) harvester.memory.targetSource = id as Id<Source>;

                let link = Game.getObjectById(sourceMem.link);
                let centerLink = Game.getObjectById(room.memory.centerLinkId);
                let controLink = Game.getObjectById(room.memory.controllerLinkId);

                if (link && link.store.energy > 400) {
                    if (controLink && controLink.store.energy < 400 && !link.cooldown) link.transferEnergy(controLink);
                    else if (centerLink && centerLink.store.energy < 400 && !link.cooldown) link.transferEnergy(centerLink);
                }

                // if (link && centerLink) continue;
                
                if (!sourceMem.carrier) {
                    let creepName = GenNonDuplicateID();
                    App.spawn.run(source.room.name, Role.Carrier, creepName);
                    sourceMem.carrier = creepName;
                    return;
                }

                let carrier = Game.creeps[sourceMem.carrier];
                if (!carrier) {
                    App.spawn.run(source.room.name, Role.Carrier, sourceMem.carrier);
                    return;
                }

                if (!carrier.memory.targetContainer && sourceMem.container) carrier.memory.targetContainer = sourceMem.container;

                if (Game.time % 100 == 0 && !room.storage) {
                    let { x, y, roomName } = sourceMem.harvestPos;
                    let resource = room.lookForAt(LOOK_RESOURCES, new RoomPosition(x, y, roomName))[0]
                    if (resource && resource.amount > 500) App.spawn.run(roomName, Role.Builder);
                }
                if (Game.time % 200 == 0) {
                    let { x, y, roomName } = sourceMem.harvestPos;
                    let resource = room.lookForAt(LOOK_RESOURCES, new RoomPosition(x, y, roomName))[0]
                    if (resource && resource.amount > 500) sourceMem.carrier = null;
                }
            }
        }
    }
}