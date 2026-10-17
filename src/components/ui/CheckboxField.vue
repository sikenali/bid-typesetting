<script setup>
defineProps({
  label: { type: String, default: '' },
})
const model = defineModel({ type: Boolean })
</script>

<template>
  <label class="checkbox-field">
    <div
      role="checkbox"
      :aria-checked="model"
      tabindex="0"
      class="checkbox-box"
      :class="{ checked: model }"
      @click="model = !model"
      @keydown.enter.prevent="model = !model"
      @keydown.space.prevent="model = !model"
    >
      <svg v-if="model" width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 4.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <span v-if="label" class="checkbox-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.checkbox-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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
  outline: none;
}
.checkbox-box.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.checkbox-field:hover .checkbox-box:not(.checked) {
  border-color: var(--color-primary);
}
.checkbox-label {
  font-size: 14px;
  color: var(--color-text-body);
}
</style>
