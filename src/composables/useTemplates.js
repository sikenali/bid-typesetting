import { ref } from 'vue'

const STORAGE_KEY = 'bid-page-user-templates'
const BUILTIN_INIT_KEY = 'bid-page-templates-initialized'

const categoryMeta = {
  official: { label: '公文', spineColor: 'bg-cinnabar', iconColor: '#C23B22' },
  academic: { label: '学术', spineColor: 'bg-jade-light', iconColor: '#5B8C5A' },
  military: { label: '军标', spineColor: 'bg-indigo-500', iconColor: '#4F46E5' },
  business: { label: '商务', spineColor: 'bg-gold-dark', iconColor: '#C8A45C' },
  creative: { label: '创意', spineColor: 'bg-cloud-blue', iconColor: '#5B7DB1' },
}

// 将字符串行距转为 {line_spacing_mode, line_spacing_value}
function parseLineSpacing(str) {
  if (!str) return { line_spacing_mode: 'MULTIPLE', line_spacing_value: 1.5 }
  if (str.includes('固定值')) {
    const v = parseInt(str.replace('固定值', '').replace('磅', '').trim())
    return { line_spacing_mode: 'EXACT', line_spacing_value: v || 28 }
  }
  if (str.includes('最小值')) {
    const v = parseInt(str.replace('最小值', '').replace('磅', '').trim())
    return { line_spacing_mode: 'AT_LEAST', line_spacing_value: v || 21 }
  }
  if (str.includes('单倍')) return { line_spacing_mode: 'SINGLE', line_spacing_value: 1 }
  if (str.includes('1.5倍')) return { line_spacing_mode: 'ONE_POINT_FIVE', line_spacing_value: 1.5 }
  if (str.includes('双倍') || str.includes('2倍')) return { line_spacing_mode: 'DOUBLE', line_spacing_value: 2 }
  if (str.includes('倍行距')) {
    const v = parseFloat(str.replace('倍行距', '').replace('倍', '').trim())
    return { line_spacing_mode: 'MULTIPLE', line_spacing_value: v || 1.5 }
  }
  return { line_spacing_mode: 'MULTIPLE', line_spacing_value: 1.5 }
}

// 统一格式化模板字段（将旧字段名映射到面板实际使用的字段名）
function normalizeTemplate(tpl) {
  const fp = tpl.formatParams
  if (!fp) return tpl

  // body
  if (fp.body) {
    if (fp.body.font) fp.body.cn_font = fp.body.font
    if (fp.body.fontSize) fp.body.size_cn = fp.body.fontSize
    if (fp.body.lineSpacing) {
      const ls = parseLineSpacing(fp.body.lineSpacing)
      fp.body.line_spacing_mode = ls.line_spacing_mode
      fp.body.line_spacing_value = ls.line_spacing_value
    }
    if (fp.body.indentFirst !== undefined) fp.body.first_line_indent_chars = fp.body.indentFirst
    delete fp.body.font
    delete fp.body.fontSize
    delete fp.body.lineSpacing
    delete fp.body.indentFirst
  }

  // headings
  if (fp.heading) {
    const headingArr = []
    const lvlMap = { level1: 0, level2: 1, level3: 2, level4: 3 }
    for (const [key, idx] of Object.entries(lvlMap)) {
      const h = fp.heading[key]
      if (h) {
        const item = {}
        if (h.font) item.cn_font = h.font
        if (h.fontSize) item.size_cn = h.fontSize
        if (h.bold !== undefined) item.bold = h.bold
        if (h.italic !== undefined) item.italic = h.italic
        if (h.underline !== undefined) item.underline = h.underline
        if (h.align) item.align = h.align
        headingArr[idx] = item
      }
    }
    fp.headings = headingArr
    delete fp.heading
  }

  // fig_caption / tbl_caption
  ;['fig_caption', 'tbl_caption'].forEach(key => {
    if (fp[key]) {
      if (fp[key].font) fp[key].cn_font = fp[key].font
      if (fp[key].fontSize) fp[key].size_cn = fp[key].fontSize
      if (fp[key].lineSpacing) {
        const ls = parseLineSpacing(fp[key].lineSpacing)
        fp[key].line_spacing_mode = ls.line_spacing_mode
        fp[key].line_spacing_value = ls.line_spacing_value
      }
      delete fp[key].font
      delete fp[key].fontSize
      delete fp[key].lineSpacing
    }
  })

  // table
  if (fp.table) {
    if (fp.table.cn_font === undefined && fp.table.font) fp.table.cn_font = fp.table.font
    if (fp.table.en_font === undefined && fp.table.en_font_str) fp.table.en_font = fp.table.en_font_str
    if (fp.table.size_cn === undefined && fp.table.fontSize) fp.table.size_cn = fp.table.fontSize
    if (fp.table.line_spacing_mode === undefined && fp.table.lineSpacing) {
      const ls = parseLineSpacing(fp.table.lineSpacing)
      fp.table.line_spacing_mode = ls.line_spacing_mode
      fp.table.line_spacing_value = ls.line_spacing_value
    }
  }

  // toc
  if (fp.toc) {
    if (fp.toc.level_styles) {
      fp.toc.level_styles = fp.toc.level_styles.map(l => {
        const item = { ...l }
        if (item.font) { item.cn_font = item.font; delete item.font }
        if (item.fontSize) { item.size_cn = item.fontSize; delete item.fontSize }
        if (item.line_spacing_mode === undefined && item.lineSpacing) {
          const ls = parseLineSpacing(item.lineSpacing)
          item.line_spacing_mode = ls.line_spacing_mode
          item.line_spacing_value = ls.line_spacing_value
          delete item.lineSpacing
        }
        return item
      })
    }
  }

  // header_footer
  if (fp.header_footer) {
    if (fp.header_footer.header_font) { fp.header_footer.header_cn_font = fp.header_footer.header_font; delete fp.header_footer.header_font }
    if (fp.header_footer.footer_font) { fp.header_footer.footer_cn_font = fp.header_footer.footer_font; delete fp.header_footer.footer_font }
  }

  return tpl
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
      page: { paper_size: 'A4', top_cm: 2.54, bottom_cm: 2.54, left_cm: 3.17, right_cm: 3.17, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'ONE_POINT_FIVE', line_spacing_value: 1.5, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: true, space_count: 1 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 28, space_before_value: 12, space_before_unit: 'line', space_after_value: 6, space_after_unit: 'line', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 28, space_before_value: 12, space_before_unit: 'line', space_after_value: 6, space_after_unit: 'line', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 28, space_before_value: 6, space_before_unit: 'line', space_after_value: 3, space_after_unit: 'line', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'SINGLE', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 20, enable_cell_formatting: true, style_type: 'TableGrid' },
      table_settings: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 1.5, min_line_height: 20, align: 'CENTER', border_style: 'all', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1.5, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1.5, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: false, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'single', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'page_of_pages' },
      patterns: { rules: [
        { scheme: 'ARABIC', wrapper: 'DOT', multi_depth: 0, enabled: true, custom_example: '' },
      ]},
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
      page: { paper_size: 'A4', top_cm: 2.54, bottom_cm: 2.54, left_cm: 3.17, right_cm: 3.17, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'ONE_POINT_FIVE', line_spacing_value: 1.5, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: true, space_count: 1 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 28, space_before_value: 12, space_before_unit: 'line', space_after_value: 6, space_after_unit: 'line', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 28, space_before_value: 12, space_before_unit: 'line', space_after_value: 6, space_after_unit: 'line', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 28, space_before_value: 6, space_before_unit: 'line', space_after_value: 3, space_after_unit: 'line', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'SINGLE', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'SINGLE', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 20, enable_cell_formatting: true, style_type: 'TableGrid' },
      table_settings: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 1.5, min_line_height: 20, align: 'CENTER', border_style: 'all', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1.5, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1.5, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: false, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'single', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'page_of_pages' },
      patterns: { rules: [
        { scheme: 'AUTHOR_YEAR', wrapper: 'NONE', multi_depth: 0, enabled: true, custom_example: '' },
      ]},
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
      page: { paper_size: 'A4', top_cm: 3.7, bottom_cm: 3.5, left_cm: 2.8, right_cm: 2.6, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: false, space_count: 0 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '四号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '四号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '四号', autofit: true, line_spacing_mode: 'EXACT', line_spacing_value: 28, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 0, enable_cell_formatting: false, style_type: 'normal' },
      table_settings: { enable: false, cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '四号', line_spacing_value: 28, min_line_height: 28, align: 'CENTER', border_style: 'single', auto_width: true },
      toc: { enable: false, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 28, tab_leader: 'NONE', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: false, enable_footer: false, header_text: '', header_cn_font: '仿宋', header_en_font: 'Times New Roman', header_size_cn: '三号', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'none', header_top_cm: 1.5, footer_bottom_cm: 1.75, page_number_from_body: false, clear_footer: true, footer_cn_font: '仿宋', footer_en_font: 'Times New Roman', footer_size_cn: '四号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'dash' },
      patterns: { rules: [] },
    },
  },
  {
    id: -100,
    name: 'GJB438C 软件需求规格说明',
    category: 'military',
    builtIn: true,
    selected: false,
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    description: 'GJB 438C-2021 [5.10] 军用软件开发文档通用要求',
    formatParams: {
      page: { paper_size: 'A4', top_cm: 3.7, bottom_cm: 3.5, left_cm: 2.8, right_cm: 2.6, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: false, space_count: 0 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'EXACT', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 0, enable_cell_formatting: false, style_type: 'normal' },
      table_settings: { enable: false, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 15, min_line_height: 15, align: 'CENTER', border_style: 'single', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 2, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 3, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: true, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'none', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'standard' },
      patterns: { rules: [] },
    },
  },
  {
    id: -101,
    name: 'GJB438C 软件设计说明',
    category: 'military',
    builtIn: true,
    selected: false,
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    description: 'GJB 438C-2021 [5.11] 军用软件开发文档通用要求',
    formatParams: {
      page: { paper_size: 'A4', top_cm: 3.7, bottom_cm: 3.5, left_cm: 2.8, right_cm: 2.6, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: false, space_count: 0 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'EXACT', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 0, enable_cell_formatting: false, style_type: 'normal' },
      table_settings: { enable: false, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 15, min_line_height: 15, align: 'CENTER', border_style: 'single', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 2, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 3, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: true, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'none', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'standard' },
      patterns: { rules: [] },
    },
  },
  {
    id: -102,
    name: 'GJB438C 软件测试计划',
    category: 'military',
    builtIn: true,
    selected: false,
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    description: 'GJB 438C-2021 [5.14] 军用软件开发文档通用要求',
    formatParams: {
      page: { paper_size: 'A4', top_cm: 3.7, bottom_cm: 3.5, left_cm: 2.8, right_cm: 2.6, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: false, space_count: 0 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'EXACT', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 0, enable_cell_formatting: false, style_type: 'normal' },
      table_settings: { enable: false, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 15, min_line_height: 15, align: 'CENTER', border_style: 'single', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 2, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 3, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: true, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'none', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'standard' },
      patterns: { rules: [] },
    },
  },
  {
    id: -103,
    name: 'GJB438C 软件测试说明',
    category: 'military',
    builtIn: true,
    selected: false,
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    description: 'GJB 438C-2021 [5.13] 军用软件开发文档通用要求',
    formatParams: {
      page: { paper_size: 'A4', top_cm: 3.7, bottom_cm: 3.5, left_cm: 2.8, right_cm: 2.6, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: false, space_count: 0 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'EXACT', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 0, enable_cell_formatting: false, style_type: 'normal' },
      table_settings: { enable: false, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 15, min_line_height: 15, align: 'CENTER', border_style: 'single', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 2, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 3, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: true, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'none', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'standard' },
      patterns: { rules: [] },
    },
  },
  {
    id: -104,
    name: 'GJB438C 软件测试报告',
    category: 'military',
    builtIn: true,
    selected: false,
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    description: 'GJB 438C-2021 [5.14] 军用软件开发文档通用要求',
    formatParams: {
      page: { paper_size: 'A4', top_cm: 3.7, bottom_cm: 3.5, left_cm: 2.8, right_cm: 2.6, gutter_cm: 0, header_margin_cm: 1.5, orientation: 'portrait' },
      body: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: false, space_count: 0 },
      headings: [
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '三号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '黑体', en_font: 'Times New Roman', size_cn: '四号', bold: true, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '楷体', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
        { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '小四', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'LEFT', add_space: false, space_count: 0 },
      ],
      fig_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      tbl_caption: { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 15, space_before_value: 3, space_before_unit: 'pt', space_after_value: 3, space_after_unit: 'pt', first_line_indent_chars: 0, align: 'CENTER', add_space: false, space_count: 0 },
      table: { enable: true, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', autofit: true, line_spacing_mode: 'EXACT', line_spacing_value: 15, align: 'CENTER', cell_align: 'CENTER', min_row_height_pt: 0, enable_cell_formatting: false, style_type: 'normal' },
      table_settings: { enable: false, cn_font: '宋体', en_font: 'Times New Roman', size_cn: '五号', line_spacing_value: 15, min_line_height: 15, align: 'CENTER', border_style: 'single', auto_width: true },
      toc: { enable: true, title_text: '目录', title_cn_font: '黑体', title_en_font: 'Times New Roman', title_size_cn: '三号', level_styles: [
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 0, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 1, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 2, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
        { cn_font: '宋体', en_font: 'Times New Roman', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'EXACT', line_spacing_value: 15, tab_leader: 'DOT', left_indent_value: 3, right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, align: 'LEFT', space_before_value: 0, space_before_unit: 'pt', space_after_value: 0, space_after_unit: 'pt' },
      ]},
      header_footer: { enable_header: true, enable_footer: true, header_text: '', header_cn_font: '宋体', header_en_font: 'Times New Roman', header_size_cn: '小五', header_align: 'CENTER', header_bold: false, header_italic: false, header_underline_type: 'none', header_top_cm: 1.5, footer_bottom_cm: 1.5, page_number_from_body: false, clear_footer: true, footer_cn_font: '宋体', footer_en_font: 'Times New Roman', footer_size_cn: '五号', footer_align: 'CENTER', footer_italic: false, footer_page_number_type: 'standard' },
      patterns: { rules: [] },
    },
  },
]

function loadTemplates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      localStorage.setItem(BUILTIN_INIT_KEY, 'true')
      return [...builtinTemplates, ...parsed.map(normalizeTemplate)]
    }
    localStorage.setItem(BUILTIN_INIT_KEY, 'true')
    return builtinTemplates.map(normalizeTemplate)
  } catch {}
  return builtinTemplates
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
