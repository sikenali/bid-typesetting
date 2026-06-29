import { ref, reactive, computed } from 'vue'

const formatParams = reactive({
  apply_page: true,
  apply_body: true,
  apply_headings: true,
  apply_figtbl: true,
  apply_toc: true,
  apply_header_footer: true,

  page: {
    top_cm: 3.7,
    bottom_cm: 3.5,
    left_cm: 2.8,
    right_cm: 2.6,
    gutter_cm: 0,
    header_margin_cm: 2.54,
    paper_size: 'A4',
    paper_width_cm: 21.0,
    paper_height_cm: 29.7,
    columns: 1,
    column_spacing_cm: 1,
    keep_original_orientation: false,
  },

  body: {
    cn_font: '仿宋',
    en_font: 'Times New Roman',
    size_cn: '三号',
    bold: false,
    italic: false,
    underline: false,
    line_spacing_mode: 'EXACT',
    line_spacing_value: 26,
    space_before_value: 0,
    space_before_unit: 'pt',
    space_after_value: 0,
    space_after_unit: 'pt',
    left_indent_value: 0,
    left_indent_unit: 'char',
    right_indent_value: 0,
    right_indent_unit: 'char',
    first_line_indent_chars: 2,
    align: 'JUSTIFY',
    add_space: true,
    space_count: 1,
  },

  headings: [
    {
      cn_font: '黑体',
      en_font: 'Times New Roman',
      size_cn: '三号',
      bold: true,
      italic: false,
      underline: false,
      line_spacing_mode: 'SINGLE',
      line_spacing_value: 28,
      space_before_value: 12,
      space_before_unit: 'line',
      space_after_value: 6,
      space_after_unit: 'line',
      left_indent_value: 0,
      left_indent_unit: 'char',
      right_indent_value: 0,
      right_indent_unit: 'char',
      first_line_indent_chars: 0,
      align: 'LEFT',
      add_space: false,
      space_count: 0,
    },
    {
      cn_font: '黑体',
      en_font: 'Times New Roman',
      size_cn: '四号',
      bold: true,
      italic: false,
      underline: false,
      line_spacing_mode: 'SINGLE',
      line_spacing_value: 28,
      space_before_value: 12,
      space_before_unit: 'line',
      space_after_value: 6,
      space_after_unit: 'line',
      left_indent_value: 0,
      left_indent_unit: 'char',
      right_indent_value: 0,
      right_indent_unit: 'char',
      first_line_indent_chars: 0,
      align: 'LEFT',
      add_space: false,
      space_count: 0,
    },
    {
      cn_font: '仿宋',
      en_font: 'Times New Roman',
      size_cn: '小四',
      bold: false,
      italic: false,
      underline: false,
      line_spacing_mode: 'SINGLE',
      line_spacing_value: 28,
      space_before_value: 6,
      space_before_unit: 'line',
      space_after_value: 3,
      space_after_unit: 'line',
      left_indent_value: 0,
      left_indent_unit: 'char',
      right_indent_value: 0,
      right_indent_unit: 'char',
      first_line_indent_chars: 0,
      align: 'LEFT',
      add_space: false,
      space_count: 0,
    },
    {
      cn_font: '仿宋',
      en_font: 'Times New Roman',
      size_cn: '小四',
      bold: false,
      italic: false,
      underline: false,
      line_spacing_mode: 'SINGLE',
      line_spacing_value: 28,
      space_before_value: 3,
      space_before_unit: 'line',
      space_after_value: 3,
      space_after_unit: 'line',
      left_indent_value: 0,
      left_indent_unit: 'char',
      right_indent_value: 0,
      right_indent_unit: 'char',
      first_line_indent_chars: 0,
      align: 'LEFT',
      add_space: false,
      space_count: 0,
    },
  ],

  patterns: {
    rules: [
      { enabled: false, scheme: 'ZH_NUM', wrapper: 'DUNHAO', multi_depth: '1', custom_example: '' },
      { enabled: false, scheme: 'ZH_NUM', wrapper: 'DOUBLE_PAREN', multi_depth: '1', custom_example: '' },
      { enabled: false, scheme: 'ARABIC', wrapper: 'DOT', multi_depth: '1', custom_example: '' },
      { enabled: false, scheme: 'ARABIC', wrapper: 'SINGLE_PAREN', multi_depth: '1', custom_example: '' },
    ],
  },

  fig_caption: {
    cn_font: '宋体',
    en_font: 'Times New Roman',
    size_cn: '五号',
    bold: false,
    italic: false,
    underline: false,
    line_spacing_mode: 'SINGLE',
    line_spacing_value: 15,
    space_before_value: 3,
    space_before_unit: 'pt',
    space_after_value: 3,
    space_after_unit: 'pt',
    left_indent_value: 0,
    left_indent_unit: 'char',
    right_indent_value: 0,
    right_indent_unit: 'char',
    first_line_indent_chars: 0,
    align: 'CENTER',
    add_space: false,
    space_count: 0,
  },

  tbl_caption: {
    cn_font: '宋体',
    en_font: 'Times New Roman',
    size_cn: '五号',
    bold: false,
    italic: false,
    underline: false,
    line_spacing_mode: 'SINGLE',
    line_spacing_value: 15,
    space_before_value: 3,
    space_before_unit: 'pt',
    space_after_value: 3,
    space_after_unit: 'pt',
    left_indent_value: 0,
    left_indent_unit: 'char',
    right_indent_value: 0,
    right_indent_unit: 'char',
    first_line_indent_chars: 0,
    align: 'CENTER',
    add_space: false,
    space_count: 0,
  },

  table: {
    enable: true,
    cn_font: '宋体',
    en_font: 'Times New Roman',
    size_cn: '五号',
    autofit: true,
    line_spacing_mode: 'SINGLE',
    line_spacing_value: 15,
    align: 'CENTER',
    cell_align: 'CENTER',
    min_row_height_pt: 0,
    enable_cell_formatting: false,
    style_type: 'normal',
  },

  toc: {
    enable: false,
    title_text: '目录',
    title_cn_font: '黑体',
    title_en_font: 'Times New Roman',
    title_size_cn: '三号',
    level_styles: [
      { cn_font: '宋体', en_font: 'Arial', size_cn: '小五', bold: true, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1, space_before_value: 0, space_before_unit: 'line', space_after_value: 0, space_after_unit: 'line', left_indent_value: 0, left_indent_unit: 'char', right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, tab_leader: 'DOT' },
      { cn_font: '宋体', en_font: 'Arial', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1, space_before_value: 0, space_before_unit: 'line', space_after_value: 0, space_after_unit: 'line', left_indent_value: 1, left_indent_unit: 'char', right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, tab_leader: 'DOT' },
      { cn_font: '宋体', en_font: 'Arial', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1, space_before_value: 0, space_before_unit: 'line', space_after_value: 0, space_after_unit: 'line', left_indent_value: 2, left_indent_unit: 'char', right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, tab_leader: 'DOT' },
      { cn_font: '宋体', en_font: 'Arial', size_cn: '小五', bold: false, italic: false, color_rgb: [0, 0, 0], line_spacing_mode: 'SINGLE', line_spacing_value: 1, space_before_value: 0, space_before_unit: 'line', space_after_value: 0, space_after_unit: 'line', left_indent_value: 3, left_indent_unit: 'char', right_indent_value: 0, right_indent_unit: 'char', first_line_indent_chars: 0, tab_leader: 'DOT' },
    ],
  },

  header_footer: {
    enable_header: false,
    enable_footer: true,
    header_text: '',
    header_cn_font: '宋体',
    header_en_font: 'Times New Roman',
    header_size_cn: '五号',
    header_align: 'CENTER',
    header_bold: false,
    header_italic: false,
    header_underline_type: 'none',
    header_top_cm: 1.50,
    footer_bottom_cm: 1.50,
    page_number_from_body: false,
    clear_footer: true,
    footer_cn_font: '宋体',
    footer_en_font: 'Times New Roman',
    footer_size_cn: '五号',
    footer_align: 'CENTER',
    footer_italic: false,
    footer_page_number_type: 'standard',
  },

  cleanup: {
    text_cleanup: {
      add_space_between_cn_en: true,
      punctuation_clean: true,
      clear_superscript: true,
      soft_enter_to_hard: true,
      remove_extra_blank_lines: false,
    },
    style_cleanup: {
      clear_all_styles: true,
      clear_paragraph_indent: true,
      clear_align_grid: true,
      clean_after_formatting: false,
    },
    object_structure: {
      object_wrapping: true,
      collapse_sdt_tags: false,
      tab_stop_mode: '2',
    },
    caption_detection: {
      fig_detection_enabled: true,
      fig_detection_spacing: 2,
      tbl_detection_enabled: true,
      tbl_detection_spacing: 2,
    },
    global_switches: {
      apply_page: true,
      apply_body: true,
      apply_headings: true,
      apply_figtbl: true,
      apply_toc: true,
      apply_header_footer: true,
      auto_refresh_fields: false,
      close_word_after_refresh: true,
    },
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
  afterSnapshot.value = JSON.parse(JSON.stringify(formatParams))
  diffs.value = []
}

function loadFormatParams(params) {
  if (!params) return
  for (const key of Object.keys(params)) {
    if (key in formatParams) {
      if (typeof params[key] === 'object' && !Array.isArray(params[key])) {
        Object.assign(formatParams[key], params[key])
      } else if (Array.isArray(formatParams[key]) && Array.isArray(params[key])) {
        params[key].forEach((item, i) => {
          if (formatParams[key][i]) {
            Object.assign(formatParams[key][i], item)
          } else {
            formatParams[key].push(item)
          }
        })
      } else {
        formatParams[key] = params[key]
      }
    }
  }
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
