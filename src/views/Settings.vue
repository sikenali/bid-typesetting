<script setup>
import { ref } from 'vue'
import { RiPaletteLine, RiBookmark3Line, RiEyeLine, RiCheckLine, RiSaveLine, RiMagicLine, RiFileTextLine, RiBuildingLine, RiBook2Line, RiBarChart2Line, RiFileEditLine, RiSettings3Line } from '@remixicon/vue'

const activeSection = ref('theme')

const themes = [
  { id: 'light', name: '浅色主题', desc: '经典羊皮纸底色', previewBg: '#FDF6E3', selected: true },
  { id: 'dark', name: '深色主题', desc: '深色护眼模式', previewBg: '#2C2416', selected: false },
  { id: 'paper', name: '纯白纸', desc: '清爽干净', previewBg: '#FFFFFF', selected: false },
]

const templates = [
  { id: 'gb', name: 'GB/T 国家标准', sub: 'GB/T 7714', desc: '符合国家公文标准格式', icon: RiFileTextLine, iconColor: '#C8A45C', selected: true },
  { id: 'government', name: '政府公文', sub: 'GB/T 9704', desc: '党政机关公文格式标准', icon: RiBuildingLine, iconColor: '#C43A31', selected: false },
  { id: 'academic', name: '学术论文', sub: 'GB/T 7714', desc: '学术论文排版规范', icon: RiBook2Line, iconColor: '#6B8CAE', selected: false },
  { id: 'business', name: '商务报告', sub: 'ISO 50001', desc: '国际商务文档模板', icon: RiBarChart2Line, iconColor: '#5B8C5A', selected: false },
]

const displayOptions = [
  { id: 'annotation', name: '以批注形式展示修改', desc: '开启后，排版修改将以批注气泡形式显示在文档右侧', checked: true },
  { id: 'highlight', name: '高亮修改处', desc: '开启后，页面中将高亮标记所有被修改的内容', checked: false },
]

const selectTheme = (id) => {
  themes.forEach(t => { t.selected = t.id === id })
}

const selectTemplate = (id) => {
  templates.forEach(t => { t.selected = t.id === id })
}

const toggleOption = (id) => {
  const option = displayOptions.find(o => o.id === id)
  if (option) option.checked = !option.checked
}
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex">
    <div class="w-[280px] bg-[#FBF7EF] border-r border-[#E0D5C0] flex flex-col">
      <div class="px-6 pt-5 pb-5">
        <h3 class="text-base font-semibold text-[#3D2B1F]">排版设置</h3>
        <div class="w-full h-[1px] bg-[#E0D5C0] mt-[2px]"></div>
        <p class="text-xs text-[#8B7355] mt-2">配置主题、模板与显示方式</p>
      </div>

      <div class="flex-1 px-4 pb-4 space-y-2">
        <button
          @click="activeSection = 'theme'"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeSection === 'theme' ? 'bg-[#C23B22] text-white' : 'bg-[#F5EFE0] hover:bg-[#F0E8D5]'"
        >
          <div class="flex items-center gap-3">
            <RiPaletteLine size="20" :color="activeSection === 'theme' ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === 'theme' ? 'text-white' : 'text-[#3D2B1F]'">主题设置</div>
              <div class="text-[11px]" :class="activeSection === 'theme' ? 'text-white/75' : 'text-[#8B7355]'">Theme</div>
            </div>
            <div v-if="activeSection === 'theme'" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>

        <button
          @click="activeSection = 'template'"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeSection === 'template' ? 'bg-[#C8A45C] text-white' : 'bg-[#F5EFE0] hover:bg-[#F0E8D5]'"
        >
          <div class="flex items-center gap-3">
            <RiBookmark3Line size="20" :color="activeSection === 'template' ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === 'template' ? 'text-white' : 'text-[#3D2B1F]'">内置模板</div>
              <div class="text-[11px]" :class="activeSection === 'template' ? 'text-white/75' : 'text-[#8B7355]'">Templates</div>
            </div>
            <div v-if="activeSection === 'template'" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>

        <button
          @click="activeSection = 'display'"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeSection === 'display' ? 'bg-[#5B8C5A] text-white' : 'bg-[#F5EFE0] hover:bg-[#F0E8D5]'"
        >
          <div class="flex items-center gap-3">
            <RiEyeLine size="20" :color="activeSection === 'display' ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === 'display' ? 'text-white' : 'text-[#3D2B1F]'">显示模式</div>
              <div class="text-[11px]" :class="activeSection === 'display' ? 'text-white/75' : 'text-[#8B7355]'">Display</div>
            </div>
            <div v-if="activeSection === 'display'" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>
      </div>

      <div class="px-4 py-5 space-y-3">
        <button class="w-full flex items-center justify-center gap-2 py-3 bg-[#F5EFE0] border border-[#C8A45C]/50 rounded-xl text-[#5C4033] font-semibold text-[14px]">
          <RiSaveLine size="18" color="#C8A45C" />
          保存到模板
        </button>
        <button class="w-full flex items-center justify-center gap-2 py-3 bg-[#C23B22] text-white rounded-xl font-semibold text-[14px]">
          <RiMagicLine size="18" color="white" />
          一键修改
        </button>
      </div>
    </div>

    <div class="flex-1 bg-[#EAE5D9] flex flex-col">
      <div class="px-8 py-5 bg-[#FDF6E3] flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="activeSection === 'theme' ? 'bg-[#C23B22]' : activeSection === 'template' ? 'bg-[#C8A45C]' : 'bg-[#5B8C5A]'"
        >
          <RiPaletteLine v-if="activeSection === 'theme'" size="20" color="white" />
          <RiBookmark3Line v-else-if="activeSection === 'template'" size="20" color="white" />
          <RiEyeLine v-else size="20" color="white" />
        </div>
        <div>
          <h2 class="text-[18px] font-bold text-[#3D2B1F]">
            {{ activeSection === 'theme' ? '主题设置' : activeSection === 'template' ? '内置模板' : '显示模式' }}
          </h2>
          <p class="text-[12px] text-[#8B7355]">
            {{ activeSection === 'theme' ? '选择界面配色方案' : activeSection === 'template' ? '选择文档排版标准模板' : '控制修改建议的展示方式' }}
          </p>
        </div>
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <div class="bg-[#F5EFE0] border border-[#E8DCC8] rounded-2xl p-8">
          <div class="w-full h-[6px] bg-[#D4C4A8] rounded-[3px] mb-6"></div>

          <div v-if="activeSection === 'theme'" class="grid grid-cols-3 gap-4">
            <div
              v-for="theme in themes"
              :key="theme.id"
              @click="selectTheme(theme.id)"
              class="bg-white rounded-xl p-8 text-center transition-all cursor-pointer"
              :class="theme.selected ? 'ring-2 ring-[#C23B22] shadow-lg shadow-[#C23B22]/18' : 'hover:shadow-md'"
            >
              <div
                class="w-[150px] h-[100px] rounded-lg border border-[#E0D5C0] mx-auto mb-4"
                :style="{ backgroundColor: theme.previewBg }"
              ></div>
              <h4
                class="text-[16px] font-bold mb-1"
                :class="theme.selected ? 'text-[#C23B22]' : 'text-[#3D2B1F]'"
              >{{ theme.name }}</h4>
              <p class="text-[12px] text-[#8B7355] mb-3">{{ theme.desc }}</p>
              <div
                class="w-[26px] h-[26px] rounded-full mx-auto flex items-center justify-center"
                :class="theme.selected ? 'bg-[#C23B22]' : 'bg-[#E0D5C0]'"
              >
                <RiCheckLine v-if="theme.selected" size="14" color="white" />
              </div>
            </div>
          </div>

          <div v-else-if="activeSection === 'template'" class="grid grid-cols-4 gap-4">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              @click="selectTemplate(tpl.id)"
              class="bg-white rounded-xl p-6 text-center transition-all cursor-pointer"
              :class="tpl.selected ? 'ring-2 ring-[#C8A45C] shadow-lg shadow-[#C8A45C]/18' : 'hover:shadow-md'"
            >
              <div
                class="w-[56px] h-[56px] rounded-full mx-auto mb-3 flex items-center justify-center"
                :class="tpl.selected ? 'bg-[#C8A45C]/10' : 'bg-[#F0E8D5]'"
              >
                <component :is="tpl.icon" size="28" :color="tpl.iconColor" />
              </div>
              <h4 class="text-[15px] font-semibold text-[#3D2B1F] mb-1">{{ tpl.name }}</h4>
              <p class="text-[11px] text-[#8B7355]">{{ tpl.sub }}</p>
              <p class="text-[12px] text-[#8B7355] mt-1">{{ tpl.desc }}</p>
              <div
                class="w-[26px] h-[26px] rounded-full mx-auto mt-3 flex items-center justify-center"
                :class="tpl.selected ? 'bg-[#C8A45C]' : 'bg-[#E0D5C0]'"
              >
                <RiCheckLine v-if="tpl.selected" size="14" color="white" />
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="option in displayOptions"
              :key="option.id"
              class="flex items-center justify-between bg-white rounded-xl p-6"
            >
              <div class="flex items-center gap-4">
                <div class="w-[48px] h-[48px] rounded-lg bg-[#E8F0E0] flex items-center justify-center">
                  <RiFileEditLine v-if="option.id === 'annotation'" size="24" color="#5B8C5A" />
                  <RiSettings3Line v-else size="24" color="#5B8C5A" />
                </div>
                <div>
                  <h4 class="text-[16px] font-semibold text-[#3D2B1F]">{{ option.name }}</h4>
                  <p class="text-[13px] text-[#8B7355]">{{ option.desc }}</p>
                </div>
              </div>
              <button
                @click="toggleOption(option.id)"
                class="w-[56px] h-[30px] rounded-full relative transition-colors"
                :class="option.checked ? 'bg-[#5B8C5A]' : 'bg-[#E0D5C0]'"
              >
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-[26px] h-[26px] bg-white rounded-full shadow flex items-center justify-center transition-all duration-200"
                  :class="option.checked ? 'right-0.5' : 'left-0.5'"
                >
                  <RiCheckLine v-if="option.checked" size="14" color="#5B8C5A" />
                </div>
              </button>
            </div>

            <div class="bg-white rounded-xl border border-[#E8DCC8] overflow-hidden">
              <div class="flex h-[140px]">
                <div class="flex-1 p-5 space-y-3">
                  <div class="h-3 w-3/4 bg-[#F5EFE0] rounded"></div>
                  <div class="h-3 w-full bg-[#F5EFE0] rounded"></div>
                  <div class="h-3 w-5/6 bg-[#F5EFE0] rounded"></div>
                  <div class="h-3 w-2/3 bg-[#F5EFE0] rounded"></div>
                </div>
                <div class="w-12 bg-[#FDF6E3] border-l border-[#E8DCC8] flex flex-col items-center justify-center gap-3">
                  <div class="w-2 h-6 rounded-full bg-[#C8A45C]"></div>
                  <div class="w-2 h-6 rounded-full bg-[#5B8C5A]"></div>
                  <div class="w-2 h-6 rounded-full bg-[#C23B22]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-5 bg-[#FDF6E3] border-t border-[#E0D5C0] flex items-center justify-end gap-3">
        <button class="px-6 py-3 bg-[#F5EFE0] border border-[#E0D5C0] rounded-xl text-[14px] font-medium text-[#5C4033]">取消</button>
        <button class="flex items-center gap-2 px-6 py-3 bg-[#C23B22] text-white rounded-xl text-[14px] font-semibold">
          <RiCheckLine size="16" color="white" />
          <span>应用设置</span>
        </button>
      </div>
    </div>
  </div>
</template>
