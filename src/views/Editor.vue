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
import { DocxEditor } from '@eigenpal/docx-editor-vue'
import '@eigenpal/docx-editor-vue/styles.css'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import {
  RiZoomOutLine, RiZoomInLine, RiPagesLine, RiTextSnippet, RiHeading,
  RiBarChart2Line, RiListCheck2, RiLayoutTop2Line, RiRefreshLine,
  RiFootprintLine, RiDoubleQuotesL, RiFileTextLine, RiFileEditLine,
  RiSideBarLine, RiCheckLine, RiEdit2Line, RiEyeLine, RiLoader2Line
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

// Large file warning threshold
const LARGE_FILE_SIZE = 50 * 1024 * 1024 // 50MB
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
  reset: RiRefreshLine,
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
  body: '调整正文字体、字号与行距',
  heading: '设置各级标题样式',
  chart: '配置图表样式与位置',
  toc: '设置目录层级与格式',
  header: '配置页眉页脚内容、位置与样式',
  reset: '重置排版参数',
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
  // Show a brief toast notification
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
        :is-processing="isProcessing"
        @tab-change="activeTab = $event"
        @save-template="handleSaveTemplate"
        @one-click-modify="handleOneClickModify"
      />

      <div class="flex-1 flex flex-col bg-warm-gray">
        <!-- Header bar -->
        <div class="bg-cream border-b border-tan-border">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-cinnabar flex items-center justify-center">
                <component :is="tabIcons[activeTab]" size="18" color="white" />
              </div>
              <div>
                <div class="text-[16px] font-bold text-brown-dark">{{ tabTitles[activeTab] || '排版设置' }}</div>
                <div class="text-[12px] text-brown-muted">{{ tabSubtitles[activeTab] || '配置文档排版参数' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="px-6 py-3 bg-cream-dark border border-tan-border rounded-xl text-[14px] font-medium text-brown"
                @click="handleReset"
              >
                重置
              </button>
              <button
                class="flex items-center gap-2 px-6 py-3 bg-jade-light text-white rounded-xl text-[14px] font-semibold hover:bg-jade transition-colors"
                @click="handleSave"
              >
                <RiCheckLine size="16" color="white" />
                <span>保存</span>
              </button>
              <button
                class="flex items-center gap-2 px-6 py-3 bg-[#C23B22] text-white rounded-xl text-[14px] font-semibold hover:bg-[#A83028] transition-colors"
                @click="showPreviewModal = !showPreviewModal"
              >
                <RiEyeLine size="16" color="white" />
                <span>{{ showPreviewModal ? '关闭预览' : '预览' }}</span>
              </button>
            </div>
          </div>
        </div>

        <PagePanel
          v-if="activeTab === 'page'"
          :params="formatParams.page"
          :apply="{ apply_page: formatParams.apply_page }"
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
        />
        <TOCPanel
          v-else-if="activeTab === 'toc'"
          :params="formatParams.toc"
        />
        <HeaderFooterPanel
          v-else-if="activeTab === 'header'"
          :params="formatParams.header_footer"
        />
        <div v-else-if="activeTab === 'reset'" class="bg-cream px-6 py-4 border-b border-tan-border">
          <div class="flex items-center justify-center py-6 text-brown-muted">
            <p class="text-[13px]">点击"重置"按钮恢复初始排版参数</p>
          </div>
        </div>



        <!-- Bottom area: nav sidebar + preview -->
        <div class="flex-1 flex overflow-hidden">
          <div
            v-if="showNav"
            class="w-60 bg-cream border-r border-tan-border overflow-y-auto shrink-0 flex flex-col"
          >
            <div class="px-4 py-3 border-b border-tan-border">
              <h4 class="text-[13px] font-semibold text-brown-dark">文档目录</h4>
              <p class="text-[11px] text-brown-muted">共 {{ headings.length }} 个标题</p>
            </div>
            <div class="flex-1 p-3 space-y-1">
              <div v-if="headings.length === 0" class="flex items-center justify-center py-8 text-brown-muted text-[12px]">
                暂无目录信息
              </div>
              <div
                v-for="(h, i) in headings"
                :key="i"
                class="px-2 py-1.5 rounded text-[12px] cursor-pointer hover:bg-cream-darker transition-colors"
                :style="{ paddingLeft: `${12 + (h.level - 1) * 16}px` }"
                :class="h.level === 1 ? 'font-semibold text-brown-dark' : h.level === 2 ? 'font-medium text-brown' : 'text-brown-muted'"
              >
                {{ h.text }}
              </div>
            </div>
          </div>

          <!-- Preview area -->
          <div
            ref="previewScrollRef"
            class="flex-1 overflow-auto"
            :style="{ zoom: `${zoomLevel}%` }"
          >
            <!-- DocxEditor: edit mode for .docx files -->
            <div
              v-if="showEditor && documentBuffer"
              class="docx-editor-container"
            >
              <DocxEditor
                ref="editorRef"
                :document-buffer="documentBuffer"
              />
            </div>

            <!-- VueOfficeDocx: preview mode for .docx files -->
            <div
              v-else-if="isDocx && vueOfficeBuffer"
              class="max-w-[864px] mx-auto bg-white shadow"
            >
              <VueOfficeDocx :src="vueOfficeBuffer" style="width: 100%;" />
            </div>

            <!-- VueOfficePdf: preview mode for .pdf files -->
            <div
              v-else-if="isPdf && vueOfficeBuffer"
              class="max-w-[864px] mx-auto bg-white shadow"
            >
              <VueOfficePdf :src="vueOfficeBuffer" style="width: 100%;" />
            </div>

            <!-- VueOfficeExcel: preview mode for .xlsx files -->
            <div
              v-else-if="isXlsx && vueOfficeBuffer"
              class="max-w-[864px] mx-auto bg-white shadow"
            >
              <VueOfficeExcel :src="vueOfficeBuffer" style="width: 100%;" />
            </div>

            <!-- Empty state -->
            <div v-else class="flex items-center justify-center h-full text-brown-muted">
              <p class="text-[14px]">暂无预览内容</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Save template modal -->
      <SaveTemplateModal
        v-if="showSaveModal"
        @close="showSaveModal = false"
        @saved="onTemplateSaved"
      />

      <!-- Preview modal (like template preview) -->
      <div
        v-if="showPreviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="showPreviewModal = false"
      >
        <div class="bg-cream rounded-2xl shadow-2xl w-[90vw] h-[85vh] flex flex-col overflow-hidden border border-tan-border">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 bg-cream-dark border-b border-tan-border">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-cinnabar flex items-center justify-center">
                <RiEyeLine size="16" color="white" />
              </div>
              <span class="text-[14px] font-semibold text-brown-dark">文档预览</span>
            </div>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-dark transition-colors"
              @click="showPreviewModal = false"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="#5C4033" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Toolbar inside modal -->
          <div class="bg-cream border-b border-tan-border px-6 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-[2px] h-5 bg-tan-border mx-1"></div>
              <button class="w-7 h-7 flex items-center justify-center bg-cream-darker rounded" @click="zoomOut">
                <RiZoomOutLine size="14" class="text-brown" />
              </button>
              <span class="text-[13px] font-medium text-brown-dark min-w-[44px] text-center">{{ zoomLevel }}%</span>
              <button class="w-7 h-7 flex items-center justify-center bg-cream-darker rounded" @click="zoomIn">
                <RiZoomInLine size="14" class="text-brown" />
              </button>

              <!-- Edit mode toggle (only for .docx files) -->
              <button
                v-if="isDocx"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-darker rounded-lg text-[12px] font-medium transition-colors"
                :class="isEditMode ? 'text-cinnabar bg-cinnabar/10' : 'text-brown'"
                @click="toggleEditMode"
              >
                <RiEdit2Line v-if="isEditMode" size="14" />
                <RiEyeLine v-else size="14" />
                {{ isEditMode ? '编辑模式' : '预览模式' }}
              </button>

              <!-- File name badge -->
              <div class="flex items-center gap-2 px-3 py-2 bg-cream-dark rounded-lg">
                <RiFileTextLine size="18" color="#C43A31" />
                <span class="truncate max-w-[143px] text-sm font-medium text-brown">{{ currentFile?.name || '未命名文档' }}</span>
              </div>

              <!-- Page navigation -->
              <div class="w-[2px] h-5 bg-tan-border mx-1"></div>
              <RiPagesLine size="16" class="text-brown-muted shrink-0" />
              <div class="flex items-center gap-1">
                <span class="text-[13px] font-medium text-brown-dark">第</span>
                <input
                  type="number"
                  v-model.number="currentPage"
                  class="w-10 px-1 py-0.5 bg-cream-dark border border-tan-border rounded text-[13px] text-brown-dark text-center font-medium"
                  min="1"
                />
                <span class="text-[13px] font-medium text-brown-dark">页 / 共 {{ totalPages }} 页</span>
              </div>
              <RiFileEditLine size="16" class="text-brown-muted shrink-0" />
            </div>
          </div>

          <!-- Modal body -->
          <div class="flex-1 overflow-auto p-6 bg-parchment">
            <div v-if="vueOfficeBuffer" class="max-w-[800px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <VueOfficeDocx v-if="isDocx" :src="vueOfficeBuffer" style="width: 100%;" />
              <VueOfficePdf v-else-if="isPdf" :src="vueOfficeBuffer" style="width: 100%;" />
              <VueOfficeExcel v-else-if="isXlsx" :src="vueOfficeBuffer" style="width: 100%;" />
            </div>
            <div v-else class="flex items-center justify-center h-full text-brown-muted">
              <p class="text-[14px]">暂无预览内容</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.docx-editor-container :deep(.ep-root) {
  background: #ffffff !important;
}

.docx-editor-container :deep(.ep-editor) {
  background: #ffffff !important;
}

/* Hide docx-editor-vue title bar and menu bar */
.docx-editor-container :deep(.docx-editor-vue__title-bar-center),
.docx-editor-container :deep(.menu-bar),
.docx-editor-container :deep(.doc-name),
.docx-editor-container :deep(.doc-name__input) {
  display: none !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
