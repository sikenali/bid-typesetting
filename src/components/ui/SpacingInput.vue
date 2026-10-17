<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String], required: true },
  unit: { type: String, default: '磅' },
  min: { type: Number, default: 0 },
  step: { type: [Number, String], default: 0.1 },
  width: { type: String, default: 'w-[60px]' },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="input-with-unit">
    <input
      type="number"
      class="input-box"
      :min="min"
      :step="step"
      :value="currentValue"
      @input="emit('update:modelValue', parseFloat($event.target.value) || 0)"
      :disabled="disabled"
      :aria-label="ariaLabel || undefined"
    />
    <span v-if="unit" class="input-unit">{{ unit }}</span>
  </div>
</template>

<style scoped>
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-box {
  width: 130px;
  height: 44px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 15px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base), background var(--transition-base);
  font-family: var(--font-family);
}
.input-box:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-white);
}
.input-box:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.input-unit {
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
