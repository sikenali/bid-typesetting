<script setup>
import { ref, computed } from 'vue'
import { confirmDialog } from '@/utils/confirm'

const emit = defineEmits(['close', 'select', 'delete', 'edit'])
const props = defineProps({
  templates: { type: Array, required: true },
})

const searchKeyword = ref('')
const activeCategory = ref('all')

const categories = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '公文' },
  { id: 'academic', label: '学术' },
  { id: 'military', label: '军标' },
  { id: 'business', label: '商务' },
  { id: 'creative', label: '创意' },
]

const CATEGORY_MAP = {
  official: '公文',
  academic: '学术',
  military: '军标',
  business: '商务',
  creative: '创意',
}

function formatCategory(cat) {
  return CATEGORY_MAP[cat] || (cat || '未分类')
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const filteredTemplates = computed(() => {
  return props.templates.filter(tpl => {
    const kw = searchKeyword.value.trim().toLowerCase()
    const matchSearch = !kw || (tpl.name || '').toLowerCase().includes(kw)
    const matchCategory = activeCategory.value === 'all' || tpl.category === activeCategory.value
    return matchSearch && matchCategory
  })
})

function handleSelect(tpl) {
  emit('select', tpl)
}

async function handleDelete(e, tpl) {
  e.stopPropagation()
  if (!(await confirmDialog('确定删除此模板吗？'))) return
  emit('delete', tpl.id)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="overlay" @click.self="emit('close')">
        <div class="modal-card" role="dialog" aria-modal="true">
          <header class="modal-header">
            <div class="header-left">
              <div class="header-icon"><RiBook2Line size="18" /></div>
              <span class="header-title">载入模板</span>
              <span class="header-count">共 {{ filteredTemplates.length }} 个</span>
            </div>
            <button class="close-btn" @click="emit('close')" aria-label="关闭">
              <RiCloseLine size="18" />
            </button>
          </header>

          <div class="toolbar">
            <div class="search-box">
              <RiSearchLine size="16" class="search-icon" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索模板名称…"
                class="search-input"
              />
              <button
                v-if="searchKeyword"
                class="clear-btn"
                @click="searchKeyword = ''"
                aria-label="清空"
              >
                <RiCloseLine size="14" />
              </button>
            </div>
            <div class="chip-group">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                class="chip"
                :class="{ active: activeCategory === cat.id }"
                @click="activeCategory = cat.id"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="list-wrap">
            <div v-if="filteredTemplates.length === 0" class="empty">
              <RiFolderOpenLine size="40" class="empty-icon" />
              <p class="empty-title">暂无匹配的模板</p>
              <p class="empty-desc">尝试更换搜索关键词或分类筛选</p>
            </div>

            <div v-else class="list">
              <div
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                class="row"
                @click="handleSelect(tpl)"
              >
                <div class="row-icon">
                  <RiFileTextLine size="18" />
                </div>
                <div class="row-body">
                  <div class="row-title-row">
                    <span class="row-name">{{ tpl.name }}</span>
                    <span class="tag" :class="tpl.builtIn ? 'tag-builtin' : 'tag-custom'">
                      {{ tpl.builtIn ? '内置' : '自定义' }}
                    </span>
                  </div>
                  <div class="row-meta">
                    <span>{{ formatCategory(tpl.category) }}</span>
                    <span v-if="tpl.createdAt" class="dot">·</span>
                    <span v-if="tpl.createdAt">{{ formatDate(tpl.createdAt) }}</span>
                  </div>
                </div>
                <div class="row-actions">
                  <button
                    class="action-btn"
                    title="预览"
                    @click.stop="handleSelect(tpl)"
                  >
                    <RiEyeLine size="15" />
                  </button>
                  <button
                    class="action-btn action-primary"
                    title="应用"
                    @click.stop="handleSelect(tpl)"
                  >
                    <RiDownload2Line size="15" />
                  </button>
                  <button
                    v-if="!tpl.builtIn"
                    class="action-btn action-danger"
                    title="删除"
                    @click.stop="handleDelete($event, tpl)"
                  >
                    <RiDeleteBinLine size="15" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: var(--z-modal);
}
.modal-card {
  width: 720px;
  max-width: 100%;
  height: 80vh;
  max-height: 720px;
  background: var(--color-bg-white);
  border-radius: 18px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  height: 60px;
  padding: 0 20px;
  border-bottom: 0.7px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.header-count {
  font-size: 12px;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  padding: 3px 10px;
  border-radius: 9999px;
}
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.close-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.toolbar {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 0.7px solid var(--color-border-soft);
  flex-shrink: 0;
}
.search-box {
  position: relative;
  flex: 1;
  min-width: 0;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-faint);
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 38px;
  background: var(--color-bg-card);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  font-family: inherit;
  transition: border-color var(--transition-base), background-color var(--transition-base);
}
.search-input::placeholder {
  color: var(--color-text-faint);
}
.search-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-white);
}
.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.clear-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.chip-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  height: 30px;
  padding: 0 12px;
  border-radius: 9999px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-base);
}
.chip:hover {
  border-color: var(--color-primary);
}
.chip.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary-deep);
  font-weight: 500;
}
.list-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
}
.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.empty-icon {
  color: var(--color-text-faint);
}
.empty-title {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 500;
}
.empty-desc {
  font-size: 13px;
  color: var(--color-text-faint);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 0.7px solid var(--color-border-soft);
  border-radius: 12px;
  background: var(--color-bg-white);
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.row:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.row-icon {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.row-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.row-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
  flex-shrink: 0;
}
.tag-builtin {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
}
.tag-custom {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
}
.row-meta {
  font-size: 13px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.row-meta .dot {
  color: var(--color-text-faint);
}
.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
}
.action-danger:hover {
  background: var(--color-error-soft);
  color: var(--color-error);
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.96);
}
</style>
