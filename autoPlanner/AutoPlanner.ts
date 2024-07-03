import Singleton from "@/Singleton";

const autoPlanner = require('autoPlanner');
export default class AutoPlanner extends Singleton {
    public run() {
        let flag = Game.flags['LayoutVisual63'] as any;
        /* storagePos 可以手动定位中心点 */
        var p = Game.flags.p;
        var pa = Game.flags.pa;
        var pb = Game.flags.pb;
        var pc = Game.flags.pc;
        var pm = Game.flags.pm;
        if (p) {
            global.roomStructsData = autoPlanner.ManagerPlanner.computeManor(p.pos.roomName, [pc, pm, pa, pb])
            Game.flags.p.remove()
            global.roomStructsData.structMaplv = [];/*进行数据清空的操作*/
        }
        if (flag) {
            if (global.roomStructsData) {
                if (Game.flags._dayin) {
                    console.log(JSON.stringify(global.roomStructsData))
                    Game.flags._dayin.remove();
                }
                let ret = {
                    structMap: global.roomStructsData.structMap
                };
                let _add_lv_state = false;
                if (global.roomStructsData.structMaplv?.length < 1) {
                    _add_lv_state = true;
                }
                for (let level = 1; level <= 8; level++) {
                    for (let type in CONTROLLER_STRUCTURES) {
                        let lim = CONTROLLER_STRUCTURES[type]
                        if (type == 'road') {
                            if (level == 4) {
                                for (let i = 0; i < ret.structMap[type].length; i++) {
                                    let e = ret.structMap[type][i]
                                    if (_add_lv_state) {
                                        global.roomStructsData.structMaplv.push(`${e[0]}/${e[1]}/${type}/${level}`)
                                    }
                                    new RoomVisual(flag.pos.roomName as string).text(level.toString(), e[0] + 0.3, e[1] + 0.5, { font: 0.4, opacity: 0.8 })
                                }
                            }
                        } else {
                            for (let i = lim[level - 1]; i < Math.min(ret.structMap[type].length, lim[level]); i++) {
                                let e = ret.structMap[type][i]
                                if (type != 'rampart') {
                                    if (_add_lv_state) {
                                        global.roomStructsData.structMaplv.push(`${e[0]}/${e[1]}/${type}/${level}`)
                                    }
                                    // {x: -4, y: -3,structureType:'extension',level:2}
                                    new RoomVisual(flag.pos.roomName as string).text(level.toString(), e[0] + 0.3, e[1] + 0.5, { font: 0.4, opacity: 0.8 })
                                }
                            }
                        }

                    }
                }
                if (Game.flags.savestructMap) {
                    if (!Memory.RoomControlData) Memory.RoomControlData = {}
                    if (!Memory.RoomControlData[flag.pos.roomName]) Memory.RoomControlData[flag.pos.roomName] = {}
                    if (Memory.RoomControlData[flag.pos.roomName]) {
                        Memory.RoomControlData[flag.pos.roomName].structMap = global.roomStructsData.structMaplv
                        Memory.RoomControlData[flag.pos.roomName].rams = global.roomStructsData.structMap.rampart;
                        console.log(global.roomStructsData.structMap.rampart)
                        Game.flags.savestructMap.remove();
                        console.log(`[LayoutVisual63] 房间${flag.pos.roomName}63布局已经刷新`)
                    }
                }

                //这个有点消耗cpu 不看的时候记得关
                if (flag) {
                    autoPlanner.HelperVisual.showRoomStructures(global.roomStructsData.roomName, global.roomStructsData.structMap)
                }
            }
        }
        if (Game.flags['showRam']) {
            this.showRam();
        }
    }

    // 大概消耗1 CPU！ 慎用！
    public showRam() {
        let roomName = Game.flags['showRam'].room.name;
        const visual = new RoomVisual(roomName);
        let ramArr = Memory.RoomControlData[roomName].rams;
        ramArr.forEach(e => visual.text("⊙", e[0], e[1] + 0.25, { color: "#003fff", opacity: 0.75 }))
    }

    public checkStructure(roomName: string) {

    }

    public checkSites(roomName: string) {
        if (!Memory.RoomControlData) return;
        if (!Memory.RoomControlData[roomName]) return;
        if (!Memory.RoomSitesState) Memory.RoomSitesState = {};
        if (!Memory.RoomSitesState[roomName]) Memory.RoomSitesState[roomName] = {};
        for (let i = 1; i <= Game.rooms[roomName].controller.level; i++) {
            if (!Memory.RoomSitesState[roomName][i]) {
                this._createSites(roomName, i);
                Object.values(Game.creeps).filter(e => {
                    if (e.room.name == roomName) e.memory.path = [];
                })
            }
        }
    }

    private _createSites(roomName: string, lv: number) {
        if (Memory.RoomControlData && Memory.RoomControlData[roomName]?.structMap) {
            let data = Memory.RoomControlData[roomName].structMap.filter(e => e.split('').reverse().join('')[0] == lv.toString())
            if (100 - Object.keys(Game.constructionSites).length < data.length) return;
            data.forEach(e => {
                let strArr = e.split('/');
                Game.rooms[roomName].createConstructionSite(+strArr[0], +strArr[1], strArr[2] as BuildableStructureConstant);
            })
        }
        Memory.RoomSitesState[roomName][lv] = true;
    }

    public checkRampart(roomName: string) {
        let room = Game.rooms[roomName];
        let flag = Game.flags[`${roomName}_ram`];
        if (room.memory.customRampartSites == void 0) room.memory.customRampartSites = [];
        if (room.memory.wallHits == void 0) room.memory.wallHits = 20000;
        if (flag) {
            let ram_sites = room.find(FIND_CONSTRUCTION_SITES, {
                filter: s => s.structureType == STRUCTURE_RAMPART
            }).map(e => e.pos);
            if (!ram_sites.length) {
                let rams = Memory.RoomControlData[roomName].rams.map(e => {
                    let [x, y] = e;
                    return new RoomPosition(x, y, roomName);
                })
                room.memory.customRampartSites = room.memory.customRampartSites.concat(rams);
            } else room.memory.customRampartSites = room.memory.customRampartSites.concat(ram_sites);
            flag.remove();
        }
        if (room.terminal) {
            if (room.memory.autoRampart === void 0 && !room.memory.customRampartSites.length) {
                if (Memory.RoomControlData[roomName].structMap.map(e => e.split("/")).filter(e => e[2] == "extension").length == 60) {
                    room.memory.autoRampart = true;
                } else room.memory.autoRampart = false;
                if (room.memory.autoRampart) {
                    let rams = Memory.RoomControlData[roomName].rams.map(e => {
                        let [x, y] = e;
                        return new RoomPosition(x, y, roomName);
                    })
                    room.memory.customRampartSites = room.memory.customRampartSites.concat(rams);
                    console.log(roomName, "刷墙启动");
                }
            }
        }

        if (room.memory.lastRepairTick) {
            if (Game.time - room.memory.lastRepairTick > 1000000) {
                room.memory.wallHits -= 20000;
                room.memory.lastRepairTick = null;
            }
        }
        if (room.memory.customRampartSites.length && room.storage?.store.energy > 100000 && room.memory.wallHits < 300000000) global.cc[roomName].repairer = 1;
        else global.cc[roomName].repairer = 0;
    }
}