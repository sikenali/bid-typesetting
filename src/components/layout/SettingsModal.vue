<template>
  <UiModal
    v-model="visible"
    title="设置中心"
    subtitle="选择要进入的设置界面"
    icon="ri-settings-3-line"
    width="92vw"
    :max-width="1400"
    height="92vh"
    :show-footer="false"
    :close-on-click-overlay="false"
  >
    <div class="settings-body">
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
  </UiModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { UiModal } from '@/components/ui';
import { riToCompName } from '@/utils/icon';
import ThemeSettingsView from '@/views/settings/ThemeSettingsView.vue';
import TemplateSettingsView from '@/views/settings/TemplateSettingsView.vue';
import ModelSettingsView from '@/views/settings/ModelSettingsView.vue';
import ProfileSettingsView from '@/views/settings/ProfileSettingsView.vue';
import AboutSettingsView from '@/views/settings/AboutSettingsView.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialTab: { type: String, default: '' },
  initialKind: { type: String, default: '' },
});

const emit = defineEmits(['update:visible']);

const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
});

const menuItems = [
  { key: 'theme', label: '主题设置', icon: 'ri-palette-line', component: ThemeSettingsView },
  { key: 'template', label: '模板管理', icon: 'ri-file-list-2-line', component: TemplateSettingsView },
  { key: 'model', label: '模型管理', icon: 'ri-cpu-line', component: ModelSettingsView },
  { key: 'profile', label: '个性设置', icon: 'ri-user-settings-line', component: ProfileSettingsView },
  { key: 'about', label: '关于', icon: 'ri-information-line', component: AboutSettingsView },
];

const route = useRoute();

function initialTab() {
  if (props.initialTab && menuItems.some((i) => i.key === props.initialTab)) {
    return props.initialTab;
  }
  return menuItems.some((i) => i.key === route.query.tab) ? route.query.tab : 'theme';
}

const activeKey = ref(initialTab());

watch(
  () => props.visible,
  (v) => {
    if (v) activeKey.value = initialTab();
  }
);

const activeComponent = computed(() => menuItems.find((i) => i.key === activeKey.value)?.component);

function selectTab(key) {
  activeKey.value = key;
}
</script>

<style scoped>
.settings-body {
  display: flex;
  gap: 20px;
  height: 100%;
  min-height: 0;
  padding: 0;
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
</style>
