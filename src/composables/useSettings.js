import { ref, watch, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

/**
 * 应用级偏好设置。
 * 主题统一由 stores/theme.js 管理（JS 直写 CSS 变量），
 * 本文件的 theme 只是 store 的读写代理，避免双源覆盖。
 */

const STORAGE_KEY = 'bid-page-settings'

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

const saved = loadSettings()
const template = ref(saved?.template ?? null)
const previewEnabled = ref(saved?.previewEnabled ?? true)
const clearStylesEnabled = ref(saved?.clearStylesEnabled ?? false)
const annotationEnabled = ref(saved?.annotationEnabled ?? false)
const highlightEnabled = ref(saved?.highlightEnabled ?? true)

/** 旧主题 id → 新主题 key */
const LEGACY_THEME_MAP = {
  light: 'parchment',
  paper: 'white',
  white: 'white',
  dark: 'dark',
  parchment: 'parchment',
}

function persistSettings(themeStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    theme: themeStore ? themeStore.currentTheme : null,
    template: template.value,
    previewEnabled: previewEnabled.value,
    clearStylesEnabled: clearStylesEnabled.value,
    annotationEnabled: annotationEnabled.value,
    highlightEnabled: highlightEnabled.value,
  }))
}

export function useSettings() {
  const themeStore = useThemeStore()

  const theme = computed({
    get: () => themeStore.currentTheme,
    set: (val) => themeStore.setTheme(LEGACY_THEME_MAP[val] || val || 'parchment'),
  })

  watch([theme, template, previewEnabled, clearStylesEnabled, annotationEnabled, highlightEnabled], () => persistSettings(themeStore), { deep: true })

  return {
    theme,
    currentTheme: computed(() => themeStore.currentTheme),
    template,
    previewEnabled,
    clearStylesEnabled,
    annotationEnabled,
    highlightEnabled,
    setTheme(val) { theme.value = val },
    setTemplate(val) { template.value = val },
    togglePreview() { previewEnabled.value = !previewEnabled.value },
    toggleClearStyles() { clearStylesEnabled.value = !clearStylesEnabled.value },
    toggleAnnotation() { annotationEnabled.value = !annotationEnabled.value },
    toggleHighlight() { highlightEnabled.value = !highlightEnabled.value },
  }
}
