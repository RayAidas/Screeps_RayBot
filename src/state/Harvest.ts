import App from "@/App";
import { Role } from "@/common/Constant";
import { State } from "@/fsm/state";
import Singleton from "@/Singleton";
import Build from "./Build";

export default class Harvest extends Singleton {
  public run(creep: Creep) {
    switch (creep.memory.role) {
      case Role.Harvester: {
        if (creep.memory.targetSource) {
          let target = Game.getObjectById(creep.memory.targetSource);
          let sourceMem = creep.room.memory.sources[target.id];
          let structures = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos).filter(e => e.structureType == STRUCTURE_CONTAINER);
          if (creep.ticksToLive <= creep.memory.time + creep.body.length * 3) {
            if (sourceMem.harvester == creep.name) sourceMem.harvester = null;
          }
          if (!Game.getObjectById(sourceMem.container)) {
            if (creep.store.energy >= 48) {
              if (!structures.length) {
                let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos);
                if (sites.length) creep.build(sites[0]);
                else creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER);
              } else sourceMem.container = structures[0].id as Id<StructureContainer>;
            } else creep.harvest(target);
          } else {
            let container = Game.getObjectById(sourceMem.container);
            if (creep.store.energy >= 50 && container.hits / container.hitsMax < 1) creep.repair(container);
            else creep.harvest(target);
          }
          let link = Game.getObjectById(sourceMem.link);
          if (!target.energy && link) {
            let container = Game.getObjectById(sourceMem.container);
            if (container && container.store.energy && creep.store.getFreeCapacity() > 0) creep.withdraw(container, 'energy');
            else {
              let drop = creep.room.lookForAt(LOOK_RESOURCES, creep.pos).filter(d => d.resourceType == 'energy');
              if (drop.length) creep.pickup(drop[0]);
            }
          }
          if (link && creep.store.energy >= 40) creep.transfer(link, 'energy');
        } else if (creep.memory.targetMineral) {
          let target = Game.getObjectById(creep.memory.targetMineral);
          if (target.mineralAmount) creep.harvest(target);
        }
        break;
      }
      case Role.HelpUpgrader:
      case Role.HelpBuilder: {
        if (creep.store.getFreeCapacity() == 0) {
          creep.memory.sourceId = null;
          if (creep.memory.role == Role.HelpBuilder) App.fsm.changeState(creep, State.Build);
          if (creep.memory.role == Role.HelpUpgrader) App.fsm.changeState(creep, State.Upgrade);
          return;
        }
        let source: Source = null;
        if (creep.memory.sourceId) source = Game.getObjectById(creep.memory.sourceId);
        else {
          source = creep.pos.findClosestByPath(FIND_SOURCES);
          if (source) creep.memory.sourceId = source.id;
          else return;
        }
        if (source.energy > 0) {
          if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.customMove(source.pos);
          }
        } else {
          source = creep.room.find(FIND_SOURCES, {
            filter: (s) => s.energy > 0 && App.common.getPosNear(s.pos)
          })[0]
          if (source) creep.memory.sourceId = source.id;
        }
        break;
      }
    }
  }
}