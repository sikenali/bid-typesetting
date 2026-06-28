<script setup>
defineProps({
  params: { type: Object, required: true },
  apply: { type: Object, required: true },
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
  <div class="bg-cream px-6 py-4 border-b border-tan-border space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto">

    <div class="flex items-center gap-3 mb-4">
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="apply.apply_page" class="sr-only peer" />
        <div class="w-[40px] h-[22px] bg-cream-darker rounded-full peer peer-checked:bg-cinnabar transition-colors"></div>
        <div class="absolute left-[3px] top-[3px] w-[16px] h-[16px] bg-white rounded-full transition-transform peer-checked:translate-x-[18px]"></div>
      </label>
      <span class="text-[13px] font-medium text-brown-dark">应用页面设置</span>
    </div>

    <div>
      <h4 class="text-[13px] font-semibold text-brown-dark mb-2">纸张与边距</h4>
      <div class="grid grid-cols-2 gap-x-4 gap-y-3">
        <div class="col-span-2 flex items-center gap-3">
          <span class="text-[12px] text-brown w-[80px] shrink-0">纸张大小</span>
          <select v-model="params.paper_size" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="s in paperSizes" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[80px] shrink-0">宽度 (cm)</span>
          <input type="number" step="0.1" v-model.number="params.paper_width_cm" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[80px] shrink-0">高度 (cm)</span>
          <input type="number" step="0.1" v-model.number="params.paper_height_cm" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
        <div class="col-span-2 flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="params.keep_original_orientation" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
            <span class="text-[12px] text-brown">保持原始纸张方向</span>
          </label>
        </div>
      </div>
    </div>

    <div class="w-full h-[1px] bg-tan-border"></div>

    <div>
      <h4 class="text-[13px] font-semibold text-brown-dark mb-2">页边距 (cm)</h4>
      <div class="grid grid-cols-2 gap-x-4 gap-y-3">
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">上</span>
          <input type="number" step="0.1" v-model.number="params.top_cm" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">下</span>
          <input type="number" step="0.1" v-model.number="params.bottom_cm" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">左</span>
          <input type="number" step="0.1" v-model.number="params.left_cm" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">右</span>
          <input type="number" step="0.1" v-model.number="params.right_cm" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
      </div>
    </div>

    <div class="w-full h-[1px] bg-tan-border"></div>

    <div>
      <h4 class="text-[13px] font-semibold text-brown-dark mb-2">分栏</h4>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown">栏数</span>
          <div class="flex gap-1">
            <button
              v-for="n in [1, 2, 3]" :key="n"
              @click="params.columns = n"
              class="w-9 h-9 rounded-lg text-[13px] font-medium transition-colors"
              :class="params.columns === n ? 'bg-cinnabar text-white' : 'bg-cream-darker text-brown border border-tan-border'"
            >{{ n }}</button>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown">栏间距 (cm)</span>
          <input type="number" step="0.1" v-model.number="params.column_spacing_cm" class="w-20 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
        </div>
      </div>
    </div>

  </div>
</template>
