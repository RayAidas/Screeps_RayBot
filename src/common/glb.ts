import { colorful, colorHex, format, getColor } from "@/common/utils";
import Singleton from "@/Singleton";

export default class Glb extends Singleton {
	public initGlobal() {
		global.getAll = this._getAll;
		global.createRoomTask = this._createRoomTask;
		global.setRI = this._setRoomIndex;
		global.getRI = this._getRoomIndex;
		global.allSend = this._allSend;
		global.getStore = this._getStore;
		global.getRoomResource = this._getRoomResource;
		global.buy = this._buy;
		global.sell = this._sell;
		global.deal = this._deal;
		global.send = this._send;
		global.clearMemory = this._clearMemory;
		global.setAutoDeal = this._setAutoDeal;
		global.autoDeal = this._autoDeal;
		global.getHighwayFlag = this._getHighwayFlag;
		global.clearOrders = this._clearOrders;
		global.getAvgPrice = this._getAvgPrice;
		global.clearSites = this._clearSites;
		global.changePrice = this._changePrice;
		global.createGF = this._createGF;
		global.createGT = this._createGT;
		global.createL = this._createL;
		global.sendTask = this._sendTask;
		global.setSellRes = this._setSellRes;
		global.addWhiteList = this._addWhiteList;
	}

	private _setSellRes(roomName: string, res: ResourceConstant, price: number, interval: number, num: number) {
		if (!Memory.sellList) {
			Memory.sellList = {};
		}
		Memory.sellList[res] = {
			roomName: roomName,
			price: price,
			interval: interval,
			num: num
		}
	};

	public _sendTask(target: string, resoruce: ResourceConstant, num: number, selfRoom?: string) {
		if (!Memory.sendTask) Memory.sendTask = {}
		let id = `${target}${resoruce}${num}`;
		if (!Memory.sendTask[id]) {
			Memory.sendTask[id] = {
				targetRoom: target,
				resource: resoruce,
				num: num,
				selfRoom: selfRoom
			}
			console.log(JSON.stringify(Memory.sendTask[id]))
		} else console.log("该任务已存在");
	}

	public static getAllRes() {
		let rooms = Memory.myrooms;
		let allRes: MyResource = {}
		for (let i = 0; i < rooms.length; i++) {
			let storage = Game.rooms[rooms[i]].storage;
			let terminal = Game.rooms[rooms[i]].terminal;
			// let factory: StructureFactory = Game.getObjectById(Game.rooms[rooms[i]].memory.factory?.id);
			if (storage) {
				let types = Object.keys(storage.store);
				for (let j = 0; j < types.length; j++) {
					if (allRes[types[j]]) allRes[types[j]] += storage.store[types[j]];
					else allRes[types[j]] = storage.store[types[j]];
				}
			}
			if (terminal) {
				let types = Object.keys(terminal.store);
				for (let j = 0; j < types.length; j++) {
					if (allRes[types[j]]) allRes[types[j]] += terminal.store[types[j]];
					else allRes[types[j]] = terminal.store[types[j]];
				}
			}
			// if (factory) {
			// 	let types = Object.keys(factory.store);
			// 	for (let j = 0; j < types.length; j++) {
			// 		if (allRes[types[j]]) allRes[types[j]] += factory.store[types[j]];
			// 		else allRes[types[j]] = factory.store[types[j]];
			// 	}
			// }
		}
		return allRes;
	}

	/**
	 * 获取所有房间 terminal storage factory 中的资源数量
	 * @returns string
	 */
	private _getAll() {
		let time = Game.cpu.getUsed()
		let all = Glb.getAllRes(); // 这里是资源
		global.allRes = all;
		let base = [RESOURCE_ENERGY, "U", "L", "K", "Z", "X", "O", "H", RESOURCE_POWER, RESOURCE_OPS]
		// 压缩列表
		let bars = [RESOURCE_BATTERY, RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_ZYNTHIUM_BAR, RESOURCE_PURIFIER, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_GHODIUM_MELT]
		// 商品
		let c_grey = [RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID]
		let c_blue = [RESOURCE_DEVICE, RESOURCE_CIRCUIT, RESOURCE_MICROCHIP, RESOURCE_TRANSISTOR, RESOURCE_SWITCH, RESOURCE_WIRE, RESOURCE_SILICON].reverse()
		let c_yellow = [RESOURCE_MACHINE, RESOURCE_HYDRAULICS, RESOURCE_FRAME, RESOURCE_FIXTURES, RESOURCE_TUBE, RESOURCE_ALLOY, RESOURCE_METAL].reverse()
		let c_pink = [RESOURCE_ESSENCE, RESOURCE_EMANATION, RESOURCE_SPIRIT, RESOURCE_EXTRACT, RESOURCE_CONCENTRATE, RESOURCE_CONDENSATE, RESOURCE_MIST].reverse()
		let c_green = [RESOURCE_ORGANISM, RESOURCE_ORGANOID, RESOURCE_MUSCLE, RESOURCE_TISSUE, RESOURCE_PHLEGM, RESOURCE_CELL, RESOURCE_BIOMASS].reverse()
		// boost
		let b_grey = ["OH", "ZK", "UL", "G"]
		let gent = (r) => [r + "H", r + "H2O", "X" + r + "H2O", r + "O", r + "HO2", "X" + r + "HO2"]
		let b_blue = gent("U")
		let b_yellow = gent("Z")
		let b_pink = gent("K")
		let b_green = gent("L")
		let b_withe = gent("G")


		let formatNumber = function (n) {
			var b = parseInt(n).toString();
			var len = b.length;
			if (len <= 3) { return b; }
			var r = len % 3;
			return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
		}
		let str = ""
		// let arr = t.map(v=>+":"+_.padLeft(formatNumber(v[1]),10))
		let colorMap = {
			[RESOURCE_ENERGY]: "rgb(255,242,0)",
			"Z": "rgb(247, 212, 146)",
			"L": "rgb(108, 240, 169)",
			"U": "rgb(76, 167, 229)",
			"K": "rgb(218, 107, 245)",
			"X": "rgb(255, 192, 203)",
			"G": "rgb(255,255,255)",
			[RESOURCE_BATTERY]: "rgb(255,242,0)",
			[RESOURCE_ZYNTHIUM_BAR]: "rgb(247, 212, 146)",
			[RESOURCE_LEMERGIUM_BAR]: "rgb(108, 240, 169)",
			[RESOURCE_UTRIUM_BAR]: "rgb(76, 167, 229)",
			[RESOURCE_KEANIUM_BAR]: "rgb(218, 107, 245)",
			[RESOURCE_PURIFIER]: "rgb(255, 192, 203)",
			[RESOURCE_GHODIUM_MELT]: "rgb(255,255,255)",
			[RESOURCE_POWER]: "rgb(224,90,90)",
			[RESOURCE_OPS]: "rgb(224,90,90)",
		}
		let addList = function (list, color?) {
			let uniqueColor = function (str, resType) {
				if (colorMap[resType]) str = "<font style='color: " + colorMap[resType] + ";'>" + str + "</font>"
				return str
			}
			if (color) str += "<div style='color: " + color + ";'>"
			list.forEach(e => str += uniqueColor(_.padLeft(e, 15), e)); str += "<br>";
			list.forEach(e => str += uniqueColor(_.padLeft(formatNumber(all[e] || 0), 15), e)); str += "<br>";
			if (color) str += "</div>"
		}
		str += "<br>基础资源:<br>"
		// addList(base2)
		addList(base)
		str += "<br>压缩资源:<br>"
		addList(bars)
		str += "<br>商品资源:<br>"
		addList(c_grey)
		addList(c_blue, "rgb(76, 167, 229)")
		addList(c_yellow, "rgb(247, 212, 146)")
		addList(c_pink, "rgb(218, 107, 245)")
		addList(c_green, "rgb(108, 240, 169)")
		str += "<br>LAB资源:<br>"
		addList(b_grey)
		addList(b_blue, "rgb(76, 167, 229)")
		addList(b_yellow, "rgb(247, 212, 146)")
		addList(b_pink, "rgb(218, 107, 245)")
		addList(b_green, "rgb(108, 240, 169)")
		addList(b_withe, "rgb(255,255,255)")
		console.log(str)

		return "Game.cpu.used:" + (Game.cpu.getUsed() - time)


		// let sortRes = allTypes.sort((a, b) => {
		//   return a.length - b.length;
		// });



		// let newArr: string[][] = [];
		// for (let i = 0; i < 8; i++) {
		//   newArr[i] = [];
		// }
		// for (let i = 0; i < sortRes.length; i++) {
		//   newArr[i % 8].push(sortRes[i])
		// }

		// for (let i = 0; i < newArr.length; i++) {
		//   let str: string = '';
		//   for (let j = 0; j < newArr[i].length; j++) {
		//     str += newArr[i][j] + ': ' + format(allRes[newArr[i][j]]) + ' '
		//     let space = 20 * (j + 1) - str.length;
		//     for (let k = 0; k < space; k++) {
		//       str += ' '
		//     }
		//   }
		//   console.log(str)
		// }

	}

	// /**
	//  * 清空lab
	//  * @param roomName 
	//  */
	// private _clearLabs(roomName?: string) {
	// 	if (roomName) {
	// 		global.lt[roomName].clear = true;
	// 	} else {
	// 		for (let room in global.lt) {
	// 			global.lt[room].clear = true;
	// 		}
	// 	}
	// }

	/**
//  *  获取lab目标产物
//  * @param roomName 
//  * @returns 
//  */
	// 	private _getCompoundConstant(roomName: string): MineralCompoundConstant {
	// 		return Game.rooms[roomName].memory['compound'];
	// 	}

	// /**
	// * 存储lab目标产物
	// * @param roomName 
	// * @param compound 
	// */
	// private _setCompoundConstant(roomName: string, compound: MineralCompoundConstant) {
	// 	Game.rooms[roomName].memory['compound'] = compound;
	// 	if (!compound) {
	// 		Game.rooms[roomName].memory['resource_type1'] = null;
	// 		Game.rooms[roomName].memory['resource_type2'] = null;
	// 		global.lt[roomName].resource_type1 = null;
	// 		global.lt[roomName].resource_type2 = null;
	// 		global.lt[roomName].state = false;
	// 	} else {
	// 		global.lt[roomName].state = true;
	// 	}
	// 	global.lt[roomName].clear = true;
	// }

	/**
	 * 设置房间索引
	 * @param roomName 
	 * @param index 
	 */
	private _setRoomIndex(roomName: string, index: number) {
		Game.rooms[roomName].memory['index'] = index;
	}

	/**
	 * 获取房间索引
	 * @param roomName 
	 * @returns 
	 */
	private _getRoomIndex(roomName: string) {
		return Game.rooms[roomName].memory['index'];
	}

	/**
	 * 
	 * @param res 
	 * @param target 
	 */
	private _allSend(res: ResourceConstant, target: string) {
		let rooms: string[] = Memory['myrooms'];
		for (let i = 0; i < rooms.length; i++) {
			if (rooms[i] == target) continue;
			let room = Game.rooms[rooms[i]]
			let num = room.terminal?.store[res] || 0;
			global.send(room.name, target, res, num);
		}
	}

	/**
	 * 获取房间资源存储状态
	 * @param roomName 
	 */
	private _getStore(roomName?: string) {
		if (roomName) {
			let storage = Game.rooms[roomName].storage;
			let terminal = Game.rooms[roomName].terminal;
			let factory = Game.getObjectById(Game.rooms[roomName].memory.factory.id);
			let storageUsed = storage?.store.getUsedCapacity() || 0;
			let storeCapacity = storage?.store.getCapacity() || 1;
			let storageProportion = (storageUsed / storeCapacity * 100).toFixed(2) + '%';
			let storageColor = colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100)));
			let terminalUsed = terminal?.store.getUsedCapacity() || 0;
			let terminalCapacity = terminal?.store.getCapacity() || 1;
			let terminalProportion = (terminalUsed / terminalCapacity * 100).toFixed(2) + '%';
			let terminalColor = colorHex(getColor(Math.ceil(terminalUsed / terminalCapacity * 100)));
			let factoryUsed = factory?.store.getUsedCapacity() || 0;
			let factoryCapacity = factory?.store.getCapacity() || 1;
			let factoryProportion = (factoryUsed / factoryCapacity * 100).toFixed(2) + '%';
			let factoryColor = colorHex(getColor(Math.ceil(factoryUsed / factoryCapacity * 100)));
			console.log(colorful(roomName, 'blue'),
				'Storage:', colorful(storageProportion, storageColor), ' ',
				'Terminal', colorful(terminalProportion, terminalColor), ' ',
				'Factory', colorful(factoryProportion, factoryColor));
		} else {
			let rooms: string[] = Memory.myrooms;
			for (let i = 0; i < rooms.length; i++) {
				let storage = Game.rooms[rooms[i]].storage;
				let terminal = Game.rooms[rooms[i]].terminal;
				let factory = Game.getObjectById(Game.rooms[rooms[i]].memory.factory.id);
				let storageUsed = storage?.store.getUsedCapacity() || 0;
				let storeCapacity = storage?.store.getCapacity() || 1;
				let storageProportion = (storageUsed / storeCapacity * 100).toFixed(2) + '%';
				let storageColor = colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100)));
				let terminalUsed = terminal?.store.getUsedCapacity() || 0;
				let terminalCapacity = terminal?.store.getCapacity() || 1;
				let terminalProportion = (terminalUsed / terminalCapacity * 100).toFixed(2) + '%';
				let terminalColor = colorHex(getColor(Math.ceil(terminalUsed / terminalCapacity * 100)));
				let factoryUsed = factory?.store.getUsedCapacity() || 0;
				let factoryCapacity = factory?.store.getCapacity() || 1;
				let factoryProportion = (factoryUsed / factoryCapacity * 100).toFixed(2) + '%';
				let factoryColor = colorHex(getColor(Math.ceil(factoryUsed / factoryCapacity * 100)));
				console.log(colorful(rooms[i], 'blue'),
					'Storage:', colorful(storageProportion, storageColor), ' ',
					'Terminal', colorful(terminalProportion, terminalColor), ' ',
					'Factory', colorful(factoryProportion, factoryColor));
			}
		}
	}

	private _getRoomResource(resource: ResourceConstant, roomName?: string) {
		if (roomName) {
			let storageNum = Game.rooms[roomName].storage?.store[resource] || 0;
			let terminalNum = Game.rooms[roomName].terminal?.store[resource] || 0;
			let factoryNum = Game.getObjectById(Game.rooms[roomName].memory.factory.id)?.store[resource] || 0;
			let amount = storageNum + terminalNum + factoryNum;
			console.log(colorful(roomName, 'blue'),
				`Storage-${resource}:`, format(storageNum), ' ',
				`Terminal-${resource}:`, format(terminalNum), ' ',
				`Factory-${resource}:`, format(factoryNum), ' ',
				'amount:', format(amount));
		} else {
			//TODO 左对齐
			let rooms: string[] = Memory.myrooms;
			for (let i = 0; i < rooms.length; i++) {
				let storageNum = Game.rooms[rooms[i]].storage?.store[resource] || 0;
				let terminalNum = Game.rooms[rooms[i]].terminal?.store[resource] || 0;
				let factoryNum = Game.getObjectById(Game.rooms[rooms[i]].memory.factory.id)?.store[resource] || 0;
				let amount = storageNum + terminalNum + factoryNum;
				console.log(colorful(rooms[i], 'blue'),
					`Storage-${resource}:`, format(storageNum), ' ',
					`Terminal-${resource}:`, format(terminalNum), ' ',
					`Factory-${resource}:`, format(factoryNum), ' ',
					'amount:', format(amount));
			}
		}
	}

	private _buy(resource: ResourceConstant, num: number, price: number, roomName?: string): ScreepsReturnCode {
		return Game.market.createOrder({
			type: ORDER_BUY,
			resourceType: resource,
			price: price,
			totalAmount: num,
			roomName: roomName
		});
	}

	private _sell(resource: ResourceConstant, num: number, price: number, roomName?: string): ScreepsReturnCode {
		return Game.market.createOrder({
			type: ORDER_SELL,
			resourceType: resource,
			price: price,
			totalAmount: num,
			roomName: roomName
		});
	}

	private _deal(orderId: string, num: number, room?: string): ScreepsReturnCode {
		return Game.market.deal(orderId, num, room)
	}

	private _send(from: string, to: string, resource: ResourceConstant, num?: number): ScreepsReturnCode {
		let terminal = Game.rooms[from].terminal;
		let amount = num ? num : terminal.store[resource];
		let res = terminal?.send(resource, amount, to);
		let cost = Game.market.calcTransactionCost(amount, from, to);
		if (res == OK) console.log(colorful(terminal.room.name, 'blue'), `send ${num ? num : terminal.store[resource]} ${resource} to`, colorful(to, 'blue'), colorful(`消耗:${cost}`, 'red'));
		return res;
	}

	private _clearMemory() {
		for (let name in Memory.rooms) {
			if (!Game.rooms[name]) delete Memory.rooms[name];
			else {
				delete Memory.rooms[name]['roads'];
				delete Memory.rooms[name]['ramparts'];
			}
		}
	}

	private _setAutoDeal(orderId: string, num: number, roomName: string) {
		global.order[roomName] = {
			orderId: orderId,
			num: num,
			roomName: roomName
		}
	}

	// TODO 获取deposit 和 power bank 的 flag
	private _getHighwayFlag() {
		let rooms: string[] = Memory['myrooms'];
		for (let i = 0; i < rooms.length; i++) {
			let pbF = Game.flags[`PB_${rooms[i]}`];
			let depoF = Game.flags[`D_${rooms[i]}`];
			if (pbF) console.log(colorful('PowerBank', 'blue'), pbF.pos.roomName);
			if (depoF) console.log(colorful('Deposit', 'blue'), depoF.pos.roomName);
		}
	}

	private _clearOrders() {
		Object.values(Game.market.orders).filter((order) => {
			if (order.remainingAmount == 0) Game.market.cancelOrder(order.id)
		})
	}

	private _autoDeal(roomName: string, res: ResourceConstant, limit: number, num: number = 10000) {
		if (Game.rooms[roomName].terminal?.cooldown) return;
		const checkRoomName = (roomName: string) => {
			let reg = /[0-9][0-9]*/g;
			let arr = roomName.match(reg).map(e => Number(e));
			let max = Math.max(...arr);
			if (max > 70) return false;
			else return true;
		}
		let orders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: res })
			.filter(order => order.price < limit && order.amount > 0 && checkRoomName(order.roomName))
			.sort((a, b) => a.price - b.price)
		if (orders.length == 0) return;
		if (orders[0].amount < num) num = orders[0].amount;
		let order = Game.market.deal(orders[0].id, num, roomName);
		let price = orders[0].price * num;
		console.log(colorful(roomName, 'blue'), `buy ${num} ${res}`, order == 0 ? colorful('购买成功', 'green') : colorful('购买失败', 'red'));
		console.log(colorful(`花费:${price}`, 'red'));
		return order;
	}

	private _getAvgPrice(resourceType: ResourceConstant, dis: number = 0): number {
		let list = Game.market.getHistory(resourceType);
		let avgPrice = list.map(e => e.avgPrice)
			.reduce((pre, cur) => {
				return pre + cur
			}) / list.length;
		let finalPrice = Number(avgPrice.toFixed(2)) + dis;
		return finalPrice;
	}

	private _clearSites() {
		for (let id in Game.constructionSites) {
			Game.constructionSites[id].remove();
		}
	}

	private _changePrice(resource: ResourceConstant, price: number) {
		Object.values(Game.market.orders).filter(
			(order) => order.resourceType == resource && order.remainingAmount > 0
		).forEach(o => Game.market.changeOrderPrice(o.id, price))
	}

	private _createGF(id: number, from: string, targetRoom: string, point: RoomPosition, targetStructure: StructureConstant = null) {
		// App.groupF.create(id, from, targetRoom, point, targetStructure);
	}

	private _createGT(id: number, from: string, targetRoom: string, point: RoomPosition, type: string, persistent: boolean, targetStructure: StructureConstant = null) {
		// App.group.create(id, from, targetRoom, point, type, persistent, targetStructure);
	}

	private _createL(id: number, from: string, targetRoom: string, type: string, persistent: boolean = false, nums: number = 0, targetStructure: StructureConstant = null, time: boolean = false) {
		// App.loner.create(id, from, targetRoom, type, persistent, nums, targetStructure, time);
	};

	private _createRoomTask(taksId: number, roomName: string, targetRoom: string, role: Role, operate: string, targetStructure: STRUCTURE_STORAGE | STRUCTURE_TERMINAL, num: number, res?: ResourceConstant) {
		if (!Memory.roomTask) Memory.roomTask = {};
		if (!Memory.roomTask[roomName]) Memory.roomTask[roomName] = {};
		Memory.roomTask[roomName][taksId] = {
			role: role,
			roomName: roomName,
			targetRoom: targetRoom,
			targetRes: res,
			operate: operate,
			targetStructure: targetStructure,
			num: num
		}
		global.cc[roomName][role] = num;

	}

	private _addWhiteList(username: string) {
		if (!Memory.whiteList) Memory.whiteList = [];
		Memory.whiteList.push(username);
	}
}