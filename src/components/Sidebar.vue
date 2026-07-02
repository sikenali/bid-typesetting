<script setup>
import { ref, onMounted, nextTick } from 'vue'
import {
  RiPagesLine,
  RiTextSnippet,
  RiHeading,
  RiBarChart2Line,
  RiListCheck2,
  RiLayoutTop2Line,
  RiBrushLine,
  RiCheckLine,
} from '@remixicon/vue'
import { useToast } from '../composables/useToast'

const { success } = useToast()

const props = defineProps({
  activeTab: { type: String, default: 'page' },
})
const emit = defineEmits(['tab-change', 'cancel', 'apply', 'reset'])
const activeTab = ref(props.activeTab)

const tabs = [
  { id: 'page', label: '页面', sublabel: 'Page Layout', icon: RiPagesLine, activeBg: 'bg-cinnabar' },
  { id: 'heading', label: '标题', sublabel: 'Headings', icon: RiHeading, activeBg: 'bg-cinnabar' },
  { id: 'body', label: '正文', sublabel: 'Body Text', icon: RiTextSnippet, activeBg: 'bg-cinnabar' },
  { id: 'toc', label: '目录', sublabel: 'Table of Contents', icon: RiListCheck2, activeBg: 'bg-cinnabar' },
  { id: 'chart', label: '图表', sublabel: 'Charts & Tables', icon: RiBarChart2Line, activeBg: 'bg-cinnabar' },
  { id: 'header', label: '页眉页脚', sublabel: 'Header & Footer', icon: RiLayoutTop2Line, activeBg: 'bg-cinnabar' },
  { id: 'reset', label: '初始化', sublabel: 'Initialize', icon: RiBrushLine, activeBg: 'bg-[#C8A45C]' },
]

const selectTab = (tabId) => {
  activeTab.value = tabId
  emit('tab-change', tabId)
  nextTick(positionIndicator)
}

const tabContainerRef = ref(null)
const indicatorStyle = ref({ top: '0px', height: '0px' })
const isInitialized = ref(false)

function positionIndicator() {
  const container = tabContainerRef.value
  if (!container) return
  const btns = container.querySelectorAll('button')
  let targetBtn = null
  for (const btn of btns) {
    if (btn.dataset.tabId === activeTab.value) {
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
  setTimeout(() => {
    positionIndicator()
    isInitialized.value = true
  }, 100)
})
</script>

<template>
  <aside class="w-[280px] bg-cream border-r border-tan-border flex flex-col shrink-0" role="navigation" aria-label="文档排版标签">
    <div class="px-6 pt-5 pb-5">
      <h3 class="text-[16px] font-semibold text-brown-dark">文档排版标签</h3>
      <div class="w-full h-[1px] bg-tan-border mt-[2px]"></div>
      <p class="text-[12px] text-brown-muted mt-2">选择需要识别的排版元素</p>
    </div>

    <div ref="tabContainerRef" class="flex-1 px-4 pb-4 relative">
      <div class="absolute left-4 right-4 rounded-xl shadow-sm pointer-events-none z-0"
        :class="[tabs.find(t => t.id === activeTab)?.activeBg || 'bg-cinnabar', isInitialized ? 'transition-all duration-300 ease-out' : '']"
        :style="indicatorStyle">
      </div>
      <div class="space-y-[2px] relative">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :data-tab-id="tab.id"
          @click="selectTab(tab.id)"
          class="relative z-10 w-full rounded-xl py-3 px-4 flex items-center gap-3 transition-colors text-left focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2"
          :class="activeTab === tab.id ? 'text-white' : 'text-brown-dark hover:text-brown-dark'"
          :aria-current="activeTab === tab.id ? 'page' : false"
        >
          <component :is="tab.icon" :size="'20'" :color="activeTab === tab.id ? 'white' : '#5C4033'" aria-hidden="true" />
          <div class="flex-1">
            <div class="text-[15px] font-semibold" :class="activeTab === tab.id ? 'text-white' : 'text-brown-dark'">
              {{ tab.label }}
            </div>
            <div class="text-[11px]" :class="activeTab === tab.id ? 'text-white/75' : 'text-brown-muted'">
              {{ tab.sublabel }}
            </div>
          </div>
        </button>
        <div class="w-full h-[1px] bg-tan-border my-[14px]"></div>
      </div>
    </div>

    <div class="px-4 py-3 flex items-center gap-2 border-t border-tan-border">
      <button
        @click="emit('cancel'); success('取消当前页面参数修改~')"
        class="group relative flex-1 flex items-center justify-center py-2 bg-cream-dark border border-tan-border rounded-lg text-[13px] font-medium text-brown transition-colors hover:bg-cream-darker focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2"
        aria-label="取消当前修改"
      >
        下朝
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-medium bg-brown-dark text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">取消</span>
      </button>
      <button
        @click="emit('reset'); success('当前页面修改已重置为上传文件参数~')"
        class="group relative flex-1 flex items-center justify-center py-2 bg-[#5B8C5A]/10 border border-[#5B8C5A] rounded-lg text-[13px] font-medium text-[#5B8C5A] transition-colors hover:bg-[#5B8C5A]/20 focus-visible:ring-2 focus-visible:ring-jade focus-visible:ring-offset-2"
        aria-label="重置为初始参数"
      >
        抄家
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-medium bg-brown-dark text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">重置</span>
      </button>
      <button
        @click="emit('apply'); success('当前页面参数修改已保存~')"
        class="group relative flex-1 flex items-center justify-center gap-1 py-2 bg-cinnabar text-white rounded-lg text-[13px] font-semibold transition-colors hover:bg-cinnabar-dark focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2"
        aria-label="保存当前修改"
      >
        <RiCheckLine size="14" aria-hidden="true" />
        <span>准奏</span>
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-medium bg-brown-dark text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">保存</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
