<script setup>
import { ref, watch, computed } from 'vue'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import VueOfficePptx from '@vue-office/pptx'

const props = defineProps({
  file: {
    type: [File, Blob],
    default: null,
  },
  src: {
    type: String,
    default: '',
  },
})

const docBuffer = ref(null)
const fileName = computed(() => {
  if (props.file?.name) return props.file.name
  if (props.src) return 'document.docx'
  return 'document'
})

const fileExtension = computed(() => fileName.value.split('.').pop().toLowerCase())

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

watch(() => [props.file, props.src], async () => {
  docBuffer.value = null
  if (props.file) {
    try {
      if (['docx', 'pdf', 'xlsx', 'pptx'].includes(fileExtension.value)) {
        docBuffer.value = await readFileAsArrayBuffer(props.file)
      }
    } catch (e) {
      console.error('读取文件失败:', e)
    }
  } else if (props.src) {
    docBuffer.value = props.src
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full min-h-full bg-warm-gray overflow-auto py-8">
    <div v-if="!file && !src" class="max-w-[680px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl min-h-[842px] flex items-center justify-center">
      <p class="text-brown-muted text-lg font-xiaowei">请先上传文档</p>
    </div>
      <div v-else class="max-w-[864px] mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl p-[1px]">
      <div v-if="isDocx && docBuffer && (file || src)" class="w-full">
        <VueOfficeDocx :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isPdf && docBuffer && (file || src)" class="w-full">
        <VueOfficePdf :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isXlsx && docBuffer && (file || src)" class="w-full">
        <VueOfficeExcel :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isPptx && docBuffer && (file || src)" class="w-full">
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
