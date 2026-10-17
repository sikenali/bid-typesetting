<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/toast'
import { useTemplates } from '../composables/useTemplates'
import { useFormatState } from '../composables/useFormatState'
import { useDocument } from '../composables/useDocument'
import PreviewTemplateModal from '../components/PreviewTemplateModal.vue'
import TopNav from '../components/layout/TopNav.vue'
import PageFooter from '../components/layout/PageFooter.vue'
import CreditQualificationModal from '../components/layout/CreditQualificationModal.vue'
import BiddingSitesModal from '../components/layout/BiddingSitesModal.vue'

const router = useRouter()
const { templates, categoryMeta } = useTemplates()
const { loadFormatParams } = useFormatState()
const { getFile } = useDocument()

const showSettings = ref(false)
const showCredit = ref(false)
const showBidding = ref(false)

const activeCategory = ref('all')
const searchKeyword = ref('')

const categories = [
  { id: 'all', label: '全部', icon: 'RiBookOpenLine' },
  { id: 'official', label: '公文', icon: 'RiGovernmentLine' },
  { id: 'academic', label: '学术', icon: 'RiBook2Line' },
  { id: 'military', label: '军标', icon: 'RiShieldStarLine' },
  { id: 'business', label: '商务', icon: 'RiBarChart2Line' },
  { id: 'creative', label: '创意', icon: 'RiPaintBrushLine' },
]

const categoryLabels = computed(() => {
  const map = { all: '全部' }
  for (const [k, v] of Object.entries(categoryMeta)) {
    map[k] = v.label
  }
  return map
})

const filteredTemplates = computed(() => {
  let list = templates.value
  if (activeCategory.value !== 'all') {
    list = list.filter(t => t.category === activeCategory.value)
  }
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(t => (t.name || '').toLowerCase().includes(kw) || (t.description || '').toLowerCase().includes(kw))
  }
  return list
})

const selectedTemplate = ref(null)

function selectTemplate(tpl) {
  selectedTemplate.value = tpl
}

function previewSelected() {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择一个模板')
    return
  }
}

const showPreviewModal = ref(false)

function applySelected() {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择一个模板')
    return
  }
  if (!getFile()) {
    ElMessage.warning('请先上传文档')
    return
  }
  if (selectedTemplate.value.formatParams) {
    loadFormatParams(selectedTemplate.value.formatParams)
  }
  router.push('/editor')
}

function openPreview(tpl) {
  if (!tpl) return
  selectedTemplate.value = tpl
  showPreviewModal.value = true
}

const currentCategoryLabel = computed(() => {
  if (activeCategory.value === 'all') return '全部模板'
  return `${categoryLabels.value[activeCategory.value] || activeCategory.value}模板`
})

const currentCategoryDesc = computed(() => {
  if (activeCategory.value === 'all') return '浏览所有保存的排版模板'
  return `浏览${categoryLabels.value[activeCategory.value]}类排版模板`
})
</script>

<template>
  <div class="template-page">
    <TopNav title="模板库" :show-back="true" @open-settings="showSettings = true" />

    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-title">
          <h3>模板书架</h3>
          <p>选择或管理您的排版模板</p>
        </div>
        <div class="category-list">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="category-item"
            :class="{ active: activeCategory === cat.id }"
            @click="activeCategory = cat.id"
          >
            <component :is="cat.icon" size="18" class="cat-icon" />
            <span class="cat-label">{{ cat.label }}</span>
            <span v-if="cat.id === 'all'" class="cat-count">{{ templates.length }}</span>
          </button>
        </div>
      </aside>

      <main class="content">
        <div class="content-header">
          <div class="header-left">
            <h2>{{ currentCategoryLabel }}</h2>
            <p>{{ currentCategoryDesc }}</p>
          </div>
          <div class="search-box">
            <RiSearchLine size="16" class="search-icon" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索模板名称或描述…"
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
        </div>

        <div class="content-body">
          <div v-if="filteredTemplates.length === 0" class="empty">
            <RiBookOpenLine size="48" class="empty-icon" />
            <p class="empty-title">暂无可用模板</p>
            <p class="empty-desc">在编辑器中点击「保存到模板」来创建您的自定义模板</p>
          </div>

          <div v-else class="grid">
            <article
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              class="card"
              :class="{ selected: selectedTemplate && selectedTemplate.id === tpl.id }"
              @click="selectTemplate(tpl)"
            >
              <div class="card-top">
                <div class="card-icon">
                  <RiFileTextLine size="20" />
                </div>
                <div class="card-tags">
                  <span class="tag tag-cat">{{ categoryLabels[tpl.category] || '未分类' }}</span>
                  <span class="tag" :class="tpl.builtIn ? 'tag-builtin' : 'tag-custom'">
                    {{ tpl.builtIn ? '内置' : '自定义' }}
                  </span>
                </div>
              </div>
              <h3 class="card-name">{{ tpl.name }}</h3>
              <p class="card-desc">{{ tpl.description || '用户保存的自定义排版模板' }}</p>
              <div class="card-foot">
                <span class="card-status">
                  <span class="dot" :class="selectedTemplate && selectedTemplate.id === tpl.id ? 'dot-on' : 'dot-off'"></span>
                  <span>{{ selectedTemplate && selectedTemplate.id === tpl.id ? '已选' : '未选' }}</span>
                </span>
                <button
                  type="button"
                  class="apply-btn"
                  @click.stop="applySelected()"
                >
                  <RiDownload2Line size="14" />
                  <span>应用</span>
                </button>
              </div>
            </article>
          </div>

          <div v-if="selectedTemplate" class="selected-bar">
            <div class="selected-left">
              <RiLayout3Line size="18" class="selected-icon" />
              <span class="selected-label">已选：</span>
              <span class="selected-name">{{ selectedTemplate.name }}</span>
            </div>
            <div class="selected-right">
              <button
                type="button"
                class="btn-outline"
                @click="openPreview(selectedTemplate)"
              >
                <RiEyeLine size="16" />
                <span>预览模板</span>
              </button>
              <button
                type="button"
                class="btn-primary"
                @click="applySelected"
              >
                <RiCheckLine size="16" />
                <span>应用所选模板</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <PageFooter @credit-query="showCredit = true" @bidding-sites="showBidding = true" />

    <PreviewTemplateModal
      v-if="showPreviewModal && selectedTemplate"
      :template="selectedTemplate"
      @close="showPreviewModal = false"
    />

    <CreditQualificationModal v-model:visible="showCredit" />
    <BiddingSitesModal v-model:visible="showBidding" />
  </div>
</template>

<style scoped>
.template-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-main);
}
.layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-bg-white);
  border-right: 0.7px solid var(--color-border-soft);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sidebar-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.sidebar-title p {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}
.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.category-item {
  height: 46px;
  border-radius: 10px;
  padding: 0 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  color: var(--color-text-body);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color var(--transition-base), color var(--transition-base);
  text-align: left;
}
.category-item:hover {
  background: var(--color-bg-secondary);
}
.category-item.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
  font-weight: 500;
}
.cat-icon {
  flex-shrink: 0;
  color: currentColor;
}
.cat-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cat-count {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 9999px;
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
}
.category-item.active .cat-count {
  background: var(--color-bg-white);
  color: var(--color-primary-deep);
}
.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content-header {
  padding: 24px 32px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-shrink: 0;
}
.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.header-left p {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
.search-box {
  position: relative;
  width: 100%;
  max-width: 400px;
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
  height: 42px;
  padding: 0 36px 0 38px;
  background: var(--color-bg-white);
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
.content-body {
  flex: 1;
  padding: 8px 32px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.empty {
  padding: 60px 20px;
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
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 8px 0 0;
}
.empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.card {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}
.card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-icon {
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
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
}
.tag-cat {
  background: var(--color-bg-secondary);
  color: var(--color-text-body);
}
.tag-builtin {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
}
.tag-custom {
  background: var(--color-primary-soft);
  color: var(--color-primary-deep);
}
.card-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
}
.card-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 0.7px solid var(--color-border-soft);
}
.card-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.card.selected .card-status {
  color: var(--color-primary-deep);
  font-weight: 500;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}
.dot-on {
  background: var(--color-primary);
}
.dot-off {
  background: transparent;
  border: 0.7px solid var(--color-text-faint);
}
.apply-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--color-primary);
  border: none;
  color: var(--color-bg-white);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity var(--transition-base);
}
.apply-btn:hover {
  opacity: 0.92;
}
.selected-bar {
  position: sticky;
  bottom: 0;
  background: var(--color-bg-white);
  border-top: 0.7px solid var(--color-border-soft);
  border-radius: 14px 14px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 -32px -32px;
  flex-shrink: 0;
}
.selected-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.selected-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}
.selected-label {
  font-size: 14px;
  color: var(--color-text-body);
  font-weight: 500;
  flex-shrink: 0;
}
.selected-name {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.selected-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.btn-outline,
.btn-primary {
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity var(--transition-base), border-color var(--transition-base), color var(--transition-base);
}
.btn-outline {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn-primary {
  background: var(--color-primary);
  border: none;
  color: var(--color-bg-white);
}
.btn-primary:hover {
  opacity: 0.92;
}
</style>
