import JSZip from 'jszip'

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

const SIZE_MAP = [
  { name: '初号', sz: 84 },
  { name: '小初', sz: 72 },
  { name: '一号', sz: 52 },
  { name: '小一', sz: 48 },
  { name: '二号', sz: 44 },
  { name: '小二', sz: 36 },
  { name: '三号', sz: 32 },
  { name: '四号', sz: 28 },
  { name: '小四', sz: 24 },
  { name: '五号', sz: 21 },
  { name: '小五', sz: 18 },
]

function closestSizeName(szHalfPt) {
  let best = '五号', bestDiff = Infinity
  for (const s of SIZE_MAP) {
    const diff = Math.abs(s.sz - szHalfPt)
    if (diff < bestDiff) { bestDiff = diff; best = s.name }
  }
  return best
}

function twipsToCm(twips) {
  return Math.round((twips / 567) * 100) / 100
}

function attr(el, name) {
  if (!el) return null
  const v = el.getAttribute(name)
  if (v !== null && v !== '') return v
  return el.getAttributeNS(W_NS, name) ?? null
}

function tag(el, name) {
  return el?.getElementsByTagNameNS(W_NS, name)[0]
}

function parseSpacing(spacing) {
  if (!spacing) return {}
  const r = {}
  const line = attr(spacing, 'line')
  const lineRule = attr(spacing, 'lineRule')
  if (line) {
    const v = parseInt(line)
    if (lineRule === 'exact') {
      r.line_spacing_mode = 'EXACT'
      r.line_spacing_value = Math.round(v / 20)
    } else {
      const ratio = v / 240
      if (Math.abs(ratio - 1) < 0.05) r.line_spacing_mode = 'SINGLE'
      else if (Math.abs(ratio - 1.5) < 0.05) r.line_spacing_mode = 'ONE_POINT_FIVE'
      else if (Math.abs(ratio - 2) < 0.05) r.line_spacing_mode = 'DOUBLE'
      else { r.line_spacing_mode = 'MULTIPLE'; r.line_spacing_value = Math.round(ratio * 10) / 10 }
    }
  }
  const before = attr(spacing, 'before')
  const after = attr(spacing, 'after')
  if (before) { r.space_before_value = Math.round(parseInt(before) / 20); r.space_before_unit = 'pt' }
  if (after) { r.space_after_value = Math.round(parseInt(after) / 20); r.space_after_unit = 'pt' }
  return r
}

function parseRPr(rPr) {
  if (!rPr) return {}
  const r = {}
  const rFonts = tag(rPr, 'rFonts')
  if (rFonts) {
    r.cn_font = attr(rFonts, 'eastAsia') || '宋体'
    r.en_font = attr(rFonts, 'ascii') || attr(rFonts, 'hAnsi') || 'Times New Roman'
  }
  const sz = tag(rPr, 'sz')
  if (sz) r.size_cn = closestSizeName(parseInt(attr(sz, 'val')) || 24)
  r.bold = !!tag(rPr, 'b')
  return r
}

function parsePPr(pPr) {
  if (!pPr) return {}
  const jc = tag(pPr, 'jc')
  const alignMap = { both: 'JUSTIFY', left: 'LEFT', center: 'CENTER', right: 'RIGHT' }
  return {
    ...parseSpacing(tag(pPr, 'spacing')),
    align: jc ? (alignMap[attr(jc, 'val')] || 'LEFT') : undefined,
  }
}

export async function readDocxParams(file) {
  const buf = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buf)

  const docXmlStr = await zip.file('word/document.xml')?.async('string')
  const stylesXmlStr = await zip.file('word/styles.xml')?.async('string')

  if (!docXmlStr) return null

  const docXml = new DOMParser().parseFromString(docXmlStr, 'text/xml')
  const stylesXml = stylesXmlStr ? new DOMParser().parseFromString(stylesXmlStr, 'text/xml') : null

  const params = {}

  // --- Page margins & paper size ---
  const body = docXml.getElementsByTagNameNS(W_NS, 'body')[0]
  const sectPrs = body?.getElementsByTagNameNS(W_NS, 'sectPr')
  const lastSectPr = sectPrs?.[sectPrs.length - 1]

  if (lastSectPr) {
    const pgSz = tag(lastSectPr, 'pgSz')
    const pgMar = tag(lastSectPr, 'pgMar')
    const page = {}

    if (pgSz) {
      const w = parseInt(attr(pgSz, 'w')) || 0
      const h = parseInt(attr(pgSz, 'h')) || 0
      if (w > 0 && h > 0) {
        page.paper_width_cm = twipsToCm(w)
        page.paper_height_cm = twipsToCm(h)
        if (Math.abs(twipsToCm(w) - 21) < 0.5 && Math.abs(twipsToCm(h) - 29.7) < 0.5) {
          page.paper_size = 'A4'
        } else {
          page.paper_size = 'custom'
        }
      }
    }

    if (pgMar) {
      page.top_cm = twipsToCm(parseInt(attr(pgMar, 'top')) || 0)
      page.bottom_cm = twipsToCm(parseInt(attr(pgMar, 'bottom')) || 0)
      page.left_cm = twipsToCm(parseInt(attr(pgMar, 'left')) || 0)
      page.right_cm = twipsToCm(parseInt(attr(pgMar, 'right')) || 0)
      page.gutter_cm = twipsToCm(parseInt(attr(pgMar, 'gutter')) || 0)
      page.header_margin_cm = twipsToCm(parseInt(attr(pgMar, 'header')) || 0)
    }

    if (Object.keys(page).length > 0) params.page = page
  }

  // --- Styles from styles.xml ---
  if (stylesXml) {
    const styleEls = Array.from(stylesXml.getElementsByTagNameNS(W_NS, 'style'))
    let defaultStyle = null
    const headingStyles = []

    for (const el of styleEls) {
      const type = attr(el, 'type')
      const isDefault = attr(el, 'default')
      const styleId = attr(el, 'styleId') || ''
      if (type === 'paragraph' && isDefault === '1') defaultStyle = el
      if (type === 'paragraph') {
        const m = styleId.match(/^(?:Heading|heading|标题|標題)?\s*([1-4一-四])$/)
        if (m) {
          let level = parseInt(m[1])
          if (Number.isNaN(level)) {
            const cnMap = { '一': 1, '二': 2, '三': 3, '四': 4 }
            level = cnMap[m[1]] || 1
          }
          headingStyles.push({ el, level: level - 1 })
        }
      }
    }

    // Body defaults
    if (defaultStyle) {
      const pPr = tag(defaultStyle, 'pPr')
      const rPr = tag(defaultStyle, 'rPr')
      const bodyP = { ...parseRPr(rPr), ...parsePPr(pPr) }

      // Indentation
      const ind = pPr ? tag(pPr, 'ind') : null
      if (ind) {
        const left = attr(ind, 'left')
        const right = attr(ind, 'right')
        const firstLine = attr(ind, 'firstLine')
        const firstLineChars = attr(ind, 'firstLineChars')
        if (left) { bodyP.left_indent_value = Math.round(parseInt(left) / 567 * 100) / 100; bodyP.left_indent_unit = 'cm' }
        if (right) { bodyP.right_indent_value = Math.round(parseInt(right) / 567 * 100) / 100; bodyP.right_indent_unit = 'cm' }
        if (firstLineChars) bodyP.first_line_indent_chars = parseInt(firstLineChars)
        else if (firstLine) bodyP.first_line_indent_chars = Math.round(parseInt(firstLine) / 240)
      }

      if (Object.keys(bodyP).length > 0) params.body = bodyP
    }

    // Heading styles
    const headings = []
    for (let i = 0; i < 4; i++) {
      const found = headingStyles.find(h => h.level === i)
      if (found) {
        const pPr = tag(found.el, 'pPr')
        const rPr = tag(found.el, 'rPr')
        const h = { ...parseRPr(rPr) }
        const spacing = pPr ? tag(pPr, 'spacing') : null
        if (spacing) {
          const before = attr(spacing, 'before')
          const after = attr(spacing, 'after')
          if (before) { h.space_before_value = Math.round(parseInt(before) / 20); h.space_before_unit = 'pt' }
          if (after) { h.space_after_value = Math.round(parseInt(after) / 20); h.space_after_unit = 'pt' }
        }
        headings.push(h)
      }
    }
    if (headings.length > 0) params.headings = headings
  }

  return params
}
