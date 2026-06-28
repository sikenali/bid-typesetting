<script setup>
import { RiCheckLine, RiArrowDownSLine } from '@remixicon/vue'

defineProps({
  params: { type: Object, required: true },
})

const paperSizes = [
  { value: 'A4', label: 'A4 (210×297mm)', w: 21.0, h: 29.7 },
  { value: 'A3', label: 'A3 (297×420mm)', w: 29.7, h: 42.0 },
  { value: 'B5', label: 'B5 (176×250mm)', w: 17.6, h: 25.0 },
  { value: 'Letter', label: 'Letter (216×279mm)', w: 21.6, h: 27.9 },
  { value: 'custom', label: '自定义', w: 21.0, h: 29.7 },
]
</script>

<template>
  <div class="bg-cream border-b border-tan-border max-h-[calc(100vh-16rem)] overflow-y-auto px-5 py-3">
    <div class="grid grid-cols-2 gap-4">
      <!-- 纸张边距与尺寸 -->
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-cinnabar shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">纸张边距与尺寸</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <!-- 第一排：边距 -->
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">上边距</span>
            <input type="number" step="0.1" v-model.number="params.top_cm"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">下边距</span>
            <input type="number" step="0.1" v-model.number="params.bottom_cm"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">左边距</span>
            <input type="number" step="0.1" v-model.number="params.left_cm"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">右边距</span>
            <input type="number" step="0.1" v-model.number="params.right_cm"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
        </div>
        <div class="w-full h-[1px] bg-tan-border"></div>
        <div class="grid grid-cols-2 gap-3">
          <!-- 第二排：纸张大小 + 选项 -->
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">纸张大小</span>
            <div class="relative flex-1">
              <select v-model="params.paper_size"
                class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown appearance-none outline-none focus:border-cinnabar transition-colors pr-8">
                <option v-for="s in paperSizes" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
              <RiArrowDownSLine class="absolute right-2 top-1/2 -translate-y-1/2 text-brown-muted pointer-events-none" size="16" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">装订线</span>
            <input type="number" step="0.1" v-model.number="params.gutter_cm"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">页眉</span>
            <input type="number" step="0.1" v-model.number="params.header_margin_cm"
              class="w-full bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
          <div class="flex items-center gap-[4px] cursor-pointer" @click="params.keep_original_orientation = !params.keep_original_orientation">
            <div class="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              :class="params.keep_original_orientation ? 'bg-cinnabar' : 'bg-cream-darker border border-tan-border'">
              <RiCheckLine v-if="params.keep_original_orientation" size="12" class="text-white" />
            </div>
            <span class="text-[13px] text-brown">保持原方向</span>
          </div>
        </div>
      </div>

      <!-- 分栏 -->
      <div class="bg-cream-dark border border-tan-border rounded-2xl p-6 flex flex-col gap-4">
        <div class="w-full h-[6px] bg-tan-dark rounded-sm shrink-0"></div>
        <div class="flex items-center gap-[8px]">
          <div class="w-[5px] h-[18px] rounded-[2px] bg-gold-dark shrink-0"></div>
          <span class="text-[15px] font-bold text-brown-dark" style="font-family: 'Source Han Sans SC'">分栏</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">栏数</span>
            <div class="bg-cream-darker rounded-lg p-[4px] flex items-center gap-1">
              <button v-for="(n, i) in [1, 2, 3]" :key="n"
                @click="params.columns = n"
                class="w-[40px] h-[34px] rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer"
                :class="params.columns === n ? 'bg-white text-cinnabar shadow-sm' : 'text-brown hover:text-brown-dark'"
              >{{ n }}</button>
            </div>
          </div>
          <div class="w-[2px] h-[24px] bg-tan-border shrink-0"></div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] text-brown whitespace-nowrap shrink-0">栏间距</span>
            <input type="number" step="0.1" v-model.number="params.column_spacing_cm"
              class="w-[64px] bg-white border border-tan-border rounded-lg px-[12px] py-[8px] text-[13px] text-brown outline-none focus:border-cinnabar transition-colors" />
            <span class="text-[13px] text-brown">毫米</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
