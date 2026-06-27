<script setup>
const props = defineProps({
  file: {
    type: File,
    default: null,
  },
})
</script>

<template>
  <div class="w-full h-full bg-white shadow-lg overflow-auto p-8">
    <div v-if="!file" class="flex items-center justify-center h-full text-ink-black/40 font-xiaowei">
      请先上传文档
    </div>
    <div v-else class="max-w-[800px] mx-auto">
      <div class="mb-4 pb-4 border-b border-gold/30">
        <h3 class="font-calligraphy text-2xl text-cinnabar">{{ file.name }}</h3>
      </div>
      <div class="prose prose-slate max-w-none">
        <p class="font-songti leading-relaxed text-justify">
          文档预览区域（vue-office 将在实际使用时集成）
        </p>
        <p class="font-songti leading-relaxed text-justify mt-4">
          这里将显示 Office 文档的排版效果，支持 Word、PDF、Excel、PPT 等格式。
        </p>
      </div>
    </div>
  </div>
</template>
