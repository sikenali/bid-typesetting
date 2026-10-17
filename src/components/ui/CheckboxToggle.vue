<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  size: { type: String, default: 'small' },
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="checkbox-toggle" @click="toggle" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle" role="checkbox" :aria-checked="modelValue" :aria-label="label" tabindex="0">
    <div class="checkbox-box" :class="{ checked: modelValue }">
      <svg v-if="modelValue" width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 4.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <span class="checkbox-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.checkbox-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  outline: none;
}
.checkbox-box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  flex-shrink: 0;
}
.checkbox-box.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.checkbox-label {
  font-size: 14px;
  color: var(--color-text-body);
  flex-shrink: 0;
}
.checkbox-toggle:hover .checkbox-box:not(.checked) {
  border-color: var(--color-primary);
}
</style>
