<script setup>
/**
 * UiSelectCard — 通用可选选中卡片
 * 收敛主题预览卡 / 导出格式卡 / 个性模式卡 / 布局卡：图标 + 标题 + 描述 + 右上 UiCheck
 * 激活态：主色边框 + 主色浅底 + 右上勾选徽标（DESIGN.md §6.5）
 *
 * @example
 * <UiSelectCard
 *   :selected="fmt === 'docx'"
 *   title="Word 文档 ·.docx"
 *   desc="保留可编辑正文"
 *   icon-text="W"
 *   icon-color="#2B579A"
 *   @select="fmt = 'docx'"
 * >
 *   <template #icon><MySvg /></template>
 * </UiSelectCard>
 */
import UiCheck from './UiCheck.vue';

const props = defineProps({
  selected: { type: Boolean, default: false },
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
  /** 左上小图标文字（如 W / PDF / MD），与 icon slot 二选一 */
  iconText: { type: String, default: '' },
  iconColor: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  /** 选中态边框 / 底色（默认走主题 primary，可覆盖） */
  activeBorder: { type: String, default: 'var(--color-primary)' },
  activeBg: { type: String, default: 'var(--color-primary-soft)' },
});

const emit = defineEmits(['select']);

function onClick() {
  emit('select');
}
</script>

<template>
  <div
    class="ui-select-card"
    :class="{ 'is-selected': selected, 'is-disabled': disabled }"
    :style="selected ? { borderColor: activeBorder, backgroundColor: activeBg } : undefined"
    role="option"
    :aria-selected="selected"
    :tabindex="disabled ? -1 : 0"
    @click="!disabled && onClick()"
    @keydown.enter.space.prevent="!disabled && onClick()"
  >
    <UiCheck :checked="selected" class="ui-select-card-check" :size="22" />
    <div v-if="$slots.icon || iconText" class="ui-select-card-icon" :style="{ backgroundColor: iconColor || 'var(--color-primary)' }">
      <slot name="icon">
        <span class="ui-select-card-icon-text">{{ iconText }}</span>
      </slot>
    </div>
    <div class="ui-select-card-body">
      <div v-if="title || $slots.title" class="ui-select-card-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="desc || $slots.desc" class="ui-select-card-desc">
        <slot name="desc">{{ desc }}</slot>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ui-select-card {
  position: relative;
  border: 0.7px solid var(--color-border-soft);
  background-color: var(--color-bg-white);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  transition: border-color 0.2s, background-color 0.2s, transform 0.15s, box-shadow 0.2s;
  outline: none;
}
.ui-select-card:hover:not(.is-disabled) {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}
.ui-select-card:active:not(.is-disabled) { transform: translateY(1px); }
.ui-select-card:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent);
}
.ui-select-card.is-disabled { opacity: 0.55; cursor: not-allowed; }
.ui-select-card-check {
  position: absolute;
  top: 12px;
  right: 12px;
}
.ui-select-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-bg-white);
}
.ui-select-card-icon-text {
  font-weight: 700;
  font-size: 17px;
  line-height: 1;
  font-family: var(--font-family-cn);
}
.ui-select-card-body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.ui-select-card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: var(--font-family-cn);
}
.ui-select-card-desc {
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-muted);
  font-family: var(--font-family-cn);
}
</style>
