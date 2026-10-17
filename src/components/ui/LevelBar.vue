<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  labels: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const barRef = ref(null)
const indicatorStyle = ref({ left: '3px', width: '60px' })

function positionIndicator() {
  const bar = barRef.value
  if (!bar) return
  const btns = bar.querySelectorAll('[data-level-btn]')
  const btn = btns[props.modelValue]
  if (!btn) {
    if (props.labels.length) console.warn(`LevelBar: modelValue ${props.modelValue} out of range for ${btns.length} buttons`)
    return
  }
  const barRect = bar.getBoundingClientRect()
  const btnRect = btn.getBoundingClientRect()
  indicatorStyle.value = {
    left: `${btnRect.left - barRect.left}px`,
    width: `${btnRect.width}px`,
  }
}

function select(idx) {
  emit('update:modelValue', idx)
  nextTick(positionIndicator)
}

watch(() => props.modelValue, () => { nextTick(positionIndicator) })
watch(() => props.labels, () => { nextTick(positionIndicator) })
onMounted(() => { nextTick(positionIndicator) })
</script>

<template>
  <div ref="barRef" class="level-bar" role="group" :aria-label="'选择层级'">
    <div class="level-indicator" :style="indicatorStyle"></div>
    <button
      v-for="(label, idx) in labels"
      :key="idx"
      data-level-btn
      class="level-btn"
      :class="{ active: modelValue === idx }"
      @click="select(idx)"
      :aria-pressed="modelValue === idx"
      :aria-label="label"
    >{{ label }}</button>
  </div>
</template>

<style scoped>
.level-bar {
  display: inline-flex;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  position: relative;
}
.level-indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  background: var(--color-primary);
  border-radius: 8px;
  transition: all var(--transition-slow);
  pointer-events: none;
}
.level-btn {
  position: relative;
  z-index: 1;
  min-width: 60px;
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 8px;
  color: var(--color-text-body);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--transition-base);
  white-space: nowrap;
}
.level-btn.active {
  color: #fff;
  font-weight: 500;
}
.level-btn:not(.active):hover {
  color: var(--color-text-primary);
}
</style>
