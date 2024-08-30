import * as managers from './indexManager';

export default class App {
  static get init() {
    return managers.Init.getInstance();
  }

  static get autoPlanner() {
    return managers.AutoPlanner.getInstance();
  }

  static get fsm() {
    return managers.FSM.getInstance();
  }

  static get common() {
    return managers.Common.getInstance();
  }

  static get energySource() {
    return managers.EnergySource.getInstance();
  }

  static get mineral() {
    return managers.Mineral.getInstance();
  }

  static get spawn() {
    return managers.Spawn.getInstance();
  }

  static get harvest() {
    return managers.Harvest.getInstance();
  }

  static get moveto() {
    return managers.MoveTo.getInstance();
  }

  static get withdraw() {
    return managers.Withdraw.getInstance();
  }

  static get pick() {
    return managers.Pick.getInstance();
  }

  static get transfer() {
    return managers.Transfer.getInstance();
  }

  static get repair() {
    return managers.Repair.getInstance();
  }

  static get upgrade() {
    return managers.Upgrade.getInstance();
  }

  static get build() {
    return managers.Build.getInstance();
  }

  static get tower() {
    return managers.Tower.getInstance();
  }

  static get terminal() {
    return managers.Terminal.getInstance();
  }

  static get glb() {
    return managers.Glb.getInstance();
  }

  static get factory() {
    return managers.Factory.getInstance();
  }

  static get lab() {
    return managers.Lab.getInstance();
  }

  static get link() {
    return managers.Link.getInstance();
  }

  static get logistics() {
    return managers.Logistics.getInstance();
  }

  static get powerSpawn() {
    return managers.PowerSpawn.getInstance();
  }

  static get boost() {
    return managers.Boost.getInstance();
  }

  static get unboost() {
    return managers.Unoost.getInstance();
  }

  static get pc() {
    return managers.PC.getInstance();
  }

  static get solitary() {
    return managers.Solitary.getInstance();
  }

  static get observer() {
    return managers.Observer.getInstance();
  }

  // static get carry() {
  //   return managers.Carry.getInstance();
  // }


  // static get repair() {
  //   return managers.Repair.getInstance();
  // }

  // static get attack() {
  //   return managers.Attack.getInstance();
  // }

  // static get group() {
  //   return managers.Group.getInstance();
  // }

  // static get groupF() {
  //   return managers.GroupF.getInstance();
  // }

  // static get foreignSegment() {
  //   return managers.ForeignSegment.getInstance();
  // }
}