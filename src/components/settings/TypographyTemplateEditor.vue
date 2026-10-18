<script setup>
import RulePanelEditor from '@/components/RulePanelEditor.vue';
import PageRuleEditor from '@/components/rules/PageRuleEditor.vue';
import BodyRuleEditor from '@/components/rules/BodyRuleEditor.vue';
import HeadingRuleEditor from '@/components/rules/HeadingRuleEditor.vue';
import ChartRuleEditor from '@/components/rules/ChartRuleEditor.vue';
import TOCRuleEditor from '@/components/rules/TOCRuleEditor.vue';
import HeaderFooterRuleEditor from '@/components/rules/HeaderFooterRuleEditor.vue';
import CleanupRuleEditor from '@/components/rules/CleanupRuleEditor.vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
});
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="typography-editor">
    <RulePanelEditor title="页面设置" desc="页面尺寸、边距与方向" icon="RiPagesLine" default-open>
      <PageRuleEditor :params="props.modelValue.page" />
    </RulePanelEditor>
    <RulePanelEditor title="正文格式" desc="字体、字号、行距与缩进" icon="RiTextSnippet" default-open>
      <BodyRuleEditor :params="props.modelValue.body" />
    </RulePanelEditor>
    <RulePanelEditor title="标题与编号" desc="各级标题样式与自动编号规则" icon="RiHeading" default-open>
      <HeadingRuleEditor :headings="props.modelValue.headings" :patterns="props.modelValue.patterns" />
    </RulePanelEditor>
    <RulePanelEditor title="图表样式" desc="图题、表题与表格样式" icon="RiBarChart2Line" default-open>
      <ChartRuleEditor
        :fig-caption="props.modelValue.fig_caption"
        :tbl-caption="props.modelValue.tbl_caption"
        :table="props.modelValue.table"
        :table-settings="props.modelValue.table_settings"
      />
    </RulePanelEditor>
    <RulePanelEditor title="目录设置" desc="目录层级与引导符" icon="RiListCheck2" default-open>
      <TOCRuleEditor :params="props.modelValue.toc" />
    </RulePanelEditor>
    <RulePanelEditor title="页眉页脚" desc="页眉页脚内容与位置" icon="RiLayoutTop2Line" default-open>
      <HeaderFooterRuleEditor :params="props.modelValue.header_footer" />
    </RulePanelEditor>
    <RulePanelEditor title="预处理与全局开关" desc="排版前的清理与检测策略" icon="RiBrushLine" default-open>
      <CleanupRuleEditor
        :text-cleanup="props.modelValue.cleanup?.text_cleanup"
        :style-cleanup="props.modelValue.cleanup?.style_cleanup"
        :object-structure="props.modelValue.cleanup?.object_structure"
        :caption-detection="props.modelValue.cleanup?.caption_detection"
        :apply-switches="props.modelValue"
      />
    </RulePanelEditor>
  </div>
</template>

<style scoped>
.typography-editor { display: flex; flex-direction: column; gap: 12px; }
</style>
