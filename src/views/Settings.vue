<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettings } from '../composables/useSettings'
import { useTemplates } from '../composables/useTemplates'
import { RiPaletteLine, RiBookmark3Line, RiEyeLine, RiCheckLine, RiFileTextLine, RiBuildingLine, RiBook2Line, RiBarChart2Line, RiFileEditLine, RiSettings3Line, RiBrushLine, RiDeleteBinLine, RiSearchLine } from '@remixicon/vue'

const router = useRouter()
const { theme: currentTheme, template: currentTemplate, annotationEnabled, highlightEnabled, setTheme, setTemplate, toggleAnnotation, toggleHighlight } = useSettings()
const { templates, deleteTemplate, categoryMeta } = useTemplates()

const activeSection = ref('theme')
const sectionContainerRef = ref(null)
const indicatorStyle = ref({ top: '0px', height: '0px' })
const isInitialized = ref(false) // 首次加载完成后标记
const sectionTabs = [
  { id: 'theme', label: '主题设置', sublabel: 'Theme', icon: RiPaletteLine, activeBg: 'bg-cinnabar' },
  { id: 'template', label: '模板设置', sublabel: 'Template', icon: RiBookmark3Line, activeBg: 'bg-gold-dark' },
  { id: 'display', label: '显示设置', sublabel: 'Display', icon: RiEyeLine, activeBg: 'bg-jade-light' },
]

function selectSection(id) {
  activeSection.value = id
  nextTick(() => {
    positionIndicator()
    // 切换到对应 section 时计算卡片指示器位置
    if (id === 'theme') {
      setTimeout(positionThemeIndicator, 50)
    } else if (id === 'template') {
      setTimeout(positionTemplateIndicator, 50)
    }
  })
}

function positionIndicator() {
  const container = sectionContainerRef.value
  if (!container) return
  const btns = container.querySelectorAll('button')
  let targetBtn = null
  for (const btn of btns) {
    if (btn.dataset.sectionId === activeSection.value) {
      targetBtn = btn
      break
    }
  }
  if (!targetBtn) return
  const containerRect = container.getBoundingClientRect()
  const btnRect = targetBtn.getBoundingClientRect()
  indicatorStyle.value = {
    top: `${btnRect.top - containerRect.top}px`,
    height: `${btnRect.height}px`,
  }
}

onMounted(() => {
  nextTick(() => {
    positionIndicator()
    setTimeout(positionThemeIndicator, 100)
    // 首次加载完成后启用动效
    setTimeout(() => { isInitialized.value = true }, 150)
  })
})

// 主题卡片选择器
const themeContainerRef = ref(null)
const themeIndicatorStyle = ref({ left: '0px', width: '0px' })

function positionThemeIndicator() {
  const container = themeContainerRef.value
  if (!container) return
  const cards = container.querySelectorAll('[data-theme-id]')
  let targetCard = null
  for (const card of cards) {
    if (card.dataset.themeId === currentTheme.value) {
      targetCard = card
      break
    }
  }
  if (!targetCard) return
  const containerRect = container.getBoundingClientRect()
  const cardRect = targetCard.getBoundingClientRect()
  themeIndicatorStyle.value = {
    left: `${cardRect.left - containerRect.left - 4}px`,
    width: `${cardRect.width + 8}px`,
  }
}

// 标准模板卡片选择器
const templateContainerRef = ref(null)
const templateIndicatorStyle = ref({ left: '0px', width: '0px' })

function positionTemplateIndicator() {
  const container = templateContainerRef.value
  if (!container) return
  const cards = container.querySelectorAll('[data-template-id]')
  let targetCard = null
  for (const card of cards) {
    if (card.dataset.templateId === currentTemplate.value) {
      targetCard = card
      break
    }
  }
  if (!targetCard) return
  const containerRect = container.getBoundingClientRect()
  const cardRect = targetCard.getBoundingClientRect()
  templateIndicatorStyle.value = {
    left: `${cardRect.left - containerRect.left - 4}px`,
    width: `${cardRect.width + 8}px`,
  }
}

onMounted(() => {
  nextTick(() => {
    positionIndicator()
    // 首次加载时，主题是默认显示的，延迟计算确保 DOM 完全渲染
    setTimeout(positionThemeIndicator, 100)
  })
})

const themes = [
  { id: 'light', name: '浅色主题', desc: '经典羊皮纸底色', previewBg: '#FDF6E3' },
  { id: 'dark', name: '深色主题', desc: '深色护眼模式', previewBg: '#2C2416' },
  { id: 'paper', name: '纯白纸', desc: '清爽干净', previewBg: '#FFFFFF' },
]

const templates = [
  { id: 'gb', name: '国家标准', sub: 'GB/T 7714', desc: '符合国家公文标准格式', icon: RiFileTextLine, iconColor: '#C8A45C' },
  { id: 'government', name: '政府公文', sub: 'GB/T 9704', desc: '党政机关公文格式标准', icon: RiBuildingLine, iconColor: '#C43A31' },
  { id: 'academic', name: '学术论文', sub: 'GB/T 7714', desc: '学术论文排版规范', icon: RiBook2Line, iconColor: '#6B8CAE' },
  { id: 'business', name: '商务报告', sub: 'ISO 50001', desc: '国际商务文档模板', icon: RiBarChart2Line, iconColor: '#5B8C5A' },
]

const displayOptions = [
  { id: 'highlight', name: '高亮修改处', desc: '开启后，页面中将高亮标记所有被修改的内容' },
  { id: 'annotation', name: '以批注形式展示修改', desc: '开启后，排版修改将以批注气泡形式显示在文档右侧' },
]

// 模板设置相关状态
const activeTemplateTab = ref('built-in') // 'built-in' or 'custom'
const templateSearchKeyword = ref('')

const templateCategories = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '公文' },
  { id: 'academic', label: '学术' },
  { id: 'business', label: '商务' },
  { id: 'creative', label: '创意' },
]
const activeCategory = ref('all')

const filteredTemplates = computed(() => {
  if (activeTemplateTab.value === 'built-in') {
    return templates.value.filter(t => t.builtIn)
  }
  return templates.value.filter(tpl => {
    const matchSearch = !templateSearchKeyword.value || tpl.name.toLowerCase().includes(templateSearchKeyword.value.toLowerCase())
    const matchCategory = activeCategory.value === 'all' || tpl.category === activeCategory.value
    return matchSearch && matchCategory && !tpl.builtIn
  })
})

const handleDeleteCustomTemplate = (id) => {
  if (confirm('确定删除此自定义模板吗？')) {
    deleteTemplate(id)
  }
}
</script>

<template>
  <div class="pt-16 h-screen flex">
    <div class="w-[280px] bg-cream border-r border-tan-border flex flex-col">
      <div class="px-6 pt-5 pb-5">
        <h3 class="text-base font-semibold text-brown-dark">排版设置</h3>
        <div class="w-full h-[1px] bg-tan-border mt-[2px]"></div>
        <p class="text-xs text-brown-muted mt-2">配置主题、模板与显示方式</p>
      </div>

      <div ref="sectionContainerRef" class="flex-1 px-4 pb-4 relative">
        <div class="absolute left-4 right-4 rounded-xl shadow-sm pointer-events-none z-0"
          :class="[sectionTabs.find(t => t.id === activeSection)?.activeBg || 'bg-cinnabar', isInitialized ? 'transition-all duration-300 ease-out' : '']"
          :style="indicatorStyle">
        </div>
        <div class="space-y-[2px] relative">
          <button
            v-for="tab in sectionTabs" :key="tab.id"
            :data-section-id="tab.id"
            @click="selectSection(tab.id)"
            class="relative z-10 w-full rounded-xl py-3 px-4 flex items-center gap-3 transition-colors text-left"
            :class="activeSection === tab.id ? 'text-white' : 'text-brown-dark hover:text-brown-dark'"
          >
            <component :is="tab.icon" :size="20" :color="activeSection === tab.id ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === tab.id ? 'text-white' : 'text-brown-dark'">{{ tab.label }}</div>
              <div class="text-[11px]" :class="activeSection === tab.id ? 'text-white/75' : 'text-brown-muted'">{{ tab.sublabel }}</div>
            </div>
          </button>
        </div>
      </div>

    </div>

    <div class="flex-1 bg-warm-gray flex flex-col">
      <div class="px-8 py-5 bg-parchment flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="activeSection === 'theme' ? 'bg-cinnabar' : activeSection === 'template' ? 'bg-gold-dark' : 'bg-jade-light'"
          >
            <RiPaletteLine v-if="activeSection === 'theme'" size="20" color="white" />
            <RiBookmark3Line v-else-if="activeSection === 'template'" size="20" color="white" />
            <RiEyeLine v-else size="20" color="white" />
          </div>
          <div>
            <h2 class="text-[18px] font-bold text-brown-dark">
              {{ activeSection === 'theme' ? '主题设置' : activeSection === 'template' ? '模板设置' : '显示设置' }}
            </h2>
            <p class="text-[12px] text-brown-muted">
              {{ activeSection === 'theme' ? '选择界面配色方案' : activeSection === 'template' ? '管理模板与排版标准' : '控制修改建议的展示方式' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="px-6 py-3 bg-cream-dark border border-tan-border rounded-xl text-[14px] font-medium text-brown" @click="router.back()">取消</button>
          <button
            class="flex items-center gap-2 px-6 py-3 text-white rounded-xl text-[14px] font-semibold"
            :class="activeSection === 'template' ? 'bg-gold-dark' : activeSection === 'display' ? 'bg-jade-light' : 'bg-cinnabar'"
            @click="router.back()"
          >
            <RiCheckLine size="16" color="white" />
            <span>应用设置</span>
          </button>
        </div>
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <div class="bg-cream-dark border border-tan-light rounded-2xl p-8">
          <div class="w-full h-[6px] bg-tan-dark rounded-[3px] mb-6"></div>

          <div v-if="activeSection === 'theme'" class="relative">
            <div class="absolute -top-3 -bottom-3 rounded-2xl ring-2 ring-cinnabar ring-offset-2 ring-offset-cream-dark pointer-events-none bg-transparent"
              :class="isInitialized ? 'transition-all duration-300 ease-out' : ''"
              :style="themeIndicatorStyle">
            </div>
            <div ref="themeContainerRef" class="grid grid-cols-3 gap-4">
              <div
                v-for="theme in themes" :key="theme.id"
                :data-theme-id="theme.id"
                @click="setTheme(theme.id); nextTick(positionThemeIndicator)"
                class="bg-white rounded-xl p-8 text-center transition-all cursor-pointer relative"
                :class="currentTheme === theme.id ? 'shadow-lg shadow-cinnabar/18' : 'hover:shadow-md'"
              >
                <div
                  class="w-[150px] h-[100px] rounded-lg border border-[#E0D5C0] mx-auto mb-4"
                  :style="{ backgroundColor: theme.previewBg }"
                ></div>
                <h4
                  class="text-[16px] font-bold mb-1"
                  :class="currentTheme === theme.id ? 'text-cinnabar' : 'text-brown-dark'"
                >{{ theme.name }}</h4>
                <p class="text-[12px] text-brown-muted mb-3">{{ theme.desc }}</p>
                <div
                  class="w-[26px] h-[26px] rounded-full mx-auto flex items-center justify-center"
                  :class="currentTheme === theme.id ? 'bg-cinnabar' : 'bg-tan-dark'"
                >
                  <RiCheckLine v-if="currentTheme === theme.id" size="14" color="white" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeSection === 'template'" class="space-y-4">
            <!-- Tab selector -->
            <div class="flex items-center gap-4 border-b border-tan-border pb-3">
              <button
                @click="activeTemplateTab = 'built-in'"
                class="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                :class="activeTemplateTab === 'built-in' ? 'bg-gold-dark text-white' : 'text-brown hover:bg-cream-darker'"
              >
                系统模板
              </button>
              <button
                @click="activeTemplateTab = 'custom'"
                class="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                :class="activeTemplateTab === 'custom' ? 'bg-gold-dark text-white' : 'text-brown hover:bg-cream-darker'"
              >
                自定义模板
              </button>
            </div>

            <!-- Built-in templates - bookshelf style -->
            <div v-if="activeTemplateTab === 'built-in'">
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="tpl in filteredTemplates" :key="tpl.id"
                  :data-template-id="tpl.id"
                  @click="setTemplate(tpl.id); nextTick(positionTemplateIndicator)"
                  class="bg-white rounded-xl p-5 text-center transition-all cursor-pointer relative border-2"
                  :class="currentTemplate === tpl.id ? 'border-gold-dark shadow-lg shadow-gold-dark/18' : 'border-transparent hover:shadow-md hover:border-tan-border'"
                >
                  <div
                    class="w-[48px] h-[48px] rounded-full mx-auto mb-3 flex items-center justify-center"
                    :class="currentTemplate === tpl.id ? 'bg-gold-dark/10' : 'bg-cream-darker'"
                  >
                    <RiBook2Line size="24" :color="categoryMeta[tpl.category]?.iconColor || '#C8A45C'" />
                  </div>
                  <h4 class="text-[14px] font-semibold text-brown-dark mb-1">{{ tpl.name }}</h4>
                  <p class="text-[11px] text-brown-muted">{{ categoryMeta[tpl.category]?.label || tpl.category }}</p>
                  <div
                    class="w-[24px] h-[24px] rounded-full mx-auto mt-3 flex items-center justify-center"
                    :class="currentTemplate === tpl.id ? 'bg-gold-dark' : 'bg-tan-dark'"
                  >
                    <RiCheckLine v-if="currentTemplate === tpl.id" size="12" color="white" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom templates - bookshelf style with search and filter -->
            <div v-else>
              <div class="mb-4 space-y-3">
                <div class="relative">
                  <RiSearchLine size="16" color="#8B7355" class="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="templateSearchKeyword"
                    type="text"
                    placeholder="搜索自定义模板..."
                    class="w-full pl-10 pr-4 py-2.5 bg-white border border-tan-border rounded-xl text-[13px] text-brown-dark placeholder-brown-muted/60 outline-none focus:border-gold-dark transition-colors"
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    v-for="cat in templateCategories"
                    :key="cat.id"
                    @click="activeCategory = cat.id"
                    class="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    :class="activeCategory === cat.id
                      ? 'bg-gold-dark text-white'
                      : 'bg-white border border-tan-border text-brown hover:border-tan-dark'"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>

              <div v-if="filteredTemplates.length === 0" class="text-center py-12 bg-white rounded-xl">
                <p class="text-[13px] text-brown-muted">暂无自定义模板</p>
              </div>
              <div v-else class="grid grid-cols-3 gap-4">
                <div
                  v-for="tpl in filteredTemplates" :key="tpl.id"
                  class="bg-white rounded-xl p-5 text-center transition-all cursor-pointer relative border-2 border-transparent hover:shadow-md hover:border-tan-border group"
                >
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click.stop="handleDeleteCustomTemplate(tpl.id)"
                      class="w-6 h-6 rounded-md flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <RiDeleteBinLine size="12" color="#C43A31" />
                    </button>
                  </div>
                  <div
                    class="w-[48px] h-[48px] rounded-full mx-auto mb-3 flex items-center justify-center"
                    :class="currentTemplate === String(tpl.id) ? 'bg-gold-dark/10' : 'bg-cream-darker'"
                  >
                    <RiBook2Line size="24" :color="categoryMeta[tpl.category]?.iconColor || '#5B8C5A'" />
                  </div>
                  <h4 class="text-[14px] font-semibold text-brown-dark mb-1">{{ tpl.name }}</h4>
                  <p class="text-[11px] text-brown-muted">{{ categoryMeta[tpl.category]?.label || tpl.category }}</p>
                  <div
                    class="w-[24px] h-[24px] rounded-full mx-auto mt-3 flex items-center justify-center"
                    :class="currentTemplate === String(tpl.id) ? 'bg-gold-dark' : 'bg-tan-dark'"
                  >
                    <RiCheckLine v-if="currentTemplate === String(tpl.id)" size="12" color="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <!-- 新增：预览功能 -->
            <div class="flex items-center justify-between bg-white rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class="w-[48px] h-[48px] rounded-lg bg-diff-green-bg flex items-center justify-center">
                  <RiEyeLine size="24" color="#5B8C5A" />
                </div>
                <div>
                  <h4 class="text-[16px] font-semibold text-brown-dark">排版效果预览</h4>
                  <p class="text-[13px] text-brown-muted">开启后，显示预览按钮，点击后对六个排版标签页面下修改的参数进行查看</p>
                </div>
              </div>
              <button
                class="w-[56px] h-[30px] rounded-full relative transition-colors bg-jade-light"
              >
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-[26px] h-[26px] bg-white rounded-full shadow flex items-center justify-center transition-all duration-200 right-0.5"
                >
                  <RiCheckLine size="14" color="#5B8C5A" />
                </div>
              </button>
            </div>

            <!-- 新增：清除文档样式 -->
            <div class="flex items-center justify-between bg-white rounded-xl p-6">
              <div class="flex items-center gap-4">
                <div class="w-[48px] h-[48px] rounded-lg bg-diff-green-bg flex items-center justify-center">
                  <RiBrushLine size="24" color="#5B8C5A" />
                </div>
                <div>
                  <h4 class="text-[16px] font-semibold text-brown-dark">清除文档样式</h4>
                  <p class="text-[13px] text-brown-muted">开启后，清除文档样式后再进行排版操作，而本地的文件样式格式不清除，仅工具操作中临时清除</p>
                </div>
              </div>
              <button
                class="w-[56px] h-[30px] rounded-full relative transition-colors bg-tan-dark"
              >
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-[26px] h-[26px] bg-white rounded-full shadow flex items-center justify-center transition-all duration-200 left-0.5"
                >
                </div>
              </button>
            </div>

            <!-- 原有：高亮修改处和批注展示 -->
            <div
              v-for="option in displayOptions"
              :key="option.id"
              class="flex items-center justify-between bg-white rounded-xl p-6"
            >
              <div class="flex items-center gap-4">
                <div class="w-[48px] h-[48px] rounded-lg bg-diff-green-bg flex items-center justify-center">
                  <RiFileEditLine v-if="option.id === 'annotation'" size="24" color="#5B8C5A" />
                  <RiSettings3Line v-else size="24" color="#5B8C5A" />
                </div>
                <div>
                  <h4 class="text-[16px] font-semibold text-brown-dark">{{ option.name }}</h4>
                  <p class="text-[13px] text-brown-muted">{{ option.desc }}</p>
                </div>
              </div>
              <button
              @click="option.id === 'annotation' ? toggleAnnotation() : toggleHighlight()"
              class="w-[56px] h-[30px] rounded-full relative transition-colors"
              :class="(option.id === 'annotation' ? annotationEnabled : highlightEnabled) ? 'bg-jade-light' : 'bg-tan-dark'"
              >
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-[26px] h-[26px] bg-white rounded-full shadow flex items-center justify-center transition-all duration-200"
                  :class="(option.id === 'annotation' ? annotationEnabled : highlightEnabled) ? 'right-0.5' : 'left-0.5'"
                >
                  <RiCheckLine v-if="option.id === 'annotation' ? annotationEnabled : highlightEnabled" size="14" color="#5B8C5A" />
                </div>
              </button>
            </div>

            <div v-if="annotationEnabled" class="bg-white rounded-xl border border-tan-light overflow-hidden">
              <div class="flex p-6">
                <div class="flex-1">
                  <div class="text-[13px] text-brown leading-[1.8]">
                    <p class="mb-4">2024年是公司发展历程中具有里程碑意义的一年。在董事会的正确领导下，全体员工团结一心，攻坚克难，圆满完成了年度各项目标任务。</p>
                    <p class="mb-4">市场拓展方面，我们新开拓了华东、华南两大区域市场，新增客户超过200家，客户满意度达到96.8%。</p>
                    <p>技术研发方面，公司全年申请专利56项，获得授权32项，其中发明专利18项。</p>
                  </div>
                </div>
                <div class="w-6 shrink-0"></div>
                <div class="w-[2px] shrink-0 bg-tan-border"></div>
                <div class="w-6 shrink-0"></div>
                <div class="w-[220px] shrink-0 space-y-3">
                  <div class="rounded-lg p-3" style="border-width: 2.7px; border-style: solid; background: rgba(200,164,92,0.1); border-color: #C8A45C;">
                    <div class="text-[12px] font-semibold text-gold-dark">格式建议</div>
                    <p class="text-[12px] text-brown leading-relaxed mt-1">建议首行缩进2字符，符合公文排版规范</p>
                  </div>
                  <div class="rounded-lg p-3" style="border-width: 2.7px; border-style: solid; background: rgba(91,140,90,0.1); border-color: #5B8C5A;">
                    <div class="text-[12px] font-semibold text-jade-light">排版优化</div>
                    <p class="text-[12px] text-brown leading-relaxed mt-1">行距已调整为28磅固定值</p>
                  </div>
                  <div class="rounded-lg p-3" style="border-width: 2.7px; border-style: solid; background: rgba(107,140,174,0.1); border-color: #6B8CAE;">
                    <div class="text-[12px] font-semibold text-cloud-blue">字体建议</div>
                    <p class="text-[12px] text-brown leading-relaxed mt-1">正文建议使用仿宋_GB2312</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>
