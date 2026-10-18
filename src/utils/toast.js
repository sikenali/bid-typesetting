import { ref } from 'vue';

/**
 * 统一 Toast 消息封装 —— 所有项目共用此文件。
 * 用法：
 *   import { ElMessage } from '@/utils/toast'
 *   ElMessage.success('已保存')
 *
 * useToastState() 供 ToastContainer.vue 读取同一份响应式列表。
 */

const toasts = ref([]);
let toastId = 0;

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function themeOf(type) {
  return {
    success: {
      bg: cssVar('--color-success-soft', '#E4F0EA'),
      border: cssVar('--color-success', '#4E9B7A'),
      color: cssVar('--color-success-strong', '#3E8A6B'),
    },
    error: {
      bg: cssVar('--color-error-soft', '#FADCDA'),
      border: cssVar('--color-error', '#E74C3C'),
      color: cssVar('--color-error', '#E74C3C'),
    },
    warning: {
      bg: cssVar('--color-warning-soft', '#FEF5E7'),
      border: cssVar('--color-warning', '#F39C12'),
      color: cssVar('--color-warning', '#F39C12'),
    },
    info: {
      bg: cssVar('--color-primary-soft', '#E9EFF9'),
      border: cssVar('--color-primary', '#4A72A8'),
      color: cssVar('--color-primary-deep', '#3A5C96'),
    },
  }[type] || {
    bg: cssVar('--color-primary-soft', '#E9EFF9'),
    border: cssVar('--color-primary', '#4A72A8'),
    color: cssVar('--color-primary-deep', '#3A5C96'),
  };
}

export function showToast(message, type = 'info', duration = 3500) {
  const id = ++toastId;
  const theme = themeOf(type);
  toasts.value.push({
    id,
    message: String(message),
    type,
    visible: true,
    style: theme,
  });

  setTimeout(() => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast) {
      toast.visible = false;
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
      }, 300);
    }
  }, duration);

  return id;
}

export const ElMessage = {
  success: (msg, duration) => showToast(msg, 'success', duration),
  error: (msg, duration) => showToast(msg, 'error', duration),
  warning: (msg, duration) => showToast(msg, 'warning', duration),
  info: (msg, duration) => showToast(msg, 'info', duration),
};

/** 供 ToastContainer.vue 读取同一份列表 */
export function useToastState() {
  return { toasts };
}

