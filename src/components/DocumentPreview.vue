<script setup>
import { ref, watch, computed } from 'vue'
import { VueOfficeDocx, VueOfficePdf, VueOfficeExcel, VueOfficePptx } from '@/lib/officeRenderers'

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
  <div class="doc-preview" role="region" aria-label="文档预览">
    <div v-if="!file && !src" class="doc-page doc-empty">
      <p class="doc-empty-text">请先上传文档</p>
    </div>
    <div v-else class="doc-page">
      <div v-if="isDocx && docBuffer && (file || src)" class="doc-fill">
        <VueOfficeDocx :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isPdf && docBuffer && (file || src)" class="doc-fill">
        <VueOfficePdf :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isXlsx && docBuffer && (file || src)" class="doc-fill">
        <VueOfficeExcel :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="isPptx && docBuffer && (file || src)" class="doc-fill">
        <VueOfficePptx :src="docBuffer" style="width: 100%;" />
      </div>
      <div v-else-if="docBuffer" class="doc-state">
        <p class="doc-state-title">正在加载文档...</p>
      </div>
      <div v-else class="doc-state">
        <p class="doc-state-title">暂不支持预览此格式</p>
        <p class="doc-state-sub">支持 DOCX / XLSX / PPTX / PDF 格式预览</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-preview {
  width: 100%;
  min-height: 100%;
  background: var(--color-bg-secondary);
  overflow: auto;
  padding: 32px;
}
.doc-page {
  max-width: 864px;
  margin: 0 auto;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  min-height: 842px;
}
.doc-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 680px;
}
.doc-fill {
  width: 100%;
}
.doc-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  gap: 8px;
}
.doc-empty-text,
.doc-state-title {
  font-size: 18px;
  color: var(--color-text-muted);
  margin: 0;
  font-family: var(--font-family-cn);
}
.doc-state-sub {
  font-size: 13px;
  color: var(--color-text-faint);
  margin: 0;
  font-family: var(--font-family-cn);
}
</style>
