<script setup>
import { ref, watch, computed } from 'vue'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'

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
const isText = computed(() => ['txt', 'md', 'markdown'].includes(fileExtension.value))

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
    if (isDocx.value || isPdf.value) {
      docBuffer.value = await readFileAsArrayBuffer(newFile)
    } else if (isText.value) {
      textContent.value = await readFileAsText(newFile)
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
      <div v-else-if="isText && textContent" class="w-full p-8">
        <pre class="text-[14px] text-brown-dark leading-relaxed whitespace-pre-wrap font-songti">{{ textContent }}</pre>
      </div>
      <div v-else-if="(isDocx || isPdf) && !docBuffer" class="flex items-center justify-center py-12 text-brown-muted font-xiaowei">
        <p class="text-lg">正在加载文档...</p>
      </div>
      <div v-else class="text-center py-12 text-brown-muted font-xiaowei">
        <p class="text-lg mb-2">暂不支持预览此格式</p>
        <p class="text-sm">支持 DOCX / PDF / TXT / MD 格式预览</p>
      </div>
    </div>
  </div>
</template>
