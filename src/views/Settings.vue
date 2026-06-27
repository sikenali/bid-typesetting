<script setup>
import { ref } from 'vue'
import { Sun, Moon, FileText, PenLine } from 'lucide-vue-next'

const theme = ref('light')
const template = ref('government')
const annotation = ref(false)

const templates = [
  { id: 'government', name: 'GB/T 政府公文', desc: '符合国家公文标准格式' },
  { id: 'enterprise', name: '企业标准文档', desc: '企业通用文档模板' },
  { id: 'academic', name: '学术论文模板', desc: '符合学术出版规范' },
  { id: 'custom', name: '自定义模板', desc: '自由配置排版参数' },
]
</script>

<template>
  <div class="min-h-screen p-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-calligraphy text-cinnabar mb-8">排版设置</h1>

      <div class="space-y-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
          <h2 class="font-calligraphy text-xl text-cinnabar mb-4">主题设置</h2>
          <div class="flex gap-4">
            <button
              @click="theme = 'light'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all"
              :class="theme === 'light' ? 'border-gold bg-parchment/50' : 'border-transparent hover:border-gold/30'"
            >
              <Sun :size="18" />
              <span class="font-xiaowei">亮色主题</span>
            </button>
            <button
              @click="theme = 'dark'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all"
              :class="theme === 'dark' ? 'border-gold bg-ink-black text-white' : 'border-transparent hover:border-gold/30'"
            >
              <Moon :size="18" />
              <span class="font-xiaowei">暗色主题</span>
            </button>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
          <h2 class="font-calligraphy text-xl text-cinnabar mb-4">内置模板</h2>
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="t in templates"
              :key="t.id"
              @click="template = t.id"
              class="p-4 rounded-lg border-2 transition-all text-left"
              :class="template === t.id ? 'border-cinnabar bg-cinnabar/5' : 'border-transparent hover:border-gold/30'"
            >
              <div class="flex items-center gap-2 mb-2">
                <FileText :size="16" class="text-gold" />
                <span class="font-xiaowei">{{ t.name }}</span>
              </div>
              <p class="text-xs text-ink-black/50">{{ t.desc }}</p>
            </button>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
          <h2 class="font-calligraphy text-xl text-cinnabar mb-4">批注设置</h2>
          <label class="flex items-center gap-3 cursor-pointer">
            <div class="relative">
              <input type="checkbox" v-model="annotation" class="sr-only" />
              <div
                class="w-12 h-6 rounded-full transition-colors"
                :class="annotation ? 'bg-jade' : 'bg-parchment border border-gold/30'"
              ></div>
              <div
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                :class="annotation ? 'translate-x-6' : 'translate-x-0'"
              ></div>
            </div>
            <span class="font-xiaowei">启用批注形式</span>
          </label>
          <p class="text-sm text-ink-black/50 mt-2 ml-15 pl-15">
            开启后，排版修改将以批注形式显示，方便审阅和确认
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
