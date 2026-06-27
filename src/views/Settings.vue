<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettings } from '../composables/useSettings'
import { RiPaletteLine, RiBookmark3Line, RiEyeLine, RiCheckLine, RiFileTextLine, RiBuildingLine, RiBook2Line, RiBarChart2Line, RiFileEditLine, RiSettings3Line } from '@remixicon/vue'

const router = useRouter()
const { theme: currentTheme, template: currentTemplate, annotationEnabled, highlightEnabled, setTheme, setTemplate, toggleAnnotation, toggleHighlight } = useSettings()

const activeSection = ref('theme')

const themes = [
  { id: 'light', name: '浅色主题', desc: '经典羊皮纸底色', previewBg: '#FDF6E3' },
  { id: 'dark', name: '深色主题', desc: '深色护眼模式', previewBg: '#2C2416' },
  { id: 'paper', name: '纯白纸', desc: '清爽干净', previewBg: '#FFFFFF' },
]

const templates = [
  { id: 'gb', name: 'GB/T 国家标准', sub: 'GB/T 7714', desc: '符合国家公文标准格式', icon: RiFileTextLine, iconColor: '#C8A45C' },
  { id: 'government', name: '政府公文', sub: 'GB/T 9704', desc: '党政机关公文格式标准', icon: RiBuildingLine, iconColor: '#C43A31' },
  { id: 'academic', name: '学术论文', sub: 'GB/T 7714', desc: '学术论文排版规范', icon: RiBook2Line, iconColor: '#6B8CAE' },
  { id: 'business', name: '商务报告', sub: 'ISO 50001', desc: '国际商务文档模板', icon: RiBarChart2Line, iconColor: '#5B8C5A' },
]

const displayOptions = [
  { id: 'highlight', name: '高亮修改处', desc: '开启后，页面中将高亮标记所有被修改的内容' },
  { id: 'annotation', name: '以批注形式展示修改', desc: '开启后，排版修改将以批注气泡形式显示在文档右侧' },
]
</script>

<template>
  <div class="pt-16 h-screen flex">
    <div class="w-[280px] bg-cream border-r border-tan-border flex flex-col">
      <div class="px-6 pt-5 pb-5">
        <h3 class="text-base font-semibold text-brown-dark">排版设置</h3>
        <div class="w-full h-[1px] bg-tan-border mt-[2px]"></div>
        <p class="text-xs text-brown-muted mt-2">配置主题、模板与显示方式</p>
      </div>

      <div class="flex-1 px-4 pb-4 space-y-2">
        <button
          @click="activeSection = 'theme'"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeSection === 'theme' ? 'bg-cinnabar text-white' : 'bg-cream-dark hover:bg-cream-darker'"
        >
          <div class="flex items-center gap-3">
            <RiPaletteLine size="20" :color="activeSection === 'theme' ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === 'theme' ? 'text-white' : 'text-brown-dark'">主题设置</div>
              <div class="text-[11px]" :class="activeSection === 'theme' ? 'text-white/75' : 'text-brown-muted'">Theme</div>
            </div>
            <div v-if="activeSection === 'theme'" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>

        <button
          @click="activeSection = 'template'"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeSection === 'template' ? 'bg-gold-dark text-white' : 'bg-cream-dark hover:bg-cream-darker'"
        >
          <div class="flex items-center gap-3">
            <RiBookmark3Line size="20" :color="activeSection === 'template' ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === 'template' ? 'text-white' : 'text-brown-dark'">标准模板</div>
              <div class="text-[11px]" :class="activeSection === 'template' ? 'text-white/75' : 'text-brown-muted'">Standards</div>
            </div>
            <div v-if="activeSection === 'template'" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>

        <button
          @click="activeSection = 'display'"
          class="w-full rounded-xl p-3 transition-all text-left"
          :class="activeSection === 'display' ? 'bg-jade-light text-white' : 'bg-cream-dark hover:bg-cream-darker'"
        >
          <div class="flex items-center gap-3">
            <RiEyeLine size="20" :color="activeSection === 'display' ? 'white' : '#5C4033'" />
            <div class="flex-1">
              <div class="text-[15px] font-semibold" :class="activeSection === 'display' ? 'text-white' : 'text-brown-dark'">显示模式</div>
              <div class="text-[11px]" :class="activeSection === 'display' ? 'text-white/75' : 'text-brown-muted'">Display</div>
            </div>
            <div v-if="activeSection === 'display'" class="w-[9px] h-[8px] bg-white rounded-[4px]"></div>
          </div>
        </button>
      </div>

    </div>

    <div class="flex-1 bg-warm-gray flex flex-col">
      <div class="px-8 py-5 bg-parchment flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="activeSection === 'theme' ? 'bg-cinnabar' : activeSection === 'template' ? 'bg-gold-dark' : 'bg-jade-light'"
          >
            <RiPaletteLine v-if="activeSection === 'theme'" size="20" color="white" />
            <RiBookmark3Line v-else-if="activeSection === 'template'" size="20" color="white" />
            <RiEyeLine v-else size="20" color="white" />
          </div>
          <div>
            <h2 class="text-[18px] font-bold text-brown-dark">
              {{ activeSection === 'theme' ? '主题设置' : activeSection === 'template' ? '标准模板' : '显示模式' }}
            </h2>
            <p class="text-[12px] text-brown-muted">
              {{ activeSection === 'theme' ? '选择界面配色方案' : activeSection === 'template' ? '选择文档排版标准模板' : '控制修改建议的展示方式' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="px-6 py-3 bg-cream-dark border border-tan-border rounded-xl text-[14px] font-medium text-brown">取消</button>
          <button
            class="flex items-center gap-2 px-6 py-3 text-white rounded-xl text-[14px] font-semibold"
            :class="activeSection === 'template' ? 'bg-gold-dark' : activeSection === 'display' ? 'bg-jade-light' : 'bg-cinnabar'"
            @click="router.back()"
          >
            <RiCheckLine size="16" color="white" />
            <span>应用设置</span>
          </button>
        </div>
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <div class="bg-cream-dark border border-tan-light rounded-2xl p-8">
          <div class="w-full h-[6px] bg-tan-dark rounded-[3px] mb-6"></div>

          <div v-if="activeSection === 'theme'" class="grid grid-cols-3 gap-4">
            <div
              v-for="theme in themes"
              :key="theme.id"
              @click="setTheme(theme.id)"
              class="bg-white rounded-xl p-8 text-center transition-all cursor-pointer"
              :class="currentTheme === theme.id ? 'ring-2 ring-cinnabar shadow-lg shadow-cinnabar/18' : 'hover:shadow-md'"
            >
              <div
                class="w-[150px] h-[100px] rounded-lg border border-[#E0D5C0] mx-auto mb-4"
                :style="{ backgroundColor: theme.previewBg }"
              ></div>
              <h4
                class="text-[16px] font-bold mb-1"
              :class="currentTheme === theme.id ? 'text-cinnabar' : 'text-brown-dark'"
            >{{ theme.name }}</h4>
            <p class="text-[12px] text-brown-muted mb-3">{{ theme.desc }}</p>
            <div
              class="w-[26px] h-[26px] rounded-full mx-auto flex items-center justify-center"
              :class="currentTheme === theme.id ? 'bg-cinnabar' : 'bg-tan-dark'"
            >
              <RiCheckLine v-if="currentTheme === theme.id" size="14" color="white" />
              </div>
            </div>
          </div>

          <div v-else-if="activeSection === 'template'" class="grid grid-cols-4 gap-4">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              @click="setTemplate(tpl.id)"
              class="bg-white rounded-xl p-6 text-center transition-all cursor-pointer"
              :class="currentTemplate === tpl.id ? 'ring-2 ring-gold-dark shadow-lg shadow-gold-dark/18' : 'hover:shadow-md'"
            >
              <div
                class="w-[56px] h-[56px] rounded-full mx-auto mb-3 flex items-center justify-center"
                :class="currentTemplate === tpl.id ? 'bg-gold-dark/10' : 'bg-cream-darker'"
              >
                <component :is="tpl.icon" size="28" :color="tpl.iconColor" />
              </div>
              <h4 class="text-[15px] font-semibold text-brown-dark mb-1">{{ tpl.name }}</h4>
              <p class="text-[11px] text-brown-muted">{{ tpl.sub }}</p>
              <p class="text-[12px] text-brown-muted mt-1">{{ tpl.desc }}</p>
              <div
                class="w-[26px] h-[26px] rounded-full mx-auto mt-3 flex items-center justify-center"
                :class="currentTemplate === tpl.id ? 'bg-gold-dark' : 'bg-tan-dark'"
              >
                <RiCheckLine v-if="currentTemplate === tpl.id" size="14" color="white" />
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
                <div class="w-[48px] h-[48px] rounded-lg bg-diff-green-bg flex items-center justify-center">
                  <RiFileEditLine v-if="option.id === 'annotation'" size="24" color="#5B8C5A" />
                  <RiSettings3Line v-else size="24" color="#5B8C5A" />
                </div>
                <div>
                  <h4 class="text-[16px] font-semibold text-brown-dark">{{ option.name }}</h4>
                  <p class="text-[13px] text-brown-muted">{{ option.desc }}</p>
                </div>
              </div>
              <button
              @click="option.id === 'annotation' ? toggleAnnotation() : toggleHighlight()"
              class="w-[56px] h-[30px] rounded-full relative transition-colors"
              :class="(option.id === 'annotation' ? annotationEnabled : highlightEnabled) ? 'bg-jade-light' : 'bg-tan-dark'"
              >
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-[26px] h-[26px] bg-white rounded-full shadow flex items-center justify-center transition-all duration-200"
                  :class="(option.id === 'annotation' ? annotationEnabled : highlightEnabled) ? 'right-0.5' : 'left-0.5'"
                >
                  <RiCheckLine v-if="option.id === 'annotation' ? annotationEnabled : highlightEnabled" size="14" color="#5B8C5A" />
                </div>
              </button>
            </div>

            <div v-if="annotationEnabled" class="bg-white rounded-xl border border-tan-light overflow-hidden">
              <div class="flex p-6">
                <div class="flex-1">
                  <div class="text-[13px] text-brown leading-[1.8]">
                    <p class="mb-4">2024年是公司发展历程中具有里程碑意义的一年。在董事会的正确领导下，全体员工团结一心，攻坚克难，圆满完成了年度各项目标任务。</p>
                    <p class="mb-4">市场拓展方面，我们新开拓了华东、华南两大区域市场，新增客户超过200家，客户满意度达到96.8%。</p>
                    <p>技术研发方面，公司全年申请专利56项，获得授权32项，其中发明专利18项。</p>
                  </div>
                </div>
                <div class="w-6 shrink-0"></div>
                <div class="w-[2px] shrink-0 bg-tan-border"></div>
                <div class="w-6 shrink-0"></div>
                <div class="w-[220px] shrink-0 space-y-3">
                  <div class="rounded-lg p-3" style="border-width: 2.7px; border-style: solid; background: rgba(200,164,92,0.1); border-color: #C8A45C;">
                    <div class="text-[12px] font-semibold text-gold-dark">格式建议</div>
                    <p class="text-[12px] text-brown leading-relaxed mt-1">建议首行缩进2字符，符合公文排版规范</p>
                  </div>
                  <div class="rounded-lg p-3" style="border-width: 2.7px; border-style: solid; background: rgba(91,140,90,0.1); border-color: #5B8C5A;">
                    <div class="text-[12px] font-semibold text-jade-light">排版优化</div>
                    <p class="text-[12px] text-brown leading-relaxed mt-1">行距已调整为28磅固定值</p>
                  </div>
                  <div class="rounded-lg p-3" style="border-width: 2.7px; border-style: solid; background: rgba(107,140,174,0.1); border-color: #6B8CAE;">
                    <div class="text-[12px] font-semibold text-cloud-blue">字体建议</div>
                    <p class="text-[12px] text-brown leading-relaxed mt-1">正文建议使用仿宋_GB2312</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>
