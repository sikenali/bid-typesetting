<script setup>
import { ref } from 'vue'
import {
  RiPagesLine,
  RiTextSnippet,
  RiHeading,
  RiBarChart2Line,
  RiListCheck2,
  RiLayoutTop2Line,
  RiRefreshLine,
  RiSaveLine,
  RiSparklingLine,
  RiLoader2Line
} from '@remixicon/vue'

const emit = defineEmits(['tab-change', 'save-template', 'one-click-modify'])
const activeTab = ref('page')
const props = defineProps({
  isProcessing: { type: Boolean, default: false },
})

const tabs = [
  { id: 'page', label: '页面', sublabel: 'Page Layout', icon: RiPagesLine },
  { id: 'body', label: '正文', sublabel: 'Body Text', icon: RiTextSnippet },
  { id: 'heading', label: '标题', sublabel: 'Headings', icon: RiHeading },
  { id: 'chart', label: '图表', sublabel: 'Charts & Tables', icon: RiBarChart2Line },
  { id: 'toc', label: '目录', sublabel: 'Table of Contents', icon: RiListCheck2 },
  { id: 'header', label: '页眉页脚', sublabel: 'Header & Footer', icon: RiLayoutTop2Line },
]

const selectTab = (tabId) => {
  activeTab.value = tabId
  emit('tab-change', tabId)
}
</script>

<template>
  <aside class="w-[280px] bg-cream border-r border-tan-border flex flex-col shrink-0">
    <div class="px-6 pt-5 pb-4">
      <h3 class="text-[16px] font-semibold text-brown-dark">文档排版标签</h3>
      <div class="w-full h-[2px] bg-tan-border mt-1"></div>
      <p class="text-[12px] text-brown-muted mt-2">选择需要识别的排版元素</p>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="selectTab(tab.id)"
        class="w-full rounded-xl py-3 px-4 flex items-center gap-3 transition-colors text-left"
        :class="activeTab === tab.id
          ? 'bg-cinnabar text-white'
          : 'bg-cream-dark text-brown-dark hover:bg-cream-darker'"
      >
        <component :is="tab.icon" :size="20" :color="activeTab === tab.id ? 'white' : '#5C4033'" />
        <div class="flex-1">
          <div
            class="text-[15px]"
            :class="activeTab === tab.id ? 'font-semibold text-white' : 'font-medium text-brown-dark'"
          >
            {{ tab.label }}
          </div>
          <div
            class="text-[11px]"
            :class="activeTab === tab.id ? 'text-white/75' : 'text-brown-muted'"
          >
            {{ tab.sublabel }}
          </div>
        </div>
        <div
          v-if="activeTab === tab.id"
          class="w-[9px] h-[8px] bg-white rounded-[4px] shrink-0"
        ></div>
      </button>

      <div class="w-full h-[1px] bg-tan-border my-[14px]"></div>

      <button
        @click="selectTab('reset')"
        class="w-full rounded-xl py-3 px-4 flex items-center gap-3 transition-colors text-left"
        :class="activeTab === 'reset'
          ? 'bg-jade-light text-white'
          : 'bg-cream-dark text-brown-dark hover:bg-cream-darker'"
      >
        <RiRefreshLine :size="20" :color="activeTab === 'reset' ? 'white' : '#5C4033'" />
        <div class="flex-1">
          <div
            class="text-[15px]"
            :class="activeTab === 'reset' ? 'font-semibold text-white' : 'font-medium text-brown-dark'"
          >
            初始化
          </div>
          <div
            class="text-[11px]"
            :class="activeTab === 'reset' ? 'text-white/75' : 'text-brown-muted'"
          >
            Initialize
          </div>
        </div>
        <div
          v-if="activeTab === 'reset'"
          class="w-[9px] h-[8px] bg-white rounded-[4px] shrink-0"
        ></div>
      </button>
    </div>

    <div class="px-4 py-4 space-y-3 border-t border-tan-border">
      <button
        @click="emit('save-template')"
        class="w-full flex items-center justify-center gap-2 py-3 bg-cream-dark border border-gold-dark/50 rounded-xl text-[14px] font-semibold text-brown transition-all hover:bg-cream-darker"
      >
        <RiSaveLine size="18" color="#C8A45C" />
        <span>保存到模板</span>
      </button>
      <button
        @click="emit('one-click-modify')"
        class="w-full flex items-center justify-center gap-2 py-3 bg-cinnabar text-white rounded-xl text-[14px] font-semibold transition-all hover:bg-cinnabar-dark disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="props.isProcessing"
      >
        <RiLoader2Line v-if="props.isProcessing" size="18" color="white" class="animate-spin" />
        <RiSparklingLine v-else size="18" color="white" />
        <span>{{ props.isProcessing ? '文档智能化排版处理中...' : '一键修改' }}</span>
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
