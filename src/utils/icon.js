import { h } from 'vue';
import * as RemixIcons from '@remixicon/vue';

/**
 * 把 "ri-xxx-yyy-line" 转为全局注册组件名 "RiXxxYyyLine"
 */
export function riToCompName(riClass) {
  if (!riClass) return '';
  const parts = String(riClass).replace('ri-', '').split('-');
  return 'Ri' + parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

/**
 * 把 "ri-xxx-line" 解析为真实组件对象（找不到返回空渲染组件）
 */
export function resolveIcon(name) {
  if (!name) return { render: () => null };
  const compName = riToCompName(name);
  const comp = RemixIcons[compName];
  return comp || { render: () => h(RemixIcons.RiQuestionLine, { size: 16 }) };
}
