<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const syncScroll = ref(true)
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col">
    <div class="px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-gold/30 flex items-center justify-between">
      <h2 class="font-calligraphy text-2xl text-cinnabar">排版前后对比</h2>
      <button
        @click="syncScroll = !syncScroll"
        class="flex items-center gap-2 px-4 py-2 text-sm font-xiaowei rounded-lg transition-colors"
        :class="syncScroll ? 'bg-jade/10 text-jade' : 'bg-parchment/50 text-ink-black/50'"
      >
        <component :is="syncScroll ? Eye : EyeOff" :size="16" />
        同步滚动
      </button>
    </div>

    <div class="flex-1 flex">
      <div class="flex-1 border-r border-gold/30">
        <div class="p-4 bg-parchment/50 font-xiaowei text-sm text-ink-black/70">原始文档</div>
        <div class="p-8 bg-white h-[calc(100%-2.5rem)] overflow-auto">
          <div class="max-w-[800px] mx-auto prose prose-slate">
            <p class="font-songti leading-relaxed text-justify">
              这里是原始文档内容预览区域。排版前的文档可能包含不规范的格式、不一致的字体、不对齐的段落等问题。
            </p>
            <p class="font-songti leading-relaxed text-justify mt-4">
              通过本工具的排版功能，可以将文档调整为符合 GB/T 政府公文标准或其他自定义模板的规范格式。
            </p>
          </div>
        </div>
      </div>

      <div class="flex-1">
        <div class="p-4 bg-parchment/50 font-xiaowei text-sm text-ink-black/70">排版后文档</div>
        <div class="p-8 bg-white h-[calc(100%-2.5rem)] overflow-auto">
          <div class="max-w-[800px] mx-auto prose prose-slate">
            <p class="font-songti leading-relaxed text-justify">
              这里是排版后的文档内容预览区域。经过规范化处理后，文档格式统一、版面整洁、符合行业标准。
            </p>
            <p class="font-songti leading-relaxed text-justify mt-4">
              排版功能支持页面设置、正文格式、标题层级、图表对齐、目录生成、页眉页脚等全方位调整。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
