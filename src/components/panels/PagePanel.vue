<script setup>
import { RiCheckLine } from '@remixicon/vue'
import DropdownSelect from '../ui/DropdownSelect.vue'
import { paperSizes } from '../../constants/ui'

defineProps({
  params: { type: Object, required: true },
})

</script>

<template>
  <div class="bg-cream border-b border-tan-border h-full px-5 py-3">
    <div class="flex gap-5 h-full overflow-hidden">
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">纸张边距与尺寸</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <!-- 第一排：边距 -->
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">上边距</span>
            <input type="number" min="0" step="0.1" v-model.number="params.top_cm"
              class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="上边距" />
            <span class="text-[13px] text-brown shrink-0">厘米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">下边距</span>
            <input type="number" min="0" step="0.1" v-model.number="params.bottom_cm"
              class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="下边距" />
            <span class="text-[13px] text-brown shrink-0">厘米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">左边距</span>
            <input type="number" min="0" step="0.1" v-model.number="params.left_cm"
              class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="左边距" />
            <span class="text-[13px] text-brown shrink-0">厘米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">右边距</span>
            <input type="number" min="0" step="0.1" v-model.number="params.right_cm"
              class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="右边距" />
            <span class="text-[13px] text-brown shrink-0">厘米</span>
          </div>
        </div>
        <div class="w-full h-[1px] bg-tan-border"></div>
        <div class="grid grid-cols-2 gap-2">
          <!-- 第二排：纸张大小 + 选项 -->
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">纸张大小</span>
            <DropdownSelect v-model="params.paper_size" :options="paperSizes" width-class="flex-1" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">装订线</span>
            <input type="number" min="0" step="0.1" v-model.number="params.gutter_cm"
              class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="装订线" />
            <span class="text-[13px] text-brown shrink-0">厘米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">页眉</span>
            <input type="number" min="0" step="0.1" v-model.number="params.header_margin_cm"
              class="w-[80px] shrink-0 bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="页眉距离" />
            <span class="text-[13px] text-brown shrink-0">厘米</span>
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.keep_original_orientation = !params.keep_original_orientation">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.keep_original_orientation ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.keep_original_orientation" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown shrink-0">保持原方向</span>
          </div>
        </div>
      </div>

      <!-- 分栏 -->
      <div class="flex-1 min-w-0 bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">分栏</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">栏数</span>
            <div class="bg-cream-darker rounded-lg p-[4px] flex items-center gap-1 relative">
              <div class="absolute top-[4px] bottom-[4px] w-[40px] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
                :style="{ left: `${4 + [1, 2, 3, 4].indexOf(params.columns) * 44}px` }">
              </div>
              <button v-for="(n, i) in [1, 2, 3, 4]" :key="n"
                @click="params.columns = n"
                class="relative z-10 w-[40px] h-[34px] rounded-lg text-[13px] font-semibold transition-colors duration-200 cursor-pointer"
                :class="params.columns === n ? 'text-cinnabar' : 'text-brown hover:text-brown-dark'"
              >{{ n }}</button>
            </div>
          </div>
          <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">栏间距</span>
            <input type="number" min="0" step="0.1" v-model.number="params.column_spacing_cm"
              class="w-[64px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" aria-label="栏间距" />
            <span class="text-[13px] text-brown">厘米</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
