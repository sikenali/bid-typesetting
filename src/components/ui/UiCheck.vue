<script setup>
/**
 * UiCheck — 统一勾选选中图标（卡片激活态右上徽标）
 * 选中时缩放弹出，未选中可完全隐藏（ghost 模式只占位不渲染，cover 模式渲染空心圈）
 * 规格对齐 DESIGN.md §6.3：尺寸走 size prop，勾选色为主题主色
 *
 * @example
 * <UiCheck :checked="selected === item.key" />
 * <UiCheck :checked="on" mode="cover" :size="22" />
 */
defineProps({
  checked: { type: Boolean, default: false },
  /** ghost=未选中不渲染 cover=未选中显示空心圈 */
  mode: { type: String, default: 'ghost' },
  size: { type: Number, default: 24 },
});
</script>

<template>
  <transition name="ui-check-pop">
    <span
      v-if="checked || mode === 'cover'"
      class="ui-check"
      :class="{ 'is-checked': checked }"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <svg
        v-if="checked"
        :width="Math.round(size * 0.58)"
        :height="Math.round(size * 0.58)"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M2.5 7L5.5 10L11.5 3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </transition>
</template>

<style scoped>
.ui-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--color-border);
  background-color: var(--color-bg-white);
  color: transparent;
  transition: background-color 0.18s, border-color 0.18s, color 0.18s;
}
.ui-check.is-checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg-white);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
}
.ui-check-pop-enter-active { transition: transform 0.22s cubic-bezier(0.34, 1.5, 0.64, 1), opacity 0.15s; }
.ui-check-pop-leave-active { transition: transform 0.14s ease-in, opacity 0.14s; }
.ui-check-pop-enter-from, .ui-check-pop-leave-to { transform: scale(0.4); opacity: 0; }
</style>
