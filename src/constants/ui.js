export const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体'].map(v => ({ value: v, label: v }))
export const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New'].map(v => ({ value: v, label: v }))
export const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五'].map(v => ({ value: v, label: v }))

export const lineSpacingModes = [
  { value: 'EXACT', label: '固定值(磅)' },
  { value: 'MULTIPLE', label: '多倍行距' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'ONE_POINT_FIVE', label: '1.5倍行距' },
  { value: 'DOUBLE', label: '双倍行距' },
  { value: 'AT_LEAST', label: '最小值' },
]

export const spacingUnits = [
  { value: 'line', label: '行' },
  { value: 'cm', label: '厘米' },
  { value: 'char', label: '字符' },
  { value: 'pt', label: '磅' },
]

export const tabLeaders = [
  { value: 'DOT', label: '点线' },
  { value: 'MID_DOT', label: '中间点' },
  { value: 'DASH', label: '短横线' },
  { value: 'UNDERSCORE', label: '下划线' },
  { value: 'THICK', label: '粗线' },
  { value: 'NONE', label: '无线条' },
]

export const numberingSchemes = [
  { value: 'NONE', label: '原有级别&标题' },
  { value: 'ZH_NUM', label: '中文数字' },
  { value: 'ALPHA_UPPER', label: '大写字母' },
  { value: 'ALPHA_LOWER', label: '小写字母' },
  { value: 'ARABIC', label: '阿拉伯数字' },
  { value: 'ROMAN_UPPER', label: '大写罗马数字' },
  { value: 'ROMAN_LOWER', label: '小写罗马数字' },
]

export const wrappers = [
  { value: 'NONE', label: '无前后缀' },
  { value: 'DOT', label: '尾部加点.' },
  { value: 'DOUBLE_PAREN', label: '双圆括号()' },
  { value: 'SINGLE_PAREN', label: '单圆括号)' },
  { value: 'DUNHAO', label: '顿号、' },
  { value: 'DOUBLE_BRACKET', label: '双方括号[]' },
  { value: 'SINGLE_BRACKET', label: '单方括号]' },
  { value: 'DOUBLE_ANGLE', label: '双尖括号<>' },
  { value: 'SINGLE_ANGLE', label: '单尖括号>' },
  { value: 'CN_BRACKET', label: '中文方括号【】' },
]

export const paperSizes = [
  { value: 'A4', label: 'A4 (21.0×29.7cm)', w: 21.0, h: 29.7 },
  { value: 'A3', label: 'A3 (29.7×42.0cm)', w: 29.7, h: 42.0 },
  { value: 'B5', label: 'B5 (17.6×25.0cm)', w: 17.6, h: 25.0 },
  { value: 'Letter', label: 'Letter (21.6×27.9cm)', w: 21.6, h: 27.9 },
  { value: 'custom', label: '自定义', w: 21.0, h: 29.7 },
]
