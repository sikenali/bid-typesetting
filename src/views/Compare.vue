<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDocument } from '../composables/useDocument'
import { useFormatState } from '../composables/useFormatState'
import { RiFileTextLine, RiEditLine, RiCheckLine, RiDownloadLine, RiArrowLeftSLine, RiArrowRightSLine, RiLayout2Line, RiCollageLine, RiLinksLine, RiPagesLine, RiTextSnippet, RiHeading, RiBarChart2Line, RiListCheck2, RiLayoutTop2Line, RiFootprintLine, RiDoubleQuotesL, RiCheckDoubleLine } from '@remixicon/vue'
import DocumentPreview from '../components/DocumentPreview.vue'

const router = useRouter()
const { getFile, getFormatted, getFormattedBlob } = useDocument()
const { beforeSnapshot, afterSnapshot, diffs, formatParams } = useFormatState()
const currentFile = getFile()
const formattedFile = computed(() => getFormatted())
const formattedBlobUrl = computed(() => getFormattedBlob())

const today = new Date()
const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`

const modifiedFileName = computed(() => {
  if (formattedFile.value?.name) return formattedFile.value.name
  if (!currentFile) return '未命名文档-M'
  const name = currentFile.name
  const dot = name.lastIndexOf('.')
  if (dot === -1) return `${name}-M-${dateStr}`
  return `${name.slice(0, dot)}-M-${dateStr}${name.slice(dot)}`
})

const compareMode = ref('side-by-side')
const diffIndex = ref(0)
const syncScroll = ref(true)
const highlightDiffs = ref(true)

const leftScrollRef = ref(null)
const rightScrollRef = ref(null)
let syncing = false

const syncScrollHandler = (source, target) => {
  if (!syncScroll.value || syncing) return
  syncing = true
  if (target) {
    const ratio = source.scrollTop / (source.scrollHeight - source.clientHeight)
    target.scrollTop = ratio * (target.scrollHeight - target.clientHeight)
  }
  nextTick(() => { syncing = false })
}

const onLeftScroll = (e) => syncScrollHandler(e.target, rightScrollRef.value)
const onRightScroll = (e) => syncScrollHandler(e.target, leftScrollRef.value)

const totalDiffs = computed(() => diffs.value.length)

const g = (obj, path) => {
  if (!obj) return '--'
  const keys = path.split('.')
  let v = obj
  for (const k of keys) v = v?.[k]
  return v ?? '--'
}

const formatHeadingLevel = (p, level) => {
  if (!p) return '--'
  const h = p.headings?.[level - 1]
  if (!h) return '--'
  return `${h.cn_font || '--'} / ${h.en_font || '--'} · ${h.size_cn || '--'}`
}

const formatHeadingAll = (p) => {
  if (!p) return '--'
  return (p.headings || []).map((h, i) => `H${i+1}: ${h.cn_font}/${h.size_cn}`).join('；')
}

const tabs = [
  { id: 'page', label: '页面', sublabel: 'Page Layout', icon: RiPagesLine,
    fields: [
      { id: 'page-paper', label: '纸张大小', before: p => g(p, 'page.paper_size'), after: p => g(p, 'page.paper_size') },
      { id: 'page-margins', label: '页边距 (上/下/左/右 cm)', before: p => `${g(p,'page.top_cm')} / ${g(p,'page.bottom_cm')} / ${g(p,'page.left_cm')} / ${g(p,'page.right_cm')}`, after: p => `${g(p,'page.top_cm')} / ${g(p,'page.bottom_cm')} / ${g(p,'page.left_cm')} / ${g(p,'page.right_cm')}` },
      { id: 'page-gutter', label: '装订线 (cm)', before: p => g(p, 'page.gutter_cm'), after: p => g(p, 'page.gutter_cm') },
      { id: 'page-header-margin', label: '页眉距 (cm)', before: p => g(p, 'page.header_margin_cm'), after: p => g(p, 'page.header_margin_cm') },
      { id: 'page-columns', label: '分栏', before: p => `${g(p,'page.columns')} 栏 · 间距 ${g(p,'page.column_spacing_cm')} cm`, after: p => `${g(p,'page.columns')} 栏 · 间距 ${g(p,'page.column_spacing_cm')} cm` },
      { id: 'page-keep-orientation', label: '保持原方向', before: p => g(p, 'page.keep_original_orientation') ? '是' : '否', after: p => g(p, 'page.keep_original_orientation') ? '是' : '否' },
    ] },
  { id: 'body', label: '正文', sublabel: 'Body Text', icon: RiTextSnippet,
    fields: [
      { id: 'body-font', label: '中文字体', before: p => g(p, 'body.cn_font'), after: p => g(p, 'body.cn_font') },
      { id: 'body-en-font', label: '英文字体', before: p => g(p, 'body.en_font'), after: p => g(p, 'body.en_font') },
      { id: 'body-font-size', label: '正文字号', before: p => g(p, 'body.size_cn'), after: p => g(p, 'body.size_cn') },
      { id: 'body-bold', label: '加粗', before: p => g(p, 'body.bold') ? '是' : '否', after: p => g(p, 'body.bold') ? '是' : '否' },
      { id: 'body-line-spacing', label: '行距', before: p => `${g(p,'body.line_spacing_mode')} ${g(p,'body.line_spacing_value')}`, after: p => `${g(p,'body.line_spacing_mode')} ${g(p,'body.line_spacing_value')}` },
      { id: 'body-indent', label: '首行缩进', before: p => `${g(p,'body.first_line_indent_chars')} 字符`, after: p => `${g(p,'body.first_line_indent_chars')} 字符` },
      { id: 'body-align', label: '对齐方式', before: p => g(p, 'body.align'), after: p => g(p, 'body.align') },
    ] },
  { id: 'heading', label: '标题', sublabel: 'Headings', icon: RiHeading,
    fields: [
      { id: 'heading-level1', label: '一级标题', before: p => formatHeadingLevel(p, 1), after: p => formatHeadingLevel(p, 1) },
      { id: 'heading-level2', label: '二级标题', before: p => formatHeadingLevel(p, 2), after: p => formatHeadingLevel(p, 2) },
      { id: 'heading-level3', label: '三级标题', before: p => formatHeadingLevel(p, 3), after: p => formatHeadingLevel(p, 3) },
      { id: 'heading-level4', label: '四级标题', before: p => formatHeadingLevel(p, 4), after: p => formatHeadingLevel(p, 4) },
    ] },
  { id: 'chart', label: '图表', sublabel: 'Charts & Tables', icon: RiBarChart2Line,
    fields: [
      { id: 'fig-caption', label: '图标题字体', before: p => `${g(p,'fig_caption.cn_font')} / ${g(p,'fig_caption.size_cn')}`, after: p => `${g(p,'fig_caption.cn_font')} / ${g(p,'fig_caption.size_cn')}` },
      { id: 'tbl-caption', label: '表标题字体', before: p => `${g(p,'tbl_caption.cn_font')} / ${g(p,'tbl_caption.size_cn')}`, after: p => `${g(p,'tbl_caption.cn_font')} / ${g(p,'tbl_caption.size_cn')}` },
      { id: 'table-font', label: '表格字体', before: p => `${g(p,'table.cn_font')} / ${g(p,'table.size_cn')}`, after: p => `${g(p,'table.cn_font')} / ${g(p,'table.size_cn')}` },
    ] },
  { id: 'toc', label: '目录', sublabel: 'Table of Contents', icon: RiListCheck2,
    fields: [
      { id: 'toc-enable', label: '生成目录', before: p => g(p, 'toc.enable') ? '是' : '否', after: p => g(p, 'toc.enable') ? '是' : '否' },
      { id: 'toc-title', label: '目录标题', before: p => g(p, 'toc.title_text'), after: p => g(p, 'toc.title_text') },
      { id: 'toc-title-font', label: '目录标题字体', before: p => `${g(p,'toc.title_cn_font')} / ${g(p,'toc.title_size_cn')}`, after: p => `${g(p,'toc.title_cn_font')} / ${g(p,'toc.title_size_cn')}` },
    ] },
  { id: 'header', label: '页眉页脚', sublabel: 'Header & Footer', icon: RiLayoutTop2Line,
    fields: [
      { id: 'header-enable', label: '启用页眉', before: p => g(p, 'header_footer.enable_header') ? '是' : '否', after: p => g(p, 'header_footer.enable_header') ? '是' : '否' },
      { id: 'header-text', label: '页眉文字', before: p => g(p, 'header_footer.header_text') || '(无)', after: p => g(p, 'header_footer.header_text') || '(无)' },
      { id: 'header-font', label: '页眉字体', before: p => `${g(p,'header_footer.header_cn_font')} / ${g(p,'header_footer.header_size_cn')}`, after: p => `${g(p,'header_footer.header_cn_font')} / ${g(p,'header_footer.header_size_cn')}` },
      { id: 'footer-enable', label: '启用页脚', before: p => g(p, 'header_footer.enable_footer') ? '是' : '否', after: p => g(p, 'header_footer.enable_footer') ? '是' : '否' },
      { id: 'footer-page-number', label: '页码类型', before: p => g(p, 'header_footer.footer_page_number_type'), after: p => g(p, 'header_footer.footer_page_number_type') },
    ] },
  { id: 'footnote', label: '脚注', sublabel: 'Footnotes', icon: RiFootprintLine, fields: [] },
  { id: 'citation', label: '引用', sublabel: 'Citations', icon: RiDoubleQuotesL, fields: [] },
]

const activeTab = ref('page')

const tabFields = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
  if (!tab) return []
  const before = beforeSnapshot.value
  const after = afterSnapshot.value || formatParams
  return tab.fields.map(f => ({
    id: f.id,
    label: f.label,
    before: f.before(before),
    after: f.after(after),
    changed: JSON.stringify(f.before(before)) !== JSON.stringify(f.after(after)),
  }))
})

const currentDiff = computed(() => diffs.value[diffIndex.value] || null)

const prevDiff = () => { if (diffIndex.value > 0) diffIndex.value-- }
const nextDiff = () => { if (diffIndex.value < totalDiffs.value - 1) diffIndex.value++ }
const acceptAll = () => {
  if (totalDiffs.value === 0) {
    alert('当前文档无参数差异')
    return
  }
  if (confirm(`确认接受全部 ${totalDiffs.value} 处修改？`)) {
    if (afterSnapshot.value) {
      const merged = JSON.parse(JSON.stringify(afterSnapshot.value))
      for (const key of Object.keys(merged)) {
        if (key in formatParams) {
          if (typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
            Object.assign(formatParams[key], merged[key])
          }
        }
      }
    }
    beforeSnapshot.value = JSON.parse(JSON.stringify(formatParams))
    diffs.value = []
    diffIndex.value = 0
    alert('已接受全部修改')
  }
}
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

const exportDoc = async () => {
  const formatted = getFormatted()
  if (!formatted) {
    alert('未找到排版后的文件，请先点击"一键排版"')
    return
  }
  try {
    downloadBlob(formatted, modifiedFileName.value)
  } catch (e) {
    console.error('导出失败:', e)
    alert('文档导出失败，请重试')
  }
}
</script>

<template>
  <div class="pt-16 h-screen flex flex-col">

      <div class="px-8 py-3 bg-parchment border-b border-tan-border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <RiLayout2Line size="18" class="text-brown" />
          <span class="text-[13px] font-semibold text-brown-dark">对比模式</span>
          <div class="flex bg-cream-darker rounded-lg p-1">
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]"
              :class="compareMode === 'side-by-side' ? 'bg-white font-semibold text-cinnabar' : 'font-medium text-brown'"
              @click="compareMode = 'side-by-side'"
            >
              <RiLayout2Line size="16" :color="compareMode === 'side-by-side' ? '#C43A31' : '#8B7355'" />
              并排对比
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]"
              :class="compareMode === 'diff-table' ? 'bg-white font-semibold text-cinnabar' : 'font-medium text-brown'"
              @click="compareMode = 'diff-table'"
            >
              <RiCollageLine size="16" :color="compareMode === 'diff-table' ? '#C43A31' : '#8B7355'" />
              差异显示
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <RiLinksLine size="15" class="text-brown" />
            <span class="text-[12px] font-medium text-brown">同步滚动</span>
            <button
              @click="syncScroll = !syncScroll"
              class="w-[40px] h-[22px] rounded-full relative transition-colors"
              :class="syncScroll ? 'bg-cinnabar' : 'bg-tan-dark'"
            >
              <div
                class="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200"
                :class="syncScroll ? 'right-0.5' : 'left-0.5'"
              ></div>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <RiEditLine size="15" class="text-brown" />
            <span class="text-[12px] font-medium text-brown">高亮修改</span>
            <button
              @click="highlightDiffs = !highlightDiffs"
              class="w-[40px] h-[22px] rounded-full relative transition-colors"
              :class="highlightDiffs ? 'bg-cinnabar' : 'bg-tan-dark'"
            >
              <div
                class="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200"
                :class="highlightDiffs ? 'right-0.5' : 'left-0.5'"
              ></div>
            </button>
          </div>
        </div>
      </div>

    <div v-if="compareMode === 'side-by-side'" class="flex-1 flex bg-warm-gray overflow-hidden">
      <div class="flex-1 flex flex-col min-w-0">
        <div class="px-6 py-3 bg-cream-dark flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-[11px] h-[10px] rounded-full bg-brown-muted shrink-0"></div>
            <span class="text-[14px] font-semibold text-brown">修改前 · 原始文档</span>
          </div>
          <div class="flex items-center gap-2">
            <RiFileTextLine size="14" color="#5B8C5A" />
            <span class="text-[13px] font-medium text-brown-dark">{{ currentFile?.name || '未命名文档' }}</span>
            <div class="flex items-center gap-1.5 px-2 py-0.5 bg-cream-darker rounded-full">
              <RiEditLine size="12" color="#C43A31" />
              <span class="text-[11px] font-medium text-cinnabar">共 {{ totalDiffs }} 处修改</span>
            </div>
          </div>
        </div>
        <div
          ref="leftScrollRef"
          class="flex-1 bg-warm-gray overflow-y-auto py-6"
          @scroll="onLeftScroll"
        >
          <DocumentPreview :file="currentFile" />
        </div>
      </div>

      <div class="flex-1 flex flex-col min-w-0">
        <div class="px-6 py-3 bg-diff-green-bg flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-[11px] h-[10px] rounded-full bg-jade-light shrink-0"></div>
            <span class="text-[14px] font-semibold text-brown-dark">修改后 · 排版优化</span>
          </div>
          <div class="flex items-center gap-2">
            <RiFileTextLine size="14" color="#5B8C5A" />
            <span class="text-[13px] font-medium text-brown-dark">{{ modifiedFileName }}</span>
            <div v-if="!formattedFile" class="px-2 py-0.5 bg-tan-dark text-white rounded-full text-[11px] font-semibold">未生成</div>
            <div v-else class="px-2 py-0.5 bg-jade-light text-white rounded-full text-[11px] font-semibold">推荐</div>
          </div>
        </div>
        <div
          ref="rightScrollRef"
          class="flex-1 bg-warm-gray overflow-y-auto py-6"
          @scroll="onRightScroll"
        >
          <DocumentPreview v-if="formattedFile" :file="formattedFile" />
          <DocumentPreview v-else :file="currentFile" />
        </div>
      </div>
    </div>

    <div v-else-if="compareMode === 'diff-table'" class="flex-1 flex bg-warm-gray overflow-hidden">

      <aside class="w-[280px] bg-cream border-r border-tan-border flex flex-col shrink-0">
        <div class="px-6 pt-5 pb-5">
          <h3 class="text-base font-semibold text-brown-dark">文档排版标签</h3>
          <div class="w-full h-[1px] bg-tan-border mt-[2px]"></div>
          <p class="text-xs text-brown-muted mt-2">选择需要识别的排版元素</p>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full rounded-xl p-2 transition-all text-left"
            :class="activeTab === tab.id
              ? 'bg-cinnabar text-white'
              : 'bg-cream-dark hover:bg-cream-darker text-brown-dark'"
          >
            <div class="flex items-center gap-2">
              <component :is="tab.icon" :size="'16'" :color="activeTab === tab.id ? 'white' : '#5C4033'" />
              <div class="flex-1">
                <div
                  class="text-[13px]"
                  :class="activeTab === tab.id ? 'font-semibold text-white' : 'font-medium text-brown-dark'"
                >
                  {{ tab.label }}
                </div>
                <div
                  class="text-[10px]"
                  :class="activeTab === tab.id ? 'text-white/75' : 'text-brown-muted'"
                >
                  {{ tab.sublabel }}
                </div>
              </div>
              <div
                v-if="activeTab === tab.id"
                class="w-[7px] h-[6px] bg-white rounded-[3px]"
              ></div>
            </div>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="px-6 py-4 bg-parchment border-b border-tan-border">
          <span class="text-[14px] font-semibold text-brown-dark">{{ tabs.find(t => t.id === activeTab)?.label || '' }}参数对比</span>
          <span class="text-[12px] text-brown-muted ml-3">共 {{ tabFields.length }} 项</span>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-tan-border">
                <th class="text-[12px] font-semibold text-brown-muted text-left py-3 px-3 w-14">序号</th>
                <th class="text-[12px] font-semibold text-brown-muted text-left py-3 px-3">字段</th>
                <th class="text-[12px] font-semibold text-brown-muted text-left py-3 px-3 w-1/3">文件1（原始）</th>
                <th class="text-[12px] font-semibold text-brown-muted text-left py-3 px-3 w-1/3">文件2（优化）</th>
                <th class="text-[12px] font-semibold text-brown-muted text-left py-3 px-3 w-24">差异状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(field, idx) in tabFields" :key="field.id" class="border-b border-tan-border/50 hover:bg-cream/50 transition-colors">
                <td class="py-3 px-3 text-[13px] text-brown-muted">{{ idx + 1 }}</td>
                <td class="py-3 px-3 text-[13px] font-medium text-brown-dark">{{ field.label }}</td>
                <td class="py-3 px-3">
                  <span class="text-[13px] text-brown" :class="{ 'line-through decoration-brown-muted': field.changed }">{{ field.before }}</span>
                </td>
                <td class="py-3 px-3">
                  <span class="text-[13px]" :class="field.changed ? 'text-jade-dark font-semibold' : 'text-brown'">{{ field.after }}</span>
                </td>
                <td class="py-3 px-3">
                  <span v-if="field.changed" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-diff-green-bg text-jade-light">
                    <RiCheckDoubleLine size="10" color="#2D8B57" />
                    已修改
                  </span>
                  <span v-else class="text-[11px] text-brown-muted">--</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="tabFields.length === 0" class="flex items-center justify-center py-16 text-brown-muted text-[13px]">
            此标签暂无参数配置
          </div>
        </div>
      </div>
    </div>

    <div class="px-8 py-3 bg-parchment border-t border-tan-border flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-[13px] h-[12px] rounded bg-cinnabar shrink-0"></div>
          <span class="text-[13px] font-medium text-brown">参数变更 {{ totalDiffs }} 处</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="flex items-center gap-1 px-3 py-2 bg-cream-darker rounded-lg" @click="prevDiff">
          <RiArrowLeftSLine size="16" class="text-brown" />
          <span class="text-[13px] font-medium text-brown">上一处</span>
        </button>
        <span class="text-[13px] text-brown-muted w-16 text-center">{{ totalDiffs > 0 ? diffIndex + 1 : 0 }} / {{ totalDiffs }}</span>
        <button class="flex items-center gap-1 px-3 py-2 bg-cream-darker rounded-lg" @click="nextDiff">
          <span class="text-[13px] font-medium text-brown">下一处</span>
          <RiArrowRightSLine size="16" class="text-brown" />
        </button>
        <div class="w-[1px] h-5 bg-tan-border mx-1"></div>
        <button
          class="flex items-center gap-1.5 px-4 py-2 bg-jade-light text-white rounded-lg text-[13px] font-semibold"
          @click="acceptAll"
        >
          <RiCheckLine size="16" color="white" />
          接受全部修改
        </button>
        <button
          class="flex items-center gap-1.5 px-4 py-2 bg-cinnabar text-white rounded-lg text-[13px] font-semibold"
          @click="exportDoc"
        >
          <RiDownloadLine size="16" color="white" />
          导出文档
        </button>
      </div>
    </div>
  </div>
</template>
