<template>
  <header class="top-nav">
    <div class="nav-left" @click="router.push('/')">
      <RiTargetLine class="tool-logo" size="26" />
      <span class="brand-cn">{{ BRAND_NAME }}</span>
      <span class="divider"></span>
      <span class="page-title">{{ title || BRAND_PRODUCT }}</span>
    </div>
    <div v-if="!isSidebar" class="nav-right">
      <UiTip v-if="showBack" text="返回" placement="bottom">
        <button
          class="nav-btn"
          @click="router.push('/')"
        >
          <RiArrowLeftLine class="nav-icon" size="18" />
        </button>
      </UiTip>
      <UiTip v-if="!onEditor" text="排版" placement="bottom">
        <button class="nav-btn" @click="router.push('/editor')">
          <RiLayout2Line class="nav-icon" size="18" />
        </button>
      </UiTip>
      <UiTip text="设置" placement="bottom">
        <button class="nav-btn" @click="emitOpenSettings">
          <RiSettings3Line class="nav-icon" size="18" />
        </button>
      </UiTip>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { BRAND_NAME, BRAND_PRODUCT } from '@/constants/brand';
import { UiTip } from '@/components/ui';
import { useThemeStore } from '@/stores/theme';

defineProps({
  showBack: { type: Boolean, default: false },
  title: { type: String, default: '' },
});

const emit = defineEmits(['open-settings']);

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();
const onEditor = computed(() => route.path.startsWith('/editor'));
const isSidebar = computed(() => themeStore.layout === 'sidebar');

function emitOpenSettings() {
  emit('open-settings');
}
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-fixed);
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-white);
  border-bottom: 0.7px solid var(--color-border-soft);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.nav-left:hover .brand-cn {
  color: var(--color-primary);
}

.tool-logo {
  color: var(--color-primary);
  line-height: 1;
}

.brand-cn {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.divider {
  display: inline-block;
  width: 2px;
  height: 20px;
  background-color: var(--color-border);
}

.page-title {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.nav-btn:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
}

.nav-icon {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.nav-btn:hover .nav-icon {
  color: #ffffff;
}
</style>
