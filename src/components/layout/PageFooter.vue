<template>
  <footer class="page-footer">
    <div class="footer-brand">
      <RiTargetLine class="tool-logo" size="20" />
      <span class="footer-brand-text">{{ BRAND_SERIES }}</span>
    </div>

    <div class="footer-actions">
      <button class="footer-icon-btn" title="企业信用" @click="emitCredit">
        <RiShieldUserLine class="footer-icon" size="14" />
      </button>
      <button class="footer-icon-btn" title="招标网站" @click="emitBidding">
        <RiGlobeLine class="footer-icon" size="14" />
      </button>
    </div>

    <span class="footer-copy">
      © {{ BRAND_YEAR }} {{ BRAND_NAME }}
      <a
        class="footer-link"
        :href="BRAND_POWERED_URL"
        target="_blank"
        rel="noopener"
      >{{ BRAND_POWERED }}</a>
    </span>
  </footer>
</template>

<script setup>
import {
  BRAND_NAME,
  BRAND_SERIES,
  BRAND_YEAR,
  BRAND_POWERED,
  BRAND_POWERED_URL,
} from '@/constants/brand';

const emit = defineEmits(['credit-query', 'bidding-sites']);

function emitCredit() {
  emit('credit-query');
}

function emitBidding() {
  emit('bidding-sites');
}
</script>

<style scoped>
.page-footer {
  position: relative;
  height: 58px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(
    180deg,
    var(--color-bg-white) 0%,
    var(--color-bg-secondary) 100%
  );
  border-top: 1px solid var(--color-border-soft);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tool-logo {
  color: var(--color-primary);
  line-height: 1;
  flex-shrink: 0;
}

.footer-brand-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-body);
  white-space: nowrap;
}

.footer-actions {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.footer-icon-btn:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
}

.footer-icon {
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.footer-icon-btn:hover .footer-icon {
  color: #ffffff;
}

.footer-copy {
  font-size: 14px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.footer-link {
  color: var(--color-primary);
  text-decoration: none;
  margin-left: 4px;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
