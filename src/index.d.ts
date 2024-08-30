interface GlobalExtension {
	state: boolean,
	Memory: any,
	tt: {
		[roomeName: string]: {
			taskRes: ResourceConstant | null,
		}
	},
	towerTask: {
		[roomName: string]: {
			enemys: Id<Creep>[],
			injured: Id<Creep | PowerCreep>[],
			structures: Id<Structure>[]
		};
	},
	et: {
		[roomName: string]: boolean;
	},
	cc: CreepsNumConfig,
	demand: {
		[taskName: string]: {
			roomName: string,
			res: ResourceConstant,
			num: number,
			taskRoom: string,
			type: 'lab' | 'factory' | 'power' | 'nuker'
		}
	},
	observer: {
		[roomName: string]: {
			stateP: boolean,
			stateD: boolean,
			index: number,
			xp: number,
			yp: number,
			xd: number,
			yd: number
		}
	},
	roomCreeps: RoomCreeps,
	order: {
		[roomName: string]: {
			orderId: string,
			num: number,
			roomName: string,
		}
	},

	roomStructsData?: {
		roomName?: string,
		storagePos?: { x: number, y: number },
		labPos?: { x: number, y: number },
		structMap?: StructMap,
		structMaplv?: string[],
	} | null,

	allRes?: MyResource,

	getAll(): void,
	createRoomTask(taksId: number, roomName: string, targetRoom: string, role: Role, operate: string, targetStructure: STRUCTURE_STORAGE | STRUCTURE_TERMINAL, num: number, res?: ResourceConstant): void,
	clearStorage(resourceTpye?: ResourceConstant, roomName?: string): void,
	clearTerminal(resourceTpye?: ResourceConstant, roomName?: string): void,
	getRooms(): string[],
	setRI(n: string, i: number): void,
	getRI(n: string): any,
	allSend(resourceType: ResourceConstant, target: string): void,
	getStore(roomName?: string): void,
	getRoomResource(resource: ResourceConstant, roomName?: string),
	buy(resource: ResourceConstant, num: number, price: number, roomName?: string): ScreepsReturnCode,
	sell(resource: ResourceConstant, num: number, price: number, roomName?: string): ScreepsReturnCode,
	deal(orderId: string, num: number, room?: string): ScreepsReturnCode,
	send(from: string, to: string, resource: ResourceConstant, num?: number): ScreepsReturnCode,
	clearMemory(): void,
	setAutoDeal(orderId: string, num: number, roomName: string): void,
	autoDeal(roomName: string, res: ResourceConstant, limit: number, num?: number): ScreepsReturnCode,
	getHighwayFlag(): void,
	clearOrders(): void,
	createDoubleGroup(createRoom: string, targetRoom: string, targetStructure: StructureConstant, index?: number): void;
	getAvgPrice(resourceTpye: ResourceConstant, dis?: number): number,
	clearSites(): void,
	changePrice(resource: ResourceConstant, price: number): void,
	createGF(id: number, from: string, targetRoom: string, point: RoomPosition, targetStructure?: StructureConstant): void;
	createGT(id: number, from: string, targetRoom: string, point: RoomPosition, type: string, persistent: boolean, targetStructure?: StructureConstant): void;
	createS(id: number, from: string, targetRoom: string, type: string, nums?: number, sustained?: boolean, targetStructure?: StructureConstant, interval?: number): void;
	sendTask(targetRoom: string, resource: ResourceConstant, num: number, selfRoom?: string): void;
	setSellRes(roomName: string, res: ResourceConstant, price: number, interval: number, num: number): void;
	addWhiteList(username: string): void;
}

interface StructMap {
	[key: string]: [number, number][]
}

type Role =
	'harvester' |
	'builder' |
	'upgrader' |
	'carrier' |
	'filler' |
	'attacker' |
	'claimer' |
	'centerTransfer' |
	'remoteTransfer' |
	'repairer' |
	'reserver' |
	'pb_attacker' |
	'pb_healer' |
	'pb_carryer' |
	'remoteHarvester' |
	'remoteReserver' |
	'remoteCarryer' |
	'remoteAttacker' |
	'remoteAttackerT' |
	'helpBuilder' |
	'helpUpgrader' |
	'depositHarvester' |
	'defense_attacker' |
	'defense_healer' |
	'transfer' |
	'transfer2Container'

interface RoomCreeps {
	[name: string]: {
		[role: string]: Creep[]
	}
}

type RoomCreepsConfig = {
	[role in Role]?: number
}

interface CreepsNumConfig {
	[roomName: string]: RoomCreepsConfig
}

/**
 * 房间控制Memory数据格式
 */
interface RoomControlData {
	[roomName: string]: {
		// 房间布局 手动布局 | hoho布局 | dev布局 | om布局 | 自动布局 |63自动布局
		// arrange: 'man' | 'hoho' | 'dev' | 'tea' | 'auto63'

		// 中心点
		center?: [number, number]

		// 防御 [不包括防御塔]
		defend?: {
			auto?: boolean  // 是否主动防御
			range?: number   // 范围
			level?: number   // 防御等级
		}
		structMap?: string[]
		rams?: number[][]
	}
}

interface Memory {
	myrooms: string[],
	username: string,
	roomTask: RoomTask,
	GF: {
		[id: number]: {
			state: string,
			captain: string,
			from: string,
			targetRoom: string,
			point: RoomPosition,
			cross: DirectionConstant,
			targetStructure?: StructureConstant,
			aggregateState?: boolean,
		}
	},
	GD: {
		[id: number]: {
			state: string,
			from: string,
			type: string,
			targetRoom: string,
			point: RoomPosition,
			persistent: boolean,
			targetStructure?: StructureConstant,
		}
	},
	S: {
		[id: number]: {
			state: string,
			from: string,
			type: string,
			targetRoom: string,
			sustained: boolean,
			time: number,
			nums?: number,
			targetStructure?: StructureConstant,
			interval?: number
		}
	}
	boostList: {
		[roomName: string]: {
			[creepName: string]: {
				type: MineralBoostConstant,
				num: number,
			}[],
		}
	},
	RoomControlData: RoomControlData
	RoomSitesState: {
		[roomName: string]: {
			[lv: number]: boolean
		}
	},
	whiteList: string[],
	sendTask?: {
		[id: string]: {
			targetRoom: string,
			resource: ResourceConstant,
			num: number,
			selfRoom?: string
		}
	},
	memorandum?: string[],
	sellList: {
		[res: string]: {
			roomName: string,
			price: number,
			interval: number,
			num: number
		}
	},
	isNoLabCD: boolean,
	generatePixel: boolean,
	pcConfig: {
		[roomName: string]: string
	},
	market: {}
}

interface Creeps {
	[creepName: string]: Creep;
}

interface MyResource {
	[type: string]: number
}

interface CreepMemory {
	test?: number,
	role: string,
	state?: string,
	roomFrom: string,
	targetSource?: Id<Source>,
	targetMineral?: Id<Mineral>,
	targetContainer?: Id<StructureContainer>,
	taskId?: number,
	transferTargetId?: Id<AnyStructure>,
	dropId?: Id<Resource>,
	ruinId?: Id<Ruin>,
	ruinState?: boolean,
	constructionId?: Id<ConstructionSite>,
	repairTarget?: Id<AnyStructure>,
	fillLabIndex?: number,
	sourceId?: Id<Source>,
	path?: RoomPosition[],
	toStorage?: ResourceConstant,
	toTerminal?: ResourceConstant,
	FtS?: ResourceConstant,
	renewTargetId?: Id<StructureSpawn>,
	moveLock?: boolean,
	time?: number,
	moveTarget?: RoomPosition,
	hostileStructure?: Id<Structure>,
	wait?: number,
	isSetBoost?: boolean,
	carryer4State?: string,
	attackTarget?: Id<any>,
	targetPos?: RoomPosition,
	attacker?: string,
	healer?: string,
	isCreate?: boolean,
	upgradePos?: RoomPosition,
	transferState?: boolean,
	boost?: boolean
}

interface FlagMemory { }
interface RoomMemory {
	index?: number,
	sources?: {
		[id: string]: {
			harvester: string,
			link: Id<StructureLink>,
			container: Id<StructureContainer>,
			carrier: string,
			harvestPos?: RoomPosition,
			linkPos?: RoomPosition,
		}
	},
	mineral?: {
		id?: Id<Mineral>,
		type?: MineralConstant;
		harvester?: string,
		container?: Id<StructureContainer>,
		carrier?: string,
		harvestPos?: RoomPosition,
		extractor?: Id<StructureExtractor>,
	}
	factory?: {
		id?: Id<StructureFactory>,
		target?: CommodityConstant,
		taskList?: CommodityConstant[],
		lv?: number,
		demand?: ResourceConstant,
		demandQuantity?: number,
	},
	labs?: {
		[index: number]: Id<StructureLab>,
		target?: MineralCompoundConstant,
		clear?: boolean,
		fillState?: boolean,
		fillTargetIndex?: number,
		fillRes?: MineralConstant | MineralCompoundConstant,
		boostType?: string,
		creepName?: string,
		num?: number,
	}
	observer?: {
		id?: Id<StructureObserver>,
		targets?: string[],
		interval?: number,
		index?: number
	}
	unboostContainer?: Id<StructureContainer>,
	unboostContainerPos?: RoomPosition,
	spawns?: string[],
	towers?: Id<StructureTower>[],
	wallHits?: number,
	autoRampart?: boolean,
	lastRepairTick?: number,
	centerLinkId?: Id<StructureLink>,
	controllerLinkPos?: RoomPosition,
	controllerLinkId?: Id<StructureLink>,
	controllerContainerId?: Id<StructureContainer>[],
	powerSpawnId?: Id<StructurePowerSpawn>,
	ignoreRoom?: string[],
	ruinState?: boolean,
	ruinEnergyState?: boolean,
	customRampartSites?: RoomPosition[],
	energyOrder?: string,	// 能量购买订单
	nuker: Id<StructureNuker>,
}
interface RoomTask {
	[roomName: string]: {
		[id: number]: {
			role: Role,
			roomName: string,
			targetRoom: string,
			targetRes?: ResourceConstant,
			targetStructure: STRUCTURE_STORAGE | STRUCTURE_TERMINAL
			operate: string,
			num: number
		}
	}
}
type Bar = {
	[type in MineralConstant]: CommodityConstant;
};

interface PowerCreepMemory extends CreepMemory {
	currentTask: string,
	task: {
		[id: string]: {
			taskName: string,
			time: number,
			opsNum: number,
			targetId?: string,
		}
	}
}
interface SpawnMemory { }

interface Creep {
	customMove(target: RoomPosition, range?: number, ignoreCreep?: boolean, flee?: boolean, gf?: boolean): ScreepsReturnCode
}

interface PowerCreep {
	customMove(target: RoomPosition, range?: number, ignoreCreep?: boolean, flee?: boolean, gf?: boolean): ScreepsReturnCode
}

// 本项目中出现的颜色常量
type Colors = 'green' | 'blue' | 'yellow' | 'red'

interface PowerCreepMemory extends CreepMemory { }

type MineralCompounds = {
	[compounds in MineralCompoundConstant]: (MineralConstant | MineralCompoundConstant)[]
}

/**
* bodySet
* 简写版本的 bodyPart[]
* 形式如下
* @example { [TOUGH]: 3, [WORK]: 4, [MOVE]: 7 }
*/
interface BodySet {
	[MOVE]?: number
	[CARRY]?: number
	[ATTACK]?: number
	[RANGED_ATTACK]?: number
	[WORK]?: number
	[CLAIM]?: number
	[TOUGH]?: number
	[HEAL]?: number
}

/**
 * 身体配置项类别
 * 包含了所有角色类型的身体配置
 */
type BodyConfigs = {
	[type in BodyAutoConfigConstant]: BodyConfig
}

type BodyConfig = {
	[energyLevel in 300 | 550 | 800 | 1300 | 1800 | 2300 | 5300 | 10000]: BodyPartConstant[]
}

type BodyAutoConfigConstant =
	'harvester' |
	'builder' |
	'upgrader' |
	'carrier' |
	'filler' |
	'attacker' |
	'centerTransfer' |
	'claimer' |
	'remoteTransfer' |
	'repairer' |
	'reserver' |
	'pb_attacker' |
	'pb_healer' |
	'pb_carryer' |
	'remoteHarvester' |
	'remoteReserver' |
	'remoteCarryer' |
	'remoteAttacker' |
	'remoteAttackerT' |
	'helpBuilder' |
	'helpUpgrader' |
	'depositHarvester' |
	'defense_attacker' |
	'defense_healer' |
	'transfer' |
	'transfer2Container'