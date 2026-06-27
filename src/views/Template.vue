<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplates } from '../composables/useTemplates'
import PreviewTemplateModal from '../components/PreviewTemplateModal.vue'
import { RiBookOpenLine, RiArrowLeftSLine, RiDeleteBin6Line, RiCheckLine, RiFileTextLine, RiGovernmentLine, RiBook2Line, RiBarChart2Line, RiPaintBrushLine, RiSearchLine, RiLayout3Line, RiEyeLine } from '@remixicon/vue'

const router = useRouter()
const { templates, deleteTemplate, categoryMeta } = useTemplates()

const activeCategory = ref('all')
const categories = ['all', ...Object.keys(categoryMeta)]
const categoryLabels = { all: '全部', ...Object.fromEntries(Object.entries(categoryMeta).map(([k, v]) => [k, v.label])) }

const categoryIcons = {
  all: RiBookOpenLine,
  official: RiGovernmentLine,
  academic: RiBook2Line,
  business: RiBarChart2Line,
  creative: RiPaintBrushLine,
}

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') return templates.value
  return templates.value.filter(t => t.category === activeCategory.value)
})

const toggleTemplate = (tpl) => {
  tpl.selected = !tpl.selected
}

const selectedTemplates = computed(() => templates.value.filter(t => t.selected))

const showPreviewModal = ref(false)

const previewTemplate = () => {
  if (selectedTemplates.value.length > 0) {
    showPreviewModal.value = true
  }
}

const applyTemplates = () => {
  if (selectedTemplates.value.length > 0) {
    router.push('/editor')
  }
}
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex">
    <div class="w-[280px] bg-cream border-r border-tan-border flex flex-col">
      <div class="px-6 pt-5 pb-5">
        <h3 class="text-base font-semibold text-brown-dark">模板书架</h3>
        <div class="w-full h-[1px] bg-tan-border mt-[2px]"></div>
        <p class="text-xs text-brown-muted mt-2">选择或管理您的排版模板</p>
      </div>

      <div class="flex-1 px-4 pb-4 space-y-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeCategory === cat ? 'bg-cinnabar text-white' : 'bg-cream-dark hover:bg-cream-darker'"
        >
          <div class="flex items-center gap-3">
            <component :is="categoryIcons[cat]" :size="20" :color="activeCategory === cat ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px]" :class="activeCategory === cat ? 'font-semibold text-white' : 'font-medium text-brown-dark'">
                {{ categoryLabels[cat] }}
              </div>
              <div class="text-[11px]" :class="activeCategory === cat ? 'text-white/75' : 'text-brown-muted'">
                {{ cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1) }}
              </div>
            </div>
            <div v-if="activeCategory === cat" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>
      </div>
    </div>

    <div class="flex-1 bg-warm-gray flex flex-col">
      <div class="px-8 py-5 bg-parchment flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-cinnabar">
            <component :is="categoryIcons[activeCategory] || RiBookOpenLine" size="20" color="white" />
          </div>
          <div>
            <h2 class="text-[18px] font-bold text-brown-dark">
              {{ activeCategory === 'all' ? '全部模板' : categoryLabels[activeCategory] + '模板' }}
            </h2>
            <p class="text-[12px] text-brown-muted">
              {{ activeCategory === 'all' ? '查看所有保存的排版模板' : '浏览' + categoryLabels[activeCategory] + '类排版模板' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2.5 bg-cream border border-tan-border rounded-xl">
            <RiSearchLine size="16" class="text-brown-muted" />
            <span class="text-[13px] text-brown-muted">搜索模板...</span>
          </div>
          <button @click="router.back()" class="flex items-center gap-2 px-6 py-2.5 bg-cinnabar text-white rounded-xl text-[14px] font-semibold">
            <RiArrowLeftSLine size="16" color="white" />
            <span>返回</span>
          </button>
        </div>
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <div v-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center h-full text-brown-muted">
          <RiBookOpenLine size="48" color="#D4C4A8" />
          <p class="mt-4 text-[16px] font-medium">暂无保存的模板</p>
          <p class="mt-1 text-[13px]">在编辑器中点击「保存到模板」来创建您的第一个模板</p>
        </div>

        <div v-else class="bg-cream-dark border border-tan-light rounded-2xl p-8">
          <div class="w-full h-[6px] bg-tan-dark rounded-[3px] mb-6"></div>
          <div class="grid grid-cols-4 gap-4">
            <div
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              class="flex flex-col items-center cursor-pointer"
              @click="toggleTemplate(tpl)"
            >
              <div
                class="w-[180px] h-[240px] rounded-lg overflow-hidden transition-all relative"
                :class="tpl.selected
                  ? 'ring-[2.7px] ring-cinnabar shadow-[0_6px_20px_rgba(196,58,49,0.25)]'
                  : 'border-[0.7px] border-tan-border shadow-[0_4px_16px_rgba(0,0,0,0.08)]'"
              >
                <div class="h-2" :class="tpl.spineColor"></div>
                <div class="bg-white h-[224px] flex flex-col items-center justify-center px-5 py-6">
                  <div class="w-14 h-14 rounded-full bg-[#FDF0E0] flex items-center justify-center">
                    <RiFileTextLine size="28" :color="tpl.iconColor" />
                  </div>
                  <div class="mt-4 text-center">
                    <div class="text-[16px] font-bold text-brown-dark">{{ tpl.name }}</div>
                    <div class="h-1"></div>
                    <div class="text-[11px] text-brown-muted">{{ categoryMeta[tpl.category]?.label || '未分类' }}</div>
                    <div class="h-2"></div>
                    <div class="text-[12px] text-brown-muted leading-relaxed">用户保存的自定义模板</div>
                  </div>
                </div>
                <div class="h-2" :class="tpl.spineColor"></div>

                <button
                  @click.stop="deleteTemplate(tpl.id)"
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity shadow-sm"
                >
                  <RiDeleteBin6Line size="14" color="#C23B22" />
                </button>
              </div>
              <div class="h-3"></div>
              <div v-if="tpl.selected" class="flex items-center justify-center gap-2">
                <div class="w-5 h-5 rounded bg-cinnabar flex items-center justify-center">
                  <RiCheckLine size="12" color="white" />
                </div>
                <span class="text-[13px] font-semibold text-cinnabar">已选择</span>
              </div>
              <div v-else class="flex items-center justify-center gap-2">
                <div class="w-5 h-5 rounded border-[0.7px] border-tan-dark bg-cream-darker"></div>
                <span class="text-[13px] font-medium text-brown-muted">选择</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedTemplates.length > 0" class="mt-6 flex items-center justify-between bg-cream border border-tan-light rounded-2xl px-6 py-5">
          <div class="flex items-center gap-3">
            <RiLayout3Line size="22" color="#C43A31" />
            <span class="text-[14px] font-medium text-brown">已选择：</span>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-cinnabar text-white rounded-full text-[13px] font-semibold">{{ selectedTemplates[0].name }}</span>
              <span v-if="selectedTemplates.length > 1" class="text-[13px] text-brown-muted">+{{ selectedTemplates.length - 1 }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="previewTemplate"
              class="flex items-center gap-2 px-5 py-3 bg-cream-dark border border-tan-border rounded-xl text-[14px] font-medium text-brown"
            >
              <RiEyeLine size="20" color="#5C4033" />
              <span>预览模板</span>
            </button>
            <button
              @click="applyTemplates"
              class="flex items-center gap-2 px-6 py-3 bg-cinnabar text-white rounded-xl text-[14px] font-semibold"
            >
              <RiCheckLine size="20" color="white" />
              <span>应用所选模板</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <PreviewTemplateModal
    v-if="showPreviewModal"
    :template="selectedTemplates[0]"
    @close="showPreviewModal = false"
  />
</template>
