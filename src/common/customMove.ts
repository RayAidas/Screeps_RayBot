import { State } from "@/fsm/state";
import { Role } from "./Constant";

export const customMove = function (target: RoomPosition, range: number = 1, ignoreCreep: boolean = true, flee: boolean = false, gf: boolean = false) {
	let creep: Creep = this;
	if (creep.spawning) return;

	if (!creep.memory.path || !creep.memory.path.length) {
		pathFinder(creep, target, range, ignoreCreep, flee, gf);
	} else {
		if (creep.pos.x == creep.memory.path[0].x && creep.pos.y == creep.memory.path[0].y) {
			creep.memory.path.shift();
		}
		if (creep.memory.path[0]?.x === 0 || creep.memory.path[0]?.y === 0 ||
			creep.memory.path[0]?.x === 49 || creep.memory.path[0]?.y === 49) creep.memory.path.shift();
	}

	if (creep.fatigue) {
		if (creep.memory.wait) creep.memory.wait++;
		return;
	}
	creep.memory.wait = +creep.memory.wait;
	if (creep.memory.wait < 0) creep.memory.wait = 0;
	if (+creep.memory.wait) {
		creep.memory.wait--;
		return;
	}

	let next = creep.memory.path[0];
	let curr = creep.pos;
	if (next) {
		if (Math.abs(curr.x - next.x) <= 1 && Math.abs(curr.y - next.y) <= 1) {
			let obstacles: Creep[] | PowerCreep[] = creep.room.lookForAt(LOOK_CREEPS, next.x, next.y);
			if (!obstacles.length) obstacles = creep.room.lookForAt(LOOK_POWER_CREEPS, next.x, next.y);
			if (obstacles.length) {
				let obstacle = obstacles[0];
				if (obstacle.owner.username !== creep.owner.username) {
					creep.memory.path = null;
					pathFinder(creep, target, range, false, flee, gf);
					return;
				}
				if (obstacle.memory.targetPos) {
					if (creep.memory.targetPos && obstacle.memory.path?.length) {
						creep.memory.path = null;
						pathFinder(creep, target, range, false)
						return;
					} else if (!obstacle.memory.path?.length) {
						moveStep(creep);
						let dir = obstacle.pos.getDirectionTo(curr.x, curr.y);
						obstacle.move(dir);
						return;
					}
				}

				if (obstacle.memory.role == Role.Harvester) {
					creep.memory.path = null;
					pathFinder(creep, target, range, false, flee, gf);
					return 0;
				}
				if (obstacle.memory.state == State.Harvest) {
					creep.memory.path = null;
					pathFinder(creep, target, range, false, flee, gf);
					return 0;
				}
				else if (creep.memory.moveTarget?.x == obstacle.memory.moveTarget?.x &&
					creep.memory.moveTarget?.y == obstacle.memory.moveTarget?.y &&
					creep.memory.state == obstacle.memory.state &&
					creep.memory.moveTarget?.roomName == obstacle.memory.moveTarget?.roomName) {
					if (Math.abs(target.x - obstacle.pos.x) <= 2 && Math.abs(target.y - obstacle.pos.y) <= 2) {
						obstacle.memory.path = null;
						obstacle.customMove(target, range, false);
						let dir = obstacle.pos.getDirectionTo(curr.x, curr.y);
						obstacle.move(dir);
					}
					else if (Math.abs(target.x - obstacle.pos.x) <= 3 && Math.abs(target.y - obstacle.pos.y) <= 3) {
						if (ignoreCreep) {
							obstacle.customMove(target, range, true);
						} else {
							obstacle.memory.path = null;
							obstacle.customMove(target, range, false);
						}
					}
					if (Math.max(Math.abs(target.x - creep.pos.x), Math.abs(target.y - creep.pos.y)) > 3 &&
						Math.max(Math.abs(target.x - obstacle.pos.x), Math.abs(target.y - obstacle.pos.y)) > 3) {
						creep.say('强制绕路');
						creep.memory.path = null;
						pathFinder(creep, target, range, false, flee, gf);
						if (gf) return;
						moveStep(creep);
						return;
					}
				} else {
					if (gf) return;
					let dir = obstacle.pos.getDirectionTo(curr.x, curr.y);
					obstacle.memory.wait = 1;
					obstacle.move(dir);
				}
			}
			if (gf) return;
			moveStep(creep);
		} else {
			creep.memory.path = null;
			return -1
		}
	}
}

const pathFinder = function (creep: Creep | PowerCreep, target: RoomPosition, range: number = 1, ignoreCreep: boolean = true, flee: boolean = false, gf: boolean = false) {
	let res = PathFinder.search(creep.pos, { pos: target, range: range }, {
		plainCost: 2,
		swampCost: 10,
		flee: flee,
		roomCallback: function (roomName) {
			if (Game.rooms[creep.memory.roomFrom]?.memory.ignoreRoom?.includes(roomName)) return false;
			let room = Game.rooms[roomName];
			// 在这个示例中，`room` 始终存在
			// 但是由于 PathFinder 支持跨多房间检索
			// 所以你要更加小心！
			if (!room) return;
			let costs = new PathFinder.CostMatrix;

			room.find(FIND_STRUCTURES).forEach(function (struct) {
				if (struct.structureType === STRUCTURE_ROAD) {
					// 相对于平原，寻路时将更倾向于道路
					costs.set(struct.pos.x, struct.pos.y, 1);
				}
				else if (struct.structureType == STRUCTURE_PORTAL) {
					costs.set(struct.pos.x, struct.pos.y, 11);
				}
				else if (struct.structureType !== STRUCTURE_CONTAINER &&
					(struct.structureType !== STRUCTURE_RAMPART ||
						!struct.my)) {
					// 不能穿过无法行走的建筑
					costs.set(struct.pos.x, struct.pos.y, 0xff);
				}
			});
			room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (site) {
				if (site.structureType == STRUCTURE_ROAD ||
					site.structureType == STRUCTURE_CONTAINER) {
					costs.set(site.pos.x, site.pos.y, 1);
				} else {
					costs.set(site.pos.x, site.pos.y, 0xff);
					if (gf) {
						costs.set(site.pos.x - 1, site.pos.y, 0xff);
						costs.set(site.pos.x, site.pos.y - 1, 0xff);
						costs.set(site.pos.x - 1, site.pos.y - 1, 0xff);
					}
				}
			})
			room.find(FIND_HOSTILE_CREEPS).forEach(function (creep) {
				costs.set(creep.pos.x, creep.pos.y, 0xff);
			})

			// 躲避房间中的 creep
			if (!ignoreCreep) {
				room.find(FIND_CREEPS).forEach(function (creep) {
					costs.set(creep.pos.x, creep.pos.y, 0xff);
				});
			}

			if (gf) {
				const terrain = new Room.Terrain(roomName);
				for (let x = 0; x < 50; x++) {
					for (let y = 0; y < 50; y++) {
						if (terrain.get(x, y) == TERRAIN_MASK_WALL) {
							if (x > 2) costs.set(x - 1, y, 0xff);
							if (y > 2) costs.set(x, y - 1, 0xff);
							if (x > 2 && y > 2) costs.set(x - 1, y - 1, 0xff);
						} else if (terrain.get(x, y) == TERRAIN_MASK_SWAMP) {
							if (x > 2) costs.set(x - 1, y, 9);
							if (y > 2) costs.set(x, y - 1, 9);
							if (x > 2 && y > 2) costs.set(x - 1, y - 1, 9);
						}
					}
				}
				room.find(FIND_STRUCTURES).forEach(function (struct) {
					if (struct.structureType !== STRUCTURE_CONTAINER &&
						struct.structureType !== STRUCTURE_ROAD &&
						struct.structureType !== STRUCTURE_RAMPART) {
						// 不能穿过无法行走的建筑
						costs.set(struct.pos.x, struct.pos.y, 0xff);
						costs.set(struct.pos.x - 1, struct.pos.y, 0xff);
						costs.set(struct.pos.x, struct.pos.y - 1, 0xff);
						costs.set(struct.pos.x - 1, struct.pos.y - 1, 0xff);
					}
				});
			}

			return costs;
		},
		maxOps: 5000,
		maxRooms: 16
	})
	creep.memory.path = res.path;
	creep.memory.moveTarget = target;
}

const moveStep = function (creep: Creep | PowerCreep) {
	if (creep.memory.path && creep.memory.path[0]) {
		let dir = creep.pos.getDirectionTo(creep.memory.path[0].x, creep.memory.path[0].y);
		if (creep.memory.path.length == 1) creep.memory.path = [];
		return creep.move(dir);
	} else return -1;
}