import { defineStore } from 'pinia';
import { ref } from 'vue';

export const THEME_TYPES = ['parchment', 'dark', 'white'];

export const THEME_META = {
  parchment: {
    key: 'parchment',
    name: '浅色主题 · 羊皮纸',
    preview: '#F7EED4',
    previewBar: '#FFFFFF',
    previewBody: '#FAF7F2',
    description: '当前默认，长时间阅读标书不易疲劳',
  },
  dark: {
    key: 'dark',
    name: '深色主题 · 墨夜',
    preview: '#333A45',
    previewBar: '#232324',
    previewBody: '#1C1C1F',
    description: '夜间或暗光环境投标作业更护眼',
  },
  white: {
    key: 'white',
    name: '白色主题 · 纯净白',
    preview: '#FFFFFF',
    previewBar: '#F5F5F5',
    previewBody: '#FAFAFA',
    description: '极简无干扰，打印与投屏场景更干净',
  },
};

export const ACCENTS = [
  { key: 'vermilion', name: '朱红', color: '#BE3B2E', isDefault: false },
  { key: 'gold', name: '鎏金', color: '#D3A93F', isDefault: false },
  { key: 'jade', name: '玉绿', color: '#3E8C6E', isDefault: false },
  { key: 'cloud', name: '云蓝 · 默认', color: '#4A72A8', isDefault: true },
  { key: 'ink', name: '黛墨', color: '#2F3640', isDefault: false },
];

export const DEFAULT_ACCENT = '#4A72A8';

const THEME_KEY = 'bid-typesetting-theme';
const ACCENT_KEY = 'bid-typesetting-accent';
const LAYOUT_KEY = 'bid-typesetting-layout';

const themeTokens = {
  parchment: {
    '--color-primary': '#4A72A8',
    '--color-primary-deep': '#3A5C96',
    '--color-primary-soft': '#E9EFF9',
    '--color-bg-main': '#FAF7F2',
    '--color-bg-secondary': '#F7F3EA',
    '--color-bg-card': '#FCFBF8',
    '--color-bg-white': '#FFFFFF',
    '--color-bg-panel': '#F7FAFE',
    '--color-text-primary': '#1F1D1A',
    '--color-text-body': '#3A3A3A',
    '--color-text-secondary': '#6E6A60',
    '--color-text-muted': '#8A8578',
    '--color-text-faint': '#A7A296',
    '--color-border': '#E5DFD3',
    '--color-border-soft': '#EDE9E0',
    '--color-border-hover': '#D9D2C2',
    '--color-border-line': '#DDD7C9',
    '--color-border-strong': '#B9CBE6',
    '--color-success': '#4E9B7A',
    '--color-success-strong': '#3E8A6B',
    '--color-success-soft': '#E4F0EA',
    '--color-info': '#4A72A8',
    '--color-info-deep': '#3A5C96',
    '--color-info-soft': '#E9EFF9',
    '--color-warning': '#F39C12',
    '--color-warning-soft': '#FEF5E7',
    '--color-error': '#E74C3C',
    '--color-error-soft': '#FADCDA',
    '--color-switch-off': '#E3E0D6',
    '--color-badge-idle': '#EFEBE1',
  },
  dark: {
    '--color-primary': '#4D76B4',
    '--color-primary-deep': '#698CC0',
    '--color-primary-soft': '#1C2A41',
    '--color-bg-main': '#17171A',
    '--color-bg-secondary': '#1C1C1F',
    '--color-bg-card': '#232324',
    '--color-bg-white': '#232324',
    '--color-bg-panel': '#202631',
    '--color-text-primary': '#F2F3F5',
    '--color-text-body': '#DDE0E6',
    '--color-text-secondary': '#C9CDD4',
    '--color-text-muted': '#A7AEB9',
    '--color-text-faint': '#86909C',
    '--color-border': '#2A2B2E',
    '--color-border-soft': '#2A2B2E',
    '--color-border-hover': '#3A3B3F',
    '--color-border-line': '#33353A',
    '--color-border-strong': '#33415A',
    '--color-success': '#5CB98C',
    '--color-success-strong': '#7BC8A4',
    '--color-success-soft': '#1D3329',
    '--color-info': '#4D76B4',
    '--color-info-deep': '#698CC0',
    '--color-info-soft': '#1C2A41',
    '--color-warning': '#F2B23E',
    '--color-warning-soft': '#38300F',
    '--color-error': '#E86A5A',
    '--color-error-soft': '#3A2326',
    '--color-switch-off': '#3A3B3F',
    '--color-badge-idle': '#2A2B2E',
  },
  white: {
    '--color-primary': '#4A72A8',
    '--color-primary-deep': '#3A5C96',
    '--color-primary-soft': '#E9EFF9',
    '--color-bg-main': '#FFFFFF',
    '--color-bg-secondary': '#F7F7F8',
    '--color-bg-card': '#FAFAFA',
    '--color-bg-white': '#FFFFFF',
    '--color-bg-panel': '#F7FAFE',
    '--color-text-primary': '#1A1A1A',
    '--color-text-body': '#3A3A3A',
    '--color-text-secondary': '#666666',
    '--color-text-muted': '#8A8578',
    '--color-text-faint': '#A7A296',
    '--color-border': '#E0E0E0',
    '--color-border-soft': '#ECECEC',
    '--color-border-hover': '#D0D0D0',
    '--color-border-line': '#E3E3E3',
    '--color-border-strong': '#B9CBE6',
    '--color-success': '#4E9B7A',
    '--color-success-strong': '#3E8A6B',
    '--color-success-soft': '#E4F0EA',
    '--color-info': '#4A72A8',
    '--color-info-deep': '#3A5C96',
    '--color-info-soft': '#E9EFF9',
    '--color-warning': '#F39C12',
    '--color-warning-soft': '#FEF5E7',
    '--color-error': '#E74C3C',
    '--color-error-soft': '#FADCDA',
    '--color-switch-off': '#E3E0D6',
    '--color-badge-idle': '#EFEBE1',
  },
};

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function shiftHex(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const toHex = (v) => clamp(v).toString(16).padStart(2, '0');
  return '#' + toHex(rgb.r + amount) + toHex(rgb.g + amount) + toHex(rgb.b + amount);
}

function tintHex(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = (v) => Math.round(v + (255 - v) * amount);
  const toHex = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  return '#' + toHex(mix(rgb.r)) + toHex(mix(rgb.g)) + toHex(mix(rgb.b));
}

function scaleHex(hex, factor) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v * factor))).toString(16).padStart(2, '0');
  return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
}

/**
 * 从强调色派生 primary-deep / primary-soft
 * 浅色主题 soft = 高亮淡色；深色主题 soft = 同色相压暗（不能接近纯黑，否则在深色底上不可见）
 */
function deriveAccentTokens(color, isDark) {
  const deep = isDark ? tintHex(color, 0.16) : shiftHex(color, -24);
  const soft = isDark ? scaleHex(color, 0.36) : tintHex(color, 0.88);
  return {
    '--color-primary': color,
    '--color-primary-deep': deep,
    '--color-primary-soft': soft,
    '--color-info': color,
    '--color-info-deep': deep,
    '--color-info-soft': soft,
  };
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('parchment');
  const currentAccent = ref(DEFAULT_ACCENT);
  const layout = ref(localStorage.getItem(LAYOUT_KEY) || 'topbar');

  function applyTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme;
    const tokens = themeTokens[theme] || themeTokens.parchment;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }
    const isDark = theme === 'dark';
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    if (savedAccent) {
      const derived = deriveAccentTokens(savedAccent, isDark);
      for (const [key, value] of Object.entries(derived)) {
        root.style.setProperty(key, value);
      }
      currentAccent.value = savedAccent;
    } else {
      currentAccent.value = DEFAULT_ACCENT;
    }
  }

  function setTheme(theme) {
    if (!themeTokens[theme]) return;
    currentTheme.value = theme;
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * 单一入口：写入强调色。color 为空时清除内联覆盖，回落到主题默认。
   * 持久化只在用户显式选择时发生。
   */
  function applyAccent(color) {
    const root = document.documentElement;
    const normalized = typeof color === 'string' ? color.trim() : '';
    if (normalized) {
      const derived = deriveAccentTokens(normalized, currentTheme.value === 'dark');
      for (const [key, value] of Object.entries(derived)) {
        root.style.setProperty(key, value);
      }
      localStorage.setItem(ACCENT_KEY, normalized);
      currentAccent.value = normalized;
    } else {
      currentTheme.value && applyTheme(currentTheme.value);
      localStorage.removeItem(ACCENT_KEY);
    }
  }

  /** 回落到主题默认强调色（不删除持久化） */
  function clearAccent() {
    applyTheme(currentTheme.value);
    localStorage.removeItem(ACCENT_KEY);
  }

  function getLayout() {
    return localStorage.getItem(LAYOUT_KEY) || 'topbar';
  }

  function setLayout(value) {
    layout.value = value;
    localStorage.setItem(LAYOUT_KEY, value);
  }

  function resetAll() {
    currentTheme.value = 'parchment';
    applyTheme('parchment');
    localStorage.setItem(THEME_KEY, 'parchment');
    applyAccent(null);
    localStorage.removeItem(ACCENT_KEY);
    currentAccent.value = DEFAULT_ACCENT;
    layout.value = 'topbar';
    localStorage.removeItem(LAYOUT_KEY);
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved && themeTokens[saved] ? saved : 'parchment';
    currentTheme.value = theme;
    applyTheme(theme);
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    currentAccent.value = savedAccent || DEFAULT_ACCENT;
  }

  return {
    currentTheme,
    currentAccent,
    layout,
    setTheme,
    applyAccent,
    clearAccent,
    getLayout,
    setLayout,
    resetAll,
    loadTheme,
  };
});
