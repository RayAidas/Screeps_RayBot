import Singleton from "@/Singleton";

export default class PowerSpawn extends Singleton {
    public run(roomName: string) {
        if (Game.cpu.getUsed() >= 18) return;
        let room = Game.rooms[roomName];
        let powerSpawn = Game.getObjectById(room.memory.powerSpawnId);
        if (!powerSpawn) return;
        if (powerSpawn.store.energy >= 50 && powerSpawn.store.power > 0) powerSpawn.processPower();
    }
}