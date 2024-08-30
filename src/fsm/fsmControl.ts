import App from "@/App";
import { Role } from "@/common/Constant";
import { FsmSystem } from "./fsmSystem";
import { State } from "./state";


export default class FsmControl extends FsmSystem {
  public Harvest(creep: Creep) {
    App.harvest.run(creep);
  }
  public MoveTo(creep: Creep) {
    App.moveto.run(creep);;
  }
  public Withdraw(creep: Creep) {
    App.withdraw.run(creep)
  }
  public Pick(creep: Creep) {
    App.pick.run(creep);
  }
  public TransferToSpawn(creep: Creep) {
    App.transfer.ToSpawn(creep);
  }
  public Upgrade(creep: Creep) {
    App.upgrade.run(creep);
  }
  public Build(creep: Creep) {
    App.build.run(creep);
  }
  public TransferToTower(creep: Creep) {
    App.transfer.ToTower(creep);
  }
  public TransferToStorage(creep: Creep) {
    App.transfer.ToStorage(creep);
  }
  public Back(creep: Creep) {
    App.moveto.back(creep);
  }
  public TransferToTerminal(creep: Creep) {
    App.transfer.ToTerminal(creep);
  }
  public TransferToFactory(creep: Creep) {
    App.transfer.ToFactory(creep);
  }
  public Repair(creep: Creep) {
    App.repair.run(creep);
  }
  public TransferToLab(creep: Creep) {
    App.transfer.ToLab(creep);
  }
  public TransferToPowerSpawn(creep: Creep) {
    App.transfer.ToPowerSpawn(creep);
  }
  public Boost(creep: Creep) {
    App.boost.run(creep);
  }
  public Unboost(creep: Creep) {
    App.unboost.run(creep);
  }
  public TransferToNuker(creep: Creep) {
    App.transfer.ToNuker(creep);
  }
  public TransferToControllerContainer(creep: Creep) {
    App.transfer.ToControllerContainer(creep);
  }

  public switchState(creep: Creep) {
    switch (creep.memory.role) {
      case Role.Harvester: creep.memory.state = State.MoveTo;
        break;
      case Role.Carrier: creep.memory.state = State.Pick;
        break;
      case Role.Builder: creep.memory.state = State.Withdraw;
        break;
      case Role.Upgrader: creep.memory.state = State.Withdraw;
        break;
      case Role.Filler: creep.memory.state = State.Withdraw;
        break;
      case Role.Claimer: creep.memory.state = State.MoveTo;
        break;
      case Role.HelpBuilder: creep.memory.state = State.MoveTo;
        break;
      case Role.HelpUpgrader: creep.memory.state = State.MoveTo;
        break;
      case Role.CenterTransfer: creep.memory.state = State.Withdraw;
        break;
      case Role.RemoteTransfer: creep.memory.state = State.MoveTo;
        break;
      case Role.Attacker: creep.memory.state = State.MoveTo;
        break;
      case Role.Repairer: creep.memory.state = State.Withdraw;
        break;
      case Role.DepositHarvester: creep.memory.state = State.MoveTo;
        break;

      case Role.RemoteHarvester: creep.memory.state = State.MoveTo;
        break;
      case Role.RemoteReserver: creep.memory.state = State.MoveTo;
        break;
      case Role.RemoteCarryer: creep.memory.state = State.MoveTo;
        break;
      case Role.RemoteAttacker: creep.memory.state = State.MoveTo;
        break;
      case Role.RemoteAttackerT: creep.memory.state = State.MoveTo;
        break;
      case Role.Reserver: creep.memory.state = State.MoveTo;
        break;
      case Role.PB_Attacker: creep.memory.state = State.MoveTo;
        break;
      case Role.PB_Healer: creep.memory.state = State.MoveTo;
        break;
      case Role.PB_Carryer: creep.memory.state = State.MoveTo;
        break;
      case Role.Defense_Attacker: creep.memory.state = State.MoveTo;
        break;
      case Role.Defense_Healer: creep.memory.state = State.MoveTo;
        break;
      case Role.Transfer: creep.memory.state = State.MoveTo;
        break;
      case Role.Transfer2Container: creep.memory.state = State.Withdraw;
        break;
    }
  }

  public setCreepsState(creeps: Creeps) {
    for (let name in creeps) {
      let creep = Game.creeps[name];
      if (!creep.memory.state) this.switchState(creep);
    }
  }


  public update(creep: Creep) {
    if (creep.memory.state == 'Boost') return;
    if (!creep.memory.role) {
      let reg = /[0-9]+/g;
      let role = creep.name.replace(reg, '');
      creep.memory.role = role;
      return;
    }
    if (creep.memory.state) {
      if (this[`${creep.memory.state}`]) {
        this[`${creep.memory.state}`](creep);
      }
    }
    else this.switchState(creep);
  }
}