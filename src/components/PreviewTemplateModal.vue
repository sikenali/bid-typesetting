<script setup>
import { ref, watch, computed } from 'vue'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePptx from '@vue-office/pptx'
import { RiCloseLine, RiPagesLine, RiTextSnippet, RiHeading, RiFileTextLine } from '@remixicon/vue'
import { useDocument } from '../composables/useDocument'

const props = defineProps({
  template: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { getFile } = useDocument()
const currentFile = computed(() => getFile())

const docBuffer = ref(null)
const textContent = ref('')
const params = computed(() => props.template.formatParams || {})

const fileExtension = computed(() => {
  if (!currentFile.value) return ''
  return currentFile.value.name.split('.').pop().toLowerCase()
})

const isDocx = computed(() => fileExtension.value === 'docx')
const isPdf = computed(() => fileExtension.value === 'pdf')
const isXlsx = computed(() => fileExtension.value === 'xlsx')
const isPptx = computed(() => fileExtension.value === 'pptx')

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

watch(() => currentFile.value, async (file) => {
  docBuffer.value = null
  if (!file) return
  try {
    if (['docx', 'pdf', 'xlsx', 'pptx'].includes(fileExtension.value)) {
      docBuffer.value = await readFileAsArrayBuffer(file)
    }
  } catch (e) {
    console.error('读取文件失败:', e)
  }
}, { immediate: true })

const sections = computed(() => {
  const p = params.value
  return [
    {
      key: 'page',
      label: '页面设置',
      icon: RiPagesLine,
      fields: [
        { label: '纸张大小', value: p.page?.paperSize || '-' },
        { label: '上边距', value: p.page?.marginTop != null ? `${p.page.marginTop}cm` : '-' },
        { label: '下边距', value: p.page?.marginBottom != null ? `${p.page.marginBottom}cm` : '-' },
        { label: '左边距', value: p.page?.marginLeft != null ? `${p.page.marginLeft}cm` : '-' },
        { label: '右边距', value: p.page?.marginRight != null ? `${p.page.marginRight}cm` : '-' },
        { label: '方向', value: p.page?.orientation === 'portrait' ? '纵向' : p.page?.orientation === 'landscape' ? '横向' : '-' },
      ],
    },
    {
      key: 'body',
      label: '正文设置',
      icon: RiTextSnippet,
      fields: [
        { label: '字体', value: p.body?.font || '-' },
        { label: '字号', value: p.body?.fontSize || '-' },
        { label: '行距', value: p.body?.lineSpacing || '-' },
        { label: '首行缩进', value: p.body?.indentFirst != null ? `${p.body.indentFirst}字符` : '-' },
        { label: '左缩进', value: p.body?.indentLeft != null ? `${p.body.indentLeft}字符` : '-' },
      ],
    },
    {
      key: 'heading',
      label: '标题设置',
      icon: RiHeading,
      fields: [
        { label: '一级标题', value: p.heading?.level1 ? `${p.heading.level1.font} ${p.heading.level1.fontSize}` : '-' },
        { label: '二级标题', value: p.heading?.level2 ? `${p.heading.level2.font} ${p.heading.level2.fontSize}` : '-' },
        { label: '三级标题', value: p.heading?.level3 ? `${p.heading.level3.font} ${p.heading.level3.fontSize}` : '-' },
      ],
    },
  ]
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="emit('close')">
      <div class="w-[90vw] h-[88vh] max-w-[1400px] bg-cream rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-8 py-5 bg-cream-dark border-b border-tan-border shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cinnabar flex items-center justify-center">
              <RiFileTextLine size="20" color="white" />
            </div>
            <div>
              <h2 class="text-[18px] font-bold text-brown-dark">{{ template.name }}</h2>
              <p class="text-[12px] text-brown-muted">模板参数预览与文档效果</p>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="w-9 h-9 rounded-xl bg-cream border border-tan-border flex items-center justify-center hover:bg-cream-darker transition-colors"
          >
            <RiCloseLine size="18" class="text-brown-muted" />
          </button>
        </div>

        <div class="flex-1 flex min-h-0">
          <div class="flex-1 bg-warm-gray border-r border-tan-border flex flex-col min-w-0">
            <div class="px-6 py-4 bg-cream border-b border-tan-border shrink-0">
              <h3 class="text-[14px] font-semibold text-brown-dark flex items-center gap-2">
                <RiFileTextLine size="16" class="text-cinnabar" />
                文档预览
              </h3>
            </div>
            <div class="flex-1 overflow-auto p-6">
              <div v-if="currentFile && docBuffer && isDocx" class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl p-[1px]">
                <VueOfficeDocx :src="docBuffer" style="width: 100%;" />
              </div>
              <div v-else-if="currentFile && docBuffer && isPdf" class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl p-[1px]">
                <VueOfficePdf :src="docBuffer" style="width: 100%;" />
              </div>
              <div v-else-if="currentFile && docBuffer && isXlsx" class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl p-[1px]">
                <VueOfficeExcel :src="docBuffer" style="width: 100%;" />
              </div>
              <div v-else-if="currentFile && docBuffer && isPptx" class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl p-[1px]">
                <VueOfficePptx :src="docBuffer" style="width: 100%;" />
              </div>
              <div v-else class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl min-h-[600px] flex flex-col items-center justify-center text-center">
                <div class="w-20 h-20 rounded-full bg-[#FDF0E0] flex items-center justify-center mb-5">
                  <RiFileTextLine size="40" color="#D4C4A8" />
                </div>
                <p class="text-[16px] font-medium text-brown-muted mb-2">{{ currentFile ? '正在加载文档...' : '暂无打开的文档' }}</p>
                <p class="text-[13px] text-tan-dark max-w-[300px]">在编辑器中上传 DOCX / XLSX / PPTX / PDF 文档后，此处将实时预览模板排版效果</p>
              </div>
            </div>
          </div>

          <div class="w-[400px] bg-cream flex flex-col shrink-0">
            <div class="px-6 py-4 border-b border-tan-border shrink-0">
              <h3 class="text-[14px] font-semibold text-brown-dark">参数汇总</h3>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-5">
              <div v-for="section in sections" :key="section.key" class="bg-cream-dark rounded-xl p-4">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-tan-border/50">
                  <component :is="section.icon" size="16" class="text-cinnabar shrink-0" />
                  <span class="text-[14px] font-semibold text-brown-dark">{{ section.label }}</span>
                </div>
                <div class="space-y-2">
                  <div v-for="field in section.fields" :key="field.label" class="flex items-center justify-between">
                    <span class="text-[12px] text-brown-muted">{{ field.label }}</span>
                    <span class="text-[13px] font-medium text-brown-dark text-right max-w-[180px] truncate" :title="field.value">{{ field.value }}</span>
                  </div>
                </div>
              </div>

              <div v-if="!template.formatParams" class="bg-cream-dark rounded-xl p-4 text-center">
                <p class="text-[13px] text-brown-muted">此模板未保存排版参数</p>
                <p class="text-[12px] text-tan-dark mt-1">在编辑器中重新保存模板可记录参数</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-8 py-4 bg-cream-dark border-t border-tan-border shrink-0">
          <span class="text-[12px] text-brown-muted mr-auto">模板仅记录排版参数，实际效果取决于文档内容</span>
          <button
            @click="emit('close')"
            class="px-6 py-2.5 bg-white border border-tan-border rounded-xl text-[14px] font-medium text-brown hover:bg-cream transition-colors"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
