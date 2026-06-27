<script setup>
import { ref } from 'vue'
import { RiFileTextLine, RiEditLine, RiCheckLine, RiDownloadLine, RiArrowLeftSLine, RiArrowRightSLine, RiLayout2Line, RiCollageLine, RiBookmark3Line, RiSettings3Line } from '@remixicon/vue'

const compareMode = ref('side-by-side')
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col">
    <div class="px-8 py-4 bg-parchment border-b border-tan-border flex items-center justify-between">
      <div class="flex items-center gap-3">
        <RiFileTextLine size="20" color="#5B8C5A" />
        <span class="text-[15px] font-semibold text-brown-dark">2024年度工作报告.docx</span>
        <div class="flex items-center gap-2 px-3 py-1 bg-cream-darker rounded-full">
          <RiEditLine size="14" color="#C43A31" />
          <span class="text-[12px] font-medium text-cinnabar">共 23 处修改</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex bg-cream-darker rounded-lg p-1">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]"
            :class="compareMode === 'side-by-side' ? 'bg-white font-semibold text-cinnabar' : 'font-medium text-brown'"
            @click="compareMode = 'side-by-side'"
          >
            <RiLayout2Line size="16" :color="compareMode === 'side-by-side' ? '#C43A31' : '#8B7355'" />
            并排对比
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]"
            :class="compareMode === 'overlay' ? 'bg-white font-semibold text-cinnabar' : 'font-medium text-brown'"
            @click="compareMode = 'overlay'"
          >
            <RiCollageLine size="16" :color="compareMode === 'overlay' ? '#C43A31' : '#8B7355'" />
            叠加对比
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-5 py-2 bg-jade-light text-white rounded-lg text-[14px] font-semibold">
            <RiCheckLine size="18" color="white" />
            接受全部修改
          </button>
          <button class="flex items-center gap-2 px-5 py-2 bg-cinnabar text-white rounded-lg text-[14px] font-semibold">
            <RiDownloadLine size="18" color="white" />
            导出文档
          </button>
        </div>
      </div>
    </div>

    <div v-if="compareMode === 'side-by-side'" class="flex-1 flex bg-warm-gray">
      <div class="flex-1 flex flex-col">
        <div class="px-6 py-3 bg-cream-dark flex items-center gap-3">
          <div class="w-[11px] h-[10px] rounded-full bg-brown-muted"></div>
          <span class="text-[14px] font-semibold text-brown">修改前 · 原始文档</span>
        </div>
        <div class="flex-1 bg-warm-gray flex items-start justify-center p-6">
          <div class="w-[560px] bg-white shadow-lg p-[48px_56px]">
            <div class="text-center mb-1">
              <div class="text-[24px] font-bold text-[#1A1A1A]">2024年度工作报告</div>
            </div>
            <div class="text-[13px] text-[#666666] text-center mb-8">XX公司 · 2024年12月</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-11">
              2024年是公司发展历程中具有里程碑意义的一年。在董事会的正确领导下，全体员工团结一心，攻坚克难，圆满完成了年度各项目标任务。
            </p>
            <div class="text-[16px] font-bold text-[#1A1A1A] mb-3">一、主要工作回顾</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              本年度，我们紧紧围绕"提质增效、创新发展"的工作主线，在市场开拓、技术研发、团队建设等方面取得了显著成效。
            </p>
            <div class="border-[2.7px] border-cinnabar bg-diff-red-bg rounded p-2 mb-5">
              <p class="text-[14px] text-[#333333] leading-relaxed">
                市场拓展方面，我们新开拓了华东区域市场，新增客户超过150家。
              </p>
            </div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              技术研发方面，公司全年申请专利45项，获得授权28项。研发团队规模进一步扩大，引进了多名高级工程师。
            </p>
            <div class="text-[11px] text-[#999] text-center">— 1 —</div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col">
        <div class="px-6 py-3 bg-diff-green-bg flex items-center gap-3">
          <div class="w-[11px] h-[10px] rounded-full bg-jade-light"></div>
          <span class="text-[14px] font-semibold text-brown-dark">修改后 · 排版优化</span>
          <div class="ml-auto px-3 py-1 bg-jade-light text-white rounded-full text-[11px] font-semibold">推荐</div>
        </div>
        <div class="flex-1 bg-warm-gray flex items-start justify-center p-6">
          <div class="w-[560px] bg-white shadow-lg p-[48px_56px]">
            <div class="text-center mb-1">
              <div class="text-[24px] font-bold text-[#1A1A1A]">2024年度工作报告</div>
            </div>
            <div class="text-[13px] text-[#666666] text-center mb-8">XX公司 · 2024年12月</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-11">
              2024年是公司发展历程中具有里程碑意义的一年。在董事会的科学决策与大力支持下，全体员工团结一致、迎难而上，圆满完成了年度各项目标任务。
            </p>
            <div class="text-[16px] font-bold text-[#1A1A1A] mb-3">一、主要工作回顾</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              本年度，我们紧紧围绕"提质增效、创新发展"的工作主线，在市场开拓、技术研发、团队建设等方面取得了显著成效。
            </p>
            <div class="border-[2.7px] border-jade-light bg-[#E8F5E0] rounded p-2 mb-5">
              <p class="text-[14px] text-[#333333] leading-relaxed">
                市场拓展方面，我们成功开拓了华东、华南两大区域市场，累计新增优质客户超过150家，销售额同比增长35%。
              </p>
            </div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              技术研发方面，公司全年申请专利56项，获得授权32项，其中发明专利18项。研发团队规模扩大至280人。
            </p>
            <div class="text-[11px] text-[#999] text-center">— 1 —</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex bg-warm-gray relative">
      <div class="flex-1 flex flex-col">
        <div class="px-6 py-3 bg-cream-dark flex items-center gap-3">
          <div class="w-[11px] h-[10px] rounded-full bg-brown-muted"></div>
          <span class="text-[14px] font-semibold text-brown">修改前 · 原始文档</span>
        </div>
        <div class="flex-1 bg-warm-gray flex items-start justify-center p-6">
          <div class="w-[560px] bg-white shadow-lg p-[48px_56px]">
            <div class="text-center mb-1">
              <div class="text-[24px] font-bold text-[#1A1A1A]">2024年度工作报告</div>
            </div>
            <div class="text-[13px] text-[#666666] text-center mb-8">XX公司 · 2024年12月</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-11">
              2024年是公司发展历程中具有里程碑意义的一年。在董事会的正确领导下，全体员工团结一心，攻坚克难，圆满完成了年度各项目标任务。
            </p>
            <div class="text-[16px] font-bold text-[#1A1A1A] mb-3">一、主要工作回顾</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              本年度，我们紧紧围绕"提质增效、创新发展"的工作主线，在市场开拓、技术研发、团队建设等方面取得了显著成效。
            </p>
            <div class="border-[2.7px] border-cinnabar bg-diff-red-bg rounded p-2 mb-5">
              <p class="text-[14px] text-[#333333] leading-relaxed">
                市场拓展方面，我们新开拓了华东区域市场，新增客户超过150家。
              </p>
            </div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              技术研发方面，公司全年申请专利45项，获得授权28项。研发团队规模进一步扩大，引进了多名高级工程师。
            </p>
            <div class="text-[11px] text-[#999] text-center">— 1 —</div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col absolute inset-0 left-1/2 bg-white/80">
        <div class="px-6 py-3 bg-diff-green-bg/90 flex items-center gap-3">
          <div class="w-[11px] h-[10px] rounded-full bg-jade-light"></div>
          <span class="text-[14px] font-semibold text-brown-dark">修改后 · 排版优化</span>
          <div class="ml-auto px-3 py-1 bg-jade-light text-white rounded-full text-[11px] font-semibold">推荐</div>
        </div>
        <div class="flex-1 bg-warm-gray/90 flex items-start justify-center p-6">
          <div class="w-[560px] bg-white shadow-lg p-[48px_56px]">
            <div class="text-center mb-1">
              <div class="text-[24px] font-bold text-[#1A1A1A]">2024年度工作报告</div>
            </div>
            <div class="text-[13px] text-[#666666] text-center mb-8">XX公司 · 2024年12月</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-11">
              2024年是公司发展历程中具有里程碑意义的一年。在董事会的科学决策与大力支持下，全体员工团结一致、迎难而上，圆满完成了年度各项目标任务。
            </p>
            <div class="text-[16px] font-bold text-[#1A1A1A] mb-3">一、主要工作回顾</div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              本年度，我们紧紧围绕"提质增效、创新发展"的工作主线，在市场开拓、技术研发、团队建设等方面取得了显著成效。
            </p>
            <div class="border-[2.7px] border-jade-light bg-[#E8F5E0] rounded p-2 mb-5">
              <p class="text-[14px] text-[#333333] leading-relaxed">
                市场拓展方面，我们成功开拓了华东、华南两大区域市场，累计新增优质客户超过150家，销售额同比增长35%。
              </p>
            </div>
            <p class="text-[14px] text-[#333333] leading-relaxed mb-5">
              技术研发方面，公司全年申请专利56项，获得授权32项，其中发明专利18项。研发团队规模扩大至280人。
            </p>
            <div class="text-[11px] text-[#999] text-center">— 1 —</div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-8 py-3 bg-parchment border-t border-tan-border flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-[13px] h-[12px] rounded bg-cinnabar"></div>
          <span class="text-[13px] font-medium text-brown">删除内容 8 处</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-[13px] h-[12px] rounded bg-jade-light"></div>
          <span class="text-[13px] font-medium text-brown">新增内容 15 处</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1 px-3 py-2 bg-cream-darker rounded-lg">
          <RiArrowLeftSLine size="16" color="#5C4033" />
          <span class="text-[13px] font-medium text-brown">上一处</span>
        </button>
        <button class="flex items-center gap-1 px-3 py-2 bg-cream-darker rounded-lg">
          <span class="text-[13px] font-medium text-brown">下一处</span>
          <RiArrowRightSLine size="16" color="#5C4033" />
        </button>
      </div>
    </div>
  </div>
</template>
