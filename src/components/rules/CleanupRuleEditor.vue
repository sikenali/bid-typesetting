<script setup>
import CheckboxField from '../ui/CheckboxField.vue'

defineProps({
  textCleanup: { type: Object, required: true },
  styleCleanup: { type: Object, required: true },
  objectStructure: { type: Object, required: true },
  captionDetection: { type: Object, required: true },
  applySwitches: { type: Object, required: true },
})
</script>

<template>
  <div class="cleanup-editor">
    <div class="clean-group">
      <div class="group-title">文本处理</div>
      <div class="rules-grid">
        <CheckboxField v-model="textCleanup.punctuation_clean" label="标点符号清理" />
        <CheckboxField v-model="textCleanup.clear_superscript" label="清除上标" />
        <CheckboxField v-model="textCleanup.soft_enter_to_hard" label="软回车转硬回车" />
        <CheckboxField v-model="textCleanup.markdown_tags_to_plaintext" label="Markdown转纯文本" />
        <CheckboxField v-model="textCleanup.tab_to_spaces_enabled" label="Tab转空格" />
      </div>
    </div>

    <div class="clean-group">
      <div class="group-title">样式清理</div>
      <div class="rules-grid">
        <CheckboxField v-model="styleCleanup.clear_all_styles" label="清除所有样式" />
        <CheckboxField v-model="styleCleanup.clear_align_grid" label="清除对齐网格" />
        <CheckboxField v-model="styleCleanup.clear_extra_spaces" label="清除多余空格" />
        <CheckboxField v-model="styleCleanup.clear_paragraph_indent" label="清除段落缩进" />
        <CheckboxField v-model="styleCleanup.clear_heading_indent" label="清除标题缩进" />
        <CheckboxField v-model="styleCleanup.clean_after_formatting" label="格式化后清理" />
        <CheckboxField v-model="styleCleanup.remove_extra_blank_lines" label="删除多余空行" />
        <CheckboxField v-model="styleCleanup.clear_chart_format" label="清除图表格式" />
      </div>
    </div>

    <div class="clean-group">
      <div class="group-title">对象结构</div>
      <div class="rules-grid">
        <CheckboxField v-model="objectStructure.object_wrapping" label="清除对象环绕" />
        <CheckboxField v-model="objectStructure.collapse_sdt_tags" label="折叠SDT标签" />
      </div>
    </div>

    <div class="clean-group">
      <div class="group-title">图表标题检测</div>
      <div class="rules-grid">
        <CheckboxField v-model="captionDetection.fig_detection_enabled" label="自动检测图标题" />
        <CheckboxField v-model="captionDetection.tbl_detection_enabled" label="自动检测表标题" />
      </div>
    </div>

    <div class="clean-group">
      <div class="group-title">应用范围</div>
      <div class="rules-grid">
        <CheckboxField v-model="applySwitches.apply_page" label="应用页面设置" />
        <CheckboxField v-model="applySwitches.apply_body" label="应用正文格式" />
        <CheckboxField v-model="applySwitches.apply_headings" label="应用标题格式" />
        <CheckboxField v-model="applySwitches.apply_figtbl" label="应用图题表题" />
        <CheckboxField v-model="applySwitches.apply_table" label="应用表格格式" />
        <CheckboxField v-model="applySwitches.apply_toc" label="应用目录" />
        <CheckboxField v-model="applySwitches.apply_header_footer" label="应用页眉页脚" />
        <CheckboxField v-model="applySwitches.apply_numbering" label="应用编号模式" />
        <CheckboxField v-model="applySwitches.auto_refresh_fields" label="自动刷新域" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.clean-group { margin-bottom: 18px; }
.clean-group:last-child { margin-bottom: 0; }
.group-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 0.7px solid var(--color-border-soft);
}
.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
}
</style>
