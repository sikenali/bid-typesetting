<script setup>
/**
 * UiSwitch — 统一开关滑块
 * 规格对齐设计稿 §B2.3：46×26 / radius 9999 / track 开=var(--color-primary) 关=var(--color-switch-off)
 *        / 滑块 21×20 白圆 / padding 0 3px
 *
 * @example
 * <UiSwitch v-model="settings.autoTable" />
 * <UiSwitch v-model="on" size="sm" disabled />
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /** sm=38×22 md=46×26 */
  size: { type: String, default: 'md' },
});

const emit = defineEmits(['update:modelValue', 'change']);

function toggle() {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
  emit('change', !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="ui-switch"
    :class="['is-' + size, { 'is-on': modelValue, 'is-disabled': disabled }]"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="ui-switch-knob"></span>
  </button>
</template>

<style scoped>
.ui-switch {
  flex-shrink: 0;
  border: none;
  border-radius: 9999px;
  padding: 0 3px;
  cursor: pointer;
  background-color: var(--color-switch-off);
  transition: background-color 0.22s ease, opacity 0.2s;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.is-md { width: 46px; height: 26px; }
.is-sm { width: 38px; height: 22px; padding: 0 2px; }
.ui-switch.is-on {
  background-color: var(--color-primary);
  justify-content: flex-end;
}
.ui-switch-knob {
  border-radius: 9999px;
  background-color: var(--color-bg-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transition: transform 0.22s ease;
}
.is-md .ui-switch-knob { width: 21px; height: 20px; }
.is-sm .ui-switch-knob { width: 16px; height: 16px; }
.ui-switch:active:not(:disabled) .ui-switch-knob { transform: scale(0.92); }
.ui-switch.is-disabled { opacity: 0.5; cursor: not-allowed; }
</style>
