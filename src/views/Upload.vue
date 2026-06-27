<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, FileText, FileType } from 'lucide-vue-next'

const router = useRouter()
const isDragging = ref(false)
const selectedFile = ref(null)

const handleDragOver = (e) => {
  isDragging.value = true
  e.preventDefault()
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleFileChange = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const startEditing = () => {
  if (selectedFile.value) {
    router.push('/editor')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-calligraphy text-cinnabar mb-4">墨韵排版</h1>
        <p class="text-xl font-xiaowei text-ink-black/70">中国古典水墨风格文档排版工具</p>
      </div>

      <div
        class="border-2 border-dashed rounded-xl p-12 text-center transition-all"
        :class="isDragging ? 'border-cinnabar bg-cinnabar/5' : 'border-gold/40 bg-white/50'"
        @drag-over="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <Upload :size="64" class="mx-auto mb-6 text-gold" />
        <p class="text-lg font-xiaowei mb-4">
          {{ selectedFile ? `已选择: ${selectedFile.name}` : '拖拽文件到此处或点击上传' }}
        </p>
        <input
          type="file"
          class="hidden"
          id="file-input"
          accept=".docx,.pdf,.xlsx,.pptx"
          @change="handleFileChange"
        />
        <label
          for="file-input"
          class="inline-flex items-center gap-2 px-6 py-3 bg-cinnabar text-white font-xiaowei rounded-lg cursor-pointer hover:bg-cinnabar/90 transition-colors"
        >
          <FileText :size="18" />
          选择文件
        </label>

        <div class="mt-8 flex justify-center gap-4 text-sm text-ink-black/50">
          <span class="flex items-center gap-1"><FileType :size="14" /> DOCX</span>
          <span class="flex items-center gap-1"><FileType :size="14" /> PDF</span>
          <span class="flex items-center gap-1"><FileType :size="14" /> XLSX</span>
          <span class="flex items-center gap-1"><FileType :size="14" /> PPTX</span>
        </div>
      </div>

      <div v-if="selectedFile" class="mt-8 text-center">
        <button
          @click="startEditing"
          class="px-8 py-3 bg-jade text-white font-xiaowei rounded-lg hover:bg-jade/90 transition-colors"
        >
          开始排版
        </button>
      </div>
    </div>
  </div>
</template>
