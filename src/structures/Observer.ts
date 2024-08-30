import App from "@/App";
import Singleton from "@/Singleton";
import { Role } from "@/common/Constant";

export default class Observer extends Singleton {
    public run(roomName: string) {
        let room = Game.rooms[roomName];
        let observer: StructureObserver = Game.getObjectById(room.memory.observer.id);
        let targets = room.memory.observer.targets;
        if (targets.length) return;
        for (let i = 0; i < targets.length; i++) {
            let target = targets[i]
            let name = `Depo_${roomName}_${target}`;
            if (Game.flags[name]) {
                if (!Game.creeps[name]) {
                    App.spawn.run(roomName, Role.DepositHarvester, name)
                }
            }
        }

        let index = room.memory.observer.index;
        let targetRoom = targets[index];
        let num = targets.length;
        if (Game.time % (room.memory.observer.interval || (room.memory.index + 1) * 10 + 1) == 0) {
            observer.observeRoom(targetRoom);
        }

        if (Game.time % (room.memory.observer.interval || (room.memory.index + 1) * 10 + 1) == 1) {
            if (Game.rooms[targetRoom]) {
                // 判断新手墙
                let wall = Game.rooms[targetRoom].find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_WALL
                });
                if (!wall.length) {
                    let DN = `Depo_${roomName}_${targetRoom}`;
                    if (!Game.flags[DN]) {
                        if (!Game.creeps[DN]) {
                            let deposits = Game.rooms[targetRoom].find(FIND_DEPOSITS, {
                                filter: (deposit) => deposit.lastCooldown <= 60
                            })
                            if (deposits.length > 0) {
                                Game.rooms[targetRoom].createFlag(deposits[0].pos, DN);
                                App.spawn.run(roomName, Role.DepositHarvester, DN);
                            }
                        }
                    }
                }

                if (room.memory.observer.index == num - 1) room.memory.observer.index = 0;
                else room.memory.observer.index++;
            }
        }
    }
}