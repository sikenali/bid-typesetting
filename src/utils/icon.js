/**
 * 把 "ri-xxx-yyy-line" 转为全局注册的组件名 "RiXxxYyyLine"
 */
export function riToCompName(riClass) {
  if (!riClass) return ''
  const parts = String(riClass).replace('ri-', '').split('-')
  return 'Ri' + parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')
}
