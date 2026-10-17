<template>
  <header class="top-nav">
    <div class="nav-left" @click="router.push('/')">
      <RiTargetLine class="tool-logo" size="26" />
      <span class="brand-cn">{{ BRAND_NAME }}</span>
      <span class="divider"></span>
      <span class="page-title">{{ title || BRAND_PRODUCT }}</span>
    </div>
    <div class="nav-right">
      <button
        v-if="showBack"
        class="nav-btn"
        title="返回"
        @click="router.push('/')"
      >
        <RiArrowLeftLine class="nav-icon" size="18" />
      </button>
      <button class="nav-btn" title="模板库" @click="router.push('/template')">
        <RiFileList3Line class="nav-icon" size="18" />
      </button>
      <button class="nav-btn" title="设置" @click="emitOpenSettings">
        <RiSettings3Line class="nav-icon" size="18" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { BRAND_NAME, BRAND_PRODUCT } from '@/constants/brand';

defineProps({
  showBack: { type: Boolean, default: false },
  title: { type: String, default: '' },
});

const emit = defineEmits(['open-settings']);

const router = useRouter();

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
