import { ref } from 'vue'

export const confirmState = ref(null)

let resolver = null

export function confirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    resolver = resolve
    confirmState.value = {
      message,
      title: options.title || '请确认',
      icon: options.icon || 'ri-question-line',
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
    }
  })
}

export function settleConfirm(value) {
  const resolve = resolver
  resolver = null
  confirmState.value = null
  if (resolve) resolve(value)
}
