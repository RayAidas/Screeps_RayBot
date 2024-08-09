import App from "@/App";
import { GroupState as FightState, Role } from "@/common/Constant";
import { State } from "@/fsm/state";
import { Boost } from "@/indexManager";
import Singleton from "@/Singleton";

const bodys = {
	'B-TRA-0': { [RANGED_ATTACK]: 40, [MOVE]: 10 },
	'B-TRA-1': { [TOUGH]: 2, [RANGED_ATTACK]: 34, [MOVE]: 10, [HEAL]: 4 },
	'B-TRA-2': { [TOUGH]: 4, [RANGED_ATTACK]: 28, [MOVE]: 10, [HEAL]: 8 },
	'B-TRA-3': { [TOUGH]: 6, [RANGED_ATTACK]: 22, [MOVE]: 10, [HEAL]: 12 },
	'B-TRA-4': { [TOUGH]: 8, [RANGED_ATTACK]: 17, [MOVE]: 10, [HEAL]: 15 },
	'B-TRA-5': { [TOUGH]: 9, [RANGED_ATTACK]: 12, [MOVE]: 10, [HEAL]: 19 },
	'B-TRA-6': { [TOUGH]: 11, [RANGED_ATTACK]: 6, [MOVE]: 10, [HEAL]: 23 },
	'B-TRA-1-1': { [TOUGH]: 2, [RANGED_ATTACK]: 10, [MOVE]: 4, [HEAL]: 4 },
	'B-TRA-2-1': { [TOUGH]: 4, [RANGED_ATTACK]: 8, [MOVE]: 5, [HEAL]: 8 },
	'B-A': { [ATTACK]: 40, [MOVE]: 10 },
	'B-W': { [WORK]: 40, [MOVE]: 10 },
	'RA': { [RANGED_ATTACK]: 10, [MOVE]: 10 },
	'W': { [WORK]: 25, [MOVE]: 25 },
	'A': { [ATTACK]: 10, [MOVE]: 10 },
	'C': { [CLAIM]: 10, [MOVE]: 10 },
	'R': { [CLAIM]: 4, [MOVE]: 4 },
	"TEST": { [ATTACK]: 1, [MOVE]: 1 },
	"B-TEST": { [ATTACK]: 1, [MOVE]: 1 },
}

const BoostType: {
	[body in BodyPartConstant]?: MineralBoostConstant
} = {
	[WORK]: "XZH2O",
	[HEAL]: "XLHO2",
	[MOVE]: "XZHO2",
	[TOUGH]: "XGHO2",
	[ATTACK]: "XUH2O",
	[RANGED_ATTACK]: "XKHO2",
}

export default class Solitary extends Singleton {
	public run(id: number) {
		let s = Memory.S[id];
		let creep: Creep = Game.creeps[`S_${s.from}_${id}`];

		this.spawn(Number(id), s, creep);
		this.boost(Number(id), s, creep);
		this.move(Number(id), s, creep);
	}

	/**
	 * 
	 * @param id number
	 * @param from 出生房间
	 * @param targetRoom 目标房间
	 * @param type body
	 * @param sustained 持续的
	 * @param nums 波次
	 * @param targetStructure 目标建筑
	 * @param interval 间隔时间
	 */
	public create(id: number, from: string, targetRoom: string, type: string, sustained: boolean = false, nums: number = 1, targetStructure: StructureConstant = null, interval?: number) {
		if (!Memory.S) Memory.S = {}
		if (Memory.S[id]) console.log(`队伍${id}已存在!!!`);
		else {
			Memory.S[id] = {
				state: FightState.idle,
				from: from,
				type: type,
				targetRoom: targetRoom,
				sustained: sustained,
				nums: nums,
				targetStructure: targetStructure,
				time: Game.time,
				interval: interval
			}
		}
	}

	public spawn(id: number, s: {
		state: string;
		from: string;
		type: string;
		targetRoom: string;
		sustained: boolean;
		nums?: number;
		targetStructure?: StructureConstant;
	}, creep: Creep) {
		if (s.state == FightState.idle) {
			if (!creep) {
				let room = Game.rooms[s.from];
				for (let j = 0; j < room.memory['spawns'].length; j++) {
					let name = room.memory['spawns'][j];
					if (Game.spawns[name].spawning) continue;
					else {
						let newName = `S_${s.from}_${id}`;
						let bodySet = bodys[s.type];
						let body = [].concat(...Object.keys(bodySet).map(type => Array(bodySet[type]).fill(type)))
						Game.spawns[name].spawnCreep(
							body,
							newName, {
							memory: {
								role: Role.S,
								state: null,
								roomFrom: s.from,
							}
						});
						break;
					}
				}
			}
		}
	}

	public boost(id: number, s: {
		state: string;
		from: string;
		type: string;
		targetRoom: string;
		sustained: boolean;
		nums?: number;
		targetStructure?: StructureConstant;
	}, creep: Creep) {
		if (s.state == FightState.idle) {
			if (/^B/.test(s.type)) {
				if (creep &&
					creep.memory.state != State.Boost &&
					!creep.memory.boost) {
					// TODO setBoostType
					let types: {
						type: MineralBoostConstant;
						num: number;
					}[] = [];
					console.log(JSON.stringify(types))
					for (let body in bodys[s.type]) {
						types.push({
							type: BoostType[body],
							num: Game.creeps[creep.name].getActiveBodyparts(body as BodyPartConstant)
						})
					}
					Boost.SetBoostType(creep.name, types)

				} else if (creep?.memory.boost) {
					Memory.S[id].state = FightState.move;
					creep.memory.state = null;
				}
			} else Memory.S[id].state = FightState.move;
		}
	}

	public move(id: number, s: {
		state: string;
		from: string;
		type: string;
		targetRoom: string;
		sustained: boolean;
		nums?: number;
		targetStructure?: StructureConstant;
		time?: number,
		interval?: number,
	}, creep: Creep) {
		if (s.state == FightState.move) {
			if (creep) {
				if (creep.getActiveBodyparts(HEAL)) {
					creep.heal(creep);
					if (creep.hitsMax - creep.hits > 200) {
						const exitDir = creep.room.findExitTo(creep.memory.roomFrom) as ExitConstant;
						const exit = creep.pos.findClosestByRange(exitDir);
						creep.moveTo(exit);
						return;
					}
				}
				if (creep.room.name != s.targetRoom) {
					creep.customMove(new RoomPosition(25, 25, s.targetRoom), 0);
				} else {
					if (creep.room.controller?.safeMode) Memory.S[id].sustained = false;
					if (creep.getActiveBodyparts(WORK)) this._dismantle(creep);
					else if (creep.getActiveBodyparts(ATTACK)) this._attack(creep);
					else if (creep.getActiveBodyparts(RANGED_ATTACK)) this._rangeAttack(creep);
					else if (creep.getActiveBodyparts(CLAIM)) this._attackController(creep, id);
				}
			} else {
				if (s.interval) {
					if ((Game.time - s.time) % s.interval == 0) Memory.S[id].state = FightState.idle;
				} else {
					if (s.sustained) {
						Memory.S[id].nums--;
						Memory.S[id].state = FightState.idle;
					} else {
						if (s.nums > 0) {
							Memory.S[id].nums = s.nums - 1;
							Memory.S[id].state = FightState.idle;
						} else {
							delete Memory.S[id];
						}
					}
				}
			}
		}
	}

	private _getDis(pos1: RoomPosition, pos2: RoomPosition): number {
		if (pos1.roomName != pos2.roomName) return;
		return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
	}

	private _rangeAttack(creep: Creep) {
		// let f = Game.flags[`Invader_${creep.room.name}`];
		// if (f) {
		// 	let s = creep.room.lookForAt(LOOK_STRUCTURES, f);
		// 	if (s.length) {
		// 		if (this._getDis(creep.pos, s[0].pos) > 1) {
		// 			creep.customMove(s[0].pos, 2);
		// 			creep.rangedAttack(s[0])
		// 		}
		// 		else creep.rangedMassAttack();
		// 	}
		// 	return;
		// }


		let flag = Game.flags[`atk_${creep.room.name}`];
		let flag2 = Game.flags[`mass_${creep.room.name}`];
		let target: Structure = null;
		if (flag2) {
			creep.rangedMassAttack();
			creep.moveTo(flag2);
		} else {
			let enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
				filter: c => !Memory.whiteList.includes(c.owner.username) && !c.spawning && c.pos.x > 0 && c.pos.x < 49 && c.pos.y > 0 && c.pos.y < 49
			});
			if (enemy) {
				let dis = this._getDis(creep.pos, enemy.pos);
				if (dis > 3) creep.rangedMassAttack();
				else if (dis > 1) creep.rangedAttack(enemy);
				else if (dis <= 1) creep.rangedMassAttack();
				creep.moveTo(enemy);
			} else {
				if (creep.pos.x < 1 || creep.pos.x > 48 || creep.pos.y < 1 || creep.pos.y > 48) {
					creep.moveTo(new RoomPosition(25, 25, creep.room.name));
					return;
				}
				if (flag) target = creep.room.lookForAt(LOOK_STRUCTURES, flag)[0];
				else target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
					filter: e => e.structureType != STRUCTURE_CONTROLLER
				});
				if (target) {
					if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
						creep.customMove(target.pos, 3, false);
					}
				}
			}
		}
	}

	private _attack(creep: Creep) {
		let f = Game.flags[`Invader_${creep.room.name}`];
		if (f) {
			// 打野
			let s = creep.room.lookForAt(LOOK_STRUCTURES, f);
			if (s.length) {
				if (this._getDis(creep.pos, s[0].pos) > 1) creep.moveTo(s[0]);
				else creep.attack(s[0]);
			}
			return;
		}
		let enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
			filter: c => !Memory.whiteList.includes(c.owner.username)
		});
		if (enemy) {
			if (creep.attack(enemy) == ERR_NOT_IN_RANGE) {
				creep.moveTo(enemy);
			}
		} else {
			let flag = Game.flags[`atk_${creep.room.name}`];
			let target: Structure = null;
			if (flag) target = creep.room.lookForAt(LOOK_STRUCTURES, flag)[0];
			else target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
				filter: e => e.structureType != STRUCTURE_CONTROLLER
			});
			if (target) {
				if (creep.attack(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		}
	}

	private _dismantle(creep: Creep) {
		let flag = Game.flags[`dis_${creep.room.name}`];
		let target: Structure = null;
		// if (creep.pos.x <= 1 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.y >= 48) {
		// 	creep.moveTo(new RoomPosition(25, 25, creep.room.name));
		// 	return;
		// }
		if (flag) {
			target = creep.room.lookForAt(LOOK_STRUCTURES, flag)[0];
			if (!target) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: e => e.structureType != STRUCTURE_CONTROLLER
				});
			}
		}
		else target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: e => e.structureType != STRUCTURE_CONTROLLER
		});
		if (target) {
			if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
	}

	private _attackController(creep: Creep, id: number) {
		let controller = creep.room.controller;
		if (Memory.S[id].type == 'R') {
			if (controller.reservation?.username && controller.reservation.username != creep.owner.username) {
				if (creep.attackController(controller) == ERR_NOT_IN_RANGE) {
					creep.customMove(controller.pos);
				}
			} else {
				if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
					creep.customMove(controller.pos);
				}
			}
		} else if (Memory.S[id].type == 'C') {
			if (controller.owner) {
				if (creep.attackController(controller) == ERR_NOT_IN_RANGE) {
					creep.customMove(controller.pos)
				}
			} else {
				delete Memory.S[id]
			}
		}
	}
}