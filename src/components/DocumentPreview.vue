<script setup>
import { ref, watch, computed } from 'vue'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePptx from '@vue-office/pptx'

const props = defineProps({
  file: {
    type: File,
    default: null,
  },
})

const docBuffer = ref(null)
const textContent = ref('')

const fileExtension = computed(() => {
  if (!props.file) return ''
  return props.file.name.split('.').pop().toLowerCase()
})

const isDocx = computed(() => fileExtension.value === 'docx')
const isPdf = computed(() => fileExtension.value === 'pdf')
const isXlsx = computed(() => fileExtension.value === 'xlsx')
const isPptx = computed(() => fileExtension.value === 'pptx')

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

watch(() => props.file, async (newFile) => {
  docBuffer.value = null
  textContent.value = ''
  if (!newFile) return
  try {
    if (['docx', 'pdf', 'xlsx', 'pptx'].includes(fileExtension.value)) {
      docBuffer.value = await readFileAsArrayBuffer(newFile)
    }
  } catch (e) {
    console.error('读取文件失败:', e)
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full min-h-full bg-warm-gray overflow-auto py-8">
    <div v-if="!file" class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl min-h-[842px] flex items-center justify-center">
      <p class="text-brown-muted text-lg font-xiaowei">请先上传文档</p>
    </div>
      <div v-else class="max-w-[864px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl p-[1px]">
      <div v-if="isDocx && docBuffer" class="w-full">
        <VueOfficeDocx :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isPdf && docBuffer" class="w-full">
        <VueOfficePdf :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isXlsx && docBuffer" class="w-full">
        <VueOfficeExcel :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isPptx && docBuffer" class="w-full">
        <VueOfficePptx :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="docBuffer" class="flex items-center justify-center py-12 text-brown-muted font-xiaowei">
        <p class="text-lg">正在加载文档...</p>
      </div>
      <div v-else class="text-center py-12 text-brown-muted font-xiaowei">
        <p class="text-lg mb-2">暂不支持预览此格式</p>
        <p class="text-sm">支持 DOCX / XLSX / PPTX / PDF 格式预览</p>
      </div>
    </div>
  </div>
</template>
