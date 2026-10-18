<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/toast'
import { useDocument } from '../composables/useDocument'
import { useFormatState } from '../composables/useFormatState'
import { useSettings } from '../composables/useSettings'
import DocumentPreview from '../components/DocumentPreview.vue'
import TopNav from '../components/layout/TopNav.vue'
import PageFooter from '../components/layout/PageFooter.vue'
import CreditQualificationModal from '../components/layout/CreditQualificationModal.vue'
import BiddingSitesModal from '../components/layout/BiddingSitesModal.vue'

const router = useRouter()
const { getFile, getFormatted } = useDocument()
const { beforeSnapshot, afterSnapshot, diffs, formatParams } = useFormatState()
const { annotationEnabled, highlightEnabled } = useSettings()
const currentFile = computed(() => getFile())
const formattedFile = computed(() => getFormatted())

const today = new Date()
const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`

const modifiedFileName = computed(() => {
  if (formattedFile.value?.name) return formattedFile.value.name
  if (!currentFile.value) return '未命名文档-M'
  const name = currentFile.value.name
  const dot = name.lastIndexOf('.')
  if (dot === -1) return `${name}-M-${dateStr}`
  return `${name.slice(0, dot)}-M-${dateStr}${name.slice(dot)}`
})

const showSettings = ref(false)
const showCredit = ref(false)
const showBidding = ref(false)

const compareMode = ref('side-by-side')
const diffIndex = ref(0)
const syncScroll = ref(true)
const highlightDiffs = ref(highlightEnabled.value)
watch(highlightDiffs, (v) => { highlightEnabled.value = v })

const leftScrollRef = ref(null)
const rightScrollRef = ref(null)
let syncing = false

function syncScrollHandler(source, target) {
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

function g(obj, path) {
  if (!obj) return '--'
  const keys = path.split('.')
  let v = obj
  for (const k of keys) v = v?.[k]
  return v ?? '--'
}

function formatHeadingLevel(p, level) {
  if (!p) return '--'
  const h = p.headings?.[level - 1]
  if (!h) return '--'
  return `${h.cn_font || '--'} / ${h.en_font || '--'} · ${h.size_cn || '--'}`
}

const tabs = [
  { id: 'page', label: '页面', sublabel: 'Page Layout', icon: 'RiPagesLine',
    fields: [
      { id: 'page-paper', label: '纸张大小', before: p => g(p, 'page.paper_size'), after: p => g(p, 'page.paper_size') },
      { id: 'page-margins', label: '页边距 (上/下/左/右 cm)', before: p => `${g(p,'page.top_cm')} / ${g(p,'page.bottom_cm')} / ${g(p,'page.left_cm')} / ${g(p,'page.right_cm')}`, after: p => `${g(p,'page.top_cm')} / ${g(p,'page.bottom_cm')} / ${g(p,'page.left_cm')} / ${g(p,'page.right_cm')}` },
      { id: 'page-gutter', label: '装订线 (cm)', before: p => g(p, 'page.gutter_cm'), after: p => g(p, 'page.gutter_cm') },
      { id: 'page-header-margin', label: '页眉距 (cm)', before: p => g(p, 'page.header_margin_cm'), after: p => g(p, 'page.header_margin_cm') },
      { id: 'page-columns', label: '分栏', before: p => `${g(p,'page.columns')} 栏 · 间距 ${g(p,'page.column_spacing_cm')} cm`, after: p => `${g(p,'page.columns')} 栏 · 间距 ${g(p,'page.column_spacing_cm')} cm` },
      { id: 'page-keep-orientation', label: '保持原方向', before: p => g(p, 'page.keep_original_orientation') ? '是' : '否', after: p => g(p, 'page.keep_original_orientation') ? '是' : '否' },
    ] },
  { id: 'body', label: '正文', sublabel: 'Body Text', icon: 'RiTextSnippet',
    fields: [
      { id: 'body-font', label: '中文字体', before: p => g(p, 'body.cn_font'), after: p => g(p, 'body.cn_font') },
      { id: 'body-en-font', label: '英文字体', before: p => g(p, 'body.en_font'), after: p => g(p, 'body.en_font') },
      { id: 'body-font-size', label: '正文字号', before: p => g(p, 'body.size_cn'), after: p => g(p, 'body.size_cn') },
      { id: 'body-bold', label: '加粗', before: p => g(p, 'body.bold') ? '是' : '否', after: p => g(p, 'body.bold') ? '是' : '否' },
      { id: 'body-line-spacing', label: '行距', before: p => `${g(p,'body.line_spacing_mode')} ${g(p,'body.line_spacing_value')}`, after: p => `${g(p,'body.line_spacing_mode')} ${g(p,'body.line_spacing_value')}` },
      { id: 'body-indent', label: '首行缩进', before: p => `${g(p,'body.first_line_indent_chars')} 字符`, after: p => `${g(p,'body.first_line_indent_chars')} 字符` },
      { id: 'body-align', label: '对齐方式', before: p => g(p, 'body.align'), after: p => g(p, 'body.align') },
    ] },
  { id: 'heading', label: '标题', sublabel: 'Headings', icon: 'RiHeading',
    fields: [
      { id: 'heading-level1', label: '一级标题', before: p => formatHeadingLevel(p, 1), after: p => formatHeadingLevel(p, 1) },
      { id: 'heading-level2', label: '二级标题', before: p => formatHeadingLevel(p, 2), after: p => formatHeadingLevel(p, 2) },
      { id: 'heading-level3', label: '三级标题', before: p => formatHeadingLevel(p, 3), after: p => formatHeadingLevel(p, 3) },
      { id: 'heading-level4', label: '四级标题', before: p => formatHeadingLevel(p, 4), after: p => formatHeadingLevel(p, 4) },
    ] },
  { id: 'chart', label: '图表', sublabel: 'Charts & Tables', icon: 'RiBarChart2Line',
    fields: [
      { id: 'fig-caption', label: '图标题字体', before: p => `${g(p,'fig_caption.cn_font')} / ${g(p,'fig_caption.size_cn')}`, after: p => `${g(p,'fig_caption.cn_font')} / ${g(p,'fig_caption.size_cn')}` },
      { id: 'tbl-caption', label: '表标题字体', before: p => `${g(p,'tbl_caption.cn_font')} / ${g(p,'tbl_caption.size_cn')}`, after: p => `${g(p,'tbl_caption.cn_font')} / ${g(p,'tbl_caption.size_cn')}` },
      { id: 'table-font', label: '表格字体', before: p => `${g(p,'table.cn_font')} / ${g(p,'table.size_cn')}`, after: p => `${g(p,'table.cn_font')} / ${g(p,'table.size_cn')}` },
    ] },
  { id: 'toc', label: '目录', sublabel: 'Table of Contents', icon: 'RiListCheck2',
    fields: [
      { id: 'toc-enable', label: '生成目录', before: p => g(p, 'toc.enable') ? '是' : '否', after: p => g(p, 'toc.enable') ? '是' : '否' },
      { id: 'toc-title', label: '目录标题', before: p => g(p, 'toc.title_text'), after: p => g(p, 'toc.title_text') },
      { id: 'toc-title-font', label: '目录标题字体', before: p => `${g(p,'toc.title_cn_font')} / ${g(p,'toc.title_size_cn')}`, after: p => `${g(p,'toc.title_cn_font')} / ${g(p,'toc.title_size_cn')}` },
    ] },
  { id: 'header', label: '页眉页脚', sublabel: 'Header & Footer', icon: 'RiLayoutTop2Line',
    fields: [
      { id: 'header-enable', label: '启用页眉', before: p => g(p, 'header_footer.enable_header') ? '是' : '否', after: p => g(p, 'header_footer.enable_header') ? '是' : '否' },
      { id: 'header-text', label: '页眉文字', before: p => g(p, 'header_footer.header_text') || '(无)', after: p => g(p, 'header_footer.header_text') || '(无)' },
      { id: 'header-font', label: '页眉字体', before: p => `${g(p,'header_footer.header_cn_font')} / ${g(p,'header_footer.header_size_cn')}`, after: p => `${g(p,'header_footer.header_cn_font')} / ${g(p,'header_footer.header_size_cn')}` },
      { id: 'footer-enable', label: '启用页脚', before: p => g(p, 'header_footer.enable_footer') ? '是' : '否', after: p => g(p, 'header_footer.enable_footer') ? '是' : '否' },
      { id: 'footer-page-number', label: '页码类型', before: p => g(p, 'header_footer.footer_page_number_type'), after: p => g(p, 'header_footer.footer_page_number_type') },
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
    changed: JSON.stringify(f.before(before)) !== JSON.stringify(f.after(after)),
  }))
})

const prevDiff = () => { if (diffIndex.value > 0) diffIndex.value-- }
const nextDiff = () => { if (diffIndex.value < totalDiffs.value - 1) diffIndex.value++ }

function deepMerge(target, src) {
  for (const key of Object.keys(src)) {
    const v = src[key]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) target[key] = {}
      deepMerge(target[key], v)
    } else {
      target[key] = Array.isArray(v) ? [...v] : v
    }
  }
}

function acceptAll() {
  if (totalDiffs.value === 0) {
    ElMessage.warning('当前文档无参数差异')
    return
  }
  if (confirm(`确认接受全部 ${totalDiffs.value} 处修改？`)) {
    if (afterSnapshot.value) {
      deepMerge(formatParams, JSON.parse(JSON.stringify(afterSnapshot.value)))
    }
    beforeSnapshot.value = JSON.parse(JSON.stringify(formatParams))
    diffs.value = []
    diffIndex.value = 0
    ElMessage.success('已接受全部修改')
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

function exportDoc() {
  const formatted = getFormatted()
  if (!formatted) {
    ElMessage.warning('未找到排版后的文件，请先点击"一键排版"')
    return
  }
  try {
    downloadBlob(formatted, modifiedFileName.value)
    ElMessage.success('已导出文档')
  } catch (e) {
    console.error('导出失败:', e)
    ElMessage.error('文档导出失败，请重试')
  }
}
</script>

<template>
  <div class="compare-page">
    <TopNav title="对比结果" :show-back="true" @open-settings="showSettings = true" />

    <div class="toolbar">
      <div class="toolbar-left">
        <div class="chip-toggle">
          <button
            type="button"
            class="chip"
            :class="{ active: compareMode === 'side-by-side' }"
            @click="compareMode = 'side-by-side'"
          >
            <RiLayout2Line size="15" />
            <span>并排对比</span>
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: compareMode === 'diff-table' }"
            @click="compareMode = 'diff-table'"
          >
            <RiCollageLine size="15" />
            <span>差异表格</span>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <label class="toggle">
          <span class="toggle-label"><RiLinksLine size="14" /><span>同步滚动</span></span>
          <button
            type="button"
            class="switch"
            :class="{ on: syncScroll }"
            role="switch"
            :aria-checked="syncScroll"
            @click="syncScroll = !syncScroll"
          >
            <span class="knob"></span>
          </button>
        </label>
        <label class="toggle">
          <span class="toggle-label"><RiEditLine size="14" /><span>高亮修改</span></span>
          <button
            type="button"
            class="switch"
            :class="{ on: highlightDiffs }"
            role="switch"
            :aria-checked="highlightDiffs"
            @click="highlightDiffs = !highlightDiffs"
          >
            <span class="knob"></span>
          </button>
        </label>
      </div>
    </div>

    <div v-if="compareMode === 'side-by-side'" class="side-by-side">
      <div class="pane">
        <div class="pane-head pane-head-before">
          <div class="pane-title">
            <span class="dot dot-before"></span>
            <span>修改前 · 原始文档</span>
          </div>
          <div class="pane-meta">
            <RiFileTextLine size="14" />
            <span class="pane-name">{{ currentFile?.name || '未命名文档' }}</span>
            <span class="tag tag-warn">共 {{ totalDiffs }} 处修改</span>
          </div>
        </div>
        <div ref="leftScrollRef" class="pane-body" @scroll="onLeftScroll">
          <DocumentPreview :file="currentFile" />
        </div>
      </div>

      <div class="pane">
        <div class="pane-head pane-head-after">
          <div class="pane-title">
            <span class="dot dot-after"></span>
            <span>修改后 · 排版优化</span>
          </div>
          <div class="pane-meta">
            <RiFileTextLine size="14" />
            <span class="pane-name">{{ modifiedFileName }}</span>
            <span v-if="!formattedFile" class="tag tag-muted">未生成</span>
            <span v-else class="tag tag-ok">推荐</span>
          </div>
        </div>
        <div ref="rightScrollRef" class="pane-body" @scroll="onRightScroll">
          <DocumentPreview v-if="formattedFile" :file="formattedFile" />
          <DocumentPreview v-else :file="currentFile" />
        </div>
      </div>
    </div>

    <div v-else-if="annotationEnabled" class="diff-view">
      <aside class="tab-sidebar">
        <div class="sidebar-title">
          <h3>文档排版标签</h3>
          <p>选择需要识别的排版元素</p>
        </div>
        <div class="tab-list">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" size="16" class="tab-icon" />
            <div class="tab-label">
              <span class="tab-name">{{ tab.label }}</span>
              <span class="tab-sub">{{ tab.sublabel }}</span>
            </div>
          </button>
        </div>
      </aside>

      <section class="diff-content">
        <div class="diff-header">
          <span class="diff-title">{{ tabs.find(t => t.id === activeTab)?.label || '' }} 参数对比</span>
          <span class="diff-count">共 {{ tabFields.length }} 项</span>
        </div>
        <div class="diff-table-wrap">
          <table class="diff-table">
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th class="col-field">字段</th>
                <th class="col-before">修改前</th>
                <th class="col-after">修改后</th>
                <th class="col-status">差异</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(field, idx) in tabFields" :key="field.id">
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-field">{{ field.label }}</td>
                <td class="col-before">
                  <span :class="{ strikethrough: field.changed }">{{ field.before }}</span>
                </td>
                <td class="col-after">
                  <span :class="{ highlight: field.changed }">{{ field.after }}</span>
                </td>
                <td class="col-status">
                  <span v-if="field.changed" class="tag tag-ok">
                    <RiCheckDoubleLine size="11" />
                    已修改
                  </span>
                  <span v-else class="status-unchanged">--</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="tabFields.length === 0" class="diff-empty">
            此标签暂无参数配置
          </div>
        </div>
      </section>
    </div>

    <div v-else class="diff-off" style="display: flex; align-items: center; justify-content: center; height: 420px; color: var(--color-text-muted); font-size: 14px;">
      已在「个人设置」中关闭批注形式展示
    </div>

    <div class="action-bar">
      <div class="action-left">
        <span class="diff-badge">
          <span class="dot dot-accent"></span>
          <span>参数变更 {{ totalDiffs }} 处</span>
        </span>
      </div>
      <div class="action-right">
        <button type="button" class="btn-sm" @click="prevDiff" :disabled="diffIndex <= 0">
          <RiArrowLeftSLine size="15" />
          <span>上一处</span>
        </button>
        <span class="diff-progress">{{ totalDiffs > 0 ? diffIndex + 1 : 0 }} / {{ totalDiffs }}</span>
        <button type="button" class="btn-sm" @click="nextDiff" :disabled="diffIndex >= totalDiffs - 1">
          <span>下一处</span>
          <RiArrowRightSLine size="15" />
        </button>
        <div class="divider"></div>
        <button type="button" class="btn-sm btn-secondary" @click="acceptAll">
          <RiCheckLine size="15" />
          <span>接受全部修改</span>
        </button>
        <button type="button" class="btn-sm btn-primary" @click="exportDoc">
          <RiDownloadLine size="15" />
          <span>导出文档</span>
        </button>
      </div>
    </div>

    <PageFooter @credit-query="showCredit = true" @bidding-sites="showBidding = true" />

    <CreditQualificationModal v-model:visible="showCredit" />
    <BiddingSitesModal v-model:visible="showBidding" />
  </div>
</template>

<style scoped>
.compare-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-main);
}
.toolbar {
  height: 60px;
  padding: 0 24px;
  background: var(--color-bg-white);
  border-bottom: 0.7px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chip-toggle {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
}
.chip {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--color-text-body);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-base);
}
.chip:hover {
  color: var(--color-primary-deep);
}
.chip.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
  font-weight: 500;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-body);
  font-weight: 500;
}
.switch {
  width: 46px;
  height: 26px;
  border-radius: 9999px;
  border: none;
  background: var(--color-switch-off);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 3px;
  transition: background-color var(--transition-base);
}
.switch.on {
  background: var(--color-primary);
  justify-content: flex-end;
}
.switch .knob {
  width: 21px;
  height: 20px;
  border-radius: 9999px;
  background: var(--color-bg-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transition: transform var(--transition-base);
}
.side-by-side {
  flex: 1;
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  min-height: 0;
  overflow: hidden;
}
.pane {
  flex: 1;
  min-width: 0;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pane-head {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 0.7px solid var(--color-border-soft);
  flex-shrink: 0;
}
.pane-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  display: inline-block;
}
.dot-before {
  background: var(--color-text-faint);
}
.dot-after {
  background: var(--color-success);
}
.dot-accent {
  background: var(--color-primary);
  width: 10px;
  height: 10px;
}
.pane-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
  overflow: hidden;
}
.pane-name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.tag-warn {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}
.tag-muted {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
}
.tag-ok {
  background: var(--color-success-soft);
  color: var(--color-success-strong);
}
.pane-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.diff-view {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 12px 16px;
  gap: 12px;
  min-height: 0;
}
.tab-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-title {
  padding: 16px;
  border-bottom: 0.7px solid var(--color-border-soft);
}
.sidebar-title h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.sidebar-title p {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}
.tab-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tab-item {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.tab-item:hover {
  background: var(--color-bg-secondary);
}
.tab-item.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
}
.tab-icon {
  flex-shrink: 0;
  color: var(--color-primary);
}
.tab-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tab-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.tab-item.active .tab-name {
  color: var(--color-primary-deep);
}
.tab-sub {
  font-size: 11px;
  color: var(--color-text-muted);
}
.diff-content {
  flex: 1;
  min-width: 0;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.diff-header {
  height: 52px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 0.7px solid var(--color-border-soft);
  background: var(--color-bg-white);
}
.diff-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.diff-count {
  font-size: 12px;
  color: var(--color-text-muted);
}
.diff-table-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}
.diff-table {
  width: 100%;
  border-collapse: collapse;
}
.diff-table thead th {
  background: var(--color-bg-secondary);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-body);
  padding: 10px 14px;
  text-align: left;
  border-bottom: 0.7px solid var(--color-border-soft);
  position: sticky;
  top: 0;
  z-index: 1;
}
.diff-table tbody td {
  padding: 10px 14px;
  font-size: 13px;
  color: var(--color-text-body);
  border-bottom: 0.7px solid var(--color-border-soft);
  vertical-align: top;
}
.diff-table tbody tr:hover {
  background: var(--color-bg-secondary);
}
.col-idx { width: 60px; color: var(--color-text-muted); }
.col-field { font-weight: 500; color: var(--color-text-primary); }
.col-before, .col-after { width: 30%; }
.col-before {
  color: var(--color-text-muted);
}
.col-before .strikethrough {
  text-decoration: line-through;
  color: var(--color-text-muted);
}
.col-after .highlight {
  color: var(--color-success-strong);
  font-weight: 600;
}
.status-unchanged {
  color: var(--color-text-faint);
  font-size: 12px;
}
.diff-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}
.action-bar {
  height: 64px;
  padding: 0 24px;
  background: var(--color-bg-white);
  border-top: 0.7px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}
.action-left {
  display: flex;
  align-items: center;
}
.diff-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-body);
  font-weight: 500;
}
.action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.divider {
  width: 1px;
  height: 20px;
  background: var(--color-border-soft);
  margin: 0 4px;
}
.btn-sm {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--color-bg-secondary);
  border: none;
  color: var(--color-text-body);
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-base);
}
.btn-sm:hover:not(:disabled) {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
}
.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-sm.btn-secondary {
  background: var(--color-success-soft);
  color: var(--color-success-strong);
}
.btn-sm.btn-secondary:hover:not(:disabled) {
  background: var(--color-success);
  color: var(--color-bg-white);
}
.btn-sm.btn-primary {
  background: var(--color-primary);
  color: var(--color-bg-white);
}
.btn-sm.btn-primary:hover:not(:disabled) {
  opacity: 0.92;
  color: var(--color-bg-white);
}
.diff-progress {
  font-size: 13px;
  color: var(--color-text-muted);
  min-width: 60px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
