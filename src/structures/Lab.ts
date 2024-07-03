import App from "@/App";
import Singleton from "@/Singleton";

export default class Lab extends Singleton {
    public static readonly CompoundArr: MineralCompoundConstant[] = [
        "OH", "ZK", "UL", "G", "UH", "UO", "KH", "KO", "LH", "LO", "ZH", "ZO", "GH", "GO", "UH2O", "UHO2", "KH2O", "LH2O", "GH2O", "KHO2", "LHO2", "ZH2O", "ZHO2", "GHO2", "XUH2O", "XUHO2", "XKH2O", "XKHO2", "XLH2O", "XLHO2", "XZH2O", "XZHO2", "XGH2O", "XGHO2"
    ];
    public static Compound: MineralCompounds = {
        OH: ['O', 'H'],
        ZK: ['Z', 'K'],
        UL: ['U', 'L'],
        G: ['ZK', 'UL'],
        UH: ['U', 'H'],
        UO: ['U', 'O'],
        KH: ['K', 'H'],
        KO: ['K', 'O'],
        LH: ['L', 'H'],
        LO: ['L', 'O'],
        ZH: ['Z', 'H'],
        ZO: ['Z', 'O'],
        GH: ['G', 'H'],
        GO: ['G', 'O'],
        UH2O: ['UH', 'OH'],
        UHO2: ['UO', 'OH'],
        KH2O: ['KH', 'OH'],
        KHO2: ['KO', 'OH'],
        LH2O: ['LH', 'OH'],
        LHO2: ['LO', 'OH'],
        ZH2O: ['ZH', 'OH'],
        ZHO2: ['ZO', 'OH'],
        GH2O: ['GH', 'OH'],
        GHO2: ['GO', 'OH'],
        XUH2O: ['UH2O', 'X'],
        XUHO2: ['UHO2', 'X'],
        XKH2O: ['KH2O', 'X'],
        XKHO2: ['KHO2', 'X'],
        XLH2O: ['LH2O', 'X'],
        XLHO2: ['LHO2', 'X'],
        XZH2O: ['ZH2O', 'X'],
        XZHO2: ['ZHO2', 'X'],
        XGH2O: ['GH2O', 'X'],
        XGHO2: ['GHO2', 'X']
    }

    public isEnough(res: MineralConstant | MineralCompoundConstant): boolean {
        if (global.allRes[res] > 3000 * Memory.myrooms.length) return true;
        return false;
    }

    public getMineralCompoundConstant(roomName: string, c: MineralCompoundConstant): MineralCompoundConstant {
        let room = Game.rooms[roomName];
        let constants: (MineralConstant | MineralCompoundConstant)[] = Lab.Compound[c];
        if (this.isEnough(constants[0])) {
            if (this.isEnough(constants[1])) {
                room.memory.labs.target = c;
                return c
            };
            if (constants[1] == 'O' ||
                constants[1] == 'H' ||
                constants[1] == 'Z' ||
                constants[1] == 'K' ||
                constants[1] == 'U' ||
                constants[1] == 'L' ||
                constants[1] == 'X') {
                room.memory.labs.target = c;
                return c
            };
            this.getMineralCompoundConstant(roomName, constants[1]);

        }
        else {
            if (constants[0] == 'O' ||
                constants[0] == 'H' ||
                constants[0] == 'Z' ||
                constants[0] == 'K' ||
                constants[0] == 'U' ||
                constants[0] == 'L' ||
                constants[0] == 'X') {
                room.memory.labs.target = c;
                return c
            };
            this.getMineralCompoundConstant(roomName, constants[0]);
        }
    }

    public setTask(roomName: string) {
        let room = Game.rooms[roomName];
        let arr: {
            res: MineralCompoundConstant,
            num: number,
        }[] = [];
        let compounds = Lab.CompoundArr;
        compounds.forEach(e => {
            arr.push({ res: e as MineralCompoundConstant, num: global.allRes[e] ?? 0 });
        })
        arr.sort((a, b) => {
            // if (a.num == b.num) return a.res.length - b.res.length
            return a.num - b.num;
        });
        if (arr.length) {
            let index = Math.floor(room.memory.index / 2);
            if (!arr[index]) index = 0;
            this.getMineralCompoundConstant(roomName, arr[index].res);
            room.memory.labs.fillState = true;
        }
    }

    public run(roomName: string) {
        let room = Game.rooms[roomName];
        if (!room.memory.labs) return;
        if (!room.memory.labs[1] && !room.memory.labs[2]) return;
        if (room.memory.labs.clear) return;
        if (!room.memory.labs.target) {
            this.setTask(roomName);
            return;
        }
        let lab1 = Game.getObjectById(room.memory.labs[1]);
        let lab2 = Game.getObjectById(room.memory.labs[2]);
        if (room.memory.labs.fillState) {
            let res = Lab.Compound[room.memory.labs.target];
            let creep = Game.creeps[room.memory.labs.creepName];
            let res0 = creep?.store[res[0]] ?? 0;
            let res1 = creep?.store[res[1]] ?? 0;
            if (room.terminal.store[res[0]] + room.storage.store[res[0]] + lab1.store[res[0]] + res0 < 3000) {
                App.logistics.createTask(roomName, res[0], 3000, 'lab');
                room.memory.labs.fillRes = null;
                room.memory.labs.fillTargetIndex = null;
                return
            }
            if (room.terminal.store[res[1]] + room.storage.store[res[1]] + lab2.store[res[1]] + res1 < 3000) {
                App.logistics.createTask(roomName, res[1], 3000, 'lab');
                room.memory.labs.fillRes = null;
                room.memory.labs.fillTargetIndex = null;
                return
            }
            if (lab1.store[res[0]] < 3000 && global.allRes[res[0]] <= 3000 * Memory.myrooms.length) {
                room.memory.labs.fillRes = null;
                room.memory.labs.fillTargetIndex = null;
                return;
            }
            if (lab2.store[res[1]] < 3000 && global.allRes[res[1]] <= 3000 * Memory.myrooms.length) {
                room.memory.labs.fillRes = null;
                room.memory.labs.fillTargetIndex = null;
                return;
            }
            if (lab1.store[res[0]] < 3000) {
                room.memory.labs.fillTargetIndex = 1;
                room.memory.labs.fillRes = res[0]
                return;
            }
            if (lab2.store[res[1]] < 3000) {
                room.memory.labs.fillTargetIndex = 2;
                room.memory.labs.fillRes = res[1]
                return;
            }
            room.memory.labs.fillState = false;
            room.memory.labs.fillRes = null;
            room.memory.labs.fillTargetIndex = null;
        }
        if(!Memory.isNoLabCD) if (Game.time % (room.memory.index * 2 + 30) != 0) return;
        let lab0 = Game.getObjectById(room.memory.labs[0]);
        this.reaction(lab1, lab2, lab0, roomName);
        for (let i = 3; i < room.memory.labs.num; i++) {
            let target = Game.getObjectById(room.memory.labs[i]);
            this.reaction(lab1, lab2, target, roomName);
        }
    }

    public reaction(lab1: StructureLab, lab2: StructureLab, lab3: StructureLab, roomName: string) {
        if (lab3.cooldown) return;
        if (lab1.mineralType && lab2.mineralType) lab3.runReaction(lab1, lab2);
        else {
            Game.rooms[roomName].memory.labs.clear = true;
            Game.rooms[roomName].memory.labs.target = null;
        }
    }
}