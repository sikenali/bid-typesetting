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
  <div class="flex items-center gap-1">
    <input
      type="number"
      :min="min"
      :step="step"
      :value="currentValue"
      @input="emit('update:modelValue', parseFloat($event.target.value) || 0)"
      :disabled="disabled"
      :aria-label="ariaLabel || undefined"
      :class="[width, 'bg-white border border-tan-border rounded-lg px-[8px] py-[6px] text-[12px] text-brown outline-none focus:border-cinnabar transition-colors disabled:opacity-60 disabled:cursor-not-allowed']"
    />
    <span v-if="unit" class="text-[12px] text-brown shrink-0">{{ unit }}</span>
  </div>
</template>
