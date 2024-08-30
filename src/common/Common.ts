import App from "@/App";
import Singleton from "@/Singleton";

export default class Common extends Singleton {
    public getStructrues(roomName: string) {
        this.findSpawnsByRoom(roomName);
        this.findTowersByRoom(roomName);
        this.findCenterLinkByRoom(roomName);
        this.findExtractor(roomName);
        this.findFactory(roomName);
        this.findLabs(roomName);
        this.findPowerSpawn(roomName);
        this.findNuker(roomName);
        this.findObserver(roomName);
    }
    public getPosNear(pos: RoomPosition, sourceState: boolean = false) {
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (x == 1 || y == 1 || x == 48 || y == 48) continue;
                if (x == pos.x && y == pos.y) continue;
                const terrain = new Room.Terrain(pos.roomName);
                if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    let structures = Game.rooms[pos.roomName].lookForAt(LOOK_STRUCTURES, x, y).filter(s =>
                        s.structureType != STRUCTURE_ROAD &&
                        s.structureType != STRUCTURE_CONTAINER
                    );
                    if (!sourceState) {
                        let creeps = Game.rooms[pos.roomName].lookForAt(LOOK_CREEPS, x, y);
                        if (!structures.length && !creeps.length) return new RoomPosition(x, y, pos.roomName);
                    } else {
                        if (!structures.length) return new RoomPosition(x, y, pos.roomName);
                    }
                }
            }
        }
    }

    public setUpgradePos(roomName: string, creepName: string) {
        let room = Game.rooms[roomName];
        let controlPos = room.controller.pos;
        for (let i = 1; i <= 3; i++) {
            for (let x = controlPos.x - i; x <= controlPos.x + i; x++) {
                for (let y = controlPos.y - i; y <= controlPos.y + i; y++) {
                    if (x <= 0 || y <= 0 || x >= 49 || y >= 49) continue;
                    const terrain = new Room.Terrain(roomName);
                    if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                        let structures = room.lookForAt(LOOK_STRUCTURES, x, y).filter(s =>
                            s.structureType != STRUCTURE_ROAD
                        );
                        if (!structures.length) {
                            let creeps = room.lookForAt(LOOK_CREEPS, x, y);
                            if (!creeps.length) {
                                Game.creeps[creepName].memory.upgradePos = new RoomPosition(x, y, roomName);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    public getControllerLink(roomName: string) {
        let room = Game.rooms[roomName];
        if (Game.getObjectById(room.memory.controllerLinkId)) return;
        if (room.memory.controllerLinkPos) {
            if (room.controller.level < 7) return;
            if (room.memory.controllerLinkPos) {
                let { x, y, roomName } = room.memory.controllerLinkPos;
                let link = room.lookForAt(LOOK_STRUCTURES, new RoomPosition(x, y, roomName)).filter(e => e.structureType == STRUCTURE_LINK)[0];
                if (link) {
                    room.memory.controllerLinkId = link.id as Id<StructureLink>;
                    return;
                }
                let site = room.lookForAt(LOOK_CONSTRUCTION_SITES, new RoomPosition(x, y, roomName))[0];
                if (!site) room.createConstructionSite(x, y, STRUCTURE_LINK);
            }
        } else {
            let pos = room.controller.pos;
            let res = {};
            const terrain = new Room.Terrain(roomName);
            let dis2Arr: number[][] = [];
            for (let x = pos.x - 2; x <= pos.x + 2; x++) {
                for (let y = pos.y - 2; y < pos.y + 2; y++) {
                    if (Math.abs(x + y - pos.x - y) < 2) continue;
                    dis2Arr.push([x, y]);
                }
            }
            for (let i = 0; i < dis2Arr.length; i++) {
                let [targetX, targetY] = dis2Arr[i]
                if (!res[`${targetX}-${targetY}`]) res[`${targetX}-${targetY}`] = 0;

                for (let x = targetX - 1; x <= targetX + 1; x++) {
                    for (let y = targetY - 1; y <= targetY + 1; y++) {
                        if (x == targetX && y == targetY) continue;
                        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                            let structures = Game.rooms[pos.roomName].lookForAt(LOOK_STRUCTURES, x, y).filter(s =>
                                s.structureType != STRUCTURE_ROAD &&
                                s.structureType != STRUCTURE_CONTAINER
                            );
                            if (!structures.length) res[`${targetX}-${targetY}`]++;
                        }
                    }
                }
            }
            let keyArr = Object.keys(res).sort((a, b) => res[b] - res[a]);
            let arr = keyArr[0].split('-');
            room.memory.controllerLinkPos = new RoomPosition(+arr[0], +arr[1], roomName);
        }
    }

    public getcontrollerContainerId(roomName: string): void {
        let room = Game.rooms[roomName];
        let controllerContainers: StructureContainer[] = [];
        controllerContainers = room.controller.pos.findInRange(FIND_STRUCTURES, 5, {
            filter: (stru) => {
                return stru.structureType == 'container'
            }
        }) as StructureContainer[];
        if (controllerContainers.length > 0) {
            room.memory.controllerContainerId ??= [];
            let controllerContainerIdList = [];
            for (let container of controllerContainers) {
                controllerContainerIdList.push(container.id);
            }
            room.memory.controllerContainerId = controllerContainerIdList;
        } else {
            room.memory.controllerContainerId = [];
        }
    }

    public isPosEqual(pos1: RoomPosition, pos2: RoomPosition) {
        if (pos1.x == pos2.x && pos1.y == pos2.y && pos1.roomName == pos2.roomName) return true;
        else return false;
    }

    public findSpawnsByRoom(roomName: string): string[] {
        let room = Game.rooms[roomName];
        let spawns: string[] = [];
        room.find(FIND_STRUCTURES, {
            filter: structure => {
                if (structure.structureType == STRUCTURE_SPAWN) {
                    spawns.push(structure.name);
                }
            }
        })
        room.memory.spawns = spawns;
        return spawns;
    }

    public findTowersByRoom(roomName: string): string[] {
        let room = Game.rooms[roomName];
        let towers: Id<StructureTower>[] = [];
        room.find(FIND_STRUCTURES, {
            filter: structure => {
                if (structure.structureType == STRUCTURE_TOWER)
                    towers.push(structure.id);
            }
        });
        room.memory.towers = towers;
        return towers;
    }

    public findCenterLinkByRoom(roomName: string) {
        if (Game.getObjectById(Game.rooms[roomName].memory.centerLinkId)) return;
        if (!Memory.RoomControlData) return;
        let structMap = Memory.RoomControlData[roomName]?.structMap;
        if (!structMap) return;
        let linkPos: RoomPosition = null;
        structMap.filter(e => {
            let strArr = e.split('/');
            if (strArr[2] == STRUCTURE_LINK && strArr[3] == '5') {
                linkPos = new RoomPosition(+strArr[0], +strArr[1], roomName);
            }
        })
        if (linkPos) {
            let centerLink = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, linkPos).filter(e => e.structureType == STRUCTURE_LINK)[0];
            if (centerLink) Game.rooms[roomName].memory.centerLinkId = centerLink.id as Id<StructureLink>;
        }
    }

    public findExtractor(roomName: string) {
        if (Game.getObjectById(Game.rooms[roomName].memory.mineral.extractor)) return;
        let room = Game.rooms[roomName];
        if (!room.memory.mineral?.extractor) {
            room.find(FIND_STRUCTURES, {
                filter: structure => {
                    if (structure.structureType == STRUCTURE_EXTRACTOR)
                        room.memory.mineral.extractor = structure.id;
                }
            })
        }
    }

    public findFactory(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.factory) room.memory.factory = {};
        if (Game.getObjectById(room.memory.factory.id)) return;
        let factory: Id<StructureFactory> = null;
        room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_FACTORY)
                    factory = structure.id;
            }
        })
        room.memory.factory.id = factory;
    }

    public findLabs(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.labs) room.memory.labs = {};
        // delete room.memory.labs;
        // return;
        if (room.controller.level < 8) {
            if (room.controller.level >= 6 && !room.memory.labs[0]) {
                let labs: StructureLab[] = room.find(FIND_STRUCTURES, {
                    filter: struct => struct.structureType == STRUCTURE_LAB
                })
                room.memory.labs.num = labs.length;
                if (labs.length) room.memory.labs[0] = labs[0].id;
            }
            return;
        }
        let labs: StructureLab[] = room.find(FIND_STRUCTURES, {
            filter: struct => struct.structureType == STRUCTURE_LAB
        })
        room.memory.labs.num = labs.length;
        let labsPos = labs.map(e => [e.pos.x, e.pos.y]);
        if (labsPos.length < 10) return;
        let arrX = labsPos.map(e => e[0]).sort((a, b) => a - b);
        let arrY = labsPos.map(e => e[1]).sort((a, b) => a - b);
        let minX = arrX[0];
        let minY = arrY[0];
        let maxX = minX + 3;
        let maxY = minY + 3;
        let newArr = labsPos.map(e => `${e[0]}-${e[1]}`)
        if (newArr.includes(`${minX + 1}-${minY}`) && newArr.includes(`${minX}-${minY + 1}`)) {
            let dis1 = this.getDis(new RoomPosition(maxX, minY, roomName), room.terminal.pos);
            let dis2 = this.getDis(new RoomPosition(minX, maxY, roomName), room.terminal.pos);
            if (dis1 <= dis2) {
                // console.log(roomName,'↙')
                let index = 4;
                for (let i = 0; i < labs.length; i++) {
                    let lab = labs[i];
                    let state = false;
                    for (let j = 0; j < 4; j++) {
                        if (lab.pos.x == maxX - j && lab.pos.y == minY + j) {
                            state = true;
                            room.memory.labs[j] = lab.id;
                            break;
                        }
                    }
                    if (!state) room.memory.labs[index++] = lab.id;
                }
            } else {
                // console.log(roomName,'↗')
                let index = 4;
                for (let i = 0; i < labs.length; i++) {
                    let lab = labs[i];
                    let state = false;
                    for (let j = 0; j < 4; j++) {
                        if (lab.pos.x == minX + j && lab.pos.y == maxY - j) {
                            state = true;
                            room.memory.labs[j] = lab.id;
                            break;
                        }
                    }
                    if (!state) room.memory.labs[index++] = lab.id;
                }
            }
        }
        else {
            let dis1 = this.getDis(new RoomPosition(minX, minY, roomName), room.terminal.pos);
            let dis2 = this.getDis(new RoomPosition(maxX, maxY, roomName), room.terminal.pos);
            if (dis1 <= dis2) {
                // console.log(roomName,'↘')
                let index = 4;
                for (let i = 0; i < labs.length; i++) {
                    let lab = labs[i];
                    let state = false;
                    for (let j = 0; j < 4; j++) {
                        if (lab.pos.x == minX + j && lab.pos.y == minY + j) {
                            state = true;
                            room.memory.labs[j] = lab.id;
                            break;
                        }
                    }
                    if (!state) room.memory.labs[index++] = lab.id;
                }
            }
            else {
                // console.log(roomName,'↖')
                let index = 4;
                for (let i = 0; i < labs.length; i++) {
                    let lab = labs[i];
                    let state = false;
                    for (let j = 0; j < 4; j++) {
                        if (lab.pos.x == maxX - j && lab.pos.y == maxY - j) {
                            state = true;
                            room.memory.labs[j] = lab.id;
                            break;
                        }
                    }
                    if (!state) room.memory.labs[index++] = lab.id;
                }
            }
        }
        if (!room.memory.unboostContainerPos && room.memory.labs[1] && room.memory.labs[2]) {
            let lab1 = Game.getObjectById(room.memory.labs[1]);
            let lab2 = Game.getObjectById(room.memory.labs[2]);
            room.memory.unboostContainerPos = new RoomPosition(lab1.pos.x, lab2.pos.y, roomName);
        }
    }

    public setTempLabs(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.labs) room.memory.labs = {};
        let flag0 = Game.flags['lab0'];
        let flag1 = Game.flags['lab1'];
        let flag2 = Game.flags['lab2'];
        let labs: StructureLab[] = room.find(FIND_STRUCTURES, {
            filter: struct => struct.structureType == STRUCTURE_LAB
        })
        room.memory.labs.num = labs.length;
        let index = 3;
        labs.forEach(e => {
            if (this.isPosEqual(flag0.pos, e.pos)) room.memory.labs[0] = e.id;
            else if (this.isPosEqual(flag1.pos, e.pos)) room.memory.labs[1] = e.id;
            else if (this.isPosEqual(flag2.pos, e.pos)) room.memory.labs[2] = e.id;
            else room.memory.labs[index++] = e.id;
        })
        flag0.remove();
        flag1.remove();
        flag2.remove();
    }

    public findPowerSpawn(roomName: string) {
        let room = Game.rooms[roomName];
        if (Game.getObjectById(room.memory.powerSpawnId)) return;
        let powerSpawn: Id<StructurePowerSpawn> = null;
        room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_POWER_SPAWN)
                    powerSpawn = structure.id;
            }
        })
        room.memory.powerSpawnId = powerSpawn;
    }

    public findNuker(roomName: string) {
        let room = Game.rooms[roomName];
        if (Game.getObjectById(room.memory.nuker)) return;
        let nuker: Id<StructureNuker> = null;
        room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_NUKER)
                    nuker = structure.id;
            }
        })
        room.memory.nuker = nuker;
    }

    public findObserver(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.observer) room.memory.observer = {
            targets: [],
            index: 0,
        };
        if (Game.getObjectById(room.memory.observer.id)) return;
        let observerId: Id<StructureObserver> = null;
        room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_OBSERVER)
                    observerId = structure.id;
            }
        })
        room.memory.observer.id = observerId;
    }

    public getSources(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.sources) {
            room.memory.sources = {};
            room.find(FIND_SOURCES).forEach(e => {
                room.memory.sources[e.id] = {
                    harvester: null,
                    link: null,
                    container: null,
                    carrier: null
                }
            })
        }
    }

    public getMineral(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.mineral) {
            room.memory.mineral = {};
            room.find(FIND_MINERALS).forEach(e => {
                room.memory.mineral = {
                    id: e.id,
                    harvester: null,
                    type: e.mineralType,
                    container: null,
                    carrier: null,
                    harvestPos: null,
                    extractor: null,
                }
            })
        }
    }

    /**
     * 获取房间内剩余 mineral 数量
     * @param room 
     * @returns 
     */
    public getMineralAmount(room: Room): number {
        let mineral: Mineral = null;
        if (!room.memory.mineral) room.memory.mineral = {}
        if (room.memory.mineral.id) mineral = Game.getObjectById(room.memory.mineral.id);
        else {
            mineral = room.find(FIND_MINERALS)[0];
            room.memory.mineral.id = mineral.id;
        }
        return mineral.mineralAmount || 0;
    }

    public setTime(creep: Creep) {
        if (!creep.memory.time) {
            let time = 1500 - creep.ticksToLive;
            if (time < 50) creep.memory.time = time;
            else creep.memory.time = 0;
        }
    }

    public getDis(pos1: RoomPosition, pos2: RoomPosition): number {
        if (pos1.roomName != pos2.roomName) return;
        return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
    }

    /**
     * 从目标建筑中获取资源
     * @param creep 
     * @param target 
     */
    public getResourceFromTargetStructure(creep: Creep | PowerCreep, target: AnyStructure | Ruin | Tombstone, resourceType: ResourceConstant = RESOURCE_ENERGY, amount?: number) {
        if (creep.withdraw(target, resourceType, amount) == ERR_NOT_IN_RANGE) {
            creep.customMove(target.pos);
        }
    }

    /**
     * 寻找目标建筑
     * @param creep 
     * @param target 
     */
    public transferToTargetStructure(creep: Creep | PowerCreep, target: AnyStructure, type?: ResourceConstant, amount?: number) {
        let resourceType = Object.keys(creep.store)[0] as ResourceConstant;
        if (amount) {
            if (creep.transfer(target, type ? type : resourceType, amount) == ERR_NOT_IN_RANGE) {
                creep.customMove(target.pos);
            }
        } else {
            if (creep.transfer(target, type ? type : resourceType) == ERR_NOT_IN_RANGE) {
                creep.customMove(target.pos);
            }
        }
    }

    /**
     * 寻找Extension,Spawn
     * @param creep 
     */
    public getEmptySpawnAndExt(creep: Creep) {
        if (creep.memory.transferTargetId) {
            let target = Game.getObjectById(creep.memory.transferTargetId) as StructureSpawn | StructureExtension;
            if (!target) {
                creep.memory.transferTargetId = null;
                return;
            }
            if (target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return target;
            else {
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0

                });
                if (target) {
                    creep.memory.transferTargetId = target.id;
                    return target;
                } else return null;
            }
        } else {
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            if (target) {
                creep.memory.transferTargetId = target.id;
                return target;
            } else return null;
        }
    }

    /**
     * findClosestTower
     * @param creep 
     */
    public findTower(creep: Creep) {
        let towers = creep.room.memory.towers || [];
        let target: StructureTower = null;
        let freeCapacity: StructureTower[] = [];
        for (let i = 0; i < towers.length; i++) {
            let tower = Game.getObjectById(towers[i]) as StructureTower;
            if (tower && tower.store.energy < 800) freeCapacity.push(tower);
        }
        target = freeCapacity.sort((a, b) => {
            return (b.store.getFreeCapacity(RESOURCE_ENERGY) - a.store.getFreeCapacity(RESOURCE_ENERGY))
        }
        )[0]
        return target
    }

    public findPos(pos: RoomPosition) {
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (x == pos.x && y == pos.y) continue;
                const terrain = new Room.Terrain(pos.roomName);
                if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    let structures = Game.rooms[pos.roomName].lookForAt(LOOK_STRUCTURES, x, y).filter(s =>
                        s.structureType != STRUCTURE_RAMPART &&
                        s.structureType != STRUCTURE_ROAD &&
                        s.structureType != STRUCTURE_CONTAINER
                    );
                    let creeps = Game.rooms[pos.roomName].lookForAt(LOOK_CREEPS, x, y);
                    if (!structures.length && !creeps.length) return new RoomPosition(x, y, pos.roomName);
                }
            }
        }
    }

    public getRoomResource(resource: ResourceConstant, roomName: string, facState: boolean = false): number {
        let storageNum = Game.rooms[roomName].storage?.store[resource] || 0;
        let terminalNum = Game.rooms[roomName].terminal?.store[resource] || 0;
        let factoryNum = facState ? (Game.getObjectById(Game.rooms[roomName].memory.factory.id)?.store[resource] || 0) : 0;
        let amount = storageNum + terminalNum + factoryNum;
        return amount;
    }

    public createNew(creep: Creep, time: number) {
        if (!creep.memory.isCreate && creep.ticksToLive <= time) {
            creep.memory.isCreate = true;
            App.spawn.run(creep.room.name, creep.memory.role);
        }
    }
}