import App from "./App";
import { Role, RoleNum } from "./common/Constant";
import { colorful, colorHex, getColor } from "./common/utils";
import Singleton from "./Singleton";
import { Glb } from "./indexManager";
import { TalkAll } from "./state/creepChat.js"
import { State } from "@/fsm/state";
import { remove } from "lodash";


export default class Init extends Singleton {
  public rooms: string[] = Memory.myrooms || [];
  public initGameData() {
    if (!global.state) this._globalMount();
    this._loadMemory();
    this.getRooms();
  }

  public runInLoop() {
    // try {
    TalkAll.run();
    if (Game.shard.name == "shard3" && Game.cpu.bucket < 100) return;
    if (Game.shard.name == "shard3") {
      // 默认关闭
      if (Memory.generatePixel) {
        if (Game.cpu.bucket == 10000) Game.cpu.generatePixel();
      }
    } else {
      // 默认开启
      if (Memory.generatePixel == void 0 || Memory.generatePixel) {
        if (Game.cpu.bucket == 10000) Game.cpu.generatePixel();
      }
    }
    if (Game.time % 100 == 0) global.allRes = Glb.getAllRes();
    this._clearCreep();
    this._checkCreepsNumInRooms();
    this._runStructures();
    this._runByFlags();
    for (let i = 0; i < this.rooms.length; i++) {
      App.autoPlanner.checkSites(this.rooms[i]);
      App.autoPlanner.checkRampart(this.rooms[i]);
      if (Game.time % (this.rooms.length + 5) == Game.rooms[this.rooms[i]].memory.index) App.tower.checkRoom(this.rooms[i])
      if (!global.et[Game.rooms[this.rooms[i]].name]) {
        if (Game.rooms[this.rooms[i]].energyAvailable < Game.rooms[this.rooms[i]].energyCapacityAvailable) {
          global.et[Game.rooms[this.rooms[i]].name] = true;
        }
      }
      if (Game.shard.name !== "shard3") {
        if (Memory.RoomSitesState[this.rooms[i]]) {
          if (Game.time % ((1 + Memory.rooms[this.rooms[i]].index) * (1000 + Memory.rooms[this.rooms[i]].index)) == 0) {
            Memory.RoomSitesState[this.rooms[i]] = {};
            console.log('检查建筑', this.rooms[i]);
          }
        }
      }
    }
    this._boost();
    this._runCreeps();
    let used = Game.cpu.getUsed();
    for (let i = 0; i < this.rooms.length; i++) {
      this._showRoomInfo(this.rooms[i], used);
    }

    // } catch (error) {
    //   console.log(error);
    // }
  }

  private _boost() {
    // 遍历boostList列表，取出每个房间第一个需要boost的creep去执行boost
    let roomName: string;
    for (roomName in Memory.boostList) {
      // 判断每个房间boost列表是否为空
      if (Memory.boostList[roomName]) {
        let creepNames = Object.keys(Memory.boostList[roomName]);
        // 需要boost的creep进行等待，最多等待100tick
        let creepName: string;
        for (creepName of creepNames) {
          App.fsm.changeState(Game.creeps[creepName], State.Boost);
        }
        if (creepNames[0]) {
          let boostCreep = Game.creeps[creepNames[0]];
          // App.fsm.changeState(boostCreep, State.Boost);
          App.boost.run(boostCreep);
        }
      }
    }
  }

  private _loadMemory() {
    this.getRooms();
    let rooms: string[] = Memory.myrooms || [];
    if (!Memory.boostList) Memory.boostList = {};
    if (!Memory.whiteList) Memory.whiteList = [];
    for (let i = 0; i < rooms.length; i++) {
      App.common.getSources(rooms[i]);
      App.common.getMineral(rooms[i]);
      App.common.getStructrues(rooms[i]);
      App.common.getcontrollerContainerId(rooms[i]);
      if (!Memory.boostList[rooms[i]]) Memory.boostList[rooms[i]] = {}
    }
    if (!Memory.pcConfig) {
      Memory.pcConfig = {};
      if (Memory.powerCreeps) {
        for (let name in Memory.powerCreeps) {
          let pc = Game.powerCreeps[name];
          if (pc) {
            Memory.pcConfig[pc.room.name] = name;
          }
        }
      }
    }
    console.log(colorful('Success ', 'green'), 'load memory');
  }

  private _globalMount() {
    let rooms: string[] = Memory.myrooms || [];
    global.state = true;
    global.towerTask = {};
    global.et = {};
    global.tt = {};
    global.cc = {};
    global.demand = {};
    global.observer = {};
    global.roomCreeps = {};
    global.order = {}
    global.getRooms = this.getRooms;
    for (let i = 0; i < rooms.length; i++) {
      global.cc[rooms[i]] = {}
      global.cc[rooms[i]] = {
        upgrader: 1,
      }
      global.towerTask[rooms[i]] = {
        enemys: [],
        injured: [],
        structures: [],
      };
      global.et[rooms[i]] = true;
      global.tt[rooms[i]] = {
        taskRes: null,
      }
      global.order[rooms[i]] = {
        orderId: null,
        num: 0,
        roomName: rooms[i]
      }
    }
    global.allRes = Glb.getAllRes();
  }

  private _showRoomInfo(roomName: string, used: number) {
    if (!Game.rooms[roomName]) return;
    Game.rooms[roomName].visual
      .text(`CPU:${used}`, 0, 1, {
        color: colorHex(getColor(used / Game.cpu.limit * 100)),
        align: 'left'
      })
      .text(`BUCKET:${Game.cpu.bucket}`, 0, 2, {
        color: '#8dc5e3',
        align: 'left'
      })
      .text(`FAC_TASK:${Game.rooms[roomName].memory.factory?.target ?? '空闲'}`, 0, 3, {
        color: Game.rooms[roomName].memory.factory?.target ? '#c5c599' : '#6b9955',
        align: 'left'
      })
      .text(`LAB_TASK:${Game.rooms[roomName].memory.labs?.target ?? '空闲'}`, 0, 4, {
        color: Game.rooms[roomName].memory.labs?.target ? '#c5c599' : '#6b9955',
        align: 'left'
      })
      .text(`CONTR_PRO:${Game.rooms[roomName].controller.level < 8 ? (
        (Game.rooms[roomName].controller.progress / Game.rooms[roomName].controller.progressTotal * 100).toFixed(4) + '%'
      ) : '---/---'}`, 0, 5, {
        color: '#8dc5e3',
        align: 'left'
      })
    let spawns: string[] = Game.rooms[roomName].memory['spawns'] || [];
    for (let i = 0; i < spawns.length; i++) {
      let spawningCreep = null;
      if (!Game.spawns[spawns[i]]) continue;
      if (Game.spawns[spawns[i]].spawning) {
        spawningCreep = Game.creeps[Game.spawns[spawns[i]].spawning?.name];
      }
      Game.rooms[roomName].visual
        .text(
          `${spawns[i]}:${spawningCreep?.memory['role'] ?? '空闲'} ${Game.spawns[spawns[i]].spawning?.remainingTime ?? ''}`,
          0,
          6 + i, {
          color: spawningCreep ? '#c5c599' : '#6b9955',
          align: 'left',
        });
    }

    // test lab
    // for (let i = 0; i < 10; i++) {
    //   if(!Game.rooms[roomName].memory.labs) continue
    //   let lab = Game.getObjectById(Game.rooms[roomName].memory.labs[i]);
    //   if (lab) {
    //     Game.rooms[roomName].visual
    //       .text(i.toString(),lab.pos.x,lab.pos.y)
    //   }
    // }
  }

  private _initRoomTaskRoleNum(roomName: string) {
    if (!Memory.roomTask) return;
    if (!Memory.roomTask[roomName]) return;
    for (let id in Memory.roomTask[roomName]) {
      let task = Memory.roomTask[roomName][id];
      global.cc[roomName][task.role] = task.num;
    }
  }

  private _checkCreepsNumInRooms(): void {
    let creepsConfig = this._statistics();
    for (let roomName in creepsConfig) {
      this._initRoomTaskRoleNum(roomName);
      let room = Game.rooms[roomName];
      let roomCreeps = creepsConfig[roomName];
      if (global.cc[roomName]) {
        if (Game.rooms[roomName].memory.ruinState && Game.rooms[roomName].storage) global.cc[roomName].centerTransfer = 1;
        else global.cc[roomName].centerTransfer = RoleNum[room.controller.level][Role.CenterTransfer];
      }
      if (room.storage) global.cc[roomName].filler = RoleNum[room.controller.level][Role.Filler];
      if (room.controller.level >= 4) {
        let storage = room.storage;
        let terminal = room.terminal;
        let energyAcount = (storage ? storage.store.energy : 0) + (terminal ? terminal.store.energy : 0);
        let upgradePlusFlag = Game.flags[`${roomName}_upgradePlus`];
        if (upgradePlusFlag) {
          if (room.controller.level == 8) {
            upgradePlusFlag.remove();
            let upgraderBoostFlag = Game.flags[`${roomName}_upgraderBoost`];
            if (upgraderBoostFlag) {
              upgraderBoostFlag.remove();
            }
          }
        }
        if (energyAcount > 200000) {
          if (energyAcount > 500000 && room.controller.level < 8) {
            global.cc[roomName].builder = RoleNum[room.controller.level][Role.Builder];
            global.cc[roomName].upgrader = 8;
            global.cc[roomName].filler = 2;
          } else {
            global.cc[roomName].builder = RoleNum[room.controller.level][Role.Builder];
            if (Game.rooms[roomName].controller.ticksToDowngrade < 150000 - room.memory.index * 3000 && room.controller.level == 8) global.cc[roomName].upgrader = RoleNum[room.controller.level][Role.Upgrader];
            else if (room.controller.level == 8) global.cc[roomName].upgrader = 0;
            else global.cc[roomName].upgrader = 1;
          }
          // 增加冲级模式，判断房间内有无upgradePlus旗帜
          if (upgradePlusFlag) {
            global.cc[roomName].upgrader = 10;
            global.cc[roomName].transfer2Container = 2;
            global.cc[roomName].filler = 3;
          } else {
            global.cc[roomName].transfer2Container = 0;
          }
        } else if (upgradePlusFlag) {
          global.cc[roomName].upgrader = 10;
          global.cc[roomName].transfer2Container = 2;
          global.cc[roomName].filler = 3;
        } else {
          global.cc[roomName].builder = 0;
          global.cc[roomName].upgrader = 0;
          if (room.controller.ticksToDowngrade < 100000 || room.controller.level < 8) global.cc[roomName].upgrader = 3;
        }
      } else {
        if (global.cc[roomName]) {
          global.cc[roomName].builder = RoleNum[room.controller.level][Role.Builder];
          global.cc[roomName].upgrader = RoleNum[room.controller.level][Role.Upgrader];
        } else {
          this._globalMount();
        }
      }

      // TODO 处理逻辑待优化
      let transE2SFlag = Game.flags[`${roomName}_transE2S`];
      if (transE2SFlag) {
        global.cc[roomName].transfer2Container = 4;
      }

      for (let role in roomCreeps) {
        let roleLen = roomCreeps[role].length || 0;
        if (!global.cc[roomName]) continue;
        if (roleLen < global.cc[roomName][role]) {
          if (role == Role.RemoteTransfer) {
            if (Memory.roomTask[roomName]) {
              for (let i in Memory.roomTask[roomName]) {
                let task = Memory.roomTask[roomName][i];
                if (task.roomName == roomName) App.spawn.run(roomName, role, null, +i);
              }
            }
          } else App.spawn.run(roomName, role);
        }
      }
    }
  }

  public autoSell() {
    if (Memory.sellList) {
      for (let res in Memory.sellList) {
        let item = Memory.sellList[res];
        if (Game.time % item.interval == 0) {
          if (Game.rooms[item.roomName].terminal.cooldown) return;
          if (Game.rooms[item.roomName].terminal.store[res] >= item.num) {
            let orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: res as ResourceConstant });
            for (let i = 0; i < orders.length; i++) {
              let order = orders[i]
              if (orders[i].price > item.price) {
                Game.market.deal(order.id, order.amount, item.roomName);
                return;
              }
            }
          }
        }
      }
    }
  }

  private _statistics() {
    let obj: RoomCreeps = {};
    let roles = Object.keys(Role);
    let rooms = Memory.myrooms;
    for (let i = 0; i < rooms.length; i++) {
      if (!obj[rooms[i]]) obj[rooms[i]] = {}
      for (let j = 0; j < roles.length; j++) {
        obj[rooms[i]][Role[roles[j]]] = [];
      }
    }

    _.filter(Game.creeps, (creep) => {
      if (obj[creep.memory.roomFrom] && obj[creep.memory.roomFrom][creep.memory.role]) obj[creep.memory.roomFrom][creep.memory.role].push(creep);
    })
    global.roomCreeps = obj;
    return obj;
  }

  private _runCreeps() {
    for (let name in Game.creeps) {
      let creep = Game.creeps[name];
      // try {
      if (creep.hits < creep.hitsMax && creep.room.memory.towers?.length) global.towerTask[creep.room.name].injured.push(creep.id);
      App.fsm.update(creep)
      // } catch (error) {
      //   console.log('Error:', creep.memory.roomFrom, '-', creep.memory.role, ':', error);
      // }
    }
  }

  private _clearCreep(): void {
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  }

  public getRooms(): string[] {
    if (!Memory.username) Memory.username = Object.values(Game.spawns)[0].owner.username;
    let username = Memory.username;
    let rooms = [];
    let index = 0;
    for (let name in Game.rooms) {
      let room = Game.rooms[name];
      if (room?.controller?.owner?.username == username) {
        room.memory.index = index;
        index++;
        rooms.push(room.name);
      }
    }
    Memory.myrooms = rooms;
    this.rooms = rooms;
    return rooms;
  }

  private _runStructures() {
    for (let i = 0; i < this.rooms.length; i++) {
      // try {
      App.energySource.run(this.rooms[i]);
      App.powerSpawn.run(this.rooms[i]);
      App.mineral.run(this.rooms[i]);
      App.tower.run(this.rooms[i]);
      App.link.run(this.rooms[i]);
      App.lab.run(this.rooms[i]);
      App.common.getControllerLink(this.rooms[i]);
      App.common.getcontrollerContainerId(this.rooms[i]);
      App.factory.run(this.rooms[i]);
      App.terminal.run(this.rooms[i]);
      App.spawn.update(this.rooms[i]);
      App.pc.run(this.rooms[i]);
      App.observer.run(this.rooms[i]);
      // } catch (error) {
      //   console.log(this.rooms[i], error)
      // }
    }
  }

  private _runByFlags() {
    for (let i = 0; i < this.rooms.length; i++) {
      let claimFlag = Game.flags[`${this.rooms[i]}_claim`];
      let atkClaimFlag = Game.flags[`${this.rooms[i]}_atkClaim`];
      if (claimFlag || atkClaimFlag) global.cc[this.rooms[i]].claimer = 1;
      else {
        if (global.cc[this.rooms[i]]) global.cc[this.rooms[i]].claimer = 0;
      }
      let helpBuildFlag = Game.flags[`${this.rooms[i]}_helpBuild`];
      if (helpBuildFlag) global.cc[this.rooms[i]].helpBuilder = 4;
      else {
        if (global.cc[this.rooms[i]]) global.cc[this.rooms[i]].helpBuilder = 0;
      }
      let helpUpgradeFlag = Game.flags[`${this.rooms[i]}_helpUpgrade`];
      if (helpUpgradeFlag) global.cc[this.rooms[i]].helpUpgrader = 4;
      else {
        if (global.cc[this.rooms[i]]) global.cc[this.rooms[i]].helpUpgrader = 0;
      }
      let attackerFlag = Game.flags[`${this.rooms[i]}_attack`];
      if (attackerFlag) global.cc[this.rooms[i]].attacker = 2;
      else {
        if (global.cc[this.rooms[i]]) global.cc[this.rooms[i]].attacker = 0;
      }
    }

    /**
    * 清除所有的订单
    */
    let clearOrder = Game.flags[`clearOrder`];
    if (clearOrder) {
      for (let j in Game.market.orders) {
        let order = Game.market.getOrderById(j);
        let res = Game.market.cancelOrder(j);
        console.log(`当前订单 ${order} 取消成功`)
      }
      // 移除旗子
      console.log(`当前时间 ${Game.time} 订单清理完毕,移除旗子`);
      clearOrder.remove();
    }

    let flag0 = Game.flags['lab0'];
    let flag1 = Game.flags['lab1'];
    let flag2 = Game.flags['lab2'];
    if (flag0 && flag1 && flag2) {
      let roomName = flag0.room.name;
      App.common.setTempLabs(roomName);
    }
  }

  public runS() {
    let S = Memory.S;
    if (S) {
      for (let id in S) {
        // try {
        App.solitary.run(Number(id))
        // } catch (error) {
        //   console.log(error);
        // }
      }
    }
  }

}