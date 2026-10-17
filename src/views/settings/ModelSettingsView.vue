<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from '@/utils/toast';
import { useApiKeys } from '@/composables/useApiKeys';

const {
  apiKeys, apiKeyForm, configTab, customApiFormat, customEndpoint, customModelId,
  selectedProvider, selectedModelName, providerModels, onProviderChange,
  addApiKey, removeApiKey, toggleApiKey, toggleKeyVisibility, resetForm, persistConfig, loadConfig,
} = useApiKeys();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8099';
const API_CONFIG_URL = API_BASE + '/api/config';
const API_TEST_URL = API_BASE + '/api/config/test-key';

const providers = [
  { group: '国内', items: ['阿里云', '百度', '智谱', 'DeepSeek', 'Moonshot', '零一万物'] },
  { group: '国外', items: ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Groq'] },
];

const providerOptions = providers.flatMap((g) => g.items.map((n) => ({ value: n, label: n, group: g.group })));
const modelOptions = [];
const formatOptions = [
  { value: 'openai', label: 'OpenAI Chat Completions 格式' },
  { value: 'anthropic', label: 'Anthropic Messages 格式' },
];

const testingKey = ref('');
const testSuccess = ref({});
const testFailed = ref({});
const testTimeouts = ref({});
const saving = ref(false);

onMounted(() => { loadConfig(); });

async function saveApiKey() {
  const key = apiKeyForm.value.key.trim();
  if (!key) {
    ElMessage.warning('请输入 API Key');
    return;
  }
  if (configTab.value === 'custom') {
    if (!customEndpoint.value.trim() || !customModelId.value.trim()) {
      ElMessage.warning('请填写自定义地址和模型 ID');
      return;
    }
    addApiKey({
      id: Date.now().toString(),
      provider: customApiFormat.value === 'anthropic' ? 'Anthropic (自定义)' : 'OpenAI (自定义)',
      model: customModelId.value.trim(),
      modelName: customModelId.value.trim(),
      key,
      endpoint: customEndpoint.value.trim(),
      format: customApiFormat.value,
      enabled: true,
    });
  } else {
    if (!selectedProvider.value || !selectedModelName.value) {
      ElMessage.warning('请选择服务商和模型');
      return;
    }
    addApiKey({
      id: Date.now().toString(),
      provider: selectedProvider.value,
      model: selectedModelName.value,
      modelName: selectedModelName.value,
      key,
      enabled: true,
    });
  }
  resetForm();
  persistConfig();
  await syncKeysToBackend();
  ElMessage.success('密钥已保存');
}

async function syncKeysToBackend() {
  try {
    const res = await fetch(API_CONFIG_URL);
    if (!res.ok) throw new Error('读取配置失败');
    const data = await res.json();
    const merged = [...(data.ai_providers || [])];
    for (const key of apiKeys.value) {
      const idx = merged.findIndex((p) => p.id === key.id);
      if (idx >= 0) merged[idx] = key;
      else merged.push(key);
    }
    const putRes = await fetch(API_CONFIG_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai_providers: merged }),
    });
    if (!putRes.ok) throw new Error('写入配置失败');
  } catch (e) {
    ElMessage.error('密钥同步到后端失败，仅保存到本地');
  }
}

async function handleTestKey(key) {
  testingKey.value = key.id;
  testSuccess.value[key.id] = false;
  testFailed.value[key.id] = false;
  if (testTimeouts.value[key.id]) clearTimeout(testTimeouts.value[key.id]);
  try {
    const res = await fetch(API_TEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: key.provider,
        model: key.model,
        key: key.key,
        endpoint: key.endpoint || '',
        format: key.format || 'openai',
      }),
    });
    const data = await res.json();
    testingKey.value = '';
    if (data.available) testSuccess.value[key.id] = true;
    else {
      testFailed.value[key.id] = true;
      ElMessage.error('连通性测试失败');
    }
  } catch {
    testingKey.value = '';
    testFailed.value[key.id] = true;
    ElMessage.error('连通性测试失败，请检查网络或密钥');
  }
  testTimeouts.value[key.id] = setTimeout(() => {
    testSuccess.value[key.id] = false;
    testFailed.value[key.id] = false;
  }, 3000);
}

function handleEditKey(key) {
  apiKeyForm.value.key = key.key;
  if (key.endpoint) {
    configTab.value = 'custom';
    customApiFormat.value = key.format || 'openai';
    customEndpoint.value = key.endpoint;
    customModelId.value = key.model || key.modelName || '';
  } else {
    configTab.value = 'provider';
    selectedProvider.value = key.provider;
    selectedModelName.value = key.model || key.modelName || '';
    onProviderChange();
  }
  persistConfig();
  ElMessage.info('已填充至表单，请修改后保存');
}

function handleRemoveKey(key) {
  removeApiKey(key.id);
  persistConfig();
  syncKeysToBackend();
  ElMessage.success('已删除密钥');
}

function handleToggleEnabled(key) {
  toggleApiKey(key.id);
  syncKeysToBackend();
}

function maskKey(k) {
  if (!k) return '';
  if (k.length <= 8) return k.slice(0, 2) + '****';
  return k.slice(0, 4) + '…' + k.slice(-4);
}

function switchTab(v) {
  configTab.value = v;
  persistConfig();
}
</script>

<template>
  <div class="settings-view">
    <div class="page-header-card">
      <div class="breadcrumb">
        首页 <span class="sep">/</span> 设置中心 <span class="sep">/</span> <b>模型管理</b>
      </div>
      <h1 class="page-title">模型管理</h1>
      <p class="page-desc">配置 AI 服务商与模型密钥，支持连通性测试与多密钥管理</p>
    </div>

    <div class="section-card">
      <div class="section-title">
        <RiKeyLine size="18" />
        <span>密钥配置</span>
      </div>
      <p class="section-desc">选择预置服务商或使用自定义接入点，添加一个 API Key 后即可调用模型</p>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ 'is-active': configTab === 'provider' }"
          @click="switchTab('provider')"
        >
          <RiCloudLine size="15" />
          <span>模型制造商</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'is-active': configTab === 'custom' }"
          @click="switchTab('custom')"
        >
          <RiCodeSSlashLine size="15" />
          <span>自定义配置</span>
        </button>
      </div>

      <div class="form-grid">
        <template v-if="configTab === 'provider'">
          <div class="form-row">
            <label class="form-label">服务商</label>
            <UiSelect
              v-model="selectedProvider"
              :options="providerOptions"
              placeholder="请选择服务商"
              @change="onProviderChange"
            />
          </div>
          <div class="form-row">
            <label class="form-label">模型</label>
            <UiSelect
              v-model="selectedModelName"
              :options="providerModels.map((m) => ({ value: m, label: m }))"
              placeholder="请选择模型"
            />
          </div>
        </template>
        <template v-else>
          <div class="form-row">
            <label class="form-label">API 格式</label>
            <UiSelect
              v-model="customApiFormat"
              :options="formatOptions"
              placeholder="选择 API 格式"
            />
          </div>
          <div class="form-row">
            <label class="form-label">自定义地址</label>
            <UiInput v-model="customEndpoint" placeholder="https://api.example.com/v1" />
          </div>
          <div class="form-row">
            <label class="form-label">模型 ID</label>
            <UiInput v-model="customModelId" placeholder="例如: gpt-4" />
          </div>
        </template>
        <div class="form-row">
          <label class="form-label">API Key</label>
          <div class="input-wrap">
            <UiInput
              v-model="apiKeyForm.key"
              :type="apiKeyForm.keyVisible ? 'text' : 'password'"
              placeholder="sk-..."
              class="key-input"
            />
            <button
              class="eye-btn"
              type="button"
              :title="apiKeyForm.keyVisible ? '隐藏' : '显示'"
              @click="toggleKeyVisibility()"
            >
              <RiEyeLine v-if="!apiKeyForm.keyVisible" size="16" />
              <RiEyeOffLine v-else size="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-outline" @click="resetForm()">
          <RiRestartLine size="15" />
          <span>重置表单</span>
        </button>
        <button class="btn-primary" @click="saveApiKey()">
          <RiCheckLine size="15" />
          <span>保存密钥</span>
        </button>
      </div>
    </div>

    <div v-if="apiKeys.length > 0" class="section-card">
      <div class="section-title">
        <RiLock2Line size="18" />
        <span>已保存的密钥</span>
        <span class="section-badge">{{ apiKeys.length }}</span>
      </div>
      <p class="section-desc">启用中的密钥将作为默认调用凭证；可随时测试、编辑或删除</p>

      <div class="key-list">
        <div v-for="key in apiKeys" :key="key.id" class="key-row">
          <div class="key-main">
            <div class="key-provider">
              <span class="key-dot" :class="{ 'is-enabled': key.enabled }"></span>
              <span class="key-name">{{ key.provider }}</span>
            </div>
            <div class="key-sub">
              {{ key.modelName || key.model }}
              <span class="key-mask">· {{ maskKey(key.key) }}</span>
            </div>
          </div>
          <div class="key-actions">
            <button
              v-if="testingKey !== key.id && !testSuccess[key.id] && !testFailed[key.id]"
              class="btn-mini"
              @click="handleTestKey(key)"
            >
              <RiWifiLine size="14" />
              <span>测试</span>
            </button>
            <button v-else-if="testingKey === key.id" class="btn-mini btn-mini-loading" disabled>
              <RiLoaderLine size="14" class="spin" />
              <span>测试中</span>
            </button>
            <button v-else-if="testSuccess[key.id]" class="btn-mini btn-mini-ok" disabled>
              <RiCheckLine size="14" />
              <span>连通</span>
            </button>
            <button v-else-if="testFailed[key.id]" class="btn-mini btn-mini-fail" disabled>
              <RiCloseLine size="14" />
              <span>失败</span>
            </button>
            <button class="icon-btn" title="编辑" @click="handleEditKey(key)">
              <RiEditLine size="15" />
            </button>
            <button class="icon-btn icon-btn-danger" title="删除" @click="handleRemoveKey(key)">
              <RiDeleteBinLine size="15" />
            </button>
            <label class="mini-switch" title="启用/禁用">
              <UiSwitch :model-value="key.enabled" size="sm" @change="handleToggleEnabled(key)" />
            </label>
          </div>
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
.section-badge {
  margin-left: 8px;
  padding: 2px 10px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
}
.section-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 6px 0 20px;
  font-family: var(--font-family-cn);
}

.tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  margin-bottom: 24px;
}
.tab-btn {
  height: 36px;
  padding: 0 18px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-family-cn);
  transition: color 0.2s, background-color 0.2s;
}
.tab-btn:hover { color: var(--color-text-body); }
.tab-btn.is-active {
  background: var(--color-primary);
  color: var(--color-bg-white);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-row:has(.input-wrap) { grid-column: span 1; }
.form-label {
  font-size: 13px;
  color: var(--color-text-body);
  font-weight: 500;
  font-family: var(--font-family-cn);
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.key-input { flex: 1; }
.eye-btn {
  position: absolute;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.eye-btn:hover { color: var(--color-primary); background: var(--color-bg-secondary); }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 0.7px solid var(--color-border-soft);
}
.btn-outline,
.btn-primary {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 14px;
  font-family: var(--font-family-cn);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.2s, color 0.2s, border-color 0.2s;
}
.btn-outline {
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn-primary {
  border: none;
  background: var(--color-primary);
  color: var(--color-bg-white);
  font-weight: 500;
}
.btn-primary:hover { opacity: 0.92; }

.key-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.key-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 0.7px solid var(--color-border-soft);
  border-radius: 12px;
  background: var(--color-bg-card);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.key-row:hover { border-color: var(--color-border); box-shadow: var(--shadow-sm); }
.key-main { flex: 1; min-width: 0; }
.key-provider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.key-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-faint);
  flex-shrink: 0;
}
.key-dot.is-enabled { background: var(--color-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 20%, transparent); }
.key-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: var(--font-family-cn);
}
.key-sub {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-family-cn);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.key-mask { color: var(--color-text-faint); margin-left: 4px; font-family: var(--font-family); }
.key-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.btn-mini {
  height: 30px;
  padding: 0 12px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-body);
  border-radius: 8px;
  font-size: 12px;
  font-family: var(--font-family-cn);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}
.btn-mini:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn-mini-loading { color: var(--color-text-muted); cursor: not-allowed; }
.btn-mini-ok { border-color: var(--color-success); color: var(--color-success); background: var(--color-success-soft); cursor: default; }
.btn-mini-fail { border-color: var(--color-error); color: var(--color-error); background: var(--color-error-soft); cursor: default; }
.icon-btn {
  width: 30px;
  height: 30px;
  border: 0.7px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-muted);
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.icon-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}
.icon-btn-danger:hover {
  color: var(--color-error);
  border-color: var(--color-error);
  background: var(--color-error-soft);
}
.mini-switch { display: inline-flex; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
