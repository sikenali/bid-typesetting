<script setup>
import { computed } from 'vue';

const props = defineProps({
  formatParams: { type: Object, required: true },
});

const fp = computed(() => props.formatParams || {});

function fmt(v, fallback = '—') {
  return v === undefined || v === null || v === '' ? fallback : String(v);
}
function font(item) {
  if (!item) return '—';
  return [item.cn_font, item.size_cn, item.bold ? '粗' : '', item.italic ? '斜' : '']
    .filter(Boolean).join(' · ');
}
</script>

<template>
  <div class="typography-preview">
    <div class="card" v-if="fp.page">
      <h4><RiPagesLine class="card-icon" /> 页面</h4>
      <p>纸张：{{ fmt(fp.page.paper_size) }} · {{ fmt(fp.page.orientation, '纵向') }}</p>
      <p>上 {{ fmt(fp.page.top_cm) }} / 下 {{ fmt(fp.page.bottom_cm) }} / 左 {{ fmt(fp.page.left_cm) }} / 右 {{ fmt(fp.page.right_cm) }} cm</p>
    </div>
    <div class="card" v-if="fp.body">
      <h4><RiTextSnippet class="card-icon" /> 正文</h4>
      <p>{{ font(fp.body) }}</p>
      <p>行距：{{ fmt(fp.body.line_spacing_mode) }} × {{ fmt(fp.body.line_spacing_value) }} · 首行缩进 {{ fmt(fp.body.first_line_indent_chars, '0') }} 字符</p>
    </div>
    <div class="card" v-if="fp.headings && fp.headings.length">
      <h4><RiHeading class="card-icon" /> 标题</h4>
      <p v-for="(h, i) in fp.headings.slice(0, 3)" :key="i">H{{ i + 1 }}：{{ font(h) }}</p>
    </div>
    <div class="card" v-if="fp.fig_caption || fp.tbl_caption">
      <h4><RiBarChart2Line class="card-icon" /> 图表题</h4>
      <p>图：{{ font(fp.fig_caption) }}</p>
      <p>表：{{ font(fp.tbl_caption) }}</p>
    </div>
    <div class="card" v-if="fp.toc && fp.toc.enable">
      <h4><RiListCheck2 class="card-icon" /> 目录</h4>
      <p>标题：{{ fmt(fp.toc.title_text, '目录') }} · 层级数 {{ fp.toc.level_styles?.length || 0 }}</p>
    </div>
    <div class="card" v-if="fp.header_footer">
      <h4><RiLayoutTop2Line class="card-icon" /> 页眉页脚</h4>
      <p>页眉：{{ fp.header_footer.enable_header ? '启用' : '关闭' }} · {{ fmt(fp.header_footer.header_text) }}</p>
      <p>页脚：{{ fp.header_footer.enable_footer ? '启用' : '关闭' }} · 页码 {{ fmt(fp.header_footer.footer_page_number_type) }}</p>
    </div>
  </div>
</template>

<style scoped>
.typography-preview { display: flex; flex-direction: column; gap: 12px; }
.card {
  padding: 14px 16px;
  background: var(--color-bg-secondary, #F7F3EA);
  border-radius: 12px;
  border: 0.7px solid var(--color-border-soft, #EDE9E0);
}
.card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon { color: var(--color-primary); display: inline-flex; }
.card p {
  margin: 2px 0;
  font-size: 13px;
  color: var(--color-text-body);
  line-height: 1.6;
}
</style>
