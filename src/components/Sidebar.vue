<script setup>
import { ref } from 'vue'
import {
  RiLayout2Line,
  RiFileTextLine,
  RiMarkdownLine,
  RiBarChart2Line,
  RiListCheck,
  RiLayoutTop2Line,
  RiFileEditLine
} from '@remixicon/vue'

const emit = defineEmits(['tab-change'])
const activeTab = ref('page')

const tabs = [
  { id: 'page', label: '页面', sublabel: 'Page Layout', icon: RiLayout2Line },
  { id: 'body', label: '正文', sublabel: 'Body Text', icon: RiFileTextLine },
  { id: 'heading', label: '标题', sublabel: 'Headings', icon: RiMarkdownLine },
  { id: 'chart', label: '图表', sublabel: 'Charts & Tables', icon: RiBarChart2Line },
  { id: 'toc', label: '目录', sublabel: 'TOC', icon: RiListCheck },
  { id: 'header', label: '页眉页脚', sublabel: 'Header & Footer', icon: RiLayoutTop2Line },
]

const selectTab = (tabId) => {
  activeTab.value = tabId
  emit('tab-change', tabId)
}
</script>

<template>
  <aside class="w-[280px] bg-cream border-r border-tan-border flex flex-col">
    <div class="px-6 pt-5 pb-5">
      <h3 class="text-base font-semibold text-brown-dark">文档排版标签</h3>
      <div class="w-full h-[1px] bg-tan-border mt-[2px]"></div>
      <p class="text-xs text-brown-muted mt-2">选择需要识别的排版元素</p>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="selectTab(tab.id)"
        class="w-full rounded-xl p-3 transition-all text-left"
        :class="activeTab === tab.id
          ? 'bg-cinnabar text-white'
          : 'bg-cream-dark hover:bg-cream-darker text-brown-dark'"
      >
        <div class="flex items-center gap-3">
          <component :is="tab.icon" :size="20" :color="activeTab === tab.id ? 'white' : '#8B7355'" />
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
            class="w-[9px] h-[8px] bg-white rounded-[4px]"
          ></div>
        </div>
      </button>

      <div class="w-full h-[1px] bg-tan-border mt-4 mb-4"></div>

      <button class="w-full rounded-xl p-3 bg-cream-dark hover:bg-cream-darker transition-all text-left">
        <div class="flex items-center gap-3">
          <RiFileEditLine :size="20" color="#8B7355" />
          <div class="flex-1">
            <div class="text-[15px] font-medium text-brown-dark">页码</div>
            <div class="text-[11px] text-brown-muted">Page Number</div>
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>
