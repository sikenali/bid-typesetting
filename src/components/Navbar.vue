<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { RiFileTextLine, RiBookmark3Line, RiSettings3Line } from '@remixicon/vue'
import { useDocument } from '../composables/useDocument'

const router = useRouter()
const { currentFile } = useDocument()
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 h-16 bg-parchment flex items-center justify-between px-8 z-50">
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
      <div class="w-11 h-11 bg-cinnabar rounded-lg flex items-center justify-center">
        <RiFileTextLine size="24" color="white" />
      </div>
      <div class="flex flex-col">
        <span class="text-lg font-bold text-brown-dark">墨韵排版</span>
        <span class="text-xs text-brown-muted">MoYun Typesetting</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div
        v-if="currentFile"
        class="flex items-center gap-2 px-3 py-2 bg-cream-dark rounded-lg"
      >
        <RiFileTextLine size="18" color="#C43A31" />
        <span class="truncate max-w-[143px] text-sm font-medium text-brown">{{ currentFile.name }}</span>
      </div>

      <button
        @click="router.push('/editor')"
        class="flex items-center gap-2 px-4 py-2 bg-cream-dark border border-tan-border rounded-lg text-sm hover:bg-cream-darker transition-colors"
      >
        <RiBookmark3Line size="18" color="#8B7355" />
        <span class="text-brown-dark font-medium">模板</span>
      </button>

      <button
        @click="router.push('/settings')"
        class="w-10 h-10 flex items-center justify-center bg-cream-dark border border-tan-border rounded-lg hover:bg-cream-darker transition-colors"
      >
        <RiSettings3Line size="20" color="#8B7355" />
      </button>
    </div>
  </nav>
</template>
