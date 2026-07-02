<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true }, // [{ value, icon, label }]
  buttonSize: { type: String, default: 'w-7 h-6' },
})

const emit = defineEmits(['update:modelValue'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="bg-cream-darker rounded-lg p-[3px] flex items-center relative" role="group" aria-label="对齐方式">
    <div
      class="absolute top-[3px] bottom-[3px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
      :style="{ left: `${3 + Math.max(0, (options ?? []).findIndex(o => o.value === currentValue)) * 28}px`, width: '28px' }"
    ></div>
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="emit('update:modelValue', opt.value)"
      class="relative z-10 w-7 h-6 rounded-[3px] flex items-center justify-center transition-colors duration-200 cursor-pointer"
      :class="currentValue === opt.value ? 'text-cinnabar font-semibold' : 'text-brown-muted hover:text-brown'"
      :aria-pressed="currentValue === opt.value"
      :aria-label="'对齐方式：' + (opt.label || opt.value)"
    >
      <component :is="opt.icon" :size="13" />
    </button>
  </div>
</template>
