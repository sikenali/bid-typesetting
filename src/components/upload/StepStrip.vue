<template>
  <div class="step-strip">
    <template v-for="(step, i) in steps" :key="i">
      <div class="step-pill" :class="pillClass(i)">
        <span class="step-num" :class="numClass(i)">
          <RiCheckLine v-if="showCheck(i)" size="14" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span class="step-label">{{ step.label }}</span>
      </div>
      <span
        v-if="i < steps.length - 1"
        class="step-line"
        :class="{ filled: lineFilled(i) }"
      ></span>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  steps: {
    type: Array,
    default: () => [
      { label: '样式遍历' },
      { label: '样式提取' },
      { label: '样式显示' },
    ],
  },
  current: {
    type: Number,
    default: 0,
  },
  done: {
    type: Boolean,
    default: false,
  },
})

function pillClass(i) {
  if (props.done) return 'pill-done'
  if (props.current <= 0) return 'pill-idle'
  if (i < props.current - 1) return 'pill-done'
  if (i === props.current - 1) return 'pill-active'
  return 'pill-idle'
}

function numClass(i) {
  if (props.done) return 'num-done'
  if (props.current <= 0) return 'num-idle'
  if (i < props.current - 1) return 'num-done'
  if (i === props.current - 1) return 'num-active'
  return 'num-idle'
}

function showCheck(i) {
  if (props.done) return true
  if (props.current <= 0) return false
  return i < props.current - 1
}

function lineFilled(i) {
  if (props.done) return true
  return props.current - 1 > i
}
</script>

<style scoped>
.step-strip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
}

.step-pill {
  height: 50px;
  padding: 0 20px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.pill-idle {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
}

.pill-active {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-primary);
}

.pill-done {
  background: var(--color-success-soft);
  border: 0.7px solid transparent;
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
  transition: background-color var(--transition-base), color var(--transition-base);
}

.num-idle {
  background: var(--color-badge-idle);
  color: var(--color-text-muted);
}

.num-active {
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
}

.num-done {
  background: var(--color-success);
  color: #fff;
}

.step-label {
  font-size: 17px;
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
  transition: color var(--transition-base);
}

.pill-idle .step-label { color: var(--color-text-muted); }
.pill-active .step-label { color: var(--color-primary-deep); }
.pill-done .step-label { color: var(--color-success-strong); }

.step-line {
  width: 57px;
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-border-line) 0px,
    var(--color-border-line) 5px,
    transparent 5px,
    transparent 9px
  );
  flex-shrink: 0;
  transition: background-color var(--transition-base);
}

.step-line.filled {
  background: var(--color-success);
}
</style>
