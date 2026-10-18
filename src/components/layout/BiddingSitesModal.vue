<template>
  <UiModal
    v-model="visible"
    title="招标采购平台"
    subtitle="涵盖全军装备、航天、船舶、兵器等采购信息"
    icon="ri-globe-line"
    width="1120px"
    :max-width="1400"
    height="90vh"
    :show-footer="false"
  >
    <div class="website-grid">
      <div
        v-for="(site, index) in biddingSites"
        :key="index"
        class="site-card"
      >
        <div class="site-card-top">
          <div class="site-logo">
            <RiTargetLine size="18" />
          </div>
          <div class="site-info">
            <h3 class="site-name">{{ site.name }}</h3>
            <p class="site-desc">{{ site.desc }}</p>
          </div>
        </div>
        <div class="site-card-bottom">
          <a class="site-link" :href="site.url" target="_blank" :title="site.url">
            <RiExternalLinkLine size="14" />
            <span>{{ site.url }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <a
        class="footer-link"
        href="https://www.tbrdh.com/"
        target="_blank"
        rel="noopener"
      >投标人导航网</a>
    </div>
  </UiModal>
</template>

<script setup>
import { computed } from 'vue';
import { UiModal } from '@/components/ui';

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible']);

const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
});

const biddingSites = [
  { name: '全军武器装备采购信息网', desc: '军委装备发展部', url: 'http://www.weain.mil.cn' },
  { name: '军队采购网', desc: '军委后勤保障部', url: 'https://www.plap.mil.cn' },
  { name: '航天电子采购平台', desc: '航天科技 CASC', url: 'https://www.ispacechina.com' },
  { name: '航天科工集中采购平台', desc: '航天科工 CASIC', url: 'https://www.e-casic.com' },
  { name: '中国船舶电子招标投标平台', desc: '中国船舶集团', url: 'https://www.csscbidding.com' },
  { name: '中国电科电子采购平台', desc: '中国电科', url: 'http://www.cetceg.com' },
  { name: '中国兵器电子商务平台', desc: '兵器工业集团', url: 'https://www.norincogroup-ebuy.com' },
  { name: '中国采购与招标网', desc: '国家发改委指导', url: 'https://www.chinabidding.cn' },
  { name: '中招联合招标采购网', desc: '第三方电子招投标', url: 'https://www.365trade.com.cn' },
  { name: '中国仪器进出口集团有限公司招投标平台', desc: '通用技术旗下', url: 'https://bid.cnic.com.cn' },
  { name: '中国华电集团电子商务平台', desc: '华电集团', url: 'https://www.chdtp.com' },
  { name: '中招国际招标有限公司', desc: '国际招标代理', url: 'https://www.cntcitc.com.cn/' },
];
</script>

<style scoped>
.website-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.site-card {
  width: 100%;
  min-width: 0;
  height: 140px;
  background: linear-gradient(180deg, var(--color-bg-white) 0%, var(--color-bg-card) 100%);
  border: 0.7px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 8px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              border-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}
.site-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary) 50%, transparent);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.site-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
  border-color: var(--color-primary);
}
.site-card:hover::before {
  opacity: 0.45;
}
.site-card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
}
.site-logo {
  width: 36px;
  height: 36px;
  background: var(--color-primary-soft);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
}
.site-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6px;
  gap: 1px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
}
.site-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
  line-height: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.site-desc {
  font-size: 9px;
  color: var(--color-text-muted);
  margin: 0;
  text-align: center;
  line-height: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.site-card-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 0.7px solid var(--color-border-soft);
}
.site-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.site-link:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}
.panel-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-link {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
  padding: 6px 16px;
  border-radius: 8px;
  transition: background-color 0.25s ease, opacity 0.25s ease;
}
.footer-link:hover {
  background: var(--color-primary-soft);
  opacity: 0.85;
}
</style>
