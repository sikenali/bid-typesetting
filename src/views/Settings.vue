<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettings } from '../composables/useSettings'
import { useTemplates } from '../composables/useTemplates'
import { useFormatState } from '../composables/useFormatState'
import { useToast } from '../composables/useToast'
import PreviewTemplateModal from '../components/PreviewTemplateModal.vue'
import { RiPaletteLine, RiBookmark3Line, RiEyeLine, RiCheckLine, RiFileTextLine, RiBuildingLine, RiBook2Line, RiBarChart2Line, RiFileEditLine, RiSettings3Line, RiBrushLine, RiDeleteBinLine, RiSearchLine, RiLayout3Line, RiArrowRightLine, RiKeyLine, RiEyeOffLine } from '@remixicon/vue'

const { success } = useToast()
const router = useRouter()
const { theme: currentTheme, template: currentTemplate, previewEnabled, clearStylesEnabled, annotationEnabled, highlightEnabled, setTheme, setTemplate, togglePreview, toggleClearStyles, toggleAnnotation, toggleHighlight } = useSettings()
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
  nextTick(positionIndicator)
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
    positionCategoryIndicator()
    loadApiKeyConfig()
    setTimeout(() => {
      isInitialized.value = true
      isCategoryInitialized.value = true
    }, 150)
  })
})



const themes = [
  { id: 'light', name: '浅色主题', desc: '经典羊皮纸底色', previewBg: '#FDF6E3' },
  { id: 'dark', name: '深色主题', desc: '深色护眼模式', previewBg: '#2C2416' },
  { id: 'paper', name: '纯白纸', desc: '清爽干净', previewBg: '#FFFFFF' },
]

const displayOptions = [
  { id: 'highlight', name: '高亮修改处', desc: '开启后，页面中将高亮标记所有被修改的内容' },
  { id: 'annotation', name: '以批注形式展示修改', desc: '开启后，排版修改将以批注气泡形式显示在文档右侧' },
]

// 模板设置相关状态
const templateSearchKeyword = ref('')

const templateCategories = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '公文' },
  { id: 'academic', label: '学术' },
  { id: 'business', label: '商务' },
  { id: 'creative', label: '创意' },
]
const activeCategory = ref('all')
const categoryIndicatorStyle = ref({ left: '4px', width: '0px' })
const categoryContainerRef = ref(null)
const isCategoryInitialized = ref(false)

function positionCategoryIndicator() {
  const container = categoryContainerRef.value
  if (!container) return
  const btns = container.querySelectorAll('button')
  let targetBtn = null
  for (const btn of btns) {
    if (btn.dataset.catId === activeCategory.value) {
      targetBtn = btn
      break
    }
  }
  if (!targetBtn) return
  const containerRect = container.getBoundingClientRect()
  const btnRect = targetBtn.getBoundingClientRect()
  categoryIndicatorStyle.value = {
    left: `${btnRect.left - containerRect.left}px`,
    width: `${btnRect.width}px`,
  }
}

function selectCategory(id) {
  activeCategory.value = id
  nextTick(() => {
    positionCategoryIndicator()
    if (!isCategoryInitialized.value) {
      setTimeout(() => { isCategoryInitialized.value = true }, 50)
    }
  })
}

const templateSections = computed(() => {
  const categories = ['official', 'academic', 'business', 'creative']
  const result = []
  for (const cat of categories) {
    if (activeCategory.value !== 'all' && cat !== activeCategory.value) continue
    let catTemplates = templates.value.filter(tpl => {
      if (templateSearchKeyword.value && !tpl.name.toLowerCase().includes(templateSearchKeyword.value.toLowerCase())) return false
      return tpl.category === cat
    })
    if (catTemplates.length > 0) {
      catTemplates.sort((a, b) => {
        if (a.builtIn && !b.builtIn) return -1
        if (!a.builtIn && b.builtIn) return 1
        return 0
      })
      result.push({ key: cat, templates: catTemplates })
    }
  }
  return result
})

const handleDeleteCustomTemplate = (id) => {
  if (confirm('确定删除此自定义模板吗？')) {
    deleteTemplate(id)
  }
}

const selectedTemplate = computed(() => templates.value.find(t => t.id == currentTemplate.value))
const hasSelectedTemplate = computed(() => currentTemplate.value != null && !!selectedTemplate.value)

const showPreviewModal = ref(false)

// API Key related state
const apiKeyEntries = ref([])
const apiKeyVisible = ref({})
const apiKeyLoading = ref(false)
const API_CONFIG_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8099') + '/api/config'

async function loadApiKeyConfig() {
  try {
    apiKeyLoading.value = true
    const res = await fetch(API_CONFIG_URL)
    const data = await res.json()
    const entries = data.license_entries || []
    // 如果没有已配置的密钥，初始化默认条目
    if (entries.length === 0) {
      apiKeyEntries.value = [{ name: 'sikenali', key: '0e89c80551170586abdf25f914ac5fd874cb017c288390ca117fe4cfd17a81fe', isNew: true }]
    } else {
      apiKeyEntries.value = entries.map(e => ({ name: e.name, key: '', isNew: false }))
    }
  } catch (e) {
    console.error('Failed to load API key config:', e)
    // 加载失败时也初始化默认条目
    if (apiKeyEntries.value.length === 0) {
      apiKeyEntries.value = [{ name: 'sikenali', key: '0e89c80551170586abdf25f914ac5fd874cb017c288390ca117fe4cfd17a81fe', isNew: true }]
    }
  } finally {
    apiKeyLoading.value = false
  }
}

async function saveApiKeyConfig() {
  try {
    apiKeyLoading.value = true
    const res = await fetch(API_CONFIG_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_entries: apiKeyEntries.value }),
    })
    if (res.ok) {
      success('配置已保存，密钥已加密存储~')
      await loadApiKeyConfig()
    }
  } catch (e) {
    console.error('Failed to save API key config:', e)
  } finally {
    apiKeyLoading.value = false
  }
}

function addApiKeyEntry() {
  apiKeyEntries.value.push({ name: '', key: '', isNew: true })
}

function removeApiKeyEntry(index) {
  apiKeyEntries.value.splice(index, 1)
}

function toggleKeyVisibility(index) {
  apiKeyVisible.value = { ...apiKeyVisible.value, [index]: !apiKeyVisible.value[index] }
}

const { loadFormatParams } = useFormatState()

const previewCurrentTemplate = () => {
  if (hasSelectedTemplate.value) {
    showPreviewModal.value = true
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
            <component :is="tab.icon" :size="'20'" :color="activeSection === tab.id ? 'white' : '#5C4033'" />
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
            :class="activeSection === 'theme' ? 'bg-cinnabar' : activeSection === 'template' ? 'bg-gold-dark' : activeSection === 'display' ? 'bg-jade-light' : 'bg-indigo-500'"
          >
            <RiPaletteLine v-if="activeSection === 'theme'" size="20" color="white" />
            <RiBookmark3Line v-else-if="activeSection === 'template'" size="20" color="white" />
            <RiEyeLine v-else-if="activeSection === 'display'" size="20" color="white" />
            <RiKeyLine v-else size="20" color="white" />
          </div>
          <div>
            <h2 class="text-[18px] font-bold text-brown-dark">
              {{ activeSection === 'theme' ? '主题设置' : activeSection === 'template' ? '模板设置' : activeSection === 'display' ? '显示设置' : 'API Key' }}
            </h2>
            <p class="text-[12px] text-brown-muted">
              {{ activeSection === 'theme' ? '选择界面配色方案' : activeSection === 'template' ? '管理模板与排版标准' : activeSection === 'display' ? '控制修改建议的展示方式' : '管理第三方服务的授权密钥' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="success('取消当前页面参数修改~')"
            class="group relative px-6 py-3 bg-cream-dark border border-tan-border rounded-xl text-[14px] font-medium text-brown hover:bg-brown/10 hover:border-brown/20 hover:text-brown-dark transition-all duration-200"
          >
            下朝
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-medium bg-brown-dark text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">取消</span>
          </button>
          <button
            @click="activeSection === 'apikey' ? saveApiKeyConfig() : success('当前页面参数修改已保存~')"
            class="group relative flex items-center gap-2 px-6 py-3 text-white rounded-xl text-[14px] font-semibold transition-all duration-200"
            :class="activeSection === 'template' ? 'bg-gold-dark hover:bg-gold-dark/85' : activeSection === 'display' ? 'bg-jade-light hover:bg-jade-light/85' : activeSection === 'apikey' ? 'bg-indigo-500 hover:bg-indigo-500/85' : 'bg-cinnabar hover:bg-cinnabar/85'"
          >
            <RiCheckLine size="16" color="white" />
            <span>准奏</span>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-medium bg-brown-dark text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">保存</span>
          </button>
        </div>
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <div v-if="activeSection === 'template'" class="flex items-center justify-between mb-4">
          <div ref="categoryContainerRef" class="flex items-center gap-4 p-1 rounded-xl bg-[#F0E8D5] relative">
            <div
              class="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm pointer-events-none z-0 transition-all duration-300 ease-out"
              :class="isCategoryInitialized ? '' : 'transition-none'"
              :style="categoryIndicatorStyle">
            </div>
            <button
              v-for="cat in templateCategories"
              :key="cat.id"
              :data-cat-id="cat.id"
              @click="selectCategory(cat.id)"
              class="relative z-10 px-4 py-2 rounded-lg text-[13px] transition-colors duration-200"
              :class="activeCategory === cat.id
                ? 'font-semibold text-cinnabar'
                : 'font-medium text-brown hover:text-brown-dark'"
            >
              {{ cat.label }}
            </button>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="hasSelectedTemplate"
              @click="previewCurrentTemplate"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EFE0] border-[0.7px] border-tan-border rounded-lg text-[12px] font-medium text-brown"
            >
              <RiEyeLine size="14" color="#5C4033" />
              <span>预览</span>
            </button>
            <div class="flex items-center gap-2 w-[220px] bg-[#FBF7EF] border-[0.7px] border-tan-border rounded-xl px-4 py-2">
              <RiSearchLine size="16" color="#8B7355" class="shrink-0" />
            <input
              v-model="templateSearchKeyword"
              type="text"
              placeholder="搜索模板..."
              class="flex-1 bg-transparent text-[13px] text-brown-dark placeholder-[#B8A88A] outline-none"
            />
          </div>
        </div>
      </div>

        <div class="bg-cream-dark border border-tan-light rounded-2xl p-8">

          <div v-if="activeSection === 'theme'" class="relative">
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="theme in themes" :key="theme.id"
                :data-theme-id="theme.id"
                @click="setTheme(theme.id)"
                class="bg-white rounded-xl p-4 text-center transition-all cursor-pointer relative aspect-square flex flex-col items-center justify-center"
                :class="currentTheme === theme.id ? 'shadow-lg shadow-cinnabar/18' : 'hover:shadow-md'"
              >
                <div
                  class="w-[60px] h-[60px] rounded-lg border border-[#E0D5C0] mx-auto mb-2"
                  :style="{ backgroundColor: theme.previewBg }"
                ></div>
                <h4
                  class="text-[13px] font-bold mb-0.5"
                  :class="currentTheme === theme.id ? 'text-cinnabar' : 'text-brown-dark'"
                >{{ theme.name }}</h4>
                <p class="text-[10px] text-brown-muted mb-1.5">{{ theme.desc }}</p>
                <div
                  class="w-[16px] h-[16px] rounded-full mx-auto flex items-center justify-center"
                  :class="currentTheme === theme.id ? 'bg-cinnabar' : 'bg-tan-dark'"
                >
                  <RiCheckLine v-if="currentTheme === theme.id" size="9" color="white" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeSection === 'template'" class="space-y-4">
            <!-- No match -->
            <div v-if="templateSections.length === 0" class="text-center py-12 bg-white rounded-xl">
              <p class="text-[13px] text-brown-muted">暂无匹配模板</p>
            </div>

            <!-- Category sections -->
            <template v-else>
              <div v-for="sec in templateSections" :key="sec.key" class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-[5px] h-[22px] rounded-full" :class="categoryMeta[sec.key]?.spineColor || 'bg-jade-light'"></div>
                  <h3 class="text-[16px] font-bold text-brown-dark">{{ categoryMeta[sec.key]?.label || sec.key }}</h3>
                  <span class="text-[12px] text-brown-muted">{{ categoryMeta[sec.key]?.label || sec.key }}模板 · {{ sec.templates.length }}个</span>
                </div>
                <div class="w-full h-[6px] bg-tan-dark rounded-[3px] -mt-2"></div>
                <div class="grid grid-cols-4 gap-4">
                  <div
                    v-for="tpl in sec.templates" :key="tpl.id"
                    :data-template-id="tpl.id"
                    @click="setTemplate(tpl.id)"
                    class="flex flex-col items-center cursor-pointer group transition-all duration-300"
                  >
                    <div
                      class="w-[180px] h-[240px] rounded-lg overflow-hidden transition-all duration-300 relative border-[0.7px] border-tan-border shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                      :class="currentTemplate == tpl.id ? 'ring-2 ring-gold-dark shadow-[0_4px_20px_rgba(196,58,49,0.2)]' : 'hover:shadow-[0_4px_20px_rgba(0,0,0,0.14)]'"
                    >
                      <div class="h-2" :class="categoryMeta[tpl.category]?.spineColor || 'bg-jade-light'"></div>
                      <div class="bg-white h-[224px] flex flex-col items-center justify-center px-5 py-6">
                        <div class="w-14 h-14 rounded-full bg-[#FDF0E0] flex items-center justify-center">
                          <RiBook2Line size="28" :color="categoryMeta[tpl.category]?.iconColor || '#5B8C5A'" />
                        </div>
                        <div class="mt-4 text-center">
                          <div class="text-[13px] font-bold text-brown-dark truncate">{{ tpl.name }}</div>
                          <div class="h-2"></div>
                          <div class="text-[12px] text-brown-muted leading-relaxed">{{ tpl.builtIn ? tpl.description : '用户保存的自定义模板' }}</div>
                        </div>
                      </div>
                      <div class="h-2" :class="categoryMeta[tpl.category]?.spineColor || 'bg-jade-light'"></div>
                      <div v-if="!tpl.builtIn" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click.stop="handleDeleteCustomTemplate(tpl.id)" class="w-7 h-7 rounded-md flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors shadow-sm">
                          <RiDeleteBinLine size="14" color="#C43A31" />
                        </button>
                      </div>
                    </div>
                    <div class="h-3"></div>
                    <Transition name="sel" mode="out-in">
                      <div v-if="currentTemplate == tpl.id" key="selected" class="flex items-center justify-center">
                        <div class="w-[18px] h-[18px] rounded-full bg-cinnabar flex items-center justify-center transition-all duration-300">
                          <RiCheckLine size="10" color="white" />
                        </div>
                      </div>
                      <div v-else key="unselected" class="flex items-center justify-center">
                        <div class="w-[18px] h-[18px] rounded-full border-[0.7px] border-tan-dark bg-cream-darker transition-all duration-300"></div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </template>

            <PreviewTemplateModal
              v-if="showPreviewModal"
              :template="selectedTemplate"
              @close="showPreviewModal = false"
            />
          </div>

          <div v-else-if="activeSection === 'display'" class="space-y-4">
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
                @click="togglePreview()"
                class="relative w-[52px] h-[28px] rounded-full transition-colors duration-200 ease-out"
                :class="previewEnabled ? 'bg-jade-light' : 'bg-tan-dark'"
              >
                <div
                  class="absolute top-0.5 w-[24px] h-[24px] bg-white rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ease-out"
                  :class="previewEnabled ? 'translate-x-[26px]' : 'translate-x-[2px]'"
                  :style="{ transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }"
                >
                  <RiCheckLine v-if="previewEnabled" size="12" color="#5B8C5A" />
                </div>
              </button>
            </div>

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
                @click="toggleClearStyles()"
                class="relative w-[52px] h-[28px] rounded-full transition-colors duration-200 ease-out"
                :class="clearStylesEnabled ? 'bg-jade-light' : 'bg-tan-dark'"
              >
                <div
                  class="absolute top-0.5 w-[24px] h-[24px] bg-white rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ease-out"
                  :class="clearStylesEnabled ? 'translate-x-[26px]' : 'translate-x-[2px]'"
                  :style="{ transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }"
                >
                  <RiCheckLine v-if="clearStylesEnabled" size="12" color="#5B8C5A" />
                </div>
              </button>
            </div>

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
                class="relative w-[52px] h-[28px] rounded-full transition-colors duration-200 ease-out"
                :class="(option.id === 'annotation' ? annotationEnabled : highlightEnabled) ? 'bg-jade-light' : 'bg-tan-dark'"
              >
                <div
                  class="absolute top-0.5 w-[24px] h-[24px] bg-white rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ease-out"
                  :class="(option.id === 'annotation' ? annotationEnabled : highlightEnabled) ? 'translate-x-[26px]' : 'translate-x-[2px]'"
                  :style="{ transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }"
                >
                  <RiCheckLine v-if="option.id === 'annotation' ? annotationEnabled : highlightEnabled" size="12" color="#5B8C5A" />
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

          <div v-else-if="activeSection === 'apikey'" class="space-y-4">
            <div class="bg-white rounded-xl p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <RiKeyLine size="22" color="#6366F1" />
                </div>
                <div>
                  <h4 class="text-[16px] font-semibold text-brown-dark">授权密钥管理</h4>
                  <p class="text-[12px] text-brown-muted mt-0.5">配置第三方服务的 API Key，保存后将自动加密存储</p>
                </div>
              </div>

              <div v-if="apiKeyLoading && apiKeyEntries.length === 0" class="text-center py-8 text-[13px] text-brown-muted">
                加载中...
              </div>

              <div v-for="(entry, index) in apiKeyEntries" :key="index" class="mb-4 last:mb-0">
                <!-- Name field -->
                <div class="flex items-center gap-2 mb-2">
                  <label class="text-[12px] font-medium text-brown w-12 shrink-0 text-right">名称</label>
                  <input
                    v-model="entry.name"
                    type="text"
                    placeholder="输入密钥名称"
                    class="flex-1 bg-[#FAFAF5] border border-tan-border rounded-lg px-3 py-2 text-[13px] text-brown-dark placeholder-[#B8A88A] outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                  />
                  <button
                    @click="removeApiKeyEntry(index)"
                    class="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 transition-colors shrink-0"
                    title="删除此密钥"
                  >
                    <RiDeleteBinLine size="13" color="#C43A31" />
                  </button>
                </div>

                <!-- API Key field -->
                <div class="flex items-center gap-2">
                  <label class="text-[12px] font-medium text-brown w-12 shrink-0 text-right">API Key</label>
                  <div class="flex-1 relative">
                    <input
                      :type="apiKeyVisible[index] ? 'text' : 'password'"
                      :value="entry.isNew ? entry.key : '••••••••'"
                      :placeholder="entry.isNew ? '输入 API Key' : '已配置'"
                      @input="entry.isNew = true; apiKeyEntries[index].key = $event.target.value"
                      class="w-full bg-[#FAFAF5] border border-tan-border rounded-lg pl-3 pr-10 py-2 text-[13px] text-brown-dark placeholder-[#B8A88A] outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors font-mono"
                    />
                    <button
                      @click="toggleKeyVisibility(index)"
                      class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center hover:bg-white transition-colors"
                      :title="apiKeyVisible[index] ? '隐藏' : '显示'"
                    >
                      <RiEyeLine v-if="!apiKeyVisible[index]" size="15" color="#8B7355" />
                      <RiEyeOffLine v-else size="15" color="#8B7355" />
                    </button>
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

<style scoped>
.sel-enter-active,
.sel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.sel-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.sel-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
