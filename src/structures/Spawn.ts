import { bodyConfigs, Role } from "@/common/Constant"
import { GenNonDuplicateID } from "@/common/utils"
import Singleton from "@/Singleton"
import Boost from "@/state/Boost"

export default class Spawn extends Singleton {
  private getBodys(spawnName: string, bodyType: BodyAutoConfigConstant): BodyPartConstant[] {
    const bodyConfig: BodyConfig = bodyConfigs[bodyType]
    let room = Game.spawns[spawnName].room
    const targetLevel = Object.keys(bodyConfig).reverse().find(level => {
      // 先通过等级粗略判断，再加上 dryRun 精确验证
      // console.log(level)
      const availableEnergyCheck = (Number(level) <= room.energyAvailable)
      const dryCheck = (Game.spawns[spawnName].spawnCreep(bodyConfig[level], 'bodyTester', { dryRun: true }) == OK)

      return availableEnergyCheck && dryCheck
    })
    if (!targetLevel) return []

    // 获取身体部件
    const bodys: BodyPartConstant[] = bodyConfig[targetLevel]

    return bodys
  }

  public run(roomName: string, role: string, creepName?: string, taksId?: number) {
    let room = Game.rooms[roomName];
    if (!room.memory.spawns) return;
    for (let i = 0; i < room.memory.spawns.length; i++) {
      let name = room.memory.spawns[i];
      if (!Game.spawns[name]) continue;
      if (Game.spawns[name] && Game.spawns[name].spawning) continue;
      else {
        if (!Game.spawns[name]) continue;
        let newName = GenNonDuplicateID();
        let body = this.getBodys(name, role as BodyAutoConfigConstant);
        if (body.length <= 0) return ERR_NOT_ENOUGH_ENERGY;
        Game.spawns[name].spawnCreep(
          body,
          creepName ?? newName, {
          memory: {
            role: role,
            state: null,
            roomFrom: roomName,
            taskId: taksId
          }
        });
        break;
      }
    }
  }

  public update(roomName: string) {
    if (Game.time % 2 == 0) return;
    let room = Game.rooms[roomName];
    if (!room.memory.spawns) return;
    for (let i = 0; i < room.memory.spawns.length; i++) {
      let name = room.memory.spawns[i];
      let spawn = Game.spawns[name];
      if (spawn.spawning) {
        let spawningCreep = spawn.spawning?.name;
        let creep = Game.creeps[spawningCreep];
        if (creep.memory.role == Role.Repairer || creep.memory.role == Role.HelpBuilder) {
          Boost.SetBoostType(creep.name, [{
            type: global.allRes["LH2O"] > 10000 ? "LH2O" : "LH",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }, {
            type: global.allRes["KH2O"] > 10000 ? "KH2O" : "KH",
            num: Game.creeps[creep.name].getActiveBodyparts(CARRY)
          }])
        }
        if (creep.memory.role == Role.HelpUpgrader) {
          Boost.SetBoostType(creep.name, [{
            type: global.allRes["GH2O"] > 10000 ? "GH2O" : "GH",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }, {
            type: global.allRes["KH2O"] > 10000 ? "KH2O" : "KH",
            num: Game.creeps[creep.name].getActiveBodyparts(CARRY)
          }])
        }
        // if (creep.memory.role == Role.Upgrader && creep.room.controller.level == 7 && global.allRes["XGH2O"] >= 10000) {
        //   Boost.SetBoostType(creep.name, [{
        //     type: "XGH2O",
        //     num: Game.creeps[creep.name].getActiveBodyparts(WORK)
        //   }])
        // }
        // TODO 增加插旗子控制策略
        if (creep.memory.role == Role.Upgrader && creep.room.controller.level == 6 && global.allRes["XGH2O"] >= 1000) {
          Boost.SetBoostType(creep.name, [{
            type: "XGH2O",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }, {
            type: global.allRes["KH2O"] > 1000 ? "KH2O" : "KH",
            num: Game.creeps[creep.name].getActiveBodyparts(CARRY)
          }])
        }
        if (creep.memory.role == Role.Upgrader && creep.room.controller.level == 7 && global.allRes["GH"] >= 10000) {
          Boost.SetBoostType(creep.name, [{
            type: "GH",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }])
        }
      }
    }
  }
}