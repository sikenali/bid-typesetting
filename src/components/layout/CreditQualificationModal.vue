<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="settings-panel" role="dialog" aria-modal="true">
          <div class="panel-header">
            <div class="header-left">
              <div class="header-icon">
                <RiShieldUserLine size="26" />
              </div>
              <div class="header-text">
                <h2 class="panel-title">信用查询平台</h2>
                <p class="panel-subtitle">企业信用、处罚记录、裁判文书、社会组织及军队采购失信查询</p>
              </div>
            </div>
            <button class="close-btn" title="关闭" @click="close">
              <RiCloseLine class="close-icon" size="20" />
            </button>
          </div>

          <div class="website-grid">
            <div
              v-for="(site, index) in creditSites"
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
            <span class="footer-count">共 {{ creditSites.length }} 个信用资质平台</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible']);

function close() {
  emit('update:visible', false);
}

const creditSites = [
  { name: '国家企业信用信息公示系统', desc: '企业基础信息查询', url: 'https://www.gsxt.gov.cn/index.html' },
  { name: '信用中国', desc: '信用信息总门户', url: 'https://www.creditchina.gov.cn' },
  { name: '政府采购严重违法失信行为记录名单', desc: '政府采购失信', url: 'https://www.ccgp.gov.cn/search/cr/' },
  { name: '中国裁判文书网', desc: '裁判文书查询', url: 'https://wenshu.court.gov.cn' },
  { name: '全国社会组织信用信息公示平台', desc: '社会组织信用', url: 'https://xxgs.chinanpo.mca.gov.cn/gsxt/newList' },
  { name: '军队采购失信名单', desc: '军队采购失信查询', url: 'https://www.plap.mil.cn' },
];
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-fixed);
}

.settings-panel {
  width: 1120px;
  max-width: 94vw;
  max-height: 90vh;
  background: var(--color-bg-secondary);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 18px;
  box-shadow: var(--shadow-xl);
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-soft);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 28px;
}

.panel-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 18px;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  border: none;
  flex-shrink: 0;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.close-btn:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
}

.close-icon {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.close-btn:hover .close-icon {
  color: #ffffff;
}

.website-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.site-card {
  width: 100%;
  min-width: 0;
  height: 140px;
  background: linear-gradient(
    180deg,
    var(--color-bg-white) 0%,
    var(--color-bg-card) 100%
  );
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
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-primary) 50%,
    transparent
  );
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 0.7px solid var(--color-border-soft);
}

.footer-count {
  font-size: 12px;
  color: var(--color-primary);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
