<template>
  <aside class="side-nav">
    <nav class="nav-rail" aria-label="模块导航">
      <UiTip
        v-for="item in modules"
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
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { UiTip } from '@/components/ui';
import { riToCompName } from '@/utils/icon';

const route = useRoute();
const router = useRouter();

const modules = [
  { key: 'upload', label: '上传', icon: 'ri-upload-line', path: '/' },
  { key: 'editor', label: '排版', icon: 'ri-layout-2-line', path: '/editor' },
  { key: 'template', label: '模板', icon: 'ri-file-list-3-line', path: '/template' },
  { key: 'compare', label: '对比', icon: 'ri-contrast-2-line', path: '/compare' },
  { key: 'settings', label: '设置', icon: 'ri-settings-3-line', path: '/settings' },
  { key: 'profile', label: '个性', icon: 'ri-user-settings-line', path: '/settings', query: { tab: 'profile' } },
];

function activeKey(item) {
  return route.path === item.path && (!item.query || route.query.tab === undefined);
}

function go(item) {
  router.push(item.query ? { path: item.path, query: item.query } : item.path);
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

.nav-rail {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
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
</style>
