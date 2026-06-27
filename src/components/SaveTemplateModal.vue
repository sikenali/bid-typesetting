<script setup>
import { ref } from 'vue'
import { RiCloseLine } from '@remixicon/vue'

const emit = defineEmits(['close', 'saved'])
const name = ref('')
const category = ref('official')

const categories = [
  { id: 'official', label: '公文', sub: 'Official' },
  { id: 'academic', label: '学术', sub: 'Academic' },
  { id: 'business', label: '商务', sub: 'Business' },
  { id: 'creative', label: '创意', sub: 'Creative' },
]

const handleSave = () => {
  if (!name.value.trim()) return
  emit('saved', { name: name.value.trim(), category: category.value })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="emit('close')">
      <div class="w-[440px] bg-cream rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden">
        <div class="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 class="text-[18px] font-bold text-brown-dark">保存到模板</h3>
          <button @click="emit('close')" class="w-8 h-8 rounded-lg bg-cream-dark flex items-center justify-center">
            <RiCloseLine size="18" class="text-brown-muted" />
          </button>
        </div>

        <div class="px-6 pb-6 space-y-5">
          <div>
            <label class="block text-[13px] font-medium text-brown-dark mb-2">模板名称</label>
            <input
              v-model="name"
              type="text"
              placeholder="请输入模板名称"
              class="w-full px-4 py-2.5 bg-white border border-tan-border rounded-xl text-[14px] text-brown-dark placeholder-brown-muted/60 outline-none focus:border-cinnabar transition-colors"
              @keyup.enter="handleSave"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-brown-dark mb-2">模板分类</label>
            <div class="flex gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                @click="category = cat.id"
                class="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                :class="category === cat.id
                  ? 'bg-cinnabar text-white'
                  : 'bg-white border border-tan-border text-brown hover:border-tan-dark'"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 bg-cream-dark border-t border-tan-border">
          <button
            @click="emit('close')"
            class="px-6 py-2.5 bg-white border border-tan-border rounded-xl text-[14px] font-medium text-brown hover:bg-cream transition-colors"
          >
            取消
          </button>
          <button
            @click="handleSave"
            class="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-colors"
            :class="name.trim() ? 'bg-cinnabar hover:bg-cinnabar-dark' : 'bg-tan-dark cursor-not-allowed'"
            :disabled="!name.trim()"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
