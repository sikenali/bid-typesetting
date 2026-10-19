<template>
  <aside class="side-nav">
    <div class="side-top">
      <button class="side-logo" title="回到上传" aria-label="回到上传" @click="goHome">
        <RiTargetLine size="26" />
      </button>
    </div>

    <nav class="side-body" aria-label="设置导航">
      <UiTip
        v-for="item in navSettings"
        :key="item.key"
        :text="item.label"
        placement="right"
      >
        <button
          class="rail-btn"
          :class="{ active: activeKey(item) }"
          @click="go(item)"
        >
          <component :is="riToCompName(item.icon)" size="22" />
          <span class="rail-label">{{ item.label }}</span>
        </button>
      </UiTip>
    </nav>

    <div class="side-bottom">
      <UiTip text="关于" placement="right">
        <button class="side-version" @click="goAbout">
          {{ APP_VERSION }}
        </button>
      </UiTip>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { APP_VERSION } from '@/constants/brand';
import { UiTip } from '@/components/ui';
import { riToCompName } from '@/utils/icon';

const route = useRoute();
const router = useRouter();

const navSettings = [
  { key: 'theme', label: '主题', icon: 'ri-palette-line', path: '/settings', query: { tab: 'theme' } },
  { key: 'template', label: '模板', icon: 'ri-file-list-2-line', path: '/settings', query: { tab: 'template' } },
  { key: 'model', label: '模型', icon: 'ri-cpu-line', path: '/settings', query: { tab: 'model' } },
  { key: 'profile', label: '个性', icon: 'ri-user-settings-line', path: '/settings', query: { tab: 'profile' } },
  { key: 'about', label: '关于', icon: 'ri-information-line', path: '/settings', query: { tab: 'about' } },
];

function activeKey(item) {
  if (item.query) return route.path === item.path && route.query.tab === item.query.tab;
  return route.path === item.path && !route.query.tab;
}

function go(item) {
  router.push(item.query ? { path: item.path, query: item.query } : item.path);
}

function goHome() {
  router.push('/');
}

function goAbout() {
  router.push({ path: '/settings', query: { tab: 'about' } });
}
</script>

<style scoped>
.side-nav {
  flex: 0 0 76px;
  height: 100vh;
  position: sticky;
  top: 0;
  background-color: var(--color-bg-white);
  border-right: 0.7px solid var(--color-border-soft);
  display: flex;
  flex-direction: column;
}

.side-top {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0 10px;
}

.side-logo {
  border: none;
  padding: 6px;
  border-radius: 12px;
  background-color: transparent;
  color: var(--color-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.side-logo:hover {
  background-color: var(--color-primary-soft);
}

.side-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.rail-btn {
  width: 56px;
  padding: 10px 0 8px;
  border: none;
  border-radius: 14px;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s ease;
}

.rail-btn > :first-child {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.rail-label {
  font-size: 11px;
  line-height: 1.2;
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: color 0.2s ease;
}

.rail-btn:hover {
  background-color: var(--color-primary-soft);
}

.rail-btn:hover > :first-child,
.rail-btn:hover .rail-label {
  color: var(--color-primary);
}

.rail-btn.active {
  background-color: var(--color-primary-soft);
}

.rail-btn.active > :first-child,
.rail-btn.active .rail-label {
  color: var(--color-primary);
  font-weight: 500;
}

.side-bottom {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 14px;
}

.side-version {
  border: none;
  padding: 5px 8px;
  border-radius: 10px;
  background-color: transparent;
  color: var(--color-text-muted);
  font-size: 10.5px;
  line-height: 1.2;
  font-family: var(--font-family-num, inherit);
  letter-spacing: 0.2px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.side-version:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
}
</style>
