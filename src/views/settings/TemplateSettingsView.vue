<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from '@/utils/toast';
import { useTemplates } from '@/composables/useTemplates';
import { useFormatState } from '@/composables/useFormatState';
import { useDocument } from '@/composables/useDocument';
import PreviewTemplateModal from '@/components/PreviewTemplateModal.vue';
import UiModal from '@/components/ui/UiModal.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSelect from '@/components/ui/UiSelect.vue';

const router = useRouter();
const { templates, saveTemplate, deleteTemplate, categoryMeta } = useTemplates();
const { loadFormatParams, formatParams } = useFormatState();
const { getFile } = useDocument();

const templateCategories = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '公文' },
  { id: 'academic', label: '学术' },
  { id: 'military', label: '军标' },
  { id: 'business', label: '商务' },
  { id: 'creative', label: '创意' },
];

const keyword = ref('');
const activeCategory = ref('all');

const filteredTemplates = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return templates.value.filter((t) => {
    if (activeCategory.value !== 'all' && t.category !== activeCategory.value) return false;
    if (kw && !t.name.toLowerCase().includes(kw) && !(t.description || '').toLowerCase().includes(kw)) return false;
    return true;
  });
});

function applyTemplate(tpl) {
  if (!tpl.formatParams) {
    ElMessage.warning('此模板未保存排版参数');
    return;
  }
  if (!getFile()) {
    ElMessage.warning('请先在编辑器中打开文档，再应用模板');
    return;
  }
  loadFormatParams(JSON.parse(JSON.stringify(tpl.formatParams)));
  ElMessage.success('已应用模板「' + tpl.name + '」');
  setTimeout(() => router.push('/editor'), 400);
}

const previewTarget = ref(null);
function openPreview(tpl) {
  previewTarget.value = tpl;
}

const confirmDeleteId = ref(null);
const confirmDeleteName = ref('');
function askDelete(tpl) {
  confirmDeleteId.value = tpl.id;
  confirmDeleteName.value = tpl.name;
}
function doDelete() {
  if (confirmDeleteId.value == null) return;
  deleteTemplate(confirmDeleteId.value);
  ElMessage.success('已删除模板「' + confirmDeleteName.value + '」');
  confirmDeleteId.value = null;
  confirmDeleteName.value = '';
}

const showNewModal = ref(false);
const newName = ref('');
const newCategory = ref('official');
const newDesc = ref('');
const categoryOptions = [
  { value: 'official', label: '公文' },
  { value: 'academic', label: '学术' },
  { value: 'military', label: '军标' },
  { value: 'business', label: '商务' },
  { value: 'creative', label: '创意' },
];

function openNew() {
  newName.value = '';
  newCategory.value = activeCategory.value !== 'all' ? activeCategory.value : 'official';
  newDesc.value = '';
  showNewModal.value = true;
}

function doSaveNew() {
  const name = newName.value.trim();
  if (!name) {
    ElMessage.warning('请填写模板名称');
    return;
  }
  let fp = null;
  try {
    fp = JSON.parse(JSON.stringify(formatParams));
  } catch {
    fp = null;
  }
  saveTemplate(name, newCategory.value, fp);
  ElMessage.success('已保存模板「' + name + '」');
  showNewModal.value = false;
}

function categoryLabel(key) {
  return (categoryMeta[key] || {}).label || key;
}

function categoryColor(key) {
  return (categoryMeta[key] || {}).iconColor || '#5B8C5A';
}
</script>

<template>
  <div class="settings-view">
    <div class="page-header-card">
      <div class="breadcrumb">
        首页 <span class="sep">/</span> 设置中心 <span class="sep">/</span> <b>模板管理</b>
      </div>
      <h1 class="page-title">模板管理</h1>
      <p class="page-desc">管理内置与自定义排版模板，一键应用到文档</p>
    </div>

    <div class="toolbar">
      <UiInput
        v-model="keyword"
        class="search-input"
        placeholder="搜索模板名称或描述..."
        prefix-icon="ri-search-line"
      />
      <div class="cat-filter">
        <button
          v-for="cat in templateCategories"
          :key="cat.id"
          class="cat-pill"
          :class="{ 'is-active': activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>
      <button class="btn-primary" @click="openNew">
        <RiAddLine size="16" />
        <span>新建模板</span>
      </button>
    </div>

    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <RiSearchLine size="40" class="empty-icon" />
      <p class="empty-title">暂无匹配模板</p>
      <p class="empty-desc">调整筛选条件或新建一个模板试试</p>
    </div>

    <div v-else class="template-grid">
      <div v-for="tpl in filteredTemplates" :key="tpl.id" class="template-card">
        <div class="tpl-head">
          <div class="tpl-icon-wrap">
            <RiBook2Line size="18" :color="categoryColor(tpl.category)" />
          </div>
          <div class="tpl-title-wrap">
            <div class="tpl-name">{{ tpl.name }}</div>
            <div class="tpl-tag-row">
              <span class="tag tag-cat">{{ categoryLabel(tpl.category) }}</span>
              <span class="tag" :class="tpl.builtIn ? 'tag-builtin' : 'tag-custom'">
                {{ tpl.builtIn ? '内置' : '自定义' }}
              </span>
            </div>
          </div>
        </div>
        <p class="tpl-desc">{{ tpl.description || '用户保存的自定义排版模板' }}</p>
        <div class="tpl-actions">
          <button class="btn-ghost" @click="openPreview(tpl)">
            <RiEyeLine size="15" />
            <span>预览</span>
          </button>
          <button class="btn-ghost-primary" @click="applyTemplate(tpl)">
            <RiDownload2Line size="15" />
            <span>应用</span>
          </button>
          <button v-if="!tpl.builtIn" class="btn-ghost-danger" @click="askDelete(tpl)">
            <RiDeleteBinLine size="15" />
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>

    <UiModal
      v-model="showNewModal"
      title="新建模板"
      subtitle="保存当前编辑器中的排版参数为新模板"
      icon="ri-file-add-line"
      confirm-text="保存模板"
      :confirm-disabled="!newName.trim()"
      @confirm="doSaveNew"
    >
      <div class="form-row">
        <label class="form-label">模板名称</label>
        <UiInput v-model="newName" placeholder="请输入模板名称" />
      </div>
      <div class="form-row">
        <label class="form-label">分类</label>
        <UiSelect v-model="newCategory" :options="categoryOptions" placeholder="选择分类" />
      </div>
      <div class="form-hint">
        <RiInformationLine size="14" />
        <span>模板将继承当前编辑器的排版参数，若尚未打开文档，保存的参数为空。</span>
      </div>
    </UiModal>

    <UiModal
      v-if="confirmDeleteId !== null"
      :model-value="true"
      @update:model-value="confirmDeleteId = null"
      title="删除模板"
      subtitle="删除后不可恢复"
      icon="ri-delete-bin-line"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="doDelete"
    >
      <div class="delete-text">
        确定删除模板「{{ confirmDeleteName }}」吗？删除后此模板将无法恢复。
      </div>
    </UiModal>

    <PreviewTemplateModal
      v-if="previewTarget"
      :template="previewTarget"
      @close="previewTarget = null"
    />
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

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 12px 16px;
}
.search-input { flex: 1; min-width: 0; }
.cat-filter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
}
.cat-pill {
  height: 32px;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-family: var(--font-family-cn);
  transition: color 0.2s, background-color 0.2s;
}
.cat-pill:hover { color: var(--color-text-body); }
.cat-pill.is-active {
  background: var(--color-bg-white);
  color: var(--color-primary);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}
.btn-primary {
  height: 40px;
  padding: 0 18px;
  border: none;
  background: var(--color-primary);
  color: var(--color-bg-white);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family-cn);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.btn-primary:hover { opacity: 0.92; }
.btn-primary:active { transform: translateY(1px); }

.empty-state {
  padding: 60px 20px;
  text-align: center;
  background: var(--color-bg-white);
  border: 0.7px dashed var(--color-border-soft);
  border-radius: 14px;
}
.empty-icon { color: var(--color-text-faint); }
.empty-title {
  font-size: 15px;
  color: var(--color-text-body);
  font-weight: 500;
  margin: 12px 0 4px;
  font-family: var(--font-family-cn);
}
.empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  font-family: var(--font-family-cn);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.template-card {
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border-soft);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.template-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.tpl-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.tpl-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tpl-title-wrap { flex: 1; min-width: 0; }
.tpl-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: var(--font-family-cn);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-tag-row {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-family-cn);
}
.tag-cat {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
.tag-builtin {
  background: var(--color-badge-idle);
  color: var(--color-text-muted);
}
.tag-custom {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}
.tpl-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
  font-family: var(--font-family-cn);
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tpl-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 0.7px solid var(--color-border-soft);
}
.btn-ghost,
.btn-ghost-primary,
.btn-ghost-danger {
  flex: 1;
  height: 34px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  border-radius: 8px;
  font-size: 13px;
  font-family: var(--font-family-cn);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.btn-ghost:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
.btn-ghost-primary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.btn-ghost-danger:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background: var(--color-error-soft);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.form-label {
  font-size: 13px;
  color: var(--color-text-body);
  font-weight: 500;
  font-family: var(--font-family-cn);
}
.form-hint {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  background: var(--color-primary-soft);
  border-radius: 8px;
  color: var(--color-text-body);
  font-size: 12.5px;
  font-family: var(--font-family-cn);
  line-height: 1.6;
}
.form-hint > :first-child { flex-shrink: 0; color: var(--color-primary); margin-top: 2px; }

.delete-text {
  font-size: 14px;
  color: var(--color-text-body);
  line-height: 1.7;
  font-family: var(--font-family-cn);
}
</style>
