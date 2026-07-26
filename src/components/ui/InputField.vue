<script setup>
const model = defineModel()
defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  unit: { type: String, default: '' },
  min: [Number, String],
  max: [Number, String],
  step: [Number, String],
})
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-[13px] text-brown whitespace-nowrap shrink-0">{{ label }}</label>
    <input
      v-model.number="model"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-2 py-1.5 text-[13px] text-brown outline-none focus:border-cinnabar transition-colors"
      :aria-label="label"
    />
    <span v-if="unit" class="text-[13px] text-brown shrink-0">{{ unit }}</span>
  </div>
</template>
