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
  <div class="input-field">
    <label class="input-label">{{ label }}</label>
    <div class="input-with-unit">
      <input
        v-model.number="model"
        :type="type"
        :min="min"
        :max="max"
        :step="step"
        class="input-box"
        :aria-label="label"
      />
      <span v-if="unit" class="input-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.input-label {
  font-size: 14px;
  color: var(--color-text-body);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
}
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.input-box {
  width: 100px;
  height: 36px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base), background var(--transition-base);
  font-family: var(--font-family);
}
.input-box:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-white);
}
.input-unit {
  font-size: 13px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
</style>
