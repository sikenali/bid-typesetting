import { ref } from 'vue'

const STORAGE_KEY = 'bid-page-user-templates'
const BUILTIN_INIT_KEY = 'bid-page-templates-initialized'

const categoryMeta = {
  official: { label: '公文', spineColor: 'bg-cinnabar', iconColor: '#C23B22' },
  academic: { label: '学术', spineColor: 'bg-jade-light', iconColor: '#5B8C5A' },
  business: { label: '商务', spineColor: 'bg-gold-dark', iconColor: '#C8A45C' },
  creative: { label: '创意', spineColor: 'bg-cloud-blue', iconColor: '#5B7DB1' },
}

const builtinTemplates = [
  {
    id: -1,
    name: 'GB/T 7714 顺序编码制',
    category: 'academic',
    builtIn: true,
    selected: false,
    spineColor: 'bg-jade-light',
    iconColor: '#5B8C5A',
    description: 'GB/T 7714-2015 顺序编码制参考文献格式',
    formatParams: {
      page: { paperSize: 'A4 (210mm × 297mm)', marginTop: 2.54, marginBottom: 2.54, marginLeft: 3.17, marginRight: 3.17, orientation: 'portrait' },
      body: { font: '宋体', fontSize: '小四 (12pt)', lineSpacing: '1.5倍行距', indentFirst: 2, indentLeft: 0 },
      heading: { level1: { font: '黑体', fontSize: '三号' }, level2: { font: '黑体', fontSize: '四号' }, level3: { font: '楷体', fontSize: '小四' } },
      citation: { style: 'numeric', styleLabel: '顺序编码制', referenceFont: '宋体', referenceFontSize: '五号 (10.5pt)', referenceLineSpacing: '固定值 20磅', referenceIndent: '悬挂缩进', referenceIndentChars: 2, referenceLocale: 'zh-CN' },
    },
  },
  {
    id: -2,
    name: 'GB/T 7714 著者-出版年制',
    category: 'academic',
    builtIn: true,
    selected: false,
    spineColor: 'bg-jade-light',
    iconColor: '#5B8C5A',
    description: 'GB/T 7714-2015 著者-出版年制参考文献格式',
    formatParams: {
      page: { paperSize: 'A4 (210mm × 297mm)', marginTop: 2.54, marginBottom: 2.54, marginLeft: 3.17, marginRight: 3.17, orientation: 'portrait' },
      body: { font: '宋体', fontSize: '小四 (12pt)', lineSpacing: '1.5倍行距', indentFirst: 2, indentLeft: 0 },
      heading: { level1: { font: '黑体', fontSize: '三号' }, level2: { font: '黑体', fontSize: '四号' }, level3: { font: '楷体', fontSize: '小四' } },
      citation: { style: 'author-year', styleLabel: '著者-出版年制', referenceFont: '宋体', referenceFontSize: '五号 (10.5pt)', referenceLineSpacing: '固定值 20磅', referenceIndent: '悬挂缩进', referenceIndentChars: 2, referenceLocale: 'zh-CN' },
    },
  },
  {
    id: -3,
    name: 'GB/T 9704 标准公文',
    category: 'official',
    builtIn: true,
    selected: false,
    spineColor: 'bg-cinnabar',
    iconColor: '#C23B22',
    description: 'GB/T 9704-2012 党政机关公文格式标准',
    formatParams: {
      page: { paperSize: 'A4 (210mm × 297mm)', marginTop: 3.7, marginBottom: 3.5, marginLeft: 2.8, marginRight: 2.6, orientation: 'portrait' },
      body: { font: '仿宋', fontSize: '三号 (16pt)', lineSpacing: '固定值 28磅', indentFirst: 2, indentLeft: 0 },
      heading: { level1: { font: '黑体', fontSize: '三号' }, level2: { font: '楷体', fontSize: '三号' }, level3: { font: '仿宋', fontSize: '三号' } },
      citation: { style: 'numeric', styleLabel: '顺序编码制', referenceFont: '仿宋', referenceFontSize: '小四 (12pt)', referenceLineSpacing: '固定值 24磅', referenceIndent: '悬挂缩进', referenceIndentChars: 2, referenceLocale: 'zh-CN' },
    },
  },
]

function loadTemplates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const hasBuiltins = localStorage.getItem(BUILTIN_INIT_KEY) === 'true'
      return hasBuiltins ? parsed : [...builtinTemplates, ...parsed]
    }
    localStorage.setItem(BUILTIN_INIT_KEY, 'true')
    return [...builtinTemplates]
  } catch {}
  return [...builtinTemplates]
}

const templates = ref(loadTemplates())

function persist() {
  const userTemplates = templates.value.filter(t => !t.builtIn)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates))
}

export function useTemplates() {
  function saveTemplate(name, category, formatParams = null) {
    const meta = categoryMeta[category] || categoryMeta.official
    templates.value.push({
      id: Date.now(),
      name,
      category,
      builtIn: false,
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
    builtinTemplates,
  }
}
