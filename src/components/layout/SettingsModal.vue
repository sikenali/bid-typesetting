<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="settings-panel" role="dialog" aria-modal="true">
          <div class="panel-header">
            <div class="header-left">
              <div class="header-icon">
                <RiSettings3Line size="26" />
              </div>
              <div class="header-text">
                <h2 class="panel-title">设置中心</h2>
                <p class="panel-subtitle">选择要进入的设置界面</p>
              </div>
            </div>
            <button class="close-btn" title="关闭" @click="close">
              <RiCloseLine class="close-icon" size="20" />
            </button>
          </div>

          <div class="panel-body">
            <nav class="nav-list">
              <div
                v-for="item in menuItems"
                :key="item.key"
                class="nav-item"
                :class="{ active: activeKey === item.key }"
                @click="selectTab(item.key)"
              >
                <component :is="riToCompName(item.icon)" class="icon" size="20" />
                <span class="label">{{ item.label }}</span>
              </div>
            </nav>
            <div class="panel-content">
              <component :is="activeComponent" :key="activeKey" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import ThemeSettingsView from '@/views/settings/ThemeSettingsView.vue';
import TemplateSettingsView from '@/views/settings/TemplateSettingsView.vue';
import ModelSettingsView from '@/views/settings/ModelSettingsView.vue';
import ProfileSettingsView from '@/views/settings/ProfileSettingsView.vue';
import AboutSettingsView from '@/views/settings/AboutSettingsView.vue';
import { riToCompName } from '@/utils/icon';

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible']);

function close() {
  emit('update:visible', false);
}

const menuItems = [
  { key: 'theme', label: '主题设置', icon: 'ri-palette-line', component: ThemeSettingsView },
  { key: 'template', label: '模板管理', icon: 'ri-file-list-2-line', component: TemplateSettingsView },
  { key: 'model', label: '模型管理', icon: 'ri-cpu-line', component: ModelSettingsView },
  { key: 'profile', label: '个性设置', icon: 'ri-user-settings-line', component: ProfileSettingsView },
  { key: 'about', label: '关于', icon: 'ri-information-line', component: AboutSettingsView },
];

const activeKey = ref('theme');

watch(
  () => props.visible,
  (v) => {
    if (v) activeKey.value = 'theme';
  }
);

const activeComponent = computed(() => {
  return menuItems.find((i) => i.key === activeKey.value)?.component;
});

function selectTab(key) {
  activeKey.value = key;
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.visible) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-fixed);
}

.settings-panel {
  width: 1320px;
  max-width: 94vw;
  height: 86vh;
  max-height: 900px;
  background: var(--color-bg-secondary);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 28px;
}

.panel-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 18px;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.close-btn:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
}

.close-icon {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.close-btn:hover .close-icon {
  color: #ffffff;
}

.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 20px;
}

.nav-list {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 16px;
  padding: 16px;
}

.nav-item {
  height: 52px;
  padding: 0 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.nav-item:hover {
  background-color: var(--color-bg-secondary);
}

.nav-item .icon {
  color: var(--color-text-body);
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.nav-item .label {
  font-size: 15px;
  color: var(--color-text-body);
  white-space: nowrap;
}

.nav-item.active {
  background-color: var(--color-primary-soft);
}

.nav-item.active .icon,
.nav-item.active .label {
  color: var(--color-primary);
  font-weight: 500;
}

.panel-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.panel-content :deep(.page-header-card) {
  display: none;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
