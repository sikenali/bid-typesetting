<script setup>
defineProps({
  params: { type: Object, required: true },
})

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体']
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New']
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五']
const alignOptions = [
  { value: 'LEFT', label: '左对齐' },
  { value: 'CENTER', label: '居中' },
  { value: 'RIGHT', label: '右对齐' },
]
const underlineTypes = [
  { value: 'none', label: '无' },
  { value: 'single', label: '单线' },
  { value: 'double', label: '双线' },
  { value: 'thick', label: '粗线' },
  { value: 'dotted', label: '点线' },
  { value: 'dash', label: '虚线' },
]
const pageNumberTypes = [
  { value: 'standard', label: '第X页' },
  { value: 'total', label: '第X页/共Y页' },
  { value: 'simple', label: 'X' },
  { value: 'roman', label: '罗马数字' },
]
</script>

<template>
  <div class="bg-cream px-6 py-4 border-b border-tan-border space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto">

    <div>
      <div class="flex items-center gap-3 mb-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="params.enable_header" class="sr-only peer" />
          <div class="w-[40px] h-[22px] bg-cream-darker rounded-full peer peer-checked:bg-cinnabar transition-colors"></div>
          <div class="absolute left-[3px] top-[3px] w-[16px] h-[16px] bg-white rounded-full transition-transform peer-checked:translate-x-[18px]"></div>
        </label>
        <h4 class="text-[13px] font-semibold text-brown-dark">页眉设置</h4>
      </div>
      <template v-if="params.enable_header">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-[12px] text-brown w-[60px] shrink-0">页眉内容</span>
            <input type="text" v-model="params.header_text" placeholder="输入页眉文字" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
          </div>
          <div class="grid grid-cols-3 gap-x-4 gap-y-3">
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-brown w-[60px] shrink-0">中文字体</span>
              <select v-model="params.header_cn_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
                <option v-for="f in cnFonts" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-brown w-[60px] shrink-0">英文字体</span>
              <select v-model="params.header_en_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
                <option v-for="f in enFonts" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-brown w-[60px] shrink-0">字号</span>
              <select v-model="params.header_size_cn" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
                <option v-for="s in sizeCN" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-brown">对齐</span>
              <select v-model="params.header_align" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
                <option v-for="a in alignOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="params.header_bold" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
              <span class="text-[12px] text-brown">粗体</span>
            </label>
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-brown">下划线类型</span>
              <select v-model="params.header_underline_type" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
                <option v-for="u in underlineTypes" :key="u.value" :value="u.value">{{ u.label }}</option>
              </select>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="w-full h-[1px] bg-tan-border"></div>

    <div>
      <div class="flex items-center gap-3 mb-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="params.enable_footer" class="sr-only peer" />
          <div class="w-[40px] h-[22px] bg-cream-darker rounded-full peer peer-checked:bg-cinnabar transition-colors"></div>
          <div class="absolute left-[3px] top-[3px] w-[16px] h-[16px] bg-white rounded-full transition-transform peer-checked:translate-x-[18px]"></div>
        </label>
        <h4 class="text-[13px] font-semibold text-brown-dark">页脚设置</h4>
      </div>
      <template v-if="params.enable_footer">
        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-x-4 gap-y-3">
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-brown w-[60px] shrink-0">中文字体</span>
              <select v-model="params.footer_cn_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
                <option v-for="f in cnFonts" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-brown w-[60px] shrink-0">英文字体</span>
              <select v-model="params.footer_en_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
                <option v-for="f in enFonts" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-brown w-[60px] shrink-0">字号</span>
              <select v-model="params.footer_size_cn" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
                <option v-for="s in sizeCN" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-brown">对齐</span>
              <select v-model="params.footer_align" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
                <option v-for="a in alignOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-brown">页码类型</span>
              <select v-model="params.footer_page_number_type" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[140px]">
                <option v-for="p in pageNumberTypes" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="params.clear_footer" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
              <span class="text-[12px] text-brown">清除原页脚</span>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="params.page_number_from_body" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
              <span class="text-[12px] text-brown">页码从正文开始</span>
            </label>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>
