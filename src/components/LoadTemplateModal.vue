<script setup>
import { ref, computed } from 'vue'
import { RiCloseLine, RiBook2Line, RiDeleteBinLine, RiCheckLine } from '@remixicon/vue'

const emit = defineEmits(['close', 'select', 'delete'])
const props = defineProps({
  templates: { type: Array, required: true },
})

const searchKeyword = ref('')
const activeCategory = ref('all')

const categories = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '公文' },
  { id: 'academic', label: '学术' },
  { id: 'business', label: '商务' },
  { id: 'creative', label: '创意' },
]

const filteredTemplates = computed(() => {
  return props.templates.filter(tpl => {
    const matchSearch = !searchKeyword.value || tpl.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchCategory = activeCategory.value === 'all' || tpl.category === activeCategory.value
    return matchSearch && matchCategory
  })
})

const handleLoad = (tpl) => {
  emit('select', tpl)
}

const handleDelete = (e, id) => {
  e.stopPropagation()
  if (confirm('确定删除此模板吗？')) {
    emit('delete', id)
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="emit('close')">
      <div class="w-[600px] max-h-[80vh] bg-cream rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-tan-border">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-jade-light flex items-center justify-center">
              <RiBook2Line size="18" color="white" />
            </div>
            <h3 class="text-[18px] font-bold text-brown-dark">载入模板</h3>
          </div>
          <button @click="emit('close')" class="w-8 h-8 rounded-lg bg-cream-dark flex items-center justify-center hover:bg-cream-darker transition-colors">
            <RiCloseLine size="18" class="text-brown-muted" />
          </button>
        </div>

        <!-- Search and Category -->
        <div class="px-6 pt-4 pb-3 space-y-3">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索模板名称..."
            class="w-full px-4 py-2.5 bg-white border border-tan-border rounded-xl text-[14px] text-brown-dark placeholder-brown-muted/60 outline-none focus:border-jade-light transition-colors"
          />
          <div class="flex gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              :class="activeCategory === cat.id
                ? 'bg-jade-light text-white'
                : 'bg-white border border-tan-border text-brown hover:border-tan-dark'"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Template List -->
        <div class="flex-1 overflow-y-auto px-6 pb-4">
          <div v-if="filteredTemplates.length === 0" class="text-center py-12">
            <p class="text-[14px] text-brown-muted">暂无匹配的模板</p>
          </div>
          <div
            v-for="tpl in filteredTemplates"
            :key="tpl.id"
            @click="handleLoad(tpl)"
            class="flex items-center justify-between p-4 mb-2 bg-white rounded-xl border border-tan-light cursor-pointer transition-all hover:shadow-md hover:border-jade-light/50"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :class="tpl.builtIn ? 'bg-gold-dark/10' : 'bg-jade-light/10'"
              >
                <RiBook2Line size="18" :color="tpl.builtIn ? '#C8A45C' : '#5B8C5A'" />
              </div>
              <div class="min-w-0">
                <div class="text-[14px] font-semibold text-brown-dark truncate">{{ tpl.name }}</div>
                <div class="text-[11px] text-brown-muted">{{ tpl.builtIn ? '系统内置' : '自定义模板' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="!tpl.builtIn"
                @click="handleDelete($event, tpl.id)"
                class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <RiDeleteBinLine size="14" color="#C43A31" />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 bg-cream-dark border-t border-tan-border">
          <button
            @click="emit('close')"
            class="px-5 py-2.5 bg-white border border-tan-border rounded-xl text-[13px] font-medium text-brown hover:bg-cream transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
