import Singleton from '@/Singleton';
import { PC } from '@/indexManager';

interface Detail {
    level?: number | undefined;
    amount: number;
    cooldown: number;
    components: Record<DepositConstant | CommodityConstant | MineralConstant | RESOURCE_ENERGY | RESOURCE_GHODIUM, number>;
}

export default class Factory extends Singleton {
    private ConstantNum = {
        default: 20000,
        battery: 20000,
        switch: 100,
        phlegm: 100,
        tube: 100,
        concentrate: 100,
        transistor: 20,
        tissue: 20,
        fixtures: 20,
        extract: 20,
        microchip: 10,
        muscle: 10,
        frame: 10,
        spirit: 10,
        circuit: 10,
        organoid: 10,
        hydraulics: 10,
        emanation: 10
    }
    public static productCatalog: {
        [lv: number]: CommodityConstant[]
    } = {
            0: ["battery", "utrium_bar", "lemergium_bar", "zynthium_bar", "keanium_bar", "oxidant", "reductant", "purifier", "ghodium_melt", "wire", "cell", "alloy", "condensate"],
            1: ["composite", "switch", "phlegm", "tube", "concentrate"],
            2: ["crystal", "transistor", "tissue", "fixtures", "extract"],
            3: ["liquid", "microchip", "muscle", "frame", "spirit"],
            4: ["circuit", "organoid", "hydraulics", "emanation"],
            5: ["device", "organism", "machine", "essence"],
        }
    public static getMaterials(product: CommodityConstant): Detail {
        if (!product) return {} as Detail;
        return COMMODITIES[product];
    }

    public static bar = ["utrium_bar", "lemergium_bar", "zynthium_bar", "keanium_bar", "oxidant", "reductant", "purifier", "ghodium_melt"];

    setTask(roomName: string) {
        let room = Game.rooms[roomName];
        let lv = room.memory.factory.lv || 0;
        let arr: {
            res: CommodityConstant,
            num: number,
        }[] = [];
        let products = Factory.productCatalog[lv];
        products.forEach(e => {
            arr.push({ res: e as CommodityConstant, num: global.allRes[e] ?? 0 });
        })
        arr.sort((a, b) => {
            return a.num - b.num;
        });
        for (let i = 0; i < arr.length; i++) {
            if ((arr[i].num < (this.ConstantNum[arr[i].res] || this.ConstantNum.default))) {
                let detail = Factory.getMaterials(arr[i].res);
                let resources = detail.components;
                let resourceKeys = Object.keys(resources);
                let state = resourceKeys.every(e => (global.allRes[e] || 0) > ((lv == 0 && Factory.bar.includes(arr[i].res)) ? 45000 : resources[e] * 2));
                if (state) {
                    room.memory.factory.demand = null;
                    room.memory.factory.target = arr[i].res;
                    return;
                }
            }
        }
        room.memory.factory.target = null;
    }

    run(roomName: string) {
        let room = Game.rooms[roomName];
        if (room.controller.level < 8) return;
        let factory = Game.getObjectById(room.memory.factory?.id);
        if (!factory) return;
        if (factory.cooldown) return;
        if (Game.time % (room.memory.index * 2 + 10) == 0) this.setTask(roomName);
        let target = room.memory.factory.target;
        if (target) {
            let detail = Factory.getMaterials(target);
            let resources = detail.components;
            let lv = detail.level;

            let resourceKeys = Object.keys(resources);
            if (!room.memory.factory.demand) {
                for (let i = 0; i < resourceKeys.length; i++) {
                    let res = resourceKeys[i]
                    if (factory.store[res] < resources[res]) {
                        room.memory.factory.demand = res as ResourceConstant;
                        room.memory.factory.demandQuantity = resources[res];
                        return;
                    }
                }
                if (lv && (!factory.effects || factory.effects.length == 0)) {
                    PC.addPCTask(roomName, PC.PCTaskName.operate_factory, 100);
                    return;
                }
                factory.produce(target);
            } else {
                if (factory.store[room.memory.factory.demand] >= resources[room.memory.factory.demand]) room.memory.factory.demand = null;
            };
        }
    }
}