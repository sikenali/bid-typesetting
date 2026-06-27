<script setup>
import { ref } from 'vue'
import {
  File,
  Type,
  Heading1,
  Table,
  List,
  Save,
  Wand2,
  FileText,
  AlignLeft,
} from 'lucide-vue-next'

const activeTab = ref('page')

const tabs = [
  { id: 'page', label: '页面', icon: File },
  { id: 'body', label: '正文', icon: Type },
  { id: 'heading', label: '标题', icon: Heading1 },
  { id: 'chart', label: '图表', icon: Table },
  { id: 'toc', label: '目录', icon: List },
  { id: 'header', label: '页眉', icon: AlignLeft },
  { id: 'footer', label: '页脚', icon: FileText },
]
</script>

<template>
  <aside class="w-64 bg-white/80 backdrop-blur-sm border-r border-gold/30 flex flex-col">
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
          :class="activeTab === tab.id ? 'bg-cinnabar/10 text-cinnabar border-l-2 border-cinnabar' : 'hover:bg-parchment/50 text-ink-black/70'"
        >
          <component :is="tab.icon" :size="18" />
          <span class="font-xiaowei">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div class="p-4 border-t border-gold/30 space-y-2">
      <button class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-jade text-white font-xiaowei rounded-lg hover:bg-jade/90 transition-colors">
        <Save :size="16" />
        保存到模板
      </button>
      <button class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cinnabar text-white font-xiaowei rounded-lg hover:bg-cinnabar/90 transition-colors">
        <Wand2 :size="16" />
        一键修改
      </button>
    </div>
  </aside>
</template>
