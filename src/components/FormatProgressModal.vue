<template>
  <UiModal
    v-model="visible"
    title="排版进度"
    :subtitle="desc"
    icon="ri-loader-2-line"
    width="1474px"
    :max-width="1400"
    :show-footer="false"
    :show-close="!processing"
    :close-on-click-overlay="!processing"
    :close-on-esc="!processing"
    @close="onClose"
  >
    <div class="fp-inner">
      <div class="fp-title-row">
        <span class="fp-percent">{{ progress }}%</span>
      </div>

      <div
        class="fp-bar"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="fp-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div class="fp-logs">
        <div
          v-for="(log, i) in logs"
          :key="i"
          class="fp-log-row"
          :class="{ 'is-error': log.type === 'error' }"
        >
          <span class="fp-log-time">{{ log.time }}</span>
          <span class="fp-log-msg">{{ log.msg }}</span>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { computed } from 'vue';
import { UiModal } from '@/components/ui';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  processing: { type: Boolean, default: false },
  logs: { type: Array, default: () => [] },
  desc: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => {
    if (!props.processing) emit('update:modelValue', v);
  },
});

function onClose() {
  if (!props.processing) emit('update:modelValue', false);
}
</script>

<style scoped>
.fp-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.fp-title-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
.fp-percent {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-primary, #4A72A8);
  font-family: var(--font-family-cn);
}

.fp-bar {
  margin-top: 16px;
  width: 100%;
  height: 10px;
  border-radius: 9999px;
  background-color: var(--color-border-soft, #EDE9E0);
  overflow: hidden;
}
.fp-fill {
  height: 10px;
  border-radius: 9999px;
  background-color: var(--color-primary, #4A72A8);
  transition: width 0.3s ease;
}

.fp-logs {
  margin-top: 24px;
  max-height: 200px;
  overflow-y: auto;
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
  background-color: var(--color-bg-secondary, #F7F3EA);
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
}

.fp-log-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
  line-height: 1.2;
  color: var(--color-text-muted, #8A8578);
  font-family: var(--font-family-cn);
}
.fp-log-row + .fp-log-row {
  margin-top: 8px;
}
.fp-log-time {
  flex-shrink: 0;
}
.fp-log-row.is-error {
  color: var(--color-error, #E74C3C);
}
</style>
