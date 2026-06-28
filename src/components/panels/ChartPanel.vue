<script setup>
defineProps({
  figCaption: { type: Object, required: true },
  tblCaption: { type: Object, required: true },
  table: { type: Object, required: true },
})

const cnFonts = ['宋体', '仿宋', '黑体', '楷体', '微软雅黑', '思源宋体']
const enFonts = ['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Courier New']
const sizeCN = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五']
const lineSpacingModes = [
  { value: 'EXACT', label: '固定值' },
  { value: 'SINGLE', label: '单倍行距' },
  { value: 'MULTIPLE', label: '多倍行距' },
]
const alignOptions = [
  { value: 'LEFT', label: '左对齐' },
  { value: 'CENTER', label: '居中' },
  { value: 'RIGHT', label: '右对齐' },
  { value: 'JUSTIFY', label: '两端' },
]
const cellAlignOptions = [
  { value: 'TOP', label: '顶端对齐' },
  { value: 'CENTER', label: '垂直居中' },
  { value: 'BOTTOM', label: '底端对齐' },
]
const tableStyleTypes = ['normal', 'light', 'striped', 'grid']
</script>

<template>
  <div class="bg-cream px-6 py-4 border-b border-tan-border space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto">

    <div>
      <h4 class="text-[13px] font-semibold text-brown-dark mb-2">图题设置</h4>
      <div class="grid grid-cols-3 gap-x-4 gap-y-3">
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">中文字体</span>
          <select v-model="figCaption.cn_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="f in cnFonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">英文字体</span>
          <select v-model="figCaption.en_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="f in enFonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">字号</span>
          <select v-model="figCaption.size_cn" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="s in sizeCN" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-4 mt-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="figCaption.bold" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
          <span class="text-[12px] text-brown">粗体</span>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">对齐</span>
          <select v-model="figCaption.align" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option v-for="a in alignOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">行距</span>
          <select v-model="figCaption.line_spacing_mode" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option v-for="m in lineSpacingModes" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <input type="number" step="0.5" v-model.number="figCaption.line_spacing_value" class="w-16 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
          <span class="text-[12px] text-brown-muted">磅</span>
        </div>
      </div>
    </div>

    <div class="w-full h-[1px] bg-tan-border"></div>

    <div>
      <h4 class="text-[13px] font-semibold text-brown-dark mb-2">表题设置</h4>
      <div class="grid grid-cols-3 gap-x-4 gap-y-3">
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">中文字体</span>
          <select v-model="tblCaption.cn_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="f in cnFonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">英文字体</span>
          <select v-model="tblCaption.en_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="f in enFonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">字号</span>
          <select v-model="tblCaption.size_cn" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="s in sizeCN" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-4 mt-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="tblCaption.bold" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
          <span class="text-[12px] text-brown">粗体</span>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">对齐</span>
          <select v-model="tblCaption.align" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option v-for="a in alignOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">行距</span>
          <select v-model="tblCaption.line_spacing_mode" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option v-for="m in lineSpacingModes" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <input type="number" step="0.5" v-model.number="tblCaption.line_spacing_value" class="w-16 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
          <span class="text-[12px] text-brown-muted">磅</span>
        </div>
      </div>
    </div>

    <div class="w-full h-[1px] bg-tan-border"></div>

    <div>
      <h4 class="text-[13px] font-semibold text-brown-dark mb-2">表格设置</h4>
      <div class="grid grid-cols-3 gap-x-4 gap-y-3">
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">中文字体</span>
          <select v-model="table.cn_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="f in cnFonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">英文字体</span>
          <select v-model="table.en_font" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="f in enFonts" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[12px] text-brown w-[60px] shrink-0">字号</span>
          <select v-model="table.size_cn" class="flex-1 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown">
            <option v-for="s in sizeCN" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-4 mt-3 flex-wrap">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="table.autofit" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
          <span class="text-[12px] text-brown">自动适应</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="table.enable_cell_formatting" class="w-4 h-4 rounded border-tan-border text-cinnabar" />
          <span class="text-[12px] text-brown">单元格格式</span>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">表格对齐</span>
          <select v-model="table.align" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option v-for="a in alignOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">单元格对齐</span>
          <select v-model="table.cell_align" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option v-for="a in cellAlignOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">最小行高</span>
          <input type="number" step="0.5" v-model.number="table.min_row_height_pt" class="w-16 px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown" />
          <span class="text-[12px] text-brown-muted">磅</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[12px] text-brown">表格样式</span>
          <select v-model="table.style_type" class="px-3 py-2 bg-cream border border-tan-border rounded-lg text-[13px] text-brown min-w-[100px]">
            <option value="normal">标准</option>
            <option value="light">简洁</option>
            <option value="striped">条纹</option>
            <option value="grid">网格</option>
          </select>
        </div>
      </div>
    </div>

  </div>
</template>
