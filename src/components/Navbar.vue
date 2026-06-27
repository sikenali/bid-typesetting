<script setup>
import { useRouter } from 'vue-router'
import { Settings, LayoutTemplate } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-sm border-b border-gold/30 flex items-center justify-between px-6 z-50">
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
      <span class="text-3xl font-calligraphy text-cinnabar">墨韵排版</span>
    </div>
    <div class="flex items-center gap-4">
      <button
        @click="router.push('/editor')"
        class="flex items-center gap-2 px-4 py-2 text-sm font-xiaowei text-ink-black hover:text-cinnabar transition-colors"
      >
        <LayoutTemplate :size="18" />
        模板
      </button>
      <button
        @click="router.push('/settings')"
        class="flex items-center gap-2 px-4 py-2 text-sm font-xiaowei text-ink-black hover:text-cinnabar transition-colors rounded-lg hover:bg-parchment/50"
      >
        <Settings :size="18" />
        设置
      </button>
    </div>
  </nav>
</template>
