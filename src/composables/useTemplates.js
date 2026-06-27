import { ref } from 'vue'

const STORAGE_KEY = 'bid-page-user-templates'

function loadTemplates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

const templates = ref(loadTemplates())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
}

const categoryMeta = {
  official: { label: '公文', spineColor: 'bg-cinnabar', iconColor: '#C23B22' },
  academic: { label: '学术', spineColor: 'bg-jade-light', iconColor: '#5B8C5A' },
  business: { label: '商务', spineColor: 'bg-gold-dark', iconColor: '#C8A45C' },
  creative: { label: '创意', spineColor: 'bg-cloud-blue', iconColor: '#5B7DB1' },
}

export function useTemplates() {
  function saveTemplate(name, category, formatParams = null) {
    const meta = categoryMeta[category] || categoryMeta.official
    templates.value.push({
      id: Date.now(),
      name,
      category,
      selected: false,
      spineColor: meta.spineColor,
      iconColor: meta.iconColor,
      createdAt: Date.now(),
      formatParams: formatParams ? JSON.parse(JSON.stringify(formatParams)) : null,
    })
    persist()
  }

  function deleteTemplate(id) {
    templates.value = templates.value.filter(t => t.id !== id)
    persist()
  }

  return {
    templates,
    saveTemplate,
    deleteTemplate,
    categoryMeta,
  }
}
