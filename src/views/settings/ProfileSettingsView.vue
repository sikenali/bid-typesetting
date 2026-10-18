<script setup>
import { useSettings } from '@/composables/useSettings';
import UiSwitch from '@/components/ui/UiSwitch.vue';

const settings = useSettings();

function onPreviewChange(v) {
  settings.previewEnabled.value = v;
}
function onClearStylesChange(v) {
  settings.clearStylesEnabled.value = v;
}
function onAnnotationChange(v) {
  settings.annotationEnabled.value = v;
}
function onHighlightChange(v) {
  settings.highlightEnabled.value = v;
}
</script>

<template>
  <div class="settings-view">
    <div class="page-header-card">
      <div class="breadcrumb">
        首页 <span class="sep">/</span> 设置中心 <span class="sep">/</span> <b>个性设置</b>
      </div>
      <h1 class="page-title">个性设置</h1>
      <p class="page-desc">自定义界面显示偏好与排版行为开关</p>
    </div>

    <div class="section-card">
      <div class="section-title">
        <RiEyeLine size="18" />
        <span>显示偏好</span>
      </div>
      <p class="section-desc">控制预览按钮与文档批注展示方式，所有开关即时生效</p>

      <div class="switch-list">
        <div class="switch-row">
          <div class="switch-left">
            <div class="switch-icon">
              <RiEyeLine size="18" />
            </div>
            <div class="switch-text">
              <div class="switch-name">排版效果预览</div>
              <div class="switch-desc">是否显示「预览」按钮，用于查看六个排版面板的参数效果</div>
            </div>
          </div>
          <UiSwitch :model-value="settings.previewEnabled.value" @update:model-value="onPreviewChange" />
        </div>

        <div class="switch-row">
          <div class="switch-left">
            <div class="switch-icon">
              <RiBrushLine size="18" />
            </div>
            <div class="switch-text">
              <div class="switch-name">清除文档样式</div>
              <div class="switch-desc">排版前清除原有样式，会同步到清理开关的清除全部样式项</div>
            </div>
          </div>
          <UiSwitch :model-value="settings.clearStylesEnabled.value" @update:model-value="onClearStylesChange" />
        </div>

        <div class="switch-row">
          <div class="switch-left">
            <div class="switch-icon">
              <RiFileEditLine size="18" />
            </div>
            <div class="switch-text">
              <div class="switch-name">批注形式展示</div>
              <div class="switch-desc">以批注气泡形式在文档右侧展示修改建议</div>
            </div>
          </div>
          <UiSwitch :model-value="settings.annotationEnabled.value" @update:model-value="onAnnotationChange" />
        </div>

        <div class="switch-row switch-row-last">
          <div class="switch-left">
            <div class="switch-icon">
              <RiMarkPenLine size="18" />
            </div>
            <div class="switch-text">
              <div class="switch-name">高亮修改处</div>
              <div class="switch-desc">排版完成后高亮标记文档中被修改的内容</div>
            </div>
          </div>
          <UiSwitch :model-value="settings.highlightEnabled.value" @update:model-value="onHighlightChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 20px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-header-card {
  background: var(--color-bg-white);
  border-radius: 16px;
  padding: 20px 24px;
}
.breadcrumb {
  font-size: 13px;
  color: var(--color-text-faint);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-family: var(--font-family-cn);
}
.breadcrumb .sep { color: var(--color-text-faint); }
.breadcrumb b { color: var(--color-text-body); font-weight: 500; }
.page-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  margin: 0;
  font-family: var(--font-family-cn);
  line-height: 1.2;
}
.page-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 8px 0 0;
  font-family: var(--font-family-cn);
}
.section-card {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 24px 28px;
}
.section-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: var(--font-family-cn);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.section-title > svg { color: var(--color-primary); }
.section-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 6px 0 16px;
  font-family: var(--font-family-cn);
}

.switch-list { display: flex; flex-direction: column; }
.switch-row {
  min-height: 64px;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 0.7px solid var(--color-border-soft);
}
.switch-row-last { border-bottom: none; }
.switch-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.switch-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.switch-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.switch-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-body);
  font-family: var(--font-family-cn);
}
.switch-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: var(--font-family-cn);
  line-height: 1.5;
}
</style>
