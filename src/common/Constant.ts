import { calcBodyPart } from "./utils";

export const Role = {
  Harvester: 'harvester',
  Carrier: 'carrier',
  Builder: 'builder',
  Upgrader: 'upgrader',
  Filler: 'filler',
  Claimer: 'claimer',
  CenterTransfer: 'centerTransfer',
  RemoteTransfer: 'remoteTransfer',
  Attacker: 'attacker',
  Repairer: 'repairer',
  S: 'S',
  RemoteHarvester: 'remoteHarvester',
  RemoteReserver: 'remoteReserver',
  RemoteCarryer: 'remoteCarryer',
  RemoteAttacker: 'remoteAttacker',
  RemoteAttackerT: 'remoteAttackerT',
  Reserver: 'reserver',
  HelpBuilder: 'helpBuilder',
  HelpUpgrader: 'helpUpgrader',
  DepositHarvester: 'depositHarvester',
  PB_Healer: 'pb_healer',
  PB_Attacker: 'pb_attacker',
  PB_Carryer: 'pb_carryer',
  Defense_Healer: 'defense_healer',
  Defense_Attacker: 'defense_attacker',
  GF: 'GF',
  GT: 'GT',
  Transfer: 'transfer',
  Transfer2Container: 'transfer2Container',
}

export const GroupState = {
  idle: 'Idle',
  move: 'Move',
  aggregate: 'Aggregate',
}

export const compound: MineralCompounds = {
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

export const bar: Bar = {
  'H': 'reductant',
  'K': 'keanium_bar',
  'L': 'lemergium_bar',
  'O': 'oxidant',
  'U': 'utrium_bar',
  'X': 'purifier',
  'Z': 'zynthium_bar'
}

export const RoleNum: {
  [lv: number]: {
    [role: string]: number
  }
} = {
  1: {
    [Role.Builder]: 4,
    [Role.Upgrader]: 4
  },
  2: {
    [Role.Builder]: 4,
    [Role.Upgrader]: 4
  },
  3: {
    [Role.Builder]: 4,
    [Role.Upgrader]: 10
  },
  4: {
    [Role.Builder]: 1,
    [Role.Upgrader]: 1,
    [Role.Filler]: 1,
  },
  5: {
    [Role.Builder]: 1,
    [Role.Upgrader]: 1,
    [Role.Filler]: 1,
    [Role.CenterTransfer]: 1,
  },
  6: {
    [Role.Builder]: 1,
    [Role.Upgrader]: 1,
    [Role.Filler]: 1,
    [Role.CenterTransfer]: 1,
  },
  7: {
    [Role.Builder]: 1,
    [Role.Upgrader]: 1,
    [Role.Filler]: 1,
    [Role.CenterTransfer]: 1,
  },
  8: {
    [Role.Builder]: 0,
    [Role.Upgrader]: 1,
    [Role.Filler]: 1,
    [Role.CenterTransfer]: 1,
  },
}

export const TerminalStoreNum = {
  'energy': 50000,
}

/**
 * 快速生成 creep 身体部件配置项
 * 
 * @param bodySets 1 - 8 级时对应的身体部件配置
 */
const getBodyConfig = function (...bodySets: [BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]): BodyConfig {
  let config = { 300: [], 550: [], 800: [], 1300: [], 1800: [], 2300: [], 5300: [], 10000: [] }
  // 遍历空配置项，用传入的 bodySet 依次生成配置项
  Object.keys(config).map((level, index) => {
    config[level] = calcBodyPart(bodySets[index])
  })

  return config
}


export const bodyConfigs: BodyConfigs = {
  harvester: getBodyConfig(
    { [WORK]: 2, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 4, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 5, [CARRY]: 1, [MOVE]: 3 },
    { [WORK]: 5, [CARRY]: 1, [MOVE]: 3 },
    { [WORK]: 6, [CARRY]: 1, [MOVE]: 3 },
    { [WORK]: 6, [CARRY]: 1, [MOVE]: 3 },
    { [WORK]: 15, [CARRY]: 1, [MOVE]: 8 },
    { [WORK]: 20, [CARRY]: 2, [MOVE]: 11 }
  ),
  carrier: getBodyConfig(
    { [CARRY]: 4, [MOVE]: 2 },
    { [CARRY]: 4, [MOVE]: 4 },
    { [CARRY]: 6, [MOVE]: 6 },
    { [CARRY]: 12, [MOVE]: 6 },
    { [CARRY]: 14, [MOVE]: 7 },
    { [CARRY]: 14, [MOVE]: 7 },
    { [CARRY]: 10, [MOVE]: 5 },
    { [CARRY]: 10, [MOVE]: 5 },
  ),
  builder: getBodyConfig(
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 4, [CARRY]: 8, [MOVE]: 6 },
    { [WORK]: 6, [CARRY]: 10, [MOVE]: 8 },
    { [WORK]: 8, [CARRY]: 12, [MOVE]: 10 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 }
  ),
  /**
   * 升级单位
   * 最大的身体部件只包含 15 个 WORK
   */
  upgrader: getBodyConfig(
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 6, [CARRY]: 8, [MOVE]: 6 },
    { [WORK]: 9, [CARRY]: 10, [MOVE]: 8 },
    { [WORK]: 8, [CARRY]: 12, [MOVE]: 10 },
    { [WORK]: 20, [CARRY]: 10, [MOVE]: 20 },
    { [WORK]: 15, [CARRY]: 3, [MOVE]: 15 }
  ),

  filler: getBodyConfig(
    { [CARRY]: 2, [MOVE]: 1 },
    { [CARRY]: 3, [MOVE]: 2 },
    { [CARRY]: 4, [MOVE]: 2 },
    { [CARRY]: 5, [MOVE]: 3 },
    { [CARRY]: 6, [MOVE]: 3 },
    { [CARRY]: 10, [MOVE]: 5 },
    { [CARRY]: 12, [MOVE]: 6 },
    { [CARRY]: 30, [MOVE]: 15 }
  ),

  claimer: getBodyConfig(
    { [CLAIM]: 1, [MOVE]: 2 },
    { [CLAIM]: 1, [MOVE]: 2 },
    { [CLAIM]: 1, [MOVE]: 2 },
    { [CLAIM]: 1, [MOVE]: 2 },
    { [CLAIM]: 1, [MOVE]: 2 },
    { [CLAIM]: 1, [MOVE]: 2 },
    { [CLAIM]: 1, [MOVE]: 6 },
    { [CLAIM]: 1, [MOVE]: 6 },
  ),

  centerTransfer: getBodyConfig(
    { [CARRY]: 4, [MOVE]: 4 },
    { [CARRY]: 8, [MOVE]: 8 },
    { [CARRY]: 10, [MOVE]: 5 },
    { [CARRY]: 15, [MOVE]: 10 },
    { [CARRY]: 20, [MOVE]: 10 },
    { [CARRY]: 20, [MOVE]: 10 },
    { [CARRY]: 30, [MOVE]: 15 },
    { [CARRY]: 30, [MOVE]: 15 }
  ),

  remoteTransfer: getBodyConfig(
    { [CARRY]: 5, [MOVE]: 5 },
    { [CARRY]: 5, [MOVE]: 5 },
    { [CARRY]: 6, [MOVE]: 6 },
    { [CARRY]: 10, [MOVE]: 10 },
    { [CARRY]: 15, [MOVE]: 15 },
    { [CARRY]: 15, [MOVE]: 15 },
    { [CARRY]: 20, [MOVE]: 20 },
    { [CARRY]: 20, [MOVE]: 20 },
  ),

  attacker: getBodyConfig(
    { [ATTACK]: 25, [MOVE]: 25 },
    { [ATTACK]: 25, [MOVE]: 25 },
    { [ATTACK]: 25, [MOVE]: 25 },
    { [ATTACK]: 25, [MOVE]: 25 },
    { [ATTACK]: 25, [MOVE]: 25 },
    { [ATTACK]: 15, [MOVE]: 15 },
    { [ATTACK]: 25, [MOVE]: 25 },
    { [ATTACK]: 25, [MOVE]: 25 },
  ),

  /**
   * 外矿预定单位
   */
  reserver: getBodyConfig(
    { [MOVE]: 1, [CLAIM]: 1 },
    { [MOVE]: 2, [CLAIM]: 2 },
    { [MOVE]: 2, [CLAIM]: 2 },
    { [MOVE]: 2, [CLAIM]: 2 },
    { [MOVE]: 2, [CLAIM]: 2 },
    { [MOVE]: 2, [CLAIM]: 2 },
    { [MOVE]: 2, [CLAIM]: 2 },
    { [MOVE]: 2, [CLAIM]: 2 },
  ),

  depositHarvester: getBodyConfig(
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 10 },
    { [WORK]: 10, [CARRY]: 5, [MOVE]: 15 },
    { [WORK]: 15, [CARRY]: 7, [MOVE]: 22 },
    { [WORK]: 15, [CARRY]: 7, [MOVE]: 22 },
    { [WORK]: 15, [CARRY]: 7, [MOVE]: 22 },
    { [WORK]: 15, [CARRY]: 7, [MOVE]: 22 },
    { [WORK]: 15, [CARRY]: 7, [MOVE]: 22 },
    { [WORK]: 15, [CARRY]: 7, [MOVE]: 22 },
  ),
  remoteHarvester: getBodyConfig(
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
    { [WORK]: 7, [CARRY]: 1, [MOVE]: 4 },
  ),
  remoteCarryer: getBodyConfig(
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
    { [CARRY]: 20, [WORK]: 2, [MOVE]: 11 },
  ),
  remoteAttacker: getBodyConfig(
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 5, [MOVE]: 5, [ATTACK]: 3, [RANGED_ATTACK]: 2 },
    { [TOUGH]: 10, [MOVE]: 10, [ATTACK]: 6, [RANGED_ATTACK]: 4 },
  ),
  remoteAttackerT: getBodyConfig(
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
    { [ATTACK]: 10, [MOVE]: 5 },
  ),
  remoteReserver: getBodyConfig(
    { [CLAIM]: 2, [MOVE]: 2 },
    { [CLAIM]: 2, [MOVE]: 2 },
    { [CLAIM]: 2, [MOVE]: 2 },
    { [CLAIM]: 2, [MOVE]: 2 },
    { [CLAIM]: 2, [MOVE]: 2 },
    { [CLAIM]: 2, [MOVE]: 2 },
    { [CLAIM]: 3, [MOVE]: 6 },
    { [CLAIM]: 4, [MOVE]: 8 },
  ),
  helpBuilder: getBodyConfig(
    { [WORK]: 4, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 10, [CARRY]: 10, [MOVE]: 10 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
  ),
  helpUpgrader: getBodyConfig(
    { [WORK]: 4, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 5, [CARRY]: 5, [MOVE]: 5 },
    { [WORK]: 10, [CARRY]: 10, [MOVE]: 10 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
  ),
  pb_attacker: getBodyConfig(
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 },
    { [ATTACK]: 20, [MOVE]: 20 }
  ),
  pb_healer: getBodyConfig(
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 },
    { [HEAL]: 25, [MOVE]: 25 }
  ),
  pb_carryer: getBodyConfig(
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
    { [CARRY]: 33, [MOVE]: 17 },
  ),
  repairer: getBodyConfig(
    { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
    { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
    { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
    { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
    { [WORK]: 8, [CARRY]: 8, [MOVE]: 8 },
    { [WORK]: 10, [CARRY]: 10, [MOVE]: 10 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
    { [WORK]: 15, [CARRY]: 15, [MOVE]: 15 },
  ),
  defense_attacker: getBodyConfig(
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
    { [TOUGH]: 10, [ATTACK]: 30, [MOVE]: 10 },
  ),
  defense_healer: getBodyConfig(
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
    { [TOUGH]: 10, [RANGED_ATTACK]: 13, [HEAL]: 17, [MOVE]: 10 },
  ),
  transfer: getBodyConfig(
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
    { [CARRY]: 25, [MOVE]: 25 },
  ),
  transfer2Container: getBodyConfig(
    { [CARRY]: 2, [MOVE]: 1 },
    { [CARRY]: 3, [MOVE]: 2 },
    { [CARRY]: 4, [MOVE]: 2 },
    { [CARRY]: 5, [MOVE]: 3 },
    { [CARRY]: 6, [MOVE]: 3 },
    { [CARRY]: 25, [MOVE]: 15 },
    { [CARRY]: 30, [MOVE]: 20 },
    { [CARRY]: 30, [MOVE]: 20 }
  )

}

