<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  desc: { type: String, required: false, default: '' },
  path: { type: String, required: false, default: '' },
  /** 全局注册的 remixicon 组件名，如 'RiPagesLine' */
  icon: { type: String, required: false, default: '' },
  iconClass: { type: String, required: false, default: '' },
  defaultOpen: { type: Boolean, default: false },
})

const collapsed = ref(!props.defaultOpen)

const titleIcon = computed(() => props.icon || props.iconClass || '')
const descText = computed(() => props.desc || props.description || '')
</script>

<template>
  <div class="rule-editor">
    <button
      class="rule-header"
      @click="collapsed = !collapsed"
      :aria-expanded="!collapsed"
    >
      <div class="header-text">
        <component :is="titleIcon" v-if="titleIcon" size="17" class="rule-icon" aria-hidden="true" />
        <span class="rule-title">{{ title }}</span>
        <span v-if="descText" class="rule-desc">{{ descText }}</span>
      </div>
      <RiArrowDownSLine :size="16" class="arrow" :class="{ rotated: !collapsed }" />
    </button>

    <div v-show="!collapsed" class="rule-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.rule-editor {
  border: 0.7px solid var(--color-border-soft);
  border-radius: 12px;
  background: var(--color-bg-white);
  overflow: hidden;
}
.rule-header {
  width: 100%;
  padding: 14px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  text-align: left;
  transition: background var(--transition-base);
}
.rule-header:hover { background: var(--color-bg-card); }
.header-text {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: wrap;
}
.rule-icon { color: var(--color-primary); flex-shrink: 0; display: inline-flex; }
.rule-title { flex-shrink: 0; }
.rule-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 400;
}
.arrow {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-base);
  display: flex;
}
.arrow.rotated { transform: rotate(180deg); }
.rule-body {
  padding: 18px;
  border-top: 0.7px solid var(--color-border-soft);
}
</style>
