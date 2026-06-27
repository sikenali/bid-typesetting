<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RiArrowLeftSLine, RiSearchLine, RiBookOpenLine, RiFileTextLine, RiBuildingLine, RiBook2Line, RiBarChart2Line, RiCheckLine, RiFileList3Line } from '@remixicon/vue'

const router = useRouter()
const activeCategory = ref('all')
const categories = ['all', 'official', 'academic', 'business', 'creative']
const categoryLabels = {
  all: '全部',
  official: '公文',
  academic: '学术',
  business: '商务',
  creative: '创意'
}

const books = [
  { id: 1, name: 'GB/T 国家标准格式', category: 'official', selected: true, spineColor: 'bg-cinnabar', author: '国务院', desc: '符合国家公文标准格式' },
  { id: 2, name: '党政机关公文格式', category: 'official', selected: false, spineColor: 'bg-brown-muted', author: '中共中央', desc: '党政机关公文标准' },
  { id: 3, name: '学术论文模板', category: 'academic', selected: false, spineColor: 'bg-jade-light', author: '教育部', desc: '符合学术出版规范' },
  { id: 4, name: '企业报告模板', category: 'business', selected: false, spineColor: 'bg-gold-dark', author: '商务部', desc: '企业通用文档模板' },
  { id: 5, name: '创意设计模板', category: 'creative', selected: false, spineColor: 'bg-cloud-blue', author: '文化部', desc: '创意类文档排版' },
]

const bookIcons = {
  1: RiFileList3Line,
  2: RiBuildingLine,
  3: RiBook2Line,
  4: RiBarChart2Line,
  5: RiFileTextLine
}

const sectionMeta = {
  official: { label: '公文格式', subtitle: '符合国家公文标准', barColor: 'bg-cinnabar' },
  academic: { label: '学术格式', subtitle: '符合学术出版规范', barColor: 'bg-jade-light' },
  business: { label: '商务格式', subtitle: '商务文档标准', barColor: 'bg-gold-dark' },
  creative: { label: '创意格式', subtitle: '创意类文档排版', barColor: 'bg-cloud-blue' }
}

const displayedCategories = computed(() => {
  const cats = activeCategory.value === 'all'
    ? ['official', 'academic', 'business', 'creative']
    : [activeCategory.value]
  return cats.filter(cat => books.some(b => b.category === cat))
})

const currentTemplate = computed(() => {
  const selected = books.filter(b => b.selected)
  return selected.length ? { name: selected[0].name, count: selected.length } : null
})
</script>

<template>
  <div class="min-h-screen bg-parchment pt-20 px-8 pb-8">
    <div class="max-w-[1376px] mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="w-10 h-10 flex items-center justify-center bg-cream-dark border border-tan-border rounded-lg">
            <RiArrowLeftSLine size="20" color="#5C4033" />
          </button>
          <div>
            <h1 class="text-[28px] font-bold text-brown-dark">模板书架</h1>
            <p class="text-[14px] text-brown-muted">选择一套排版模板，一键应用到您的文档</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center bg-cream-darker rounded-lg p-1">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
              class="px-4 py-2 rounded-md text-[13px] transition-colors"
              :class="activeCategory === cat ? 'bg-white text-cinnabar font-semibold' : 'text-brown font-medium hover:bg-cream-dark'"
            >
              {{ categoryLabels[cat] }}
            </button>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 bg-cream border border-tan-border rounded-lg">
            <RiSearchLine size="16" color="#8B7355" />
            <span class="text-[13px] text-[#B8A88A]">搜索模板...</span>
          </div>
        </div>
      </div>

      <div v-if="currentTemplate" class="flex items-center gap-3 px-5 py-3 bg-cream border border-tan-light rounded-xl mb-8">
        <RiBookOpenLine size="22" color="#C8A45C" />
        <span class="text-[14px] font-medium text-brown">当前应用模板：</span>
        <span class="px-3 py-1 bg-cinnabar text-white rounded-full text-[13px] font-semibold">{{ currentTemplate.name }}</span>
        <span class="text-[13px] text-brown-muted">· 已勾选 {{ currentTemplate.count }} 个模板</span>
      </div>

      <div class="space-y-8">
        <div v-for="cat in displayedCategories" :key="cat">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-[5px] h-[22px] rounded" :class="sectionMeta[cat].barColor"></div>
            <h2 class="text-[18px] font-bold text-brown-dark">{{ sectionMeta[cat].label }}</h2>
            <span class="text-[13px] text-brown-muted">{{ sectionMeta[cat].subtitle }}</span>
          </div>
          <div class="bg-cream-dark border border-tan-light rounded-2xl p-6">
            <div class="w-full h-[6px] bg-tan-dark rounded-[3px] mb-4"></div>
            <div class="flex gap-6 overflow-x-auto pb-4">
              <div
                v-for="book in books.filter(b => b.category === cat)"
                :key="book.id"
                class="w-[180px] flex-shrink-0 transition-all cursor-pointer"
                :class="book.selected ? 'scale-105' : 'opacity-80 hover:opacity-100'"
              >
                <div
                  class="w-full h-[240px] rounded-lg overflow-hidden shadow-lg transition-all"
                  :class="book.selected ? 'ring-2 ring-cinnabar' : ''"
                >
                  <div class="h-2" :class="book.spineColor"></div>
                  <div class="p-4 bg-white h-[228px] flex flex-col">
                    <div class="w-10 h-10 rounded-lg bg-cream-darker flex items-center justify-center mb-2">
                      <component :is="bookIcons[book.id]" size="18" color="#8B7355" />
                    </div>
                    <h3 class="text-[15px] font-bold text-brown-dark mb-1">{{ book.name }}</h3>
                    <p class="text-[11px] text-brown-muted mb-3">{{ book.author }}</p>
                    <p class="text-[12px] text-brown flex-1 leading-relaxed">{{ book.desc }}</p>
                    <div
                      v-if="book.selected"
                      class="mt-auto py-1.5 text-center text-[12px] font-semibold text-white bg-cinnabar rounded"
                    >
                      已选择
                    </div>
                    <div
                      v-else
                      class="mt-auto py-1.5 text-center text-[12px] font-medium text-brown-muted bg-cream-dark rounded"
                    >
                      选择此模板
                    </div>
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
