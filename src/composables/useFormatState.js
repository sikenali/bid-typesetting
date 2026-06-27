import { ref, reactive, computed } from 'vue'

const formatParams = reactive({
  page: {
    paperSize: 'A4 (210mm × 297mm)',
    marginTop: 3.7,
    marginBottom: 3.5,
    marginLeft: 2.8,
    marginRight: 2.6,
    orientation: 'portrait',
  },
  body: {
    font: '仿宋',
    fontSize: '三号 (16pt)',
    lineSpacing: '固定值 28磅',
    indentFirst: 2,
    indentLeft: 0,
  },
  heading: {
    level1: { font: '黑体', fontSize: '三号' },
    level2: { font: '楷体', fontSize: '三号' },
    level3: { font: '仿宋', fontSize: '三号' },
  },
  citation: {
    style: 'numeric',
    styleLabel: '顺序编码制',
    referenceFont: '宋体',
    referenceFontSize: '五号 (10.5pt)',
    referenceLineSpacing: '固定值 20磅',
    referenceIndent: '悬挂缩进',
    referenceIndentChars: 2,
    referenceLocale: 'zh-CN',
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
  after.page.marginTop = 3.7
  after.page.marginBottom = 3.5
  after.page.marginLeft = 2.8
  after.page.marginRight = 2.6
  after.page.orientation = 'portrait'

  after.body.font = '仿宋'
  after.body.fontSize = '三号 (16pt)'
  after.body.lineSpacing = '固定值 28磅'
  after.body.indentFirst = 2
  after.body.indentLeft = 0

  after.heading.level1.font = '黑体'
  after.heading.level1.fontSize = '三号'
  after.heading.level2.font = '楷体'
  after.heading.level2.fontSize = '三号'
  after.heading.level3.font = '仿宋'
  after.heading.level3.fontSize = '三号'

  after.citation.style = 'numeric'
  after.citation.styleLabel = '顺序编码制'
  after.citation.referenceFont = '宋体'
  after.citation.referenceFontSize = '五号 (10.5pt)'
  after.citation.referenceLineSpacing = '固定值 20磅'
  after.citation.referenceIndent = '悬挂缩进'
  after.citation.referenceIndentChars = 2
  after.citation.referenceLocale = 'zh-CN'

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
      annotation: '正文应使用三号仿宋，符合 GB/T 9704-2012 第5.2.2条',
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
      annotation: '三号字（16pt）为国标正文标准字号',
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
      annotation: '行距28磅固定值对应 GB/T 9704-2012 每面22行标准',
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

  if (before.citation.style !== after.citation.style) {
    diffList.push({
      id: 'citation-style',
      category: '引用',
      label: '引用格式',
      before: before.citation.styleLabel || before.citation.style,
      after: after.citation.styleLabel || after.citation.style,
      type: 'change',
      annotation: '参考文献采用 GB/T 7714-2015 ' + after.citation.styleLabel,
      annotationType: 'layout',
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
      annotation: '按GB/T 9704-2012: 上37mm下35mm左28mm右26mm',
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
  if (params.citation) Object.assign(formatParams.citation, params.citation)
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
