import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const show = (message, type = 'info', duration = 5000) => {
    const id = ++toastId
    toasts.value.push({ id, message, type, visible: true })

    setTimeout(() => {
      const toast = toasts.value.find(t => t.id === id)
      if (toast) toast.visible = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }, duration)

    return id
  }

  const success = (msg, duration) => show(msg, 'success', duration)
  const error = (msg, duration) => show(msg, 'error', duration)
  const info = (msg, duration) => show(msg, 'info', duration)

  return { toasts, show, success, error, info }
}
