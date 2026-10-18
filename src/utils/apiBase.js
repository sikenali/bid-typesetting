const STORAGE_KEY = 'wpx_api_base'
const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8099'

export function getApiBase() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE
  } catch {
    return DEFAULT_API_BASE
  }
}

export function setApiBase(url) {
  const value = (url || '').trim().replace(/\/+$/, '')
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore storage failures */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-base-changed', { detail: getApiBase() }))
  }
}
