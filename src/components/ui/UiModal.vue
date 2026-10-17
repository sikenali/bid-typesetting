<script setup>
/**
 * UiModal — 统一弹框壳
 * 头部：图标 + 标题 + 副标题 + 圆形关闭钮；底部标准取消/确定按钮（可用 footer slot 覆盖）
 * 规格对齐 DESIGN.md §6.1：遮罩 rgba(0,0,0,0.4) / opacity 0.3s ease / max-width 600px
 *        / height calc(100vh - 40px) / 圆角 18px / 阴影 var(--shadow-xl)
 *
 * @example
 * <UiModal v-model="show" title="新增模板" subtitle="创建后可在列表中启用" icon="ri-add-line"
 *   confirm-text="确定" :confirm-disabled="!name" @confirm="handleAdd">
 *   <UiInput v-model="name" placeholder="请输入" />
 * </UiModal>
 */
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { riToCompName } from '@/utils/icon';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** remix icon class，如 ri-add-line */
  icon: { type: String, default: 'ri-file-edit-line' },
  /** 面板宽度（px 数字或 css 字符串），默认 560 */
  width: { type: [Number, String], default: 560 },
  /** 面板最大宽度（px 数字或 css 字符串），默认 600 */
  maxWidth: { type: [Number, String], default: 600 },
  /** 面板高度（css 字符串），默认 calc(100vh - 40px) */
  height: { type: String, default: 'calc(100vh - 40px)' },
  /** 点击遮罩关闭 */
  closeOnClickOverlay: { type: Boolean, default: true },
  /** ESC 关闭 */
  closeOnEsc: { type: Boolean, default: true },
  /** 显示右上关闭钮 */
  showClose: { type: Boolean, default: true },
  /** 显示底部标准按钮组 */
  showFooter: { type: Boolean, default: true },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '确定' },
  confirmDisabled: { type: Boolean, default: false },
  confirmLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'close', 'confirm', 'cancel']);

const panelWidth = computed(() => typeof props.width === 'number' ? props.width + 'px' : props.width);
const panelMaxWidth = computed(() => typeof props.maxWidth === 'number' ? props.maxWidth + 'px' : props.maxWidth);

function close() {
  emit('update:modelValue', false);
  emit('close');
}
function onCancel() {
  emit('cancel');
  close();
}
function onConfirm() {
  if (props.confirmDisabled || props.confirmLoading) return;
  emit('confirm');
}
function onKey(ev) {
  if (ev.key === 'Escape' && props.modelValue && props.closeOnEsc) close();
}
// body 滚动锁定（多弹框嵌套时以计数方式处理）
let lockCount = 0;
function lockScroll(lock) {
  lockCount = Math.max(0, lockCount + (lock ? 1 : -1));
  document.body.style.overflow = lockCount > 0 ? 'hidden' : '';
}
watch(() => props.modelValue, v => lockScroll(v));
onMounted(() => {
  if (props.modelValue) lockScroll(true);
  document.addEventListener('keydown', onKey);
});
onUnmounted(() => {
  if (props.modelValue) lockScroll(false);
  document.removeEventListener('keydown', onKey);
});
</script>

<template>
  <teleport to="body">
    <transition name="ui-modal">
      <div v-if="modelValue" class="ui-modal-overlay" @click.self="closeOnClickOverlay && close()">
        <div
          class="ui-modal-panel"
          :style="{
            width: panelWidth,
            maxWidth: panelMaxWidth,
            height: props.height,
            maxHeight: props.height,
          }"
          role="dialog"
          aria-modal="true"
        >
          <div class="ui-modal-header">
            <div class="ui-modal-header-left">
              <div class="ui-modal-icon">
                <component :is="riToCompName(icon)" size="26" />
              </div>
              <div class="ui-modal-header-text">
                <h2 class="ui-modal-title">{{ title }}</h2>
                <p v-if="subtitle || $slots.subtitle" class="ui-modal-subtitle">
                  <slot name="subtitle">{{ subtitle }}</slot>
                </p>
              </div>
            </div>
            <button v-if="showClose" class="ui-modal-close" @click="close" aria-label="关闭">
              <RiCloseLine size="20" />
            </button>
          </div>

          <div class="ui-modal-body">
            <slot />
          </div>

          <div v-if="showFooter || $slots.footer" class="ui-modal-footer">
            <slot name="footer">
              <span class="ui-modal-footer-hint">
                <slot name="footer-hint" />
              </span>
              <span class="ui-modal-footer-btns">
                <button class="ui-modal-cancel" @click="onCancel">{{ cancelText }}</button>
                <button
                  class="ui-modal-confirm"
                  :disabled="confirmDisabled || confirmLoading"
                  @click="onConfirm"
                >
                  <RiLoader4Line v-if="confirmLoading" size="16" class="ui-modal-spin" />
                  {{ confirmText }}
                </button>
              </span>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.ui-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 20px;
}
.ui-modal-panel {
  background: var(--color-bg-white);
  border-radius: 18px;
  box-shadow: var(--shadow-xl);
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.ui-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 22px;
}
.ui-modal-header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}
.ui-modal-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}
.ui-modal-header-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ui-modal-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 28px;
  font-family: var(--font-family-cn);
}
.ui-modal-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 18px;
  font-family: var(--font-family-cn);
}
.ui-modal-close {
  width: 40px;
  height: 40px;
  background: var(--color-bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-body);
  cursor: pointer;
  border: none;
  flex-shrink: 0;
  transition: background-color 0.2s, transform 0.15s;
}
.ui-modal-close:hover { background: var(--color-border-soft); }
.ui-modal-close:active { transform: scale(0.94); }
.ui-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}
.ui-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  margin-top: 4px;
  border-top: 0.7px solid var(--color-border-soft);
}
.ui-modal-footer-hint:empty { display: none; }
.ui-modal-footer-btns {
  display: flex;
  gap: 12px;
  margin-left: auto;
}
.ui-modal-cancel {
  height: 42px;
  padding: 0 24px;
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-bg-card);
  color: var(--color-text-body);
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: var(--font-family-cn);
}
.ui-modal-cancel:hover { background-color: var(--color-bg-secondary); }
.ui-modal-confirm {
  height: 42px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background-color: var(--color-primary);
  color: var(--color-bg-white);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s, transform 0.15s;
  font-family: var(--font-family-cn);
}
.ui-modal-confirm:hover:not(:disabled) { opacity: 0.92; }
.ui-modal-confirm:active:not(:disabled) { transform: translateY(1px); }
.ui-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.ui-modal-spin { animation: ui-modal-spin 1s linear infinite; display: inline-flex; }
@keyframes ui-modal-spin { to { transform: rotate(360deg); } }

.ui-modal-enter-active, .ui-modal-leave-active { transition: opacity 0.3s ease; }
.ui-modal-enter-active .ui-modal-panel, .ui-modal-leave-active .ui-modal-panel {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.ui-modal-enter-from, .ui-modal-leave-to { opacity: 0; }
.ui-modal-enter-from .ui-modal-panel, .ui-modal-leave-to .ui-modal-panel {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
</style>
