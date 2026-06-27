import { ref, reactive, computed } from 'vue'

const formatParams = reactive({
  page: {
    paperSize: 'A4 (210mm × 297mm)',
    marginTop: 2.54,
    marginBottom: 2.54,
    marginLeft: 3.17,
    marginRight: 3.17,
    orientation: 'portrait',
  },
  body: {
    font: '宋体',
    fontSize: '小四 (12pt)',
    lineSpacing: '固定值 28磅',
    indentFirst: 2,
    indentLeft: 0,
  },
  heading: {
    level1: { font: '黑体', fontSize: '三号' },
    level2: { font: '楷体', fontSize: '四号' },
    level3: { font: '仿宋', fontSize: '小四' },
  },
})

const beforeSnapshot = ref(null)
const afterSnapshot = ref(null)
const diffs = ref([])

function takeBeforeSnapshot() {
  beforeSnapshot.value = JSON.parse(JSON.stringify(formatParams))
}

function applyFormatting() {
  if (!beforeSnapshot.value) takeBeforeSnapshot()

  const after = JSON.parse(JSON.stringify(formatParams))

  after.page.paperSize = 'A4 (210mm × 297mm)'
  after.page.marginTop = 2.54
  after.page.marginBottom = 2.54
  after.page.marginLeft = 3.17
  after.page.marginRight = 3.17
  after.page.orientation = 'portrait'

  after.body.font = '仿宋'
  after.body.fontSize = '三号 (16pt)'
  after.body.lineSpacing = '固定值 28磅'
  after.body.indentFirst = 2
  after.body.indentLeft = 0

  after.heading.level1.font = '黑体'
  after.heading.level1.fontSize = '三号'
  after.heading.level2.font = '楷体'
  after.heading.level2.fontSize = '四号'
  after.heading.level3.font = '仿宋'
  after.heading.level3.fontSize = '小四'

  afterSnapshot.value = after

  const diffList = []
  const before = beforeSnapshot.value

  if (before.body.font !== after.body.font) {
    diffList.push({
      id: 'body-font',
      category: '正文',
      label: '正文字体',
      before: before.body.font,
      after: after.body.font,
      type: 'change',
      annotation: '正文建议使用仿宋，符合公文排版规范（GB/T 9704-2012）',
      annotationType: 'font',
    })
  }

  if (before.body.fontSize !== after.body.fontSize) {
    diffList.push({
      id: 'body-font-size',
      category: '正文',
      label: '正文字号',
      before: before.body.fontSize,
      after: after.body.fontSize,
      type: 'change',
      annotation: '正文建议使用三号字，增强文档可读性',
      annotationType: 'font',
    })
  }

  if (before.body.lineSpacing !== after.body.lineSpacing) {
    diffList.push({
      id: 'body-line-spacing',
      category: '正文',
      label: '行距',
      before: before.body.lineSpacing,
      after: after.body.lineSpacing,
      type: 'change',
      annotation: '行距已调整为28磅固定值，符合正式公文标准',
      annotationType: 'layout',
    })
  }

  if (Number(before.body.indentFirst) !== Number(after.body.indentFirst)) {
    diffList.push({
      id: 'body-indent-first',
      category: '正文',
      label: '首行缩进',
      before: `${before.body.indentFirst}字符`,
      after: `${after.body.indentFirst}字符`,
      type: 'change',
      annotation: '首行缩进2字符，符合段落排版规范',
      annotationType: 'layout',
    })
  }

  if (before.heading.level1.font !== after.heading.level1.font ||
      before.heading.level1.fontSize !== after.heading.level1.fontSize) {
    diffList.push({
      id: 'heading-level1',
      category: '标题',
      label: '一级标题',
      before: `${before.heading.level1.font} ${before.heading.level1.fontSize}`,
      after: `${after.heading.level1.font} ${after.heading.level1.fontSize}`,
      type: 'change',
      annotation: '一级标题建议使用黑体三号，突出文档层级',
      annotationType: 'font',
    })
  }

  if (before.heading.level2.font !== after.heading.level2.font ||
      before.heading.level2.fontSize !== after.heading.level2.fontSize) {
    diffList.push({
      id: 'heading-level2',
      category: '标题',
      label: '二级标题',
      before: `${before.heading.level2.font} ${before.heading.level2.fontSize}`,
      after: `${after.heading.level2.font} ${after.heading.level2.fontSize}`,
      type: 'change',
      annotation: '二级标题建议使用楷体四号，与正文形成区分',
      annotationType: 'font',
    })
  }

  if (before.heading.level3.font !== after.heading.level3.font ||
      before.heading.level3.fontSize !== after.heading.level3.fontSize) {
    diffList.push({
      id: 'heading-level3',
      category: '标题',
      label: '三级标题',
      before: `${before.heading.level3.font} ${before.heading.level3.fontSize}`,
      after: `${after.heading.level3.font} ${after.heading.level3.fontSize}`,
      type: 'change',
      annotation: '三级标题建议使用仿宋小四，保持层级一致',
      annotationType: 'font',
    })
  }

  if (before.page.marginTop !== after.page.marginTop ||
      before.page.marginBottom !== after.page.marginBottom ||
      before.page.marginLeft !== after.page.marginLeft ||
      before.page.marginRight !== after.page.marginRight) {
    diffList.push({
      id: 'page-margins',
      category: '页面',
      label: '页边距',
      before: `上${before.page.marginTop}cm 下${before.page.marginBottom}cm 左${before.page.marginLeft}cm 右${before.page.marginRight}cm`,
      after: `上${after.page.marginTop}cm 下${after.page.marginBottom}cm 左${after.page.marginLeft}cm 右${after.page.marginRight}cm`,
      type: 'change',
      annotation: '页边距已按国标标准调整',
      annotationType: 'layout',
    })
  }

  diffs.value = diffList
}

function loadFormatParams(params) {
  if (!params) return
  if (params.page) Object.assign(formatParams.page, params.page)
  if (params.body) Object.assign(formatParams.body, params.body)
  if (params.heading) Object.assign(formatParams.heading, params.heading)
}

export function useFormatState() {
  return {
    formatParams,
    beforeSnapshot,
    afterSnapshot,
    diffs,
    takeBeforeSnapshot,
    applyFormatting,
    loadFormatParams,
  }
}
