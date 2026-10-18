<template>
  <teleport to="body">
    <transition name="fpmodal">
      <div
        v-if="modelValue"
        class="fp-overlay"
        @click.self="!processing && $emit('update:modelValue', false)"
      >
        <div class="fp-card" role="dialog" aria-modal="true" aria-label="排版进度">
          <button
            v-if="!processing"
            class="fp-close"
            title="关闭"
            @click="$emit('update:modelValue', false)"
          >
            <RiCloseLine size="16" />
          </button>

          <!-- 进度标题行 -->
          <div class="fp-title-row">
            <span class="fp-title">排版进度</span>
            <span class="fp-percent">{{ progress }}%</span>
          </div>

          <!-- 进度描述 -->
          <div class="fp-desc">{{ desc }}</div>

          <!-- 进度条 -->
          <div
            class="fp-bar"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="fp-fill" :style="{ width: progress + '%' }"></div>
          </div>

          <!-- 日志面板 -->
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
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  processing: { type: Boolean, default: false },
  logs: { type: Array, default: () => [] },
  desc: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue && !props.processing) {
    emit('update:modelValue', false);
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
/* Calicat 设计图「排版进度卡片」1:1 还原（node 03807700） */
.fp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 1050);
  padding: 24px;
}

.fp-card {
  width: min(1474px, 92vw);
  position: relative;
  background-color: var(--color-bg-white, #FFFFFF);
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
  border-radius: 14px;
  padding: 24px 28px;
  box-shadow: var(--shadow-xl, 0 12px 40px rgba(0, 0, 0, 0.2));
}

.fp-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: var(--color-text-muted, #8A8578);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.fp-close:hover {
  background-color: var(--color-bg-secondary, #F7F3EA);
  color: var(--color-text-body, #3A3A3A);
}

/* 进度标题行：排版进度 17px Medium / 百分比 26px Bold 主色 */
.fp-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.fp-title {
  font-size: 17px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-text-primary, #1F1D1A);
  font-family: var(--font-family-cn);
}
.fp-percent {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-primary, #4A72A8);
  font-family: var(--font-family-cn);
}

/* 进度描述 16px Regular 次级文字 */
.fp-desc {
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.2;
  color: var(--color-text-secondary, #6E6A60);
  font-family: var(--font-family-cn);
}

/* 进度条 10px 全圆角，轨道 border-soft / 填充主色 */
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

/* 日志面板：圆角 10 / 内边距 16/20，颜色跟随主题（设计稿 border #EFEBE1 / 底 #FAF8F3） */
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

/* 日志行 14px Regular 弱化文字，行距 8 */
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

.fpmodal-enter-active,
.fpmodal-leave-active {
  transition: opacity 0.2s ease;
}
.fp-card {
  transition: transform 0.2s ease;
}
.fpmodal-enter-from .fp-card,
.fpmodal-leave-to .fp-card {
  transform: translateY(8px) scale(0.98);
}
.fpmodal-enter-from,
.fpmodal-leave-to {
  opacity: 0;
}
</style>
