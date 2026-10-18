<script setup>
import { computed } from 'vue'
import DocumentPreview from '@/components/DocumentPreview.vue'
import { useDocument } from '@/composables/useDocument'
import { UiModal } from '@/components/ui'

const props = defineProps({
  template: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const visible = computed({
  get: () => true,
  set: () => {},
})

const { getFile } = useDocument()
const currentFile = computed(() => getFile())
const params = computed(() => props.template.formatParams || null)

function formatLineSpacing(mode, value) {
  if (!mode) return '-'
  if (mode === 'EXACT') return `固定值 ${value} 磅`
  if (mode === 'AT_LEAST') return `最小值 ${value} 磅`
  if (mode === 'SINGLE') return '单倍行距'
  if (mode === 'ONE_POINT_FIVE') return '1.5 倍行距'
  if (mode === 'DOUBLE') return '双倍行距'
  if (mode === 'MULTIPLE') return `${value} 倍行距`
  return String(value ?? '-')
}

function alignLabel(v) {
  if (!v) return '-'
  const map = { JUSTIFY: '两端对齐', LEFT: '左对齐', CENTER: '居中', RIGHT: '右对齐' }
  return map[v] || v
}

const sections = computed(() => {
  const p = params.value || {}
  const headings = Array.isArray(p.headings) ? p.headings : []
  const headingItems = [0, 1, 2, 3].map(i => {
    const h = headings[i]
    const name = ['一级', '二级', '三级', '四级'][i]
    return {
      label: `${name}标题`,
      value: h ? `${h.cn_font || '-'} / ${h.en_font || '-'} · ${h.size_cn || '-'}` : '-',
    }
  })
  return [
    {
      key: 'page',
      label: '页面设置',
      icon: 'RiPagesLine',
      fields: [
        { label: '纸张大小', value: p.page?.paper_size === 'A4' ? 'A4 (210×297mm)' : (p.page?.paper_size || '-') },
        { label: '上边距', value: p.page?.top_cm != null ? `${p.page.top_cm} cm` : '-' },
        { label: '下边距', value: p.page?.bottom_cm != null ? `${p.page.bottom_cm} cm` : '-' },
        { label: '左边距', value: p.page?.left_cm != null ? `${p.page.left_cm} cm` : '-' },
        { label: '右边距', value: p.page?.right_cm != null ? `${p.page.right_cm} cm` : '-' },
      ],
    },
    {
      key: 'body',
      label: '正文样式',
      icon: 'RiTextSnippet',
      fields: [
        { label: '中文字体', value: p.body?.cn_font || '-' },
        { label: '英文字体', value: p.body?.en_font || '-' },
        { label: '字号', value: p.body?.size_cn || '-' },
        { label: '行距', value: p.body?.line_spacing_mode ? formatLineSpacing(p.body.line_spacing_mode, p.body.line_spacing_value) : (p.body?.lineSpacing || '-') },
        { label: '对齐', value: alignLabel(p.body?.align) },
      ],
    },
    {
      key: 'heading',
      label: '标题样式',
      icon: 'RiHeading',
      fields: headingItems,
    },
  ]
})

function onClose() {
  emit('close')
}
</script>

<template>
  <UiModal
    v-model="visible"
    title="模板预览"
    :subtitle="props.template.name"
    icon="ri-eye-line"
    width="94vw"
    :max-width="1600"
    height="85vh"
    :show-footer="false"
    @close="onClose"
  >
    <main class="modal-body">
      <section class="preview-pane">
        <DocumentPreview :file="currentFile" />
      </section>

      <aside class="params-pane">
        <div v-if="!params" class="empty-note">
          <RiFileTextLine size="32" />
          <p>此模板未保存排版参数</p>
        </div>
        <div v-else class="params-list">
          <div v-for="s in sections" :key="s.key" class="section">
            <div class="section-head">
              <component :is="s.icon" size="15" class="section-icon" />
              <span class="section-title">{{ s.label }}</span>
            </div>
            <div v-for="f in s.fields" :key="f.label" class="field-row">
              <span class="field-label">{{ f.label }}</span>
              <span class="field-value" :title="f.value">{{ f.value }}</span>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <template #footer>
      <span class="ui-modal-footer-btns preview-footer-btns">
        <button class="ui-modal-cancel" @click="onClose">关闭预览</button>
      </span>
    </template>
  </UiModal>
</template>

<style scoped>
.modal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  gap: 0;
}
.preview-pane {
  flex: 0 0 60%;
  min-width: 0;
  background: var(--color-bg-secondary);
  padding: 24px;
  overflow: auto;
  display: flex;
  justify-content: center;
}
.params-pane {
  flex: 1;
  min-width: 0;
  padding: 20px 24px;
  overflow-y: auto;
  background: var(--color-bg-white);
  border-left: 0.7px solid var(--color-border-soft);
}
.params-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.section {
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 10px;
  padding: 14px 16px;
}
.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.section-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
  font-size: 13px;
}
.field-label {
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.field-value {
  color: var(--color-text-body);
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-note {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-faint);
  font-size: 14px;
}
.empty-note p {
  color: var(--color-text-muted);
}
</style>
