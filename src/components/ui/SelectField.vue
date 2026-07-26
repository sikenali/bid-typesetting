<script setup>
defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
})
const model = defineModel()
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-[13px] text-brown whitespace-nowrap shrink-0">{{ label }}</label>
    <select
      v-model="model"
      class="flex-1 bg-white border border-tan-border rounded-lg px-2 py-1.5 text-[13px] text-brown outline-none focus:border-cinnabar transition-colors"
      :aria-label="label"
    >
      <option v-for="opt in options" :key="opt[optionValue]" :value="opt[optionValue]">
        {{ opt[optionLabel] }}
      </option>
    </select>
  </div>
</template>
