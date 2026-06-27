<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDocument } from '../composables/useDocument'
import { RiFileWordLine, RiFilePdfLine, RiFileExcelLine, RiFilePptLine, RiUploadCloud2Line, RiAddLine } from '@remixicon/vue'

const router = useRouter()
const { setFile } = useDocument()
const isDragging = ref(false)
const selectedFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

const simulateUpload = (file) => {
  uploading.value = true
  uploadProgress.value = 0
  selectedFile.value = file
  setFile(file)

  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 15 + 5
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        router.push('/editor')
      }, 300)
    }
  }, 200)
}

const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer.files.length > 0) {
    simulateUpload(e.dataTransfer.files[0])
  }
}

const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    simulateUpload(e.target.files[0])
  }
}
</script>

<template>
  <div class="pt-16 h-screen flex items-center justify-center px-8">
    <div class="max-w-[800px] w-full flex flex-col items-center">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-brown-dark mb-2">开始您的文档排版之旅</h1>
        <p class="text-base text-brown-muted">上传文档，智能识别排版元素，一键美化您的文档</p>
      </div>

      <div
        class="w-full border-2 border-dashed rounded-xl bg-cream p-[60px_40px] text-center transition-all cursor-pointer"
        :class="isDragging ? 'border-cinnabar bg-cinnabar/5' : 'border-tan-dark'"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div v-if="!uploading" class="w-20 h-20 mx-auto mb-6 bg-cream-darker rounded-full flex items-center justify-center">
          <RiUploadCloud2Line size="36" color="#C43A31" />
        </div>
        <div v-else class="w-20 h-20 mx-auto mb-6 bg-cream-darker rounded-full flex items-center justify-center">
          <RiUploadCloud2Line size="36" color="#5B8C5A" />
        </div>

        <p v-if="!uploading" class="text-xl font-semibold text-brown-dark mb-2">
          {{ selectedFile ? `已选择: ${selectedFile.name}` : '拖拽文件到此处，或点击上传' }}
        </p>
        <p v-else class="text-xl font-semibold text-brown-dark mb-2">
          正在上传: {{ selectedFile?.name }}
        </p>

        <div v-if="uploading" class="max-w-[400px] mx-auto mb-6">
          <div class="w-full h-2 bg-cream-darker rounded-full overflow-hidden">
            <div
              class="h-full bg-jade-light rounded-full transition-all duration-300 ease-out"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <p class="text-sm text-brown-muted mt-2">{{ Math.round(uploadProgress) }}%</p>
        </div>

        <p v-if="!uploading" class="text-sm text-brown-muted mb-6">支持 .docx / .xlsx / .pptx / .pdf 格式，单文件最大 50MB</p>

        <input
          type="file"
          id="file-input"
          class="hidden"
          accept=".docx,.xlsx,.pptx,.pdf"
          :disabled="uploading"
          @change="handleFileChange"
        />

        <label
          v-if="!uploading"
          for="file-input"
          class="inline-flex items-center gap-2 px-6 py-3 bg-cinnabar text-white rounded-lg cursor-pointer hover:bg-cinnabar-dark transition-colors font-medium"
        >
          <RiAddLine size="18" color="white" />
          <span>选择文件</span>
        </label>
      </div>

      <div class="flex items-center gap-4 mt-10">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-darker rounded-lg">
          <RiFileWordLine size="14" color="#5B8C5A" />
          <span class="text-xs font-medium text-brown">DOCX</span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-darker rounded-lg">
          <RiFileExcelLine size="14" color="#2D8B57" />
          <span class="text-xs font-medium text-brown">XLSX</span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-darker rounded-lg">
          <RiFilePptLine size="14" color="#C8A45C" />
          <span class="text-xs font-medium text-brown">PPTX</span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-darker rounded-lg">
          <RiFilePdfLine size="14" color="#C43A31" />
          <span class="text-xs font-medium text-brown">PDF</span>
        </div>
      </div>
    </div>
  </div>
</template>
