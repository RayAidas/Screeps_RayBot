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
        if (creep.memory.role == Role.Repairer) {
          // TODO 增加三种不同等级数量判断
          Boost.SetBoostType(creep.name, [{
            type: global.allRes["XLH2O"] > 1000 ? "LH2O" : "LH",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }, {
            type: global.allRes["XKH2O"] > 1000 ? "KH2O" : "KH",
            num: Game.creeps[creep.name].getActiveBodyparts(CARRY)
          }])
        }
        if (creep.memory.role == Role.HelpBuilder) {
          // TODO 增加三种不同等级数量判断
          Boost.SetBoostType(creep.name, [{
            type: global.allRes["XLH2O"] > 1000 ? "LH2O" : "LH",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }, { 
            type: "XZHO2",
            num: Game.creeps[creep.name].getActiveBodyparts(MOVE)
          }])
        }
        if (creep.memory.role == Role.HelpUpgrader) {
          Boost.SetBoostType(creep.name, [{
            type: global.allRes["XGH2O"] > 1000 ? "XGH2O" : "GH",
            num: Game.creeps[creep.name].getActiveBodyparts(WORK)
          }, {
            type: "XZHO2",
            num: Game.creeps[creep.name].getActiveBodyparts(MOVE)
          }])
        }
        if (creep.memory.role == Role.Attacker) {
          Boost.SetBoostType(creep.name, [{
            type: global.allRes["XUH2O"] > 500 ? "XUH2O" : "UH2O",
            num: Game.creeps[creep.name].getActiveBodyparts(ATTACK)
          }])
        }
        // boost DepositHarvester
        // if (creep.memory.role == Role.DepositHarvester) {

        // }

        /**
         * 升级boost
         * WORK:
         *    T1: GH +50% upgradeController 效率但不增加其能量消耗
         *    T2: GH2O +80% upgradeController 效率但不增加其能量消耗
         *    T3: XGH2O +100% upgradeController 效率但不增加其能量消耗
         * CARRY:
         *    T1: KH +50 容量
         *    T2: KH2O 	+100 容量
         *    T3: XKH2O +150 容量
         */
        let upgradePlusFlag = Game.flags[`${creep.memory.roomFrom}_upgradePlus`];
        let upgraderBoostFlag = Game.flags[`${creep.memory.roomFrom}_upgraderBoost`];
        if (upgradePlusFlag || upgraderBoostFlag) {
          if (creep.memory.role == Role.Upgrader && creep.room.controller.level >= 6) {
            // 强化WORK部件
            if (global.allRes["XGH2O"] > 1000) {
              this._setBoostType(creep, "XGH2O", WORK);
            } else if (global.allRes["GH2O"] > 1000 || global.allRes["GH"] > 1000) {
              this._setBoostType(creep, global.allRes["GH2O"] > 1000 ? "GH2O" : "GH", WORK);
            } else {
              console.log(`XGH2O资源不足,自动购入`);
              global.autoDeal(creep.room.name, "XGH2O", 1940, 2000);
            }
            // 强化CARRY部件
            if (upgradePlusFlag) {
              if (global.allRes["XKH2O"] > 1000) {
                this._setBoostType(creep, "XKH2O", CARRY);
              } else if (global.allRes["KH2O"] > 1000 || global.allRes["KH"] > 1000) {
                this._setBoostType(creep, global.allRes["KH2O"] > 1000 ? "KH2O" : "KH", CARRY);
              }
            }
          }
          if (creep.memory.role == Role.Transfer2Container && upgradePlusFlag) {
            if (global.allRes["XKH2O"] > 1000) {
              this._setBoostType(creep, "XKH2O", CARRY);
            } else if (global.allRes["KH2O"] > 1000 || global.allRes["KH"] > 1000) {
              this._setBoostType(creep, global.allRes["KH2O"] > 1000 ? "KH2O" : "KH", CARRY);
            }
          }
        }
      }
    }
  }
  /**
   * 
   * @param creep 需要强化的Creep
   * @param compoundType 化合物类型
   * @param boostBodyType 强化部件
   */
  private _setBoostType(creep: Creep, compoundType: MineralBoostConstant, boostBodyPartType: BodyPartConstant): void {
    const boostBodyPartAmount = Game.creeps[creep.name].getActiveBodyparts(boostBodyPartType);
    Boost.SetBoostType(creep.name, [{
      type: compoundType,
      num: boostBodyPartAmount
    }]);
  }
}