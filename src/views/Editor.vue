<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDocument } from '../composables/useDocument'
import { useTemplates } from '../composables/useTemplates'
import { useFormatState } from '../composables/useFormatState'
import { formatDocument } from '../api/format'
import Sidebar from '../components/Sidebar.vue'
import SaveTemplateModal from '../components/SaveTemplateModal.vue'
import PagePanel from '../components/panels/PagePanel.vue'
import BodyPanel from '../components/panels/BodyPanel.vue'
import HeadingPanel from '../components/panels/HeadingPanel.vue'
import ChartPanel from '../components/panels/ChartPanel.vue'
import TOCPanel from '../components/panels/TOCPanel.vue'
import HeaderFooterPanel from '../components/panels/HeaderFooterPanel.vue'
import ResetPanel from '../components/panels/ResetPanel.vue'
import { DocxEditor } from '@eigenpal/docx-editor-vue'
import '@eigenpal/docx-editor-vue/styles.css'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import {
  RiZoomOutLine, RiZoomInLine, RiPagesLine, RiTextSnippet, RiHeading,
  RiBarChart2Line, RiListCheck2, RiLayoutTop2Line, RiBrushLine,
  RiFootprintLine, RiDoubleQuotesL, RiFileTextLine, RiFileEditLine,
  RiSideBarLine, RiCheckLine, RiEdit2Line, RiEyeLine, RiLoader2Line,
  RiSaveLine, RiSparklingLine
} from '@remixicon/vue'

const router = useRouter()
const { getFile } = useDocument()
const currentFile = computed(() => getFile())
const { formatParams, applyFormatting, takeBeforeSnapshot } = useFormatState()
const { saveTemplate } = useTemplates()

const activeTab = ref('page')
const showSaveModal = ref(false)
const zoomLevel = ref(100)
const currentPage = ref(1)
const totalPages = ref('--')
const showNav = ref(false)
const showPreviewModal = ref(false)
const headings = ref([])
const previewScrollRef = ref(null)
const documentBuffer = ref(null)
const editorRef = ref(null)
const isEditMode = ref(false)
const vueOfficeBuffer = ref(null)
const isProcessing = ref(false)

const LARGE_FILE_SIZE = 50 * 1024 * 1024
const LARGE_PAGE_COUNT = 200

const isLargeFile = computed(() => {
  if (!currentFile.value) return false
  const size = currentFile.value.size
  const pages = totalPages.value
  return size > LARGE_FILE_SIZE || (typeof pages === 'number' && pages > LARGE_PAGE_COUNT)
})

const handleLargeFileWarning = () => {
  if (!isLargeFile.value) return true
  return confirm(`文档较大（${totalPages.value} 页），排版可能需要较长时间，是否继续？`)
}

const tabIcons = {
  page: RiPagesLine,
  body: RiTextSnippet,
  heading: RiHeading,
  chart: RiBarChart2Line,
  toc: RiListCheck2,
  header: RiLayoutTop2Line,
  reset: RiBrushLine,
}

const tabTitles = {
  page: '页面设置',
  body: '正文设置',
  heading: '标题设置',
  chart: '图表设置',
  toc: '目录设置',
  header: '页眉页脚设置',
  reset: '初始化',
}

const tabSubtitles = {
  page: '配置页面尺寸、边距与方向',
  body: '配置正文字体、段落、缩进与对齐方式',
  heading: '设置各级标题样式',
  chart: '配置图表样式与位置',
  toc: '设置目录层级与格式',
  header: '配置页眉页脚内容、位置与样式',
  reset: '在一键排版之前，对上传的文件进行初始化操作',
}

watch(currentPage, (page) => {
  if (!previewScrollRef.value || totalPages.value === '--') return
  const el = previewScrollRef.value
  const ratio = (page - 1) / totalPages.value
  el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: 'smooth' })
})

const zoomIn = () => { zoomLevel.value = Math.min(200, zoomLevel.value + 10) }
const zoomOut = () => { zoomLevel.value = Math.max(50, zoomLevel.value - 10) }

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

watch(currentFile, async (file) => {
  if (!file) {
    headings.value = []
    totalPages.value = '--'
    documentBuffer.value = null
    vueOfficeBuffer.value = null
    return
  }
  takeBeforeSnapshot()
  try {
    const mammoth = await import('mammoth')
    const buf = await file.arrayBuffer()
    documentBuffer.value = buf
    vueOfficeBuffer.value = buf

    const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer: buf })
    const parser = new DOMParser()
    const d = parser.parseFromString(htmlContent, 'text/html')
    const paragraphs = d.body.querySelectorAll('p')
    const extracted = []
    let totalChars = 0
    for (const p of paragraphs) {
      const text = p.textContent?.trim()
      if (!text) continue
      totalChars += text.length
      if (/^第[一二三四五六七八九十]+[、．. ]/.test(text))
        extracted.push({ level: 1, text: text.substring(0, 50) })
      else if (/^（[一二三四五六七八九十]+）/.test(text))
        extracted.push({ level: 2, text: text.substring(0, 50) })
      else if (/^\d+[、．. ]/.test(text) || /^[一二三四五六七八九十]+[、．. ]/.test(text))
        extracted.push({ level: 3, text: text.substring(0, 50) })
    }
    headings.value = extracted
    totalPages.value = Math.max(1, Math.ceil(totalChars / 700))
  } catch {
    totalPages.value = '--'
  }
}, { immediate: true })

const handleSaveTemplate = () => {
  showSaveModal.value = true
}

const handleSave = () => {
  applyFormatting()
  alert('排版参数已保存')
}

const handleOneClickModify = async () => {
  if (!await handleLargeFileWarning()) return
  if (!currentFile.value) return
  isProcessing.value = true
  try {
    applyFormatting()
    const blob = await formatDocument(currentFile.value, formatParams)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.docx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    router.push('/compare')
  } catch (e) {
    alert('排版失败：' + e.message)
  } finally {
    isProcessing.value = false
  }
}

const handleReset = () => {
  router.push('/')
}

const onTemplateSaved = ({ name, category }) => {
  saveTemplate(name, category, formatParams)
  showSaveModal.value = false
}


const isDocx = computed(() => {
  const name = currentFile.value?.name?.toLowerCase() || ''
  return name.endsWith('.docx')
})

const isPdf = computed(() => {
  const name = currentFile.value?.name?.toLowerCase() || ''
  return name.endsWith('.pdf')
})

const isXlsx = computed(() => {
  const name = currentFile.value?.name?.toLowerCase() || ''
  return name.endsWith('.xlsx') || name.endsWith('.xls')
})

const showEditor = computed(() => isDocx.value && isEditMode.value)
</script>

<template>
  <main class="pt-16 bg-parchment">
    <div class="h-[calc(100vh-4rem)] flex">
      <Sidebar
        @tab-change="activeTab = $event"
        @cancel="handleReset"
        @reset="handleReset"
        @apply="handleSave"
      />

      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-cream border-b border-tan-border flex items-center px-8 py-5 shrink-0">
          <div class="w-10 h-10 rounded-lg bg-cinnabar flex items-center justify-center shrink-0">
            <component :is="tabIcons[activeTab]" size="22" color="white" />
          </div>
          <div class="ml-3">
            <div class="text-[18px] font-bold text-brown-dark leading-tight">{{ tabTitles[activeTab] || '排版设置' }}</div>
            <div class="text-[12px] text-brown-muted leading-tight">{{ tabSubtitles[activeTab] || '配置文档排版参数' }}</div>
          </div>
          <div class="flex-1"></div>
          <button
            @click="showPreviewModal = !showPreviewModal"
            class="flex items-center gap-1 px-3 py-2 bg-cream-dark border border-tan-border rounded-lg text-[12px] font-medium text-brown-muted transition-colors hover:bg-cream-darker"
          >
            <RiEyeLine size="14" />
            <span>预览</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto bg-warm-gray px-8 py-6 space-y-5">
          <PagePanel
            v-if="activeTab === 'page'"
            :params="formatParams.page"
          />
          <BodyPanel
            v-else-if="activeTab === 'body'"
            :params="formatParams.body"
          />
        <HeadingPanel
          v-else-if="activeTab === 'heading'"
          :params="formatParams.headings"
          :patterns="formatParams.patterns"
        />
          <ChartPanel
            v-else-if="activeTab === 'chart'"
            :fig-caption="formatParams.fig_caption"
            :tbl-caption="formatParams.tbl_caption"
            :table="formatParams.table"
            :active-sub-tab="'fig'"
          />
          <TOCPanel
            v-else-if="activeTab === 'toc'"
            :params="formatParams.toc"
          />
          <HeaderFooterPanel
            v-else-if="activeTab === 'header'"
            :params="formatParams.header_footer"
          />
          <ResetPanel
            v-else-if="activeTab === 'reset'"
            :text-cleanup="formatParams.cleanup.text_cleanup"
            :style-cleanup="formatParams.cleanup.style_cleanup"
            :object-structure="formatParams.cleanup.object_structure"
            :caption-detection="formatParams.cleanup.caption_detection"
            @reset="handleReset"
          />
        </div>

        <div class="bg-cream border-t border-tan-border flex items-center justify-end px-8 py-5 shrink-0" style="height: 61.6px;">
          <button
            @click="handleSaveTemplate"
            class="flex items-center gap-2 px-6 py-3 bg-cream-dark border border-gold-dark/50 rounded-xl text-[14px] font-semibold text-brown transition-all hover:bg-cream-darker"
          >
            <RiSaveLine size="18" color="#C8A45C" />
            <span>保存到模板</span>
          </button>
          <div class="w-3"></div>
          <button
            @click="handleOneClickModify"
            class="flex items-center gap-2 px-6 py-3 bg-cinnabar text-white rounded-xl text-[14px] font-semibold transition-all hover:bg-cinnabar-dark disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isProcessing"
          >
            <RiLoader2Line v-if="isProcessing" size="18" color="white" class="animate-spin" />
            <RiSparklingLine v-else size="18" color="white" />
            <span>{{ isProcessing ? '文档智能化排版处理中...' : '一键修改' }}</span>
          </button>
        </div>
      </div>
    </div>

    <SaveTemplateModal
      v-if="showSaveModal"
      :params="formatParams"
      @close="showSaveModal = false"
      @saved="onTemplateSaved"
    />

    <div v-if="showPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="showPreviewModal = false">
      <div class="bg-cream rounded-2xl shadow-2xl w-[90vw] h-[85vh] flex flex-col overflow-hidden border border-tan-border">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-tan-border bg-cream-dark">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-cinnabar flex items-center justify-center">
              <RiEyeLine size="16" color="white" />
            </div>
            <span class="text-[14px] font-semibold text-brown-dark">文档预览</span>
          </div>
          <button
            @click="showPreviewModal = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L12 12M12 4L4 12" stroke="#5C4033" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Toolbar -->
        <div class="bg-cream border-b border-tan-border px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="zoomOut" class="w-7 h-7 flex items-center justify-center bg-cream-dark border border-tan-border rounded-lg text-brown hover:bg-cream-darker">
              <RiZoomOutLine size="14" />
            </button>
            <span class="text-[13px] font-medium text-brown-dark min-w-[3em] text-center">{{ zoomLevel }}%</span>
            <button @click="zoomIn" class="w-7 h-7 flex items-center justify-center bg-cream-dark border border-tan-border rounded-lg text-brown hover:bg-cream-darker">
              <RiZoomInLine size="14" />
            </button>
            <div class="w-[2px] h-5 bg-tan-border mx-1"></div>
            <div v-if="vueOfficeBuffer" class="flex items-center gap-2">
              <span class="text-[12px] text-brown-muted">共 {{ totalPages }} 页</span>
              <button @click="currentPage = Math.max(1, currentPage - 1)" class="px-3 py-1.5 bg-cream-dark border border-tan-border rounded-lg text-[12px] text-brown hover:bg-cream-darker">上一页</button>
              <span class="text-[13px] text-brown font-medium min-w-[2em] text-center">{{ currentPage }}</span>
              <button @click="currentPage = Math.min(Number(totalPages), currentPage + 1)" class="px-3 py-1.5 bg-cream-dark border border-tan-border rounded-lg text-[12px] text-brown hover:bg-cream-darker">下一页</button>
            </div>
          </div>
          <div v-if="isDocx" class="flex items-center gap-2">
            <button
              @click="toggleEditMode"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
              :class="isEditMode ? 'bg-cinnabar text-white' : 'bg-cream-dark border border-tan-border text-brown hover:bg-cream-darker'"
            >
              <RiEdit2Line size="16" />
              <span>{{ isEditMode ? '退出编辑' : '编辑' }}</span>
            </button>
          </div>
        </div>

        <!-- Preview content -->
        <div ref="previewScrollRef" class="flex-1 overflow-y-auto p-6 flex flex-col items-center" style="background: #f0ebe0;">
          <div
            v-if="!isEditMode"
            :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
            class="w-[595px] min-h-[842px] bg-white shadow-lg mb-4"
          >
            <VueOfficeDocx
              v-if="vueOfficeBuffer && isDocx"
              :src="vueOfficeBuffer"
              style="width:100%; height:100%; min-height:842px; overflow: visible;"
              class="docx-wrapper"
            />
            <VueOfficePdf
              v-else-if="vueOfficeBuffer && isPdf"
              :src="vueOfficeBuffer"
              style="width:100%; height:100%;"
            />
            <VueOfficeExcel
              v-else-if="vueOfficeBuffer && isXlsx"
              :src="vueOfficeBuffer"
              style="width:100%; height:100%;"
            />
          </div>
          <DocxEditor
            v-if="vueOfficeBuffer && isDocx && isEditMode"
            ref="editorRef"
            :model-value="vueOfficeBuffer"
            @update:model-value="(v) => vueOfficeBuffer = v"
            style="width:100%; height:100%;"
            :options="{ language: 'zh-CN' }"
            class="docx-editor-content"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.docx-wrapper {
  background: #f0ebe0 !important;
  padding: 30px !important;
  padding-bottom: 0 !important;
  display: flex !important;
  flex-flow: column !important;
  align-items: center !important;
}

.docx-wrapper > section.docx {
  background: white !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5) !important;
  margin-bottom: 30px !important;
}

.docx {
  color: black !important;
  hyphens: auto !important;
  text-underline-position: from-font !important;
}

section.docx {
  box-sizing: border-box !important;
  display: flex !important;
  flex-flow: column nowrap !important;
  position: relative !important;
  overflow: hidden !important;
}

section.docx > article {
  margin-bottom: auto !important;
  z-index: 1 !important;
}

section.docx > footer {
  z-index: 1 !important;
}

.docx table {
  border-collapse: collapse !important;
}

.docx table td, .docx table th {
  vertical-align: top !important;
}

.docx p {
  margin: 0pt !important;
  min-height: 1em !important;
}

.docx span {
  white-space: pre-wrap !important;
  overflow-wrap: break-word !important;
}

.docx a {
  color: inherit !important;
  text-decoration: inherit !important;
}

.docx svg {
  fill: transparent !important;
}

/* DocxEditor 编辑内容区域样式 */
.docx-editor-content :deep(.ep-editor) {
  height: 100% !important;
  min-height: 600px !important;
}

.docx-editor-content :deep(.ep-root) {
  height: 100% !important;
}

/* Hide docx-editor-vue title bar */
.docx-editor-content :deep(.docx-editor-vue__title-bar),
.docx-editor-content :deep(.docx-editor-vue__title-bar-center),
.docx-editor-content :deep(.menu-bar),
.docx-editor-content :deep(.doc-name),
.docx-editor-content :deep(.doc-name__input) {
  display: none !important;
}
</style>
