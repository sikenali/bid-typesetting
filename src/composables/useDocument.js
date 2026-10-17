import { ref } from 'vue'

// 使用闭包存储，保证跨组件共享
const currentFile = ref(null)
const formattedFile = ref(null)
const formattedBlobUrl = ref(null)

export function useDocument() {
  return {
    currentFile,
    formattedFile,
    formattedBlobUrl,
    setFile(file) {
      currentFile.value = file
      if (formattedBlobUrl.value) {
        URL.revokeObjectURL(formattedBlobUrl.value)
      }
      formattedFile.value = null
      formattedBlobUrl.value = null
    },
    getFile() {
      return currentFile.value
    },
    clearFile() {
      if (formattedBlobUrl.value) {
        URL.revokeObjectURL(formattedBlobUrl.value)
      }
      currentFile.value = null
      formattedFile.value = null
      formattedBlobUrl.value = null
    },
    setFormatted(blob) {
      if (formattedBlobUrl.value) {
        URL.revokeObjectURL(formattedBlobUrl.value)
      }
      const name = currentFile.value?.name || 'formatted.docx'
      const dot = name.lastIndexOf('.')
      const base = dot === -1 ? name : name.slice(0, dot)
      const ext = dot === -1 ? '.docx' : name.slice(dot)
      const fileName = `${base}-排版${ext}`
      formattedFile.value = new File([blob], fileName, {
        type: blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      formattedBlobUrl.value = URL.createObjectURL(blob)
    },
    getFormatted() {
      return formattedFile.value
    },
    getFormattedBlob() {
      return formattedBlobUrl.value
    },
  }
}
