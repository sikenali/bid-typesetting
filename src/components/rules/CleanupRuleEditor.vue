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
        <CheckboxField v-model="textCleanup.add_space_between_cn_en" label="中英文间加空格" />
        <CheckboxField v-model="textCleanup.punctuation_clean" label="标点符号清理" />
        <CheckboxField v-model="textCleanup.clear_superscript" label="清除上标" />
        <CheckboxField v-model="textCleanup.soft_enter_to_hard" label="软回车转硬回车" />
        <CheckboxField v-model="textCleanup.markdown_tags_to_plaintext" label="Markdown转纯文本" />
      </div>
    </div>

    <div class="clean-group">
      <div class="group-title">样式清理</div>
      <div class="rules-grid">
        <CheckboxField v-model="styleCleanup.clear_all_styles" label="清除所有样式" />
        <CheckboxField v-model="styleCleanup.clear_align_grid" label="清除对齐网格" />
        <CheckboxField v-model="styleCleanup.clear_extra_spaces" label="清除多余空格" />
        <CheckboxField v-model="styleCleanup.clean_after_formatting" label="格式化后清理" />
        <CheckboxField v-model="styleCleanup.remove_extra_blank_lines" label="删除多余空行" />
      </div>
    </div>

    <div class="clean-group">
      <div class="group-title">应用范围</div>
      <div class="rules-grid">
        <CheckboxField v-model="applySwitches.apply_page" label="应用页面设置" />
        <CheckboxField v-model="applySwitches.apply_body" label="应用正文格式" />
        <CheckboxField v-model="applySwitches.apply_headings" label="应用标题格式" />
        <CheckboxField v-model="applySwitches.apply_figtbl" label="应用图题表题" />
        <CheckboxField v-model="applySwitches.apply_toc" label="应用目录" />
        <CheckboxField v-model="applySwitches.apply_header_footer" label="应用页眉页脚" />
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
