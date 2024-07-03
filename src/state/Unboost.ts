import App from "@/App";
import Singleton from "@/Singleton";

export default class Unboost extends Singleton {
    public run(creep: Creep) {
        if (creep.room.controller.level < 8) creep.suicide();
        else {
            if (!creep.room.memory.unboostContainerPos) creep.suicide();
            else {
                let { x, y, roomName } = creep.room.memory.unboostContainerPos;
                if (!Game.getObjectById(creep.room.memory.unboostContainer)) {
                    let construcure = creep.room.lookForAt(LOOK_STRUCTURES, new RoomPosition(x, y, roomName)).filter(e => e.structureType == STRUCTURE_CONTAINER)
                    if (construcure.length) creep.room.memory.unboostContainer = construcure[0].id as Id<StructureContainer>;
                    else creep.suicide();
                } else {
                    creep.customMove(new RoomPosition(x, y, roomName), 0);
                    if (App.common.getDis(creep.pos, new RoomPosition(x, y, roomName)) == 0) this.unboost(creep);
                }
            }
        }
    }

    public unboost(creep: Creep) {
        let lab1 = Game.getObjectById(creep.room.memory.labs[1]);
        if (lab1.cooldown) {
            let lab2 = Game.getObjectById(creep.room.memory.labs[2]);
            if (lab2.cooldown) creep.suicide()
            else lab2.unboostCreep(creep);
        } else lab1.unboostCreep(creep);
        creep.suicide();
    }
}