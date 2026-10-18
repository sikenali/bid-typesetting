<script setup>
import { computed } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'
import { confirmState, settleConfirm } from '@/utils/confirm'

const show = computed({
  get: () => !!confirmState.value,
  set: (v) => {
    if (!v) settleConfirm(false)
  },
})
</script>

<template>
  <UiModal
    v-model="show"
    :title="confirmState?.title || '请确认'"
    :icon="confirmState?.icon || 'ri-question-line'"
    :width="460"
    :max-width="520"
    height="auto"
    :confirm-text="confirmState?.confirmText || '确定'"
    :cancel-text="confirmState?.cancelText || '取消'"
    @confirm="settleConfirm(true)"
  >
    <p class="confirm-message">{{ confirmState?.message }}</p>
  </UiModal>
</template>

<style scoped>
.confirm-message {
  margin: 0;
  font-size: 15px;
  line-height: 24px;
  color: var(--color-text-body);
  font-family: var(--font-family-cn);
  white-space: pre-wrap;
}
</style>
