<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDocument } from '../composables/useDocument'
import { useTemplates } from '../composables/useTemplates'
import { useFormatState } from '../composables/useFormatState'
import Sidebar from '../components/Sidebar.vue'
import DocumentPreview from '../components/DocumentPreview.vue'
import SaveTemplateModal from '../components/SaveTemplateModal.vue'
import { RiZoomOutLine, RiZoomInLine, RiPagesLine, RiTextSnippet, RiHeading, RiBarChart2Line, RiListCheck2, RiLayoutTop2Line, RiPhoneFindFill, RiFootprintLine, RiDoubleQuotesL, RiFileTextLine, RiFileEditLine, RiSideBarLine, RiCheckLine } from '@remixicon/vue'

const router = useRouter()
const { getFile } = useDocument()
const currentFile = computed(() => getFile())
const { formatParams, applyFormatting, takeBeforeSnapshot } = useFormatState()

const initialParams = ref(null)

const tabIcons = {
  page: RiPagesLine,
  body: RiTextSnippet,
  heading: RiHeading,
  chart: RiBarChart2Line,
  toc: RiListCheck2,
  header: RiLayoutTop2Line,
  pagenumber: RiPhoneFindFill,
  footnote: RiFootprintLine,
  citation: RiDoubleQuotesL,
}

const tabTitles = {
  page: '页面设置',
  body: '正文设置',
  heading: '标题设置',
  chart: '图表设置',
  toc: '目录设置',
  header: '页眉页脚设置',
  pagenumber: '页码设置',
  footnote: '脚注设置',
  citation: '引用设置',
}

const tabSubtitles = {
  page: '配置页面尺寸、边距与方向',
  body: '调整正文字体、字号与行距',
  heading: '设置各级标题样式',
  chart: '配置图表样式与位置',
  toc: '设置目录层级与格式',
  header: '配置页眉页脚内容、位置与样式',
  pagenumber: '配置页码位置、格式与起始页码',
  footnote: '配置脚注编号格式与位置',
  citation: '配置引用格式与样式',
}

const activeTab = ref('page')
const showSaveModal = ref(false)
const zoomLevel = ref(100)
const currentPage = ref(1)
const totalPages = ref('--')
const showNav = ref(false)
const headings = ref([])
const previewScrollRef = ref(null)

watch(currentPage, (page) => {
  if (!previewScrollRef.value || totalPages.value === '--') return
  const el = previewScrollRef.value
  const ratio = (page - 1) / totalPages.value
  el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: 'smooth' }
  )
})

const { saveTemplate } = useTemplates()

const zoomIn = () => { zoomLevel.value = Math.min(200, zoomLevel.value + 10) }
const zoomOut = () => { zoomLevel.value = Math.max(50, zoomLevel.value - 10) }

watch(currentFile, async (file) => {
  if (!file) { headings.value = []; totalPages.value = '--'; return }
  initialParams.value = JSON.parse(JSON.stringify(formatParams))
  takeBeforeSnapshot()
  try {
    const mammoth = await import('mammoth')
    const buf = await file.arrayBuffer()
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

const handleOneClickModify = () => {
  applyFormatting()
  router.push('/compare')
}

const handleReset = () => {
  if (!initialParams.value) return
  Object.assign(formatParams, JSON.parse(JSON.stringify(initialParams.value)))
}

const onTemplateSaved = ({ name, category }) => {
  saveTemplate(name, category, formatParams)
  showSaveModal.value = false
}

const updateCitationLabel = () => {
  const labels = { numeric: '顺序编码制', 'author-year': '著者-出版年制' }
  formatParams.citation.styleLabel = labels[formatParams.citation.style] || '顺序编码制'
}
</script>

<template>
  <main class="pt-16 bg-parchment">
  <div class="h-[calc(100vh-4rem)] flex">
    <Sidebar @tab-change="activeTab = $event" @save-template="handleSaveTemplate" @one-click-modify="handleOneClickModify" />

    <div class="flex-1 flex flex-col bg-warm-gray">
      <div class="bg-cream border-b border-tan-border">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-cinnabar flex items-center justify-center">
              <component :is="tabIcons[activeTab] || RiFilePaper2Line" size="18" color="white" />
            </div>
            <div>
              <div class="text-[16px] font-bold text-brown-dark">{{ tabTitles[activeTab] || '排版设置' }}</div>
              <div class="text-[12px] text-brown-muted">{{ tabSubtitles[activeTab] || '配置文档排版参数' }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="px-6 py-3 bg-cream-dark border border-tan-border rounded-xl text-[14px] font-medium text-brown" @click="handleReset">
              重置
            </button>
            <button class="flex items-center gap-2 px-6 py-3 bg-jade-light text-white rounded-xl text-[14px] font-semibold hover:bg-jade transition-colors" @click="handleOneClickModify">
              <RiCheckLine size="16" color="white" />
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'page'" class="bg-cream px-6 py-4 border-b border-tan-border">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown whitespace-nowrap">纸张大小</span>
            <select v-model="formatParams.page.paperSize" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[180px]">
              <option>A4 (210mm × 297mm)</option>
              <option>A3 (297mm × 420mm)</option>
              <option>Letter (216mm × 279mm)</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">页边距</span>
            <input type="number" v-model.number="formatParams.page.marginTop" placeholder="上" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
            <input type="number" v-model.number="formatParams.page.marginBottom" placeholder="下" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
            <input type="number" v-model.number="formatParams.page.marginLeft" placeholder="左" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
            <input type="number" v-model.number="formatParams.page.marginRight" placeholder="右" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">方向</span>
            <div class="flex bg-cream-darker rounded-lg p-0.5">
              <button
                class="px-4 py-1.5 rounded-md text-[13px] transition-all"
                :class="formatParams.page.orientation === 'portrait' ? 'bg-cinnabar text-white font-semibold' : 'text-brown font-medium'"
                @click="formatParams.page.orientation = 'portrait'"
              >纵向</button>
              <button
                class="px-4 py-1.5 rounded-md text-[13px] transition-all"
                :class="formatParams.page.orientation === 'landscape' ? 'bg-cinnabar text-white font-semibold' : 'text-brown font-medium'"
                @click="formatParams.page.orientation = 'landscape'"
              >横向</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'body'" class="bg-cream px-6 py-4 border-b border-tan-border">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown whitespace-nowrap">字体</span>
            <select v-model="formatParams.body.font" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[120px]">
              <option>宋体</option>
              <option>仿宋</option>
              <option>黑体</option>
              <option>楷体</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">字号</span>
            <select v-model="formatParams.body.fontSize" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[120px]">
              <option>三号 (16pt)</option>
              <option>四号 (14pt)</option>
              <option>小四 (12pt)</option>
              <option>五号 (10.5pt)</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">行距</span>
            <select v-model="formatParams.body.lineSpacing" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[130px]">
              <option>固定值 28磅</option>
              <option>1.5倍行距</option>
              <option>双倍行距</option>
              <option>单倍行距</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">缩进</span>
            <input type="number" v-model.number="formatParams.body.indentFirst" placeholder="首行" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
            <input type="number" v-model.number="formatParams.body.indentLeft" placeholder="左" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'heading'" class="bg-cream px-6 py-4 border-b border-tan-border">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown whitespace-nowrap">一级标题</span>
            <select v-model="formatParams.heading.level1.font" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
              <option>黑体</option>
              <option>宋体</option>
              <option>仿宋</option>
              <option>楷体</option>
            </select>
            <input type="text" v-model="formatParams.heading.level1.fontSize" placeholder="三号" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">二级标题</span>
            <select v-model="formatParams.heading.level2.font" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
              <option>楷体</option>
              <option>宋体</option>
              <option>仿宋</option>
              <option>黑体</option>
            </select>
            <input type="text" v-model="formatParams.heading.level2.fontSize" placeholder="四号" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-medium text-brown">三级标题</span>
            <select v-model="formatParams.heading.level3.font" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
              <option>仿宋</option>
              <option>宋体</option>
              <option>黑体</option>
              <option>楷体</option>
            </select>
            <input type="text" v-model="formatParams.heading.level3.fontSize" placeholder="小四" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'citation'" class="bg-cream px-6 py-4 border-b border-tan-border">
        <div class="flex items-start gap-8">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-medium text-brown whitespace-nowrap w-[80px]">引用样式</span>
              <select v-model="formatParams.citation.style" @change="updateCitationLabel" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[160px]">
                <option value="numeric">顺序编码制</option>
                <option value="author-year">著者-出版年制</option>
              </select>
              <span class="text-[11px] text-brown-muted">GB/T 7714-2015</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-medium text-brown whitespace-nowrap w-[80px]">参考文献字体</span>
              <select v-model="formatParams.citation.referenceFont" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[120px]">
                <option>宋体</option>
                <option>仿宋</option>
                <option>黑体</option>
                <option>楷体</option>
                <option>Times New Roman</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-medium text-brown whitespace-nowrap w-[80px]">参考文献字号</span>
              <select v-model="formatParams.citation.referenceFontSize" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[140px]">
                <option>五号 (10.5pt)</option>
                <option>小五 (9pt)</option>
                <option>小四 (12pt)</option>
                <option>四号 (14pt)</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-medium text-brown whitespace-nowrap w-[100px]">参考文献行距</span>
              <select v-model="formatParams.citation.referenceLineSpacing" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[130px]">
                <option>固定值 20磅</option>
                <option>固定值 22磅</option>
                <option>固定值 24磅</option>
                <option>1.5倍行距</option>
                <option>单倍行距</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-medium text-brown whitespace-nowrap w-[100px]">缩进方式</span>
              <select v-model="formatParams.citation.referenceIndent" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[120px]">
                <option>悬挂缩进</option>
                <option>首行缩进</option>
                <option>无缩进</option>
              </select>
              <input type="number" v-model.number="formatParams.citation.referenceIndentChars" placeholder="字符" class="w-16 px-2 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown text-center" />
              <span class="text-[12px] text-brown-muted">字符</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-medium text-brown whitespace-nowrap w-[100px]">参考文献语言</span>
              <select v-model="formatParams.citation.referenceLocale" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[120px]">
                <option value="zh-CN">中文</option>
                <option value="en-US">英文</option>
                <option value="mixed">中英文混排</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-cream px-6 py-4 border-b border-tan-border">
        <div class="flex items-center justify-center py-6 text-brown-muted">
          <p class="text-[13px]">此功能正在开发中</p>
        </div>
      </div>

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
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-2 bg-cream-dark rounded-lg">
            <RiFileTextLine size="18" color="#C43A31" />
            <span class="truncate max-w-[143px] text-sm font-medium text-brown">{{ currentFile?.name || '未命名文档' }}</span>
          </div>
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

        <div class="flex items-center gap-2">
          <RiSideBarLine size="15" class="text-brown" />
          <span class="text-[12px] font-medium text-brown">导航目录</span>
          <button
            @click="showNav = !showNav"
            class="w-[40px] h-[22px] rounded-full relative transition-colors"
            :class="showNav ? 'bg-cinnabar' : 'bg-tan-dark'"
          >
            <div
              class="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200"
              :class="showNav ? 'right-0.5' : 'left-0.5'"
            ></div>
          </button>
        </div>
      </div>

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
        <div
          ref="previewScrollRef"
          class="flex-1 overflow-auto"
          :style="{ zoom: `${zoomLevel}%` }"
        >
          <DocumentPreview :file="currentFile" />
        </div>
      </div>

    </div>

    <SaveTemplateModal
      v-if="showSaveModal"
      @close="showSaveModal = false"
      @saved="onTemplateSaved"
    />
  </div>
  </main>
</template>
