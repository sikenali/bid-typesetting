import { ref, watch } from 'vue'

const STORAGE_KEY = 'api_keys'
const CONFIG_TAB_KEY = 'api_config_tab'
const CFG_FORMAT_KEY = 'api_cfg_format'
const CFG_ENDPOINT_KEY = 'api_cfg_endpoint'
const CFG_MODEL_ID_KEY = 'api_cfg_model_id'

const providerModelsMap = {
  '阿里云': ['qwen3.7-max', 'qwen3.7-plus', 'qwen3.6-plus', 'qwen3.5-plus', 'qwen3-max', 'qwen-plus', 'qwen-flash', 'qwen3-coder-plus'],
  '百度': ['ernie-4.0', 'ernie-3.5', 'ernie-speed'],
  '智谱': ['glm-5.1', 'glm-4.6', 'glm-4'],
  'DeepSeek': ['deepseek-v4-pro', 'deepseek-r1', 'deepseek-chat'],
  'Moonshot': ['kimi-k2.6', 'moonshot-v1-128k', 'moonshot-v1-32k'],
  '零一万物': ['yi-large', 'yi-medium', 'yi-34b-chat'],
  'OpenAI': ['gpt-5.6-sol', 'gpt-5.5', 'gpt-5.4', 'gpt-5.4-pro', 'gpt-5.3-codex', 'o4-mini', 'o3', 'gpt-4.1'],
  'Anthropic': ['claude-fable-5', 'claude-opus-4.8', 'claude-opus-4.7', 'claude-sonnet-4.6', 'claude-haiku-4.5'],
  'Google': ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-pro'],
  'Mistral': ['mistral-large-3', 'mistral-medium-3', 'mistral-small-3'],
  'Groq': ['llama-3.3-70b', 'llama-3.1-8b', 'mixtral-8x7b-32768'],
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveKeys(keys) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(keys)) } catch {}
}

export function useApiKeys() {
  const apiKeys = ref(loadSaved())

  watch(
    () => apiKeys.value,
    (keys) => { saveKeys(keys) },
    { deep: true }
  )

  const apiKeyForm = ref({ provider: '', model: '', key: '', keyVisible: false })

  const configTab = ref(
    (() => {
      try {
        const v = localStorage.getItem(CONFIG_TAB_KEY)
        return v === 'provider' || v === 'custom' ? v : 'custom'
      } catch { return 'custom' }
    })()
  )

  const customApiFormat = ref(
    (() => { try { return localStorage.getItem(CFG_FORMAT_KEY) || 'openai' } catch { return 'openai' } })()
  )
  const customEndpoint = ref(localStorage.getItem(CFG_ENDPOINT_KEY) || '')
  const customModelId = ref(localStorage.getItem(CFG_MODEL_ID_KEY) || '')

  const selectedProvider = ref('')
  const selectedModelName = ref('')

  const providerModels = ref(providerModelsMap['OpenAI'] || [])

  function onProviderChange() {
    selectedModelName.value = ''
    providerModels.value = providerModelsMap[selectedProvider.value] || []
  }

  function addApiKey(key) {
    apiKeys.value.push({ ...key, enabled: true })
    apiKeyForm.value = { provider: '', model: '', key: '', keyVisible: false }
  }

  function removeApiKey(id) {
    apiKeys.value = apiKeys.value.filter(k => k.id !== id)
  }

  function toggleApiKey(id) {
    const key = apiKeys.value.find(k => k.id === id)
    if (key) key.enabled = !key.enabled
  }

  function toggleKeyVisibility() {
    apiKeyForm.value.keyVisible = !apiKeyForm.value.keyVisible
  }

  function resetForm() {
    apiKeyForm.value = { provider: '', model: '', key: '', keyVisible: false }
    customApiFormat.value = 'openai'
    customEndpoint.value = ''
    customModelId.value = ''
    selectedProvider.value = ''
    selectedModelName.value = ''
  }

  function persistConfig() {
    try {
      localStorage.setItem(CONFIG_TAB_KEY, configTab.value)
      localStorage.setItem(CFG_FORMAT_KEY, customApiFormat.value)
      localStorage.setItem(CFG_ENDPOINT_KEY, customEndpoint.value)
      localStorage.setItem(CFG_MODEL_ID_KEY, customModelId.value)
    } catch {}
  }

  function loadConfig() {
    try {
      const tab = localStorage.getItem(CONFIG_TAB_KEY)
      if (tab === 'provider' || tab === 'custom') configTab.value = tab
      customApiFormat.value = localStorage.getItem(CFG_FORMAT_KEY) || 'openai'
      customEndpoint.value = localStorage.getItem(CFG_ENDPOINT_KEY) || ''
      customModelId.value = localStorage.getItem(CFG_MODEL_ID_KEY) || ''
      selectedProvider.value = localStorage.getItem('cfg_provider') || ''
      selectedModelName.value = localStorage.getItem('cfg_model') || ''
      if (selectedProvider.value) {
        providerModels.value = providerModelsMap[selectedProvider.value] || []
      }
    } catch {}
  }

  return {
    apiKeys,
    apiKeyForm,
    configTab,
    customApiFormat,
    customEndpoint,
    customModelId,
    selectedProvider,
    selectedModelName,
    providerModels,
    onProviderChange,
    addApiKey,
    removeApiKey,
    toggleApiKey,
    toggleKeyVisibility,
    resetForm,
    persistConfig,
    loadConfig,
  }
}
