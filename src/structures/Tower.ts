import Singleton from '@/Singleton';
export default class Tower extends Singleton {
  public randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  public run(roomName: string) {
    if (!Game.rooms[roomName].memory.towers) return;
    let towerIds = Game.rooms[roomName].memory.towers;
    let towerTask = global.towerTask[roomName];
    if (towerTask.enemys.length) {
      for (let i = 0; i < towerIds.length; i++) {
        let tower = Game.getObjectById(towerIds[i]);
        if (!tower) continue;
        let target = Game.getObjectById(towerTask.enemys[0]);
        if (target) {
          tower.attack(target);
          continue;
        } else {
          towerTask.enemys.shift();
        }
      }
    } else if (towerTask.injured.length) {
      for (let i = 0; i < 3; i++) {
        let tower = Game.getObjectById(towerIds[i]);
        if (!tower) continue;
        let target = Game.getObjectById(towerTask.injured[0]);
        if (target && target.hitsMax - target.hits > 0 && target.room.name == tower.room.name) {
          tower.heal(target);
          continue;
        } else {
          towerTask.injured.shift();
        }
      }
    } else if (towerTask.structures.length) {
      let tower = Game.getObjectById(towerIds[this.randInt(0, towerIds.length)]);
      if(tower){
        if (tower.store.energy > 500) {
          if (towerTask.structures.length) {
            let target = Game.getObjectById(towerTask.structures[0]);
            if (target) {
              tower.repair(target)
              if (target.hits == target.hitsMax) towerTask.structures.shift();
            } else {
              towerTask.structures.shift();
            }
          }
      }
      }
    }
  }

  public checkRoom(roomName: string) {
    let whiteList = Memory.whiteList || [];
    //  App.group.checkDefenseGroup(roomName);
    global.towerTask[roomName].structures = [];

    // if (Game.rooms[roomName].memory.nuckerState) {
    //   let nukes = Game.rooms[roomName].find(FIND_NUKES, {
    //     filter: nuke => {
    //       let ram = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, nuke.pos).filter(e => e.structureType == STRUCTURE_RAMPART)
    //       if (ram.length) global.towerTask[roomName].structures.push(ram[0].id);
    //       return nuke;
    //       // for (let x = nuke.pos.x - 2; x <= nuke.pos.x + 2; x++) {
    //       //   for (let y = nuke.pos.y - 2; y <= nuke.pos.y + 2; y++) {
    //       //     let ram = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, x, y).filter(e => e.structureType == STRUCTURE_RAMPART)
    //       //     if (ram.length) global.towerTask[roomName].structures.push(ram[0].id);
    //       //     return nuke;
    //       //   }
    //       // }
    //     }
    //   })
    //   if (!nukes.length) Game.rooms[roomName].memory.nuckerState = false;
    // }

    Game.rooms[roomName].find(FIND_STRUCTURES, {
      filter: structure => {
        // if (structure.structureType !== STRUCTURE_RAMPART &&
        //   structure.structureType !== STRUCTURE_WALL &&
        //   structure.hits < structure.hitsMax) {
        //   global.towerTask[roomName].structures.push(structure.id)
        // }
        // else
        if ((structure.structureType == STRUCTURE_ROAD
          || (structure.structureType == STRUCTURE_CONTAINER)) &&
          (structure.hitsMax - structure.hits) >= 1000
        ) global.towerTask[roomName].structures.unshift(structure.id)
      }
    })

    Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
      filter: (creep) => {
        if (!whiteList.includes(creep.owner.username)) {
          if (creep.body[0].boost && creep.owner.username != 'Invader') {
            if (!global.cc[roomName].defense_attacker) {
              global.cc[roomName].defense_attacker = 1;
              global.cc[roomName].defense_healer = 1;
            }
          } else {
            global.towerTask[roomName].enemys.push(creep.id);
            global.cc[roomName].defense_attacker = 0;
            global.cc[roomName].defense_healer = 0;
          }
        }
      }
    })
  }
}