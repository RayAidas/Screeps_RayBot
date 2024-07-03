/**
 * 根据身体配置生成完成的身体数组
 * cpu 消耗: 0.028 左右
 * 
 * @param bodySet 身体部件配置对象
 */
export function calcBodyPart(bodySet: BodySet): BodyPartConstant[] {
  // 把身体配置项拓展成如下形式的二维数组
  // [ [ TOUGH ], [ WORK, WORK ], [ MOVE, MOVE, MOVE ] ]
  const bodys = Object.keys(bodySet).map(type => Array(bodySet[type]).fill(type))
  // 把二维数组展平
  return [].concat(...bodys)
}

const colors: { [name in Colors]: string } = {
  red: '#ef9a9a',
  green: '#6b9955',
  yellow: '#c5c599',
  blue: '#8dc5e3'
}

export function colorful(content: string, colorName: Colors | string = null, bolder: boolean = false): string {
  const colorStyle = colorName ? `color: ${colors[colorName] ? colors[colorName] : colorName};` : ''
  const bolderStyle = bolder ? 'font-weight: bolder;' : ''

  return `<text style="${[colorStyle, bolderStyle].join(' ')}">${content}</text>`
}

export function format(num) {
  num = num + ''; //数字转字符串
  let str = ""; //字符串累加
  for (let i = num.length - 1, j = 1; i >= 0; i--, j++) {
    if (j % 3 == 0 && i != 0) { //每隔三位加逗号，过滤正好在第一个数字的情况
      str += num[i] + ","; //加千分位逗号
      continue;
    }
    str += num[i]; //倒着累加数字
  }
  return str.split('').reverse().join("");
  //  console.log(str.split('').reverse().join(""));//字符串=>数组=>反转=>字符串
}

export function getColor(val: number) {
  if (val > 100) val = 100;
  //let 百分之一 = (单色值范围) / 50;  单颜色的变化范围只在50%之内
  let per = (255 + 255) / 100;
  let r = 0;
  let g = 0;
  let b = 0;

  if (val < 50) {
    // 比例小于50的时候红色是越来越多的,直到红色为255时(红+绿)变为黄色.
    r = per * val;
    g = 255;
  }
  if (val >= 50) {
    // 比例大于50的时候绿色是越来越少的,直到0 变为纯红
    g = 255 - ((val - 50) * per);
    r = 255;
  }
  r = Math.ceil(r);// 取整
  g = Math.ceil(g);// 取整
  b = Math.ceil(b);// 取整
  return "rgb(" + r + "," + g + "," + b + ")";
}

export function colorHex(color: string) {
  let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  if (/^(rgb|RGB)/.test(color)) {
    let aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
    let strHex = "#";
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16);
      if (hex === "0") {
        hex += hex;
      }
      strHex += hex;
    }
    if (strHex.length !== 7) {
      strHex = color;
    }
    return strHex;
  } else if (reg.test(color)) {
    let aNum = color.replace(/#/, "").split("");
    if (aNum.length === 6) {
      return color;
    } else if (aNum.length === 3) {
      let numHex = "#";
      for (let i = 0; i < aNum.length; i++) {
        numHex += (aNum[i] + aNum[i]);
      }
      return numHex;
    }
  } else {
    return color;
  }
};

export function GenNonDuplicateID(randomLength: number = 6): string {
  let idStr = Game.time.toString(36)
  idStr += Math.random().toString(36).substring(3, randomLength)
  return idStr.toUpperCase();
}

/**
  *[min,max) 
  */
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * (min,max]
 * */
export function randInt2(min: number, max: number) {
  return Math.ceil(Math.random() * (max - min) + min);
}

/**
 * [min,max]
 */
export function randInt3(min: number, max: number) {
  return this.randInt(min, max + 1);
}
