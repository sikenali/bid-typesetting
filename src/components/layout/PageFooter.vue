<template>
  <footer class="page-footer">
    <div class="footer-brand">
      <RiTargetLine class="tool-logo" size="20" />
      <span class="footer-brand-text">{{ BRAND_SERIES }}</span>
    </div>

    <div class="footer-actions">
      <UiTip text="企业信用" placement="top">
        <button class="footer-icon-btn" @click="emitCredit">
          <RiShieldCheckLine class="footer-icon" size="14" />
        </button>
      </UiTip>
      <UiTip text="招标网站" placement="top">
        <button class="footer-icon-btn" @click="emitBidding">
          <RiLinksLine class="footer-icon" size="14" />
        </button>
      </UiTip>
    </div>

    <span class="footer-copy">
      © {{ BRAND_YEAR }} {{ BRAND_NAME }} · Powered by
      <a
        class="footer-link"
        href="https://lazycat.cloud/"
        target="_blank"
        rel="noopener noreferrer"
      >LightOS</a>
    </span>
  </footer>
</template>

<script setup>
import {
  BRAND_NAME,
  BRAND_SERIES,
  BRAND_YEAR,
  BRAND_POWERED_URL,
} from '@/constants/brand';
import { UiTip } from '@/components/ui';

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
  border-top: 0.7px solid var(--color-border-soft);
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
  background-color: var(--color-bg-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.footer-icon-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary, #fff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.footer-icon {
  color: inherit;
  transition: color 0.25s ease;
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
