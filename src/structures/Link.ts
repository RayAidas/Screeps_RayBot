import Singleton from "@/Singleton";

export default class Link extends Singleton {
    public run(roomName: string) {
        let room = Game.rooms[roomName];
        let centerLink = Game.getObjectById(room.memory.centerLinkId);
        let controllerLink = Game.getObjectById(room.memory.controllerLinkId);
        if (centerLink && controllerLink) {
            if (centerLink.store.energy >= 400 && controllerLink.store.energy < 500 && !centerLink.cooldown)
                centerLink.transferEnergy(controllerLink);
        }
    }
}