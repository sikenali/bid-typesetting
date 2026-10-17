<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  buttonSize: { type: String, default: 'w-7 h-6' },
})

const emit = defineEmits(['update:modelValue'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="align-group" role="group" aria-label="对齐方式">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="align-btn"
      :class="{ active: currentValue === opt.value }"
      @click="emit('update:modelValue', opt.value)"
      :aria-pressed="currentValue === opt.value"
      :aria-label="'对齐方式：' + (opt.label || opt.value)"
    >
      <component :is="opt.icon" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.align-group {
  display: inline-flex;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}
.align-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-base);
}
.align-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-white);
}
.align-btn.active {
  background: var(--color-primary);
  color: #fff;
}
</style>
