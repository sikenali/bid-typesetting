<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { RiFileTextLine, RiBookmark3Line, RiSettings3Line, RiBrushLine } from '@remixicon/vue'
import { useDocument } from '../composables/useDocument'

const router = useRouter()
const { currentFile } = useDocument()
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 h-16 bg-parchment flex items-center justify-between px-8 z-50">
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
      <div class="w-11 h-11 bg-cinnabar rounded-lg flex items-center justify-center">
        <RiBrushLine size="24" color="white" />
      </div>
      <div class="flex flex-col">
        <span class="text-lg font-bold text-brown-dark">墨墨梧文</span>
        <span class="text-xs text-brown-muted">Document Typesetting</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="router.push('/template')"
        class="group flex items-center gap-2 w-10 hover:w-[90px] h-10 bg-cream-dark hover:bg-cinnabar border border-tan-border hover:border-transparent rounded-lg transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-center justify-center w-10 h-10 shrink-0">
          <RiBookmark3Line size="18" class="text-brown-muted group-hover:text-white" />
        </div>
        <span class="text-[14px] font-medium text-brown group-hover:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200">模板</span>
      </button>

      <button
        @click="router.push('/settings')"
        class="group flex items-center gap-2 w-10 hover:w-[90px] h-10 bg-cream-dark hover:bg-cinnabar border border-tan-border hover:border-transparent rounded-lg transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-center justify-center w-10 h-10 shrink-0">
          <RiSettings3Line size="20" class="text-brown-muted group-hover:text-white" />
        </div>
        <span class="text-[14px] font-medium text-brown group-hover:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200">设置</span>
      </button>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-tan-dark rounded-[1px]"></div>
  </nav>
</template>
