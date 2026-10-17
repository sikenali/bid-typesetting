<script setup>
import { BRAND_NAME, BRAND_PRODUCT, BRAND_SERIES, BRAND_POWERED, BRAND_POWERED_URL, BRAND_YEAR } from '@/constants/brand';

const VERSION = 'v1.1.6';

const seriesMembers = [
  { name: '文版猩', tag: '标书排版', active: true },
  { name: '文抽猩', tag: '标书抽取', active: false },
  { name: '文比猩', tag: '标书比对', active: false },
  { name: '文算猩', tag: '标书造价', active: false },
];
</script>

<template>
  <div class="settings-view">
    <div class="page-header-card">
      <div class="breadcrumb">
        首页 <span class="sep">/</span> 设置中心 <span class="sep">/</span> <b>关于</b>
      </div>
      <h1 class="page-title">关于</h1>
      <p class="page-desc">了解产品版本、系列成员与版权信息</p>
    </div>

    <div class="section-card hero-card">
      <div class="hero-inner">
        <div class="brand-logo">
          <RiTargetLine size="40" />
        </div>
        <div class="brand-info">
          <div class="brand-name">
            <h2>{{ BRAND_NAME }}</h2>
            <span class="version-tag">{{ VERSION }}</span>
          </div>
          <p class="brand-product">{{ BRAND_PRODUCT }}</p>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">
        <RiQuotableLine size="18" />
        <span>功能介绍</span>
      </div>
      <p class="section-desc">
        文版猩面向投标场景，提供一键式文档排版能力。上传 Word、Excel、PPT、PDF 等格式文件，即可按 GB/T 7714、GB/T 9704、GJB 438C 等国家标准与自定义模板自动应用字体、行距、页边距、页眉页脚与图表格式。所有排版动作在本地完成，保护文档隐私，同时支持多 AI 服务商接入以处理生成与摘要类辅助任务。
      </p>
    </div>

    <div class="section-card">
      <div class="section-title">
        <RiAppsAddLine size="18" />
        <span>{{ BRAND_SERIES }}</span>
      </div>
      <p class="section-desc">文版猩是回旋标工具系列的一员，与以下产品共同覆盖招投标全流程</p>

      <div class="member-list">
        <div
          v-for="m in seriesMembers"
          :key="m.name"
          class="member-item"
          :class="{ 'is-active': m.active }"
        >
          <div class="member-icon">
            <RiTargetLine size="18" />
          </div>
          <div class="member-text">
            <div class="member-name">
              {{ m.name }}
              <span v-if="m.active" class="member-badge">当前</span>
            </div>
            <div class="member-tag">{{ m.tag }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span class="footer-left">
        &copy; {{ BRAND_YEAR }} {{ BRAND_NAME }}
      </span>
      <a class="footer-right" :href="BRAND_POWERED_URL" target="_blank" rel="noopener noreferrer">
        {{ BRAND_POWERED }}
        <RiExternalLinkLine size="13" />
      </a>
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
.hero-card {
  padding: 40px 32px;
  display: flex;
  justify-content: center;
  background:
    radial-gradient(circle at 15% 20%, var(--color-primary-soft) 0%, transparent 55%),
    radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 55%),
    var(--color-bg-white);
}
.hero-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}
.brand-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 22%, transparent);
}
.brand-info { display: flex; flex-direction: column; gap: 6px; }
.brand-name {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-name h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  font-family: var(--font-family-cn);
  letter-spacing: -0.3px;
}
.version-tag {
  padding: 3px 10px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-family);
  border: 0.7px solid color-mix(in srgb, var(--color-primary) 24%, transparent);
}
.brand-product {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 0;
  font-family: var(--font-family-cn);
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
  margin: 8px 0 0;
  font-family: var(--font-family-cn);
  line-height: 1.7;
}

.member-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.member-item {
  border: 0.7px solid var(--color-border-soft);
  border-radius: 12px;
  background: var(--color-bg-card);
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s, background-color 0.2s;
}
.member-item:hover { border-color: var(--color-border); }
.member-item.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}
.member-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--color-bg-white);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.member-item.is-active .member-icon {
  background: var(--color-primary);
  color: var(--color-bg-white);
}
.member-text { min-width: 0; }
.member-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text-body);
  font-family: var(--font-family-cn);
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.member-item.is-active .member-name { color: var(--color-primary); }
.member-badge {
  padding: 1px 6px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--color-bg-white);
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
}
.member-tag {
  font-size: 11.5px;
  color: var(--color-text-muted);
  font-family: var(--font-family-cn);
  margin-top: 2px;
}

.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: var(--font-family-cn);
}
.footer-right {
  color: var(--color-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.2s;
}
.footer-right:hover { opacity: 0.8; text-decoration: underline; }
</style>
