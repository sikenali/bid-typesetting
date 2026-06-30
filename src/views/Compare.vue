<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDocument } from '../composables/useDocument'
import { useFormatState } from '../composables/useFormatState'
import { useDocumentExport } from '../composables/useDocumentExport'
import { RiFileTextLine, RiEditLine, RiCheckLine, RiDownloadLine, RiArrowLeftSLine, RiArrowRightSLine, RiLayout2Line, RiCollageLine, RiLinksLine, RiPagesLine, RiTextSnippet, RiHeading, RiBarChart2Line, RiListCheck2, RiLayoutTop2Line, RiPhoneFindFill, RiFootprintLine, RiDoubleQuotesL, RiCheckDoubleLine } from '@remixicon/vue'
import DocumentPreview from '../components/DocumentPreview.vue'

const router = useRouter()
const { getFile } = useDocument()
const { beforeSnapshot, afterSnapshot, diffs, formatParams } = useFormatState()
const { exportFormattedDoc } = useDocumentExport()
const currentFile = getFile()

const today = new Date()
const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`

const modifiedFileName = computed(() => {
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

const tabs = [
  { id: 'page', label: '页面', sublabel: 'Page Layout', icon: RiPagesLine,
    fields: [
      { id: 'page-paper', label: '纸张大小', before: p => g(p, 'page.paperSize'), after: p => g(p, 'page.paperSize') },
      { id: 'page-margins', label: '页边距', before: p => `上${g(p,'page.marginTop')} 下${g(p,'page.marginBottom')} 左${g(p,'page.marginLeft')} 右${g(p,'page.marginRight')}`, after: p => `上${g(p,'page.marginTop')} 下${g(p,'page.marginBottom')} 左${g(p,'page.marginLeft')} 右${g(p,'page.marginRight')}` },
      { id: 'page-orientation', label: '方向', before: p => g(p, 'page.orientation'), after: p => g(p, 'page.orientation') },
    ] },
  { id: 'body', label: '正文', sublabel: 'Body Text', icon: RiTextSnippet,
    fields: [
      { id: 'body-font', label: '字体', before: p => g(p, 'body.font'), after: p => g(p, 'body.font') },
      { id: 'body-font-size', label: '字号', before: p => g(p, 'body.fontSize'), after: p => g(p, 'body.fontSize') },
      { id: 'body-line-spacing', label: '行距', before: p => g(p, 'body.lineSpacing'), after: p => g(p, 'body.lineSpacing') },
      { id: 'body-indent', label: '缩进', before: p => `首行${g(p,'body.indentFirst')} 左${g(p,'body.indentLeft')}`, after: p => `首行${g(p,'body.indentFirst')} 左${g(p,'body.indentLeft')}` },
    ] },
  { id: 'heading', label: '标题', sublabel: 'Headings', icon: RiHeading,
    fields: [
      { id: 'heading-level1', label: '一级标题', before: p => `${g(p,'heading.level1.font')} ${g(p,'heading.level1.fontSize')}`, after: p => `${g(p,'heading.level1.font')} ${g(p,'heading.level1.fontSize')}` },
      { id: 'heading-level2', label: '二级标题', before: p => `${g(p,'heading.level2.font')} ${g(p,'heading.level2.fontSize')}`, after: p => `${g(p,'heading.level2.font')} ${g(p,'heading.level2.fontSize')}` },
      { id: 'heading-level3', label: '三级标题', before: p => `${g(p,'heading.level3.font')} ${g(p,'heading.level3.fontSize')}`, after: p => `${g(p,'heading.level3.font')} ${g(p,'heading.level3.fontSize')}` },
    ] },
  { id: 'chart', label: '图表', sublabel: 'Charts & Tables', icon: RiBarChart2Line, fields: [] },
  { id: 'toc', label: '目录', sublabel: 'Table of Contents', icon: RiListCheck2, fields: [] },
  { id: 'header', label: '页眉页脚', sublabel: 'Header & Footer', icon: RiLayoutTop2Line, fields: [] },
  { id: 'pagenumber', label: '页码', sublabel: 'Page Number', icon: RiPhoneFindFill, fields: [] },
  { id: 'footnote', label: '脚注', sublabel: 'Footnotes', icon: RiFootprintLine, fields: [] },
  { id: 'citation', label: '引用', sublabel: 'Citations', icon: RiDoubleQuotesL,
    fields: [
      { id: 'citation-style', label: '引用样式', before: p => g(p, 'citation.styleLabel'), after: p => g(p, 'citation.styleLabel') },
      { id: 'citation-font', label: '参考文献字体', before: p => g(p, 'citation.referenceFont'), after: p => g(p, 'citation.referenceFont') },
      { id: 'citation-font-size', label: '参考文献字号', before: p => g(p, 'citation.referenceFontSize'), after: p => g(p, 'citation.referenceFontSize') },
      { id: 'citation-line-spacing', label: '参考文献行距', before: p => g(p, 'citation.referenceLineSpacing'), after: p => g(p, 'citation.referenceLineSpacing') },
      { id: 'citation-indent', label: '缩进方式', before: p => `${g(p,'citation.referenceIndent')} ${g(p,'citation.referenceIndentChars')}字符`, after: p => `${g(p,'citation.referenceIndent')} ${g(p,'citation.referenceIndentChars')}字符` },
      { id: 'citation-locale', label: '参考文献语言', before: p => g(p, 'citation.referenceLocale'), after: p => g(p, 'citation.referenceLocale') },
    ] },
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
    changed: f.before(before) !== f.after(after),
  }))
})

const currentDiff = computed(() => diffs.value[diffIndex.value] || null)

const prevDiff = () => { if (diffIndex.value > 0) diffIndex.value-- }
const nextDiff = () => { if (diffIndex.value < totalDiffs.value - 1) diffIndex.value++ }
const acceptAll = () => {
  if (confirm('确认接受全部修改？')) {
    alert('已接受全部修改')
  }
}
const exportDoc = async () => {
  const file = getFile()
  if (!file) {
    alert('未找到原始文档，请先上传')
    return
  }
  try {
    await exportFormattedDoc(file, formatParams)
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
            <div class="px-2 py-0.5 bg-jade-light text-white rounded-full text-[11px] font-semibold">推荐</div>
          </div>
        </div>
        <div
          ref="rightScrollRef"
          class="flex-1 bg-warm-gray overflow-y-auto py-6"
          @scroll="onRightScroll"
        >
          <DocumentPreview :file="currentFile" />
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
