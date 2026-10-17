<script setup>
/**
 * UiSelect — 统一下拉框（替换原生 select，主题化面板 + 选中勾）
 * 支持 options 分组（group 字段），v-model 绑定 value
 *
 * @example
 * <UiSelect v-model="provider" :options="providers" placeholder="选择供应商" />
 * <UiSelect v-model="m" :options="[{ value: 'a', label: 'A', group: '常用' }]" />
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  /** sm=36px md=44px */
  size: { type: String, default: 'md' },
  /** 面板最大高度 */
  maxHeight: { type: Number, default: 260 },
});

const emit = defineEmits(['update:modelValue', 'change']);

const open = ref(false);
const root = ref(null);

const selected = computed(() => props.options.find(o => o.value === props.modelValue));

const groups = computed(() => {
  const order = [];
  const map = new Map();
  for (const o of props.options) {
    const g = o.group ?? '';
    if (!map.has(g)) { map.set(g, []); order.push(g); }
    map.get(g).push(o);
  }
  return order.map(g => ({ name: g, items: map.get(g) }));
});

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}
function close() { open.value = false; }
function pick(o) {
  if (o.disabled) return;
  emit('update:modelValue', o.value);
  emit('change', o.value);
  open.value = false;
}
function onDocClick(ev) {
  if (root.value && !root.value.contains(ev.target)) open.value = false;
}
function onKey(ev) {
  if (ev.key === 'Escape') open.value = false;
}
onMounted(() => {
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
  document.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="root" class="ui-select" :class="['is-' + size, { 'is-open': open, 'is-disabled': disabled }]">
    <button type="button" class="ui-select-btn" :disabled="disabled" @click.stop="toggle">
      <span class="ui-select-value" :class="{ 'is-empty': !selected }">
        {{ selected ? selected.label : placeholder }}
      </span>
      <RiArrowDownSLine :size="16" class="ui-select-arrow" :class="{ 'is-open': open }" />
    </button>
    <transition name="ui-select-pop">
      <div v-if="open" class="ui-select-panel" :style="{ maxHeight: maxHeight + 'px' }">
        <template v-for="g in groups" :key="g.name">
          <div v-if="g.name" class="ui-select-group">{{ g.name }}</div>
          <div
            v-for="o in g.items"
            :key="String(o.value)"
            class="ui-select-item"
            :class="{ 'is-selected': o.value === modelValue, 'is-disabled': o.disabled }"
            @click.stop="pick(o)"
          >
            <span class="ui-select-item-main">
              <span class="ui-select-item-label">{{ o.label }}</span>
              <span v-if="o.desc" class="ui-select-item-desc">{{ o.desc }}</span>
            </span>
            <RiCheckLine v-if="o.value === modelValue" :size="15" class="ui-select-check" />
          </div>
        </template>
        <div v-if="options.length === 0" class="ui-select-empty">暂无选项</div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.ui-select { position: relative; display: inline-block; width: 100%; }
.ui-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background-color: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  padding: 0 14px 0 16px;
  font-size: 14px;
  color: var(--color-text-body);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
  font-family: var(--font-family-cn);
}
.is-md .ui-select-btn { height: 44px; }
.is-sm .ui-select-btn { height: 36px; font-size: 13px; }
.ui-select-btn:hover:not(:disabled) { border-color: var(--color-border-hover); }
.is-open .ui-select-btn, .ui-select-btn:focus-visible {
  border-color: var(--color-primary);
  background-color: var(--color-bg-white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.ui-select-value { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ui-select-value.is-empty { color: var(--color-text-muted); }
.ui-select-arrow { color: var(--color-text-faint); transition: transform 0.2s; flex-shrink: 0; }
.ui-select-arrow.is-open { transform: rotate(180deg); color: var(--color-primary); }
.is-disabled .ui-select-btn { background-color: var(--color-bg-secondary); color: var(--color-text-muted); cursor: not-allowed; }

.ui-select-panel {
  position: absolute;
  z-index: var(--z-dropdown);
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  min-width: 100%;
  overflow-y: auto;
  background-color: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: var(--shadow-lg);
}
.ui-select-group {
  padding: 8px 10px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.ui-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.12s;
}
.ui-select-item:hover:not(.is-disabled) { background-color: var(--color-bg-secondary); }
.ui-select-item.is-selected { background-color: var(--color-primary-soft); }
.ui-select-item-main { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.ui-select-item-label {
  font-size: 13.5px;
  color: var(--color-text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ui-select-item.is-selected .ui-select-item-label { color: var(--color-primary); font-weight: 500; }
.ui-select-item-desc { font-size: 12px; color: var(--color-text-muted); }
.ui-select-check { color: var(--color-primary); flex-shrink: 0; }
.ui-select-item.is-disabled { opacity: 0.45; cursor: not-allowed; }
.ui-select-empty { padding: 14px; text-align: center; font-size: 13px; color: var(--color-text-muted); }

.ui-select-pop-enter-active, .ui-select-pop-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.ui-select-pop-enter-from, .ui-select-pop-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
