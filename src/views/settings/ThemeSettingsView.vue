<script setup>
import { ElMessage } from '@/utils/toast';
import { useThemeStore, THEME_META, ACCENTS, DEFAULT_ACCENT, THEME_TYPES } from '@/stores/theme';

const themeStore = useThemeStore();

const themes = THEME_TYPES.map((k) => ({
  key: k,
  ...THEME_META[k],
}));

const accents = ACCENTS;

function selectTheme(theme) {
  themeStore.setTheme(theme.key);
  ElMessage.success('已切换到「' + theme.name + '」');
}

function selectAccent(color) {
  if (color === DEFAULT_ACCENT) {
    themeStore.applyAccent(null);
  } else {
    themeStore.applyAccent(color);
  }
  ElMessage.success('强调色已更新');
}

function resetAll() {
  themeStore.resetAll();
  ElMessage.success('已恢复默认主题');
}
</script>

<template>
  <div class="settings-view">
    <div class="page-header-card">
      <div class="header-row">
        <div class="header-left">
          <div class="breadcrumb">
            首页 <span class="sep">/</span> 设置中心 <span class="sep">/</span> <b>主题设置</b>
          </div>
          <h1 class="page-title">主题设置</h1>
          <p class="page-desc">统一切换外观底色与强调色，修改即时生效</p>
        </div>
        <button class="btn-outline" @click="resetAll">
          <RiRestartLine size="16" />
          <span>恢复默认</span>
        </button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <div>
          <div class="section-title">
            <RiPaletteLine size="18" />
            <span>外观主题</span>
          </div>
          <p class="section-desc">选择适合当前使用场景的界面底色，浅色偏暖、深色护眼、白色纯净</p>
        </div>
        <button class="reset-btn" @click="resetAll">
          <RiRestartLine size="16" />
          <span>恢复默认</span>
        </button>
      </div>
      <div class="theme-grid">
        <div
          v-for="theme in themes"
          :key="theme.key"
          class="theme-card"
          :class="{ 'is-active': themeStore.currentTheme === theme.key }"
          @click="selectTheme(theme)"
          role="radio"
          :aria-checked="themeStore.currentTheme === theme.key"
          tabindex="0"
        >
          <div
            v-if="themeStore.currentTheme === theme.key"
            class="theme-check"
          >
            <RiCheckLine size="14" />
          </div>
          <div class="theme-preview" :style="{ backgroundColor: theme.preview }">
            <div class="theme-preview-bar" :style="{ backgroundColor: theme.previewBar }"></div>
            <div class="theme-preview-body" :style="{ backgroundColor: theme.previewBody }">
              <div class="theme-preview-line"></div>
              <div class="theme-preview-line short"></div>
              <div class="theme-preview-line"></div>
            </div>
          </div>
          <div class="theme-name">{{ theme.name }}</div>
          <div class="theme-desc">{{ theme.description }}</div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">
        <RiSwatchLine size="18" />
        <span>强调色</span>
      </div>
      <p class="section-desc">强调色应用于主按钮、激活态与关键指示，与主题底色协调搭配</p>
      <div class="accent-list">
        <button
          v-for="a in accents"
          :key="a.key"
          class="accent-item"
          type="button"
          :aria-label="a.name"
        >
          <div
            class="accent-swatch"
            :class="{ 'is-active': themeStore.currentAccent === a.color }"
            :style="{ backgroundColor: a.color }"
          >
            <RiCheckLine v-if="themeStore.currentAccent === a.color" size="32" class="accent-check" />
          </div>
          <div class="accent-name" :class="{ 'is-active': themeStore.currentAccent === a.color }">
            {{ a.name }}
          </div>
        </button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">
        <RiInformationLine size="18" />
        <span>主题应用说明</span>
      </div>
      <div class="info-box">
        <RiInformationLine size="18" class="info-icon" />
        <div class="info-text">
          深浅色主题与强调色会持久化到浏览器本地，下次打开应用将自动恢复上次的选择。<br />
          如需全部还原，点击右上角「恢复默认」按钮，一键回到浅色主题与云蓝强调色。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 20px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-header-card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 20px 24px;
}
.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}
.header-left { flex: 1; min-width: 0; }
.breadcrumb {
  font-size: 13px;
  color: var(--color-text-faint);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-family: var(--font-family-cn);
}
.breadcrumb .sep { color: var(--color-text-faint); }
.breadcrumb b {
  color: var(--color-text-body);
  font-weight: 500;
}
.page-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0;
  font-family: var(--font-family-cn);
  line-height: 1.2;
}
.page-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 8px 0 0;
  font-family: var(--font-family-cn);
}
.btn-outline {
  height: 48px;
  padding: 0 20px;
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 14px;
  font-family: var(--font-family-cn);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
  flex-shrink: 0;
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
}
.section-card {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 24px 28px;
}
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.section-head .section-desc { margin-bottom: 0; }
.reset-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 14px;
  font-family: var(--font-family-cn);
  transition: all 0.2s ease;
}
.reset-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.section-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: var(--font-family-cn);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
}
.section-title span { color: var(--color-text-primary); }
.section-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 6px 0 20px;
  font-family: var(--font-family-cn);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.theme-card {
  position: relative;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.theme-card:hover { border-color: var(--color-border-hover); box-shadow: var(--shadow-sm); }
.theme-card:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent);
}
.theme-card.is-active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}
.theme-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-bg-white);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.theme-preview {
  width: 100%;
  height: 128px;
  border-radius: 8px;
  overflow: hidden;
  border: 0.7px solid var(--color-border-soft);
  display: flex;
  flex-direction: column;
}
.theme-preview-bar { height: 28px; flex-shrink: 0; }
.theme-preview-body {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-start;
}
.theme-preview-line {
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, #000 22%, transparent);
}
.theme-preview-line.short { width: 55%; }
.theme-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-body);
  margin-top: 12px;
  font-family: var(--font-family-cn);
}
.theme-card.is-active .theme-name { color: var(--color-primary); }
.theme-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-top: 4px;
  font-family: var(--font-family-cn);
}

.accent-list {
  display: flex;
  justify-content: space-around;
  gap: 40px;
  padding: 8px 0 4px;
}
.accent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: var(--font-family-cn);
}
.accent-swatch {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: transform 0.2s, box-shadow 0.2s;
}
.accent-swatch:hover { transform: scale(1.05); }
.accent-swatch.is-active {
  box-shadow: 0 0 0 3px var(--color-bg-white), 0 0 0 5px var(--color-primary);
}
.accent-check { color: var(--color-bg-white); }
.accent-name {
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-muted);
}
.accent-name.is-active {
  font-weight: 700;
  color: var(--color-text-primary);
}

.info-box {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-primary-soft);
  border-radius: 10px;
  border: 0.7px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
}
.info-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}
.info-text {
  font-size: 14px;
  color: var(--color-text-body);
  line-height: 1.7;
  font-family: var(--font-family-cn);
}
</style>
