<script setup>
import { RiArrowDownSLine } from '@remixicon/vue'
defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
})
const model = defineModel()
</script>

<template>
  <div class="select-field">
    <label class="select-label">{{ label }}</label>
    <div class="select-box">
      <select v-model="model" class="select-input" :aria-label="label">
        <option v-for="opt in options" :key="opt[optionValue]" :value="opt[optionValue]">
          {{ opt[optionLabel] }}
        </option>
      </select>
      <span class="arrow"><RiArrowDownSLine :size="14" /></span>
    </div>
  </div>
</template>

<style scoped>
.select-field {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.select-label {
  font-size: 14px;
  color: var(--color-text-body);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
}
.select-box {
  position: relative;
  flex: 1;
  height: 36px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: border-color var(--transition-base);
}
.select-box:hover { border-color: var(--color-border-hover); }
.select-box:focus-within { border-color: var(--color-primary); background: var(--color-bg-white); }
.select-input {
  flex: 1;
  height: 100%;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 14px;
  outline: none;
  appearance: none;
  cursor: pointer;
}
.arrow {
  padding-right: 10px;
  color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}
</style>
