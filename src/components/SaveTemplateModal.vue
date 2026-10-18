<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from '@/utils/toast'

const emit = defineEmits(['close', 'saved'])
const props = defineProps({
  params: { type: Object, default: () => ({}) },
})

const name = ref('')
const category = ref('official')

const categories = [
  { id: 'official', label: '公文' },
  { id: 'academic', label: '学术' },
  { id: 'military', label: '军标' },
  { id: 'business', label: '商务' },
  { id: 'creative', label: '创意' },
]

const summary = computed(() => {
  const p = props.params || {}
  const page = p.page || {}
  const body = p.body || {}
  const lines = []
  lines.push(`纸张 ${page.paper_size || '-'} · 页边距 上${page.top_cm ?? '-'} / 下${page.bottom_cm ?? '-'} / 左${page.left_cm ?? '-'} / 右${page.right_cm ?? '-'} cm`)
  lines.push(`正文 ${body.cn_font || '-'} / ${body.en_font || '-'} · ${body.size_cn || '-'} 号`)
  lines.push(`行距 ${body.line_spacing_mode === 'EXACT' ? '固定值' : body.line_spacing_mode === 'ONE_POINT_FIVE' ? '1.5 倍' : body.line_spacing_mode === 'DOUBLE' ? '双倍' : body.line_spacing_mode || '-'}${body.line_spacing_value != null ? ` · ${body.line_spacing_value}` : ''}`)
  if (Array.isArray(p.headings) && p.headings.length) {
    lines.push(`标题 ${p.headings[0].cn_font || '-'} / ${p.headings[0].size_cn || '-'} · ${p.headings.length} 级`)
  }
  return lines
})

function handleSave() {
  if (!name.value.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }
  emit('saved', { name: name.value.trim(), category: category.value })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="overlay" @click.self="emit('close')">
        <div class="modal-card" role="dialog" aria-modal="true">
          <header class="modal-header">
            <div class="header-left">
              <div class="header-icon"><RiSaveLine size="18" /></div>
              <span class="header-title">保存到模板</span>
            </div>
            <button class="close-btn" @click="emit('close')" aria-label="关闭">
              <RiCloseLine size="18" />
            </button>
          </header>

          <div class="modal-body">
            <div class="field">
              <label class="field-label">模板名称</label>
              <input
                v-model="name"
                type="text"
                placeholder="请输入模板名称"
                class="input-box"
                @keyup.enter="handleSave"
              />
            </div>

            <div class="field">
              <label class="field-label">分类</label>
              <div class="chip-grid">
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  type="button"
                  class="chip"
                  :class="{ active: category === cat.id }"
                  @click="category = cat.id"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <div class="summary">
              <div class="summary-title">
                <RiInformationLine size="14" />
                <span>当前参数摘要</span>
              </div>
              <ul class="summary-list">
                <li v-for="(line, i) in summary" :key="i">{{ line }}</li>
              </ul>
            </div>
          </div>

          <footer class="modal-footer">
            <button class="btn-outline" @click="emit('close')">取消</button>
            <button
              class="btn-primary"
              :disabled="!name.trim()"
              @click="handleSave"
            >保存</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: var(--z-modal);
}
.modal-card {
  width: 480px;
  max-width: 100%;
  background: var(--color-bg-white);
  border-radius: 18px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40px);
}
.modal-header {
  height: 60px;
  padding: 0 20px;
  border-bottom: 0.7px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.close-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-body);
}
.input-box {
  height: 44px;
  width: 100%;
  padding: 0 14px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  font-size: 15px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base), background-color var(--transition-base);
  font-family: inherit;
}
.input-box::placeholder {
  color: var(--color-text-faint);
}
.input-box:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-white);
}
.chip-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.chip {
  height: 36px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}
.chip:hover {
  border-color: var(--color-primary);
}
.chip.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary-deep);
  font-weight: 500;
}
.summary {
  padding: 12px 14px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  border: 0.7px solid var(--color-border-soft);
}
.summary-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  font-weight: 500;
}
.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.summary-list li {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.modal-footer {
  padding: 14px 24px;
  border-top: 0.7px solid var(--color-border-soft);
  background: var(--color-bg-secondary);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}
.btn-primary,
.btn-outline {
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  transition: opacity var(--transition-base), transform var(--transition-base), background-color var(--transition-base), border-color var(--transition-base);
}
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
  border: none;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.92;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-outline {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.96);
}
</style>
