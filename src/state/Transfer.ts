import App from "@/App";
import { Role } from "@/common/Constant";
import { State } from "@/fsm/state";
import Singleton from "@/Singleton";

export default class Transfer extends Singleton {
    public ToSpawn(creep: Creep) {
        if (creep.store.getUsedCapacity() == 0) {
            switch (creep.memory.role) {
                case Role.Carrier:
                    App.fsm.changeState(creep, State.Pick);
                    break;
                case Role.Filler:
                case Role.HelpBuilder:
                    App.fsm.changeState(creep, State.Withdraw);
                    break;
            }
            return;
        }
        if (!creep.store.energy) {
            if (creep.store.getUsedCapacity() == 0) {
                switch (creep.memory.role) {
                    case Role.Carrier:
                        App.fsm.changeState(creep, State.Pick);
                        break;
                    case Role.Filler:
                    case Role.HelpBuilder:
                        App.fsm.changeState(creep, State.Withdraw);
                        break;
                }
            }
            else App.fsm.changeState(creep, State.TransferToStorage);
            return;
        }
        if (global.et[creep.room.name]) {
            let target: AnyStructure = App.common.getEmptySpawnAndExt(creep);
            if (target) {
                App.common.transferToTargetStructure(creep, target);
                return;
            } else {
                if (!Game.getObjectById(creep.memory.transferTargetId)) creep.memory.transferTargetId = null;
            }
            if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
                creep.memory.transferTargetId = null;
                global.et[creep.room.name] = false;
                if (creep.memory.role == Role.HelpBuilder) App.fsm.changeState(creep, State.Upgrade);
                else App.fsm.changeState(creep, State.TransferToTower);
            }
        } else {
            if (creep.memory.role == Role.HelpBuilder) App.fsm.changeState(creep, State.Upgrade);
            else App.fsm.changeState(creep, State.TransferToTower);
        }
    }

    public ToTower(creep: Creep) {
        if (creep.store.getUsedCapacity() == 0) {
            switch (creep.memory.role) {
                case Role.Carrier:
                    App.fsm.changeState(creep, State.Pick);
                    break;
                case Role.Filler:
                case Role.HelpBuilder:
                    App.fsm.changeState(creep, State.Withdraw);
                    break;

            }
            return;
        }
        if (!creep.store.energy) {
            if (creep.store.getUsedCapacity() == 0) {
                switch (creep.memory.role) {
                    case Role.Carrier:
                        App.fsm.changeState(creep, State.Pick);
                        break;
                    case Role.Filler:
                    case Role.HelpBuilder:
                        App.fsm.changeState(creep, State.Withdraw);
                        break;

                }
            }
            else App.fsm.changeState(creep, State.TransferToStorage);
            return;
        }
        let target = App.common.findTower(creep);
        if (creep.store.energy > 0 && target) App.common.transferToTargetStructure(creep, target);
        else App.fsm.changeState(creep, State.TransferToPowerSpawn);
    }

    public ToStorage(creep: Creep) {
        let target = creep.room.storage;
        if (target && target.store.getFreeCapacity() == 0) {
            App.fsm.changeState(creep, State.TransferToTerminal);
            return;
        }
        switch (creep.memory.role) {
            case Role.Filler: {
                if (!target?.my) {
                    App.fsm.changeState(creep, State.TransferToSpawn);
                    return;
                }
                else {
                    if (target.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        return;
                    }
                    App.common.transferToTargetStructure(creep, target);
                }
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Withdraw);
                break;
            }
            case Role.Carrier: {
                if (!target?.my) {
                    App.fsm.changeState(creep, State.TransferToSpawn);
                    return;
                }
                else {
                    if (target.store.getFreeCapacity() == 0) {
                        App.fsm.changeState(creep, State.TransferToSpawn);
                        return;
                    }
                    App.common.transferToTargetStructure(creep, target);
                }
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Pick);
                break;
            }
            case Role.CenterTransfer: {
                if (!target?.my) {
                    App.fsm.changeState(creep, State.TransferToTerminal);
                    return;
                }
                else {
                    App.common.transferToTargetStructure(creep, target);
                }
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Withdraw);
                break;
            }
            case Role.HelpBuilder: {
                if (!target?.my) App.fsm.changeState(creep, State.Upgrade);
                else App.common.transferToTargetStructure(creep, target);
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Upgrade);
                break;
            }
            case Role.Repairer: {
                if (!target?.my) App.fsm.changeState(creep, State.Unboost);
                else App.common.transferToTargetStructure(creep, target);
                if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Unboost);
                break;
            }
        }
    }

    public ToTerminal(creep: Creep) {
        let target = creep.room.terminal
        if (target?.my) {
            if(target.store.getFreeCapacity()==0){
                App.common.transferToTargetStructure(creep, creep.room.storage);
                return;
            }
            App.common.transferToTargetStructure(creep, target);
            if (creep.store.getUsedCapacity() == 0) App.fsm.changeState(creep, State.Withdraw);
            return;
        } else App.fsm.changeState(creep, State.TransferToStorage);
    }

    public ToFactory(creep: Creep) {
        let target = Game.getObjectById(creep.room.memory.factory.id);
        if (target?.my) {
            App.common.transferToTargetStructure(creep, target);
            return;
        } else App.fsm.changeState(creep, State.TransferToStorage);
    }

    public ToLab(creep: Creep) {
        let target;
        if (creep.memory.role == Role.CenterTransfer) target = Game.getObjectById(creep.room.memory.labs[creep.memory.fillLabIndex]);
        else {
            if (creep.memory.transferTargetId) target = Game.getObjectById(creep.memory.transferTargetId);
            else {
                for (let i = 0; i < 10; i++) {
                    let lab = Game.getObjectById(creep.room.memory.labs[i]);
                    if (lab && lab.store.energy < 2000) {
                        creep.memory.transferTargetId = lab.id;
                        break;
                    }
                }
            }
        }
        if(target instanceof StructureLab){
            App.common.transferToTargetStructure(creep, target);
            if ((creep.store.energy && target.store.energy == 2000) ||
                creep.store.getUsedCapacity() == 0) {
                creep.memory.transferTargetId = null;
                App.fsm.changeState(creep, State.Withdraw);
                return
            }
            if (target.store[target.mineralType] == 3000 || creep.store.getUsedCapacity() == 0) {
                App.fsm.changeState(creep, State.Withdraw);
            }
        }else App.fsm.changeState(creep, State.TransferToStorage);
    }

    public ToPowerSpawn(creep: Creep) {
        let target = Game.getObjectById(creep.room.memory.powerSpawnId);
        if (creep.store.getUsedCapacity() == 0) {
            App.fsm.changeState(creep, State.Withdraw);
            return;
        }
        if (!creep.store.energy) {
            App.fsm.changeState(creep, State.TransferToStorage);
            return;
        }
        if (!target) {
            App.fsm.changeState(creep, State.TransferToLab);
            return
        }
        if (target.store.energy == 5000) {
            App.fsm.changeState(creep, State.TransferToLab);
            return;
        }
        App.common.transferToTargetStructure(creep, target);
    }
}