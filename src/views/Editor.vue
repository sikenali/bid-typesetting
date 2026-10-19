<template>
  <div class="editor-view">
    <TopNav title="智能化文件排版工具" :show-back="true" @open-settings="showSettings = true" />

    <div class="editor-body">
      <!-- 设置侧栏 -->
      <aside class="editor-side">
        <div class="side-title-wrap">
          <span class="side-title">排版设置</span>
          <button
            v-if="detectedParams"
            class="detect-tag"
            :class="{ open: showDetectedInfo }"
            :aria-expanded="showDetectedInfo"
            @click="showDetectedInfo = !showDetectedInfo"
          >
            <RiCheckLine size="12" />
            <span>{{ detectedSummaryShort }}</span>
          </button>
        </div>

        <nav class="side-list">
          <button
            v-for="item in sideItems"
            :key="item.id"
            class="side-item"
            :class="{ active: activeTab === item.id }"
            @click="activeTab = item.id"
          >
            <component :is="item.icon" size="18" />
            <span class="side-item-label">{{ item.label }}</span>
          </button>
        </nav>

        <div v-if="showDetectedInfo && detectedParams" class="detect-card">
          <div class="detect-card-title">检测到的文档样式</div>
          <div class="detect-card-body">
            <template v-if="detectedParams.page">
              <div class="detect-h">页面设置</div>
              <div class="detect-row">边距: 上{{ detectedParams.page.top_cm }} 下{{ detectedParams.page.bottom_cm }} 左{{ detectedParams.page.left_cm }} 右{{ detectedParams.page.right_cm }} cm</div>
              <div class="detect-row">纸张: {{ paperLabel(detectedParams.page.paper_size) }} ({{ detectedParams.page.paper_width_cm }}×{{ detectedParams.page.paper_height_cm }} cm)</div>
            </template>
            <template v-if="detectedParams.body">
              <div class="detect-h">正文样式</div>
              <div class="detect-row">中文字体: {{ detectedParams.body.cn_font }} | 英文字体: {{ detectedParams.body.en_font }} | 字号: {{ detectedParams.body.size_cn }}</div>
            </template>
            <template v-if="detectedParams.headings && detectedParams.headings.length">
              <div class="detect-h">标题样式 ({{ detectedParams.headings.length }} 级)</div>
              <div v-for="(h, i) in detectedParams.headings" :key="i" class="detect-row">
                标题{{ i + 1 }}: {{ h.cn_font || '-' }} {{ h.size_cn || '-' }}{{ h.bold ? ' 加粗' : '' }}
              </div>
            </template>
          </div>
        </div>

        <div class="side-actions">
          <button class="btn btn-outline side-btn" @click="handleCancel">取消</button>
          <button class="btn btn-outline side-btn" @click="handleReset">重置</button>
          <button class="btn btn-primary side-btn" @click="handleSave">保存</button>
        </div>
      </aside>

      <!-- 主内容区 -->
      <section class="editor-main">
        <div class="action-row">
          <div class="action-icons">
            <button class="icon-btn" title="保存到模板" aria-label="保存到模板" @click="handleSaveTemplate">
              <RiSaveLine size="19" />
            </button>
            <button class="icon-btn" title="载入模板" aria-label="载入模板" @click="handleLoadTemplate">
              <RiBook2Line size="19" />
            </button>
            <button class="icon-btn" title="导出配置" aria-label="导出配置" @click="handleExportJSON">
              <RiDownloadLine size="19" />
            </button>
            <button class="icon-btn" title="导入配置" aria-label="导入配置" @click="fileInput && fileInput.click()">
              <RiUploadLine size="19" />
            </button>
            <button
              class="icon-btn"
              :class="{ active: activeTab === 'rules' }"
              title="规则编辑器"
              aria-label="规则编辑器"
              @click="activeTab = activeTab === 'rules' ? 'reset' : 'rules'"
            >
              <RiEdit2Line size="19" />
            </button>
            <input ref="fileInput" type="file" accept=".json" hidden @change="handleImportJSON" />
          </div>

          <div class="action-right">
            <button
              v-if="previewEnabled && activeTab !== 'reset' && activeTab !== 'rules'"
              class="btn btn-outline action-btn"
              @click="showPreviewModal = !showPreviewModal"
            >
              <RiEyeLine size="15" />
              <span>预览</span>
            </button>
            <button
              class="btn btn-primary action-btn"
              :disabled="isProcessing"
              @click="handleOneClickModify"
            >
              <RiLoader2Line v-if="isProcessing" size="15" class="spinner" />
              <RiSparklingLine v-else size="15" />
              <span>{{ isProcessing ? '排版中…' : '一键排版' }}</span>
            </button>
          </div>
        </div>

        <div class="content-scroll">
          <PagePanel v-if="activeTab === 'page'" :params="formatParams.page" />

          <HeadingPanel
            v-else-if="activeTab === 'heading'"
            :params="formatParams.headings"
            :patterns="formatParams.patterns"
          />

          <BodyPanel v-else-if="activeTab === 'body'" :params="formatParams.body" />

          <TOCPanel v-else-if="activeTab === 'toc'" :params="formatParams.toc" />

          <ChartPanel
            v-else-if="activeTab === 'chart'"
            :fig-caption="formatParams.fig_caption"
            :tbl-caption="formatParams.tbl_caption"
            :table="formatParams.table"
            :table-settings="formatParams.table_settings"
            :active-sub-tab="'fig'"
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

          <div v-else-if="activeTab === 'rules'" class="rules-wrap">
            <RulePanelEditor title="页面设置" desc="页面尺寸、边距与方向" icon="RiPagesLine">
              <PageRuleEditor :params="formatParams.page" />
            </RulePanelEditor>
            <RulePanelEditor title="正文格式" desc="字体、字号、行距与缩进" icon="RiTextSnippet">
              <BodyRuleEditor :params="formatParams.body" />
            </RulePanelEditor>
            <RulePanelEditor title="标题与编号" desc="各级标题样式与自动编号规则" icon="RiHeading">
              <HeadingRuleEditor :headings="formatParams.headings" :patterns="formatParams.patterns" />
            </RulePanelEditor>
            <RulePanelEditor title="图表样式" desc="图题、表题与表格样式" icon="RiBarChart2Line">
              <ChartRuleEditor
                :fig-caption="formatParams.fig_caption"
                :tbl-caption="formatParams.tbl_caption"
                :table="formatParams.table"
                :table-settings="formatParams.table_settings"
              />
            </RulePanelEditor>
            <RulePanelEditor title="目录设置" desc="目录层级与引导符" icon="RiListCheck2">
              <TOCRuleEditor :params="formatParams.toc" />
            </RulePanelEditor>
            <RulePanelEditor title="页眉页脚" desc="页眉页脚内容与位置" icon="RiLayoutTop2Line">
              <HeaderFooterRuleEditor :params="formatParams.header_footer" />
            </RulePanelEditor>
            <RulePanelEditor title="预处理与全局开关" desc="排版前的清理与检测策略" icon="RiBrushLine">
              <CleanupRuleEditor
                :text-cleanup="formatParams.cleanup.text_cleanup"
                :style-cleanup="formatParams.cleanup.style_cleanup"
                :object-structure="formatParams.cleanup.object_structure"
                :caption-detection="formatParams.cleanup.caption_detection"
                :apply-switches="formatParams"
              />
            </RulePanelEditor>
          </div>
        </div>
      </section>
    </div>

    <PageFooter
      @credit-query="showCreditModal = true"
      @bidding-sites="showBiddingModal = true"
    />

    <!-- 文档预览 -->
    <UiModal
      v-if="showPreviewModal"
      v-model="showPreviewModal"
      title="文档预览"
      icon="ri-eye-line"
      width="90vw"
      max-width="90vw"
      height="85vh"
      :show-footer="false"
    >
      <div class="preview-inner">
        <div class="preview-toolbar">
          <div class="preview-toolbar-group">
            <button class="icon-btn-sm" aria-label="缩小" @click="zoomOut">
              <RiZoomOutLine size="14" />
            </button>
            <span class="preview-zoom">{{ zoomLevel }}%</span>
            <button class="icon-btn-sm" aria-label="放大" @click="zoomIn">
              <RiZoomInLine size="14" />
            </button>
          </div>
          <div v-if="vueOfficeBuffer" class="preview-toolbar-group">
            <span class="preview-pages">共 {{ totalPages }} 页</span>
            <button class="page-btn" @click="currentPage = Math.max(1, currentPage - 1)">上一页</button>
            <span class="page-cur">{{ currentPage }}</span>
            <button class="page-btn" @click="currentPage = Math.min(Number(totalPages), currentPage + 1)">下一页</button>
          </div>
          <div v-if="isDocx" class="preview-toolbar-group">
            <button
              class="chip"
              :class="{ active: isEditMode }"
              @click="toggleEditMode"
            >
              <RiEdit2Line size="15" />
              <span>{{ isEditMode ? '退出编辑' : '编辑' }}</span>
            </button>
          </div>
        </div>

        <div ref="previewScrollRef" class="preview-scroll">
          <div
            v-if="!isEditMode"
            class="preview-page-wrap"
            :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
          >
            <VueOfficeDocx
              v-if="vueOfficeBuffer && isDocx"
              :src="vueOfficeBuffer"
              class="docx-wrapper"
            />
            <VueOfficePdf v-else-if="vueOfficeBuffer && isPdf" :src="vueOfficeBuffer" class="office-full" />
            <VueOfficeExcel v-else-if="vueOfficeBuffer && isXlsx" :src="vueOfficeBuffer" class="office-full" />
            <div v-else class="preview-empty">
              <RiFileTextLine size="40" />
              <p>暂无可预览的文档</p>
            </div>
          </div>
          <DocxEditor
            v-if="vueOfficeBuffer && isDocx && isEditMode"
            ref="editorRef"
            :document-buffer="vueOfficeBuffer"
            mode="editing"
            class="docx-editor-content"
          />
        </div>
      </div>
    </UiModal>

    <!-- 排版进度（Calicat 设计图「排版进度卡片」1:1 弹框） -->
    <FormatProgressModal
      v-model="showFormatLog"
      :progress="formatProgress"
      :processing="isProcessing"
      :logs="formatLog"
      :desc="formatProgressDesc"
    />

    <SettingsModal v-model:visible="showSettings" />
    <CreditQualificationModal v-model:visible="showCreditModal" />
    <BiddingSitesModal v-model:visible="showBiddingModal" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  RiPagesLine,
  RiHeading,
  RiTextSnippet,
  RiListCheck2,
  RiBarChart2Line,
  RiLayoutTop2Line,
  RiBrushLine,
} from '@remixicon/vue'
import TopNav from '@/components/layout/TopNav.vue'
import PageFooter from '@/components/layout/PageFooter.vue'
import SettingsModal from '@/components/layout/SettingsModal.vue'
import CreditQualificationModal from '@/components/layout/CreditQualificationModal.vue'
import BiddingSitesModal from '@/components/layout/BiddingSitesModal.vue'
import UiModal from '@/components/ui/UiModal.vue'
import FormatProgressModal from '@/components/FormatProgressModal.vue'
import { confirmDialog } from '@/utils/confirm'
import { useSettingsTab } from '@/utils/settingsTab'
import RulePanelEditor from '@/components/RulePanelEditor.vue'
import PagePanel from '@/components/panels/PagePanel.vue'
import BodyPanel from '@/components/panels/BodyPanel.vue'
import HeadingPanel from '@/components/panels/HeadingPanel.vue'
import ChartPanel from '@/components/panels/ChartPanel.vue'
import TOCPanel from '@/components/panels/TOCPanel.vue'
import HeaderFooterPanel from '@/components/panels/HeaderFooterPanel.vue'
import ResetPanel from '@/components/panels/ResetPanel.vue'
import PageRuleEditor from '@/components/rules/PageRuleEditor.vue'
import BodyRuleEditor from '@/components/rules/BodyRuleEditor.vue'
import HeadingRuleEditor from '@/components/rules/HeadingRuleEditor.vue'
import ChartRuleEditor from '@/components/rules/ChartRuleEditor.vue'
import TOCRuleEditor from '@/components/rules/TOCRuleEditor.vue'
import HeaderFooterRuleEditor from '@/components/rules/HeaderFooterRuleEditor.vue'
import CleanupRuleEditor from '@/components/rules/CleanupRuleEditor.vue'
import { useSettings } from '@/composables/useSettings'
import { useDocument } from '@/composables/useDocument'
import { useFormatState } from '@/composables/useFormatState'
import { ElMessage } from '@/utils/toast'
import { readDocxParams } from '@/utils/docxReader'
import { healthCheck, formatDocument } from '@/api/format'
import { DocxEditor, VueOfficeDocx, VueOfficePdf, VueOfficeExcel } from '@/lib/officeRenderers'

const router = useRouter()
const { getFile, setFormatted } = useDocument()
const currentFile = computed(() => getFile())
const { formatParams, beforeSnapshot, afterSnapshot, applyFormatting, takeBeforeSnapshot, loadFormatParams, syncClearStyles, ensureTabBeforeSnapshot, saveTabAfterSnapshot, resetTab, cancelTab, clearTabSnapshots } = useFormatState()
const { clearStylesEnabled, previewEnabled } = useSettings()

watch(clearStylesEnabled, (val) => { syncClearStyles(val) }, { immediate: true })

const sideItems = [
  { id: 'page', label: '页面', icon: RiPagesLine },
  { id: 'heading', label: '标题', icon: RiHeading },
  { id: 'body', label: '正文', icon: RiTextSnippet },
  { id: 'toc', label: '目录', icon: RiListCheck2 },
  { id: 'chart', label: '图表', icon: RiBarChart2Line },
  { id: 'header', label: '页面页脚', icon: RiLayoutTop2Line },
  { id: 'reset', label: '初始化', icon: RiBrushLine },
]

const activeTab = ref('reset')
watch(activeTab, (tab) => { ensureTabBeforeSnapshot(tab) })
const showPreviewModal = ref(false)
const showFormatLog = ref(false)
const showSettings = ref(false)
const showCreditModal = ref(false)
const showBiddingModal = ref(false)
const zoomLevel = ref(100)
const currentPage = ref(1)
const totalPages = ref('--')
const headings = ref([])
const previewScrollRef = ref(null)
const documentBuffer = ref(null)
const editorRef = ref(null)
const isEditMode = ref(false)
const vueOfficeBuffer = ref(null)
const isProcessing = ref(false)
const formatProgress = ref(0)
const formatStage = ref('')
const formatLog = ref([])
const formatElapsedSec = ref(0)
let formatElapsedTimer = null
let formatCreepTimer = null

const formatProgressDesc = computed(() => {
  if (formatLog.value.some((l) => l.type === 'error')) return '排版失败 · 请检查后端服务或文件格式'
  if (isProcessing.value) {
    const stage = formatStage.value ? ` · ${formatStage.value}` : ''
    return `正在处理${stage} · 已用时 ${formatElapsedSec.value} 秒`
  }
  const pages = totalPages.value === '--' ? '' : ` · 文档约 ${totalPages.value} 页`
  return `排版完成${pages} · 已生成对比结果`
})
const detectedParams = ref(null)
const showDetectedInfo = ref(false)
const fileInput = ref(null)

const detectedSummaryShort = computed(() => {
  const d = detectedParams.value
  if (!d) return ''
  const n = []
  if (d.page) n.push('页面')
  if (d.body) n.push('正文')
  if (d.headings && d.headings.length) n.push(`标题${d.headings.length}级`)
  return `已检测: ${n.join('、')}`
})

const LARGE_FILE_SIZE = 50 * 1024 * 1024
const LARGE_PAGE_COUNT = 200

const isLargeFile = computed(() => {
  if (!currentFile.value) return false
  const size = currentFile.value.size
  const pages = totalPages.value
  return size > LARGE_FILE_SIZE || (typeof pages === 'number' && pages > LARGE_PAGE_COUNT)
})

const isDocx = computed(() => (currentFile.value?.name?.toLowerCase() || '').endsWith('.docx'))
const isPdf = computed(() => (currentFile.value?.name?.toLowerCase() || '').endsWith('.pdf'))
const isXlsx = computed(() => {
  const name = currentFile.value?.name?.toLowerCase() || ''
  return name.endsWith('.xlsx') || name.endsWith('.xls')
})

function paperLabel(size) {
  if (size === 'A4') return 'A4'
  if (size === 'custom') return '自定义'
  return size
}

async function handleLargeFileWarning() {
  if (!isLargeFile.value) return true
  return await confirmDialog(`文档较大（${totalPages.value} 页），排版可能需要较长时间，是否继续？`)
}

watch(currentPage, (page) => {
  if (!previewScrollRef.value || totalPages.value === '--') return
  const el = previewScrollRef.value
  const ratio = (page - 1) / totalPages.value
  el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: 'smooth' })
})

const zoomIn = () => { zoomLevel.value = Math.min(200, zoomLevel.value + 10) }
const zoomOut = () => { zoomLevel.value = Math.max(50, zoomLevel.value - 10) }
const toggleEditMode = () => { isEditMode.value = !isEditMode.value }

watch(currentFile, async (file) => {
  if (!file) {
    headings.value = []
    totalPages.value = '--'
    documentBuffer.value = null
    vueOfficeBuffer.value = null
    return
  }
  try {
    const mammoth = await import('mammoth')
    const buf = await file.arrayBuffer()
    documentBuffer.value = buf
    vueOfficeBuffer.value = buf

    if ((file.name || '').toLowerCase().endsWith('.docx')) {
      try {
        const detected = await readDocxParams(file)
        if (detected) {
          loadFormatParams(detected)
          detectedParams.value = detected
        }
      } catch {}
    }

    clearTabSnapshots()
    takeBeforeSnapshot()

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
      if (/^第[一二三四五六七八九十]+[、．. ]/.test(text)) extracted.push({ level: 1, text: text.substring(0, 50) })
      else if (/^（[一二三四五六七八九十]+）/.test(text)) extracted.push({ level: 2, text: text.substring(0, 50) })
      else if (/^\d+[、．. ]/.test(text) || /^[一二三四五六七八九十]+[、．. ]/.test(text)) extracted.push({ level: 3, text: text.substring(0, 50) })
    }
    headings.value = extracted
    totalPages.value = Math.max(1, Math.ceil(totalChars / 700))
    try { mammoth.shutdownWorker() } catch {}
  } catch {
    totalPages.value = '--'
  }
}, { immediate: true })

onMounted(() => { activeTab.value = 'reset'; ensureTabBeforeSnapshot('reset') })

onUnmounted(() => {
  documentBuffer.value = null
  vueOfficeBuffer.value = null
  if (formatElapsedTimer) clearInterval(formatElapsedTimer)
  if (formatCreepTimer) clearInterval(formatCreepTimer)
})

const handleSaveTemplate = () => {
  useSettingsTab().set({ tab: 'template', kind: 'typography' })
  showSettings.value = true
}
const handleSave = () => {
  saveTabAfterSnapshot(activeTab.value)
  applyFormatting()
}
const handleLoadTemplate = () => {
  useSettingsTab().set({ tab: 'template', kind: 'typography' })
  showSettings.value = true
}

const nowTime = () => new Date().toTimeString().slice(0, 8)

const addLog = (msg, type = 'info') => {
  formatLog.value.push({ msg, type, time: nowTime() })
}

const ALIGN_TEXT = { LEFT: '左对齐', CENTER: '居中', RIGHT: '右对齐', JUSTIFY: '两端对齐' }

const maxHeadingLevel = () => headings.value.reduce((m, h) => Math.max(m, h.level || 1), 0)

const docFactLine = () => {
  const parts = []
  if (totalPages.value !== '--') parts.push(`文档约 ${totalPages.value} 页`)
  const lvl = maxHeadingLevel()
  if (headings.value.length > 0) parts.push(`识别 ${lvl} 级标题、共 ${headings.value.length} 条`)
  else parts.push('未检测到编号型标题')
  return parts.join('，')
}

const headingStyleLine = () => {
  const list = formatParams.headings || []
  if (list.length === 0) return ''
  const lvl = Math.min(Math.max(maxHeadingLevel(), 1), list.length)
  const cfg = list[lvl - 1]
  const segs = [`${lvl} 级标题：${cfg.cn_font} / ${cfg.size_cn}`]
  if (cfg.align && ALIGN_TEXT[cfg.align]) segs.push(ALIGN_TEXT[cfg.align])
  return `应用样式 ${segs.join(' / ')}`
}

const bodyFactLine = () => {
  const b = formatParams.body
  if (!b) return ''
  const mode = b.line_spacing_mode
  let spacing
  if (mode === 'EXACT') spacing = `固定行距 ${b.line_spacing_value} 磅`
  else if (mode === 'MULTIPLE') spacing = `${b.line_spacing_value} 倍行距`
  else if (mode === 'ONE_POINT_FIVE') spacing = '1.5 倍行距'
  else if (mode === 'DOUBLE') spacing = '双倍行距'
  else if (mode === 'AT_LEAST') spacing = `最小行距 ${b.line_spacing_value} 磅`
  else spacing = '单倍行距'
  return `统一正文 ${b.cn_font} ${b.size_cn}、${spacing}、首行缩进 ${b.first_line_indent_chars} 字符`
}

const handleOneClickModify = async () => {
  if (!currentFile.value) {
    ElMessage.warning('未上传文件，请上传后再进行排版')
    return
  }
  if (!await handleLargeFileWarning()) return
  isProcessing.value = true
  formatProgress.value = 0
  formatLog.value = [
    { msg: '开始解析文档结构…', type: 'info', time: nowTime() },
    { msg: docFactLine(), type: 'info', time: nowTime() },
  ]
  formatElapsedSec.value = 0
  const startedAt = Date.now()
  formatElapsedTimer = setInterval(() => {
    formatElapsedSec.value = Math.round((Date.now() - startedAt) / 1000)
  }, 1000)
  showFormatLog.value = true
  // 上传与排版的耗时无法线性映射成百分比，进度条只标记真实阶段；
  // 等待后端期间用渐近递增让进度条动起来，但不宣称精确完成度。
  const stopCreep = () => {
    if (formatCreepTimer) { clearInterval(formatCreepTimer); formatCreepTimer = null }
  }
  const creepTo = (target) => {
    stopCreep()
    formatCreepTimer = setInterval(() => {
      if (formatProgress.value < target) {
        formatProgress.value = Math.round((formatProgress.value + target) / 2 * 100) / 100
      }
    }, 250)
  }
  try {
    addLog('正在检测后端服务...')
    formatStage.value = '检查后端服务'
    const backendOk = await healthCheck()
    if (!backendOk) {
      throw new Error('排版服务未启动，请先启动后端服务（http://localhost:8099）')
    }
    addLog('后端服务正常')
    formatProgress.value = 15
    addLog('正在调用后端排版服务...')
    formatStage.value = '后端排版中'
    formatProgress.value = 30
    creepTo(79)
    const blob = await formatDocument(currentFile.value, formatParams, {
      onProgress: ({ phase }) => {
        if (phase === 'response') formatProgress.value = 80
      },
    })
    stopCreep()
    formatProgress.value = 85
    formatStage.value = '生成对比结果'
    const hLine = headingStyleLine()
    if (hLine) addLog(hLine)
    const bLine = bodyFactLine()
    if (bLine) addLog(bLine)
    setFormatted(blob)
    applyFormatting()
    formatProgress.value = 100
    addLog('排版完成，已生成对比结果')
    setTimeout(() => {
      showFormatLog.value = false
      router.push('/compare')
    }, 800)
  } catch (e) {
    const msg = e.message?.includes('Failed to fetch')
      ? '无法连接到排版服务（http://localhost:8099），请确认后端服务已启动'
      : e.message
    addLog('排版失败：' + msg, 'error')
    ElMessage.error('排版失败：' + msg)
  } finally {
    isProcessing.value = false
    formatStage.value = ''
    clearInterval(formatElapsedTimer)
    formatElapsedTimer = null
    stopCreep()
  }
}

const handleCancel = () => {
  cancelTab(activeTab.value)
}

const handleReset = () => {
  resetTab(activeTab.value)
}

const handleExportJSON = () => {
  const jsonStr = JSON.stringify(formatParams, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `排版配置-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleImportJSON = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      loadFormatParams(JSON.parse(e.target.result))
      ElMessage.success('配置导入成功')
    } catch (err) {
      ElMessage.error('JSON 格式错误: ' + err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>

<style scoped>
.editor-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-main);
}
.editor-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* ── 设置侧栏 ── */
.editor-side {
  width: 310px;
  flex-shrink: 0;
  background: var(--color-bg-white);
  border-right: 0.7px solid var(--color-border-soft);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.side-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}
.side-title {
  font-size: 15px;
  color: var(--color-text-muted);
}
.detect-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 9px;
  border-radius: 9999px;
  border: none;
  background: var(--color-success-soft);
  color: var(--color-success-strong);
  font-size: 11px;
  font-weight: 500;
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: all var(--transition-base);
}
.detect-tag:hover {
  background: var(--color-success-soft);
  filter: brightness(0.96);
}
.side-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.side-item {
  height: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-body);
  font-size: 16px;
  font-weight: 400;
  text-align: left;
  transition: all var(--transition-base);
}
.side-item:hover {
  background: var(--color-bg-secondary);
}
.side-item.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
  font-weight: 500;
}
.detect-card {
  margin-top: 16px;
  border: 0.7px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  padding: 12px 14px;
}
.detect-card-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}
.detect-card-body {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.7;
}
.detect-h {
  font-weight: 500;
  color: var(--color-text-body);
  margin-top: 6px;
}
.detect-row {
  padding-left: 8px;
}
.side-actions {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  flex-direction: row;
  gap: 8px;
}
.side-btn {
  height: 46px;
  flex: 1;
  font-size: 15px;
}

/* ── 主内容区 ── */
.editor-main {
  flex: 1;
  min-width: 0;
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.action-row {
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.action-icons {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}
.icon-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.icon-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.action-btn {
  height: 42px;
  padding: 0 20px;
}
.content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 20px;
  padding-right: 4px;
}
.rules-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}

/* ── 预览弹框内部 ── */
.preview-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}
.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--color-bg-secondary);
  border: 0.7px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.preview-toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-btn-sm {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}
.icon-btn-sm:hover {
  background: var(--color-bg-secondary);
}
.preview-zoom {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 46px;
  text-align: center;
}
.preview-pages {
  font-size: 12px;
  color: var(--color-text-muted);
}
.page-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
  font-size: 13px;
  transition: all var(--transition-base);
}
.page-btn:hover {
  background: var(--color-bg-secondary);
}
.page-cur {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 22px;
  text-align: center;
}
.chip {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-base);
}
.chip:hover:not(.active) {
  background: var(--color-bg-secondary);
}
.chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary, #fff);
}
.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-bg-secondary);
  border: 0.7px solid var(--color-border-soft);
  border-radius: var(--radius-md);
}
.preview-page-wrap {
  width: 595px;
  min-height: 842px;
  background: #fff;
  box-shadow: var(--shadow-md);
}
.office-full {
  width: 100%;
  height: 100%;
}
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-faint);
  padding: 80px 0;
  width: 100%;
}
.preview-empty p {
  font-size: 14px;
}

/* ── docx 渲染 ── */
.docx-wrapper {
  background: var(--color-bg-secondary) !important;
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
.docx-editor-content :deep(.ep-editor) {
  height: 100% !important;
  min-height: 600px !important;
}
.docx-editor-content :deep(.ep-root) {
  height: 100% !important;
}
.docx-editor-content :deep(.docx-editor-vue__title-bar),
.docx-editor-content :deep(.docx-editor-vue__title-bar-center),
.docx-editor-content :deep(.menu-bar),
.docx-editor-content :deep(.doc-name),
.docx-editor-content :deep(.doc-name__input) {
  display: none !important;
}
</style>
