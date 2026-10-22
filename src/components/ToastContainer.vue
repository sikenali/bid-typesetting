<template>
  <Teleport to="body">
    <div class="toast-wrap" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :style="{
            background: toast.style.bg,
            borderColor: toast.style.border,
            color: toast.style.color,
          }"
          :class="{ 'toast-hide': !toast.visible }"
        >
          <span class="toast-stripe" :style="{ background: toast.style.border }"></span>
          <component
            :is="toastIcons[toast.type] || toastIcons.info"
            size="16"
            class="toast-icon"
            aria-hidden="true"
          />
          <span class="toast-text">{{ toast.message }}</span>
          <button class="toast-close" :aria-label="'关闭提示'" @click="dismiss(toast.id)">
            <RiCloseLine size="12" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastState, showToast } from '../utils/toast'
import {
  RiCheckLine, RiCloseCircleLine, RiErrorWarningLine, RiInformationLine,
} from '@remixicon/vue'

const { toasts } = useToastState()

const toastIcons = {
  success: RiCheckLine,
  error: RiCloseCircleLine,
  warning: RiErrorWarningLine,
  info: RiInformationLine,
}

function dismiss(id) {
  showToast('', 'info', 1)
  toasts.value = toasts.value.filter(t => t.id !== id)
}
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 12px 22px;
  border-radius: var(--radius-md);
  border: 0.7px solid var(--color-border);
  box-shadow: var(--shadow-md);
  font-size: 14px;
  font-weight: 500;
  min-width: 220px;
  max-width: 420px;
  line-height: 1.45;
}
.toast-stripe {
  flex-shrink: 0;
  width: 3px;
  height: 20px;
  border-radius: 2px;
}
.toast-icon {
  flex-shrink: 0;
  display: inline-flex;
}
.toast-text {
  flex: 1;
  word-break: break-word;
}
.toast-close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: inherit;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.toast-close:hover { opacity: 1; }
.toast-hide { opacity: 0; transform: translateY(-10px); transition: all 0.3s ease; }

.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
