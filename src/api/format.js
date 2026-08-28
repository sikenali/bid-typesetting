const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8099'

function flattenCleanup(config) {
  const c = config.cleanup || {}
  const tc = c.text_cleanup || {}
  const sc = c.style_cleanup || {}
  const os = c.object_structure || {}
  const cd = c.caption_detection || {}

  let tab_mode = 0
  if (tc.tab_to_spaces_enabled) {
    const v = tc.tab_to_spaces
    if (v === 'none') tab_mode = 0
    else if (v === 'delete') tab_mode = -1
    else if (v === 'enter') tab_mode = -2
    else tab_mode = parseInt(v) || 2
  }

  return {
    PreprocessPunctuation: tc.punctuation_clean ?? false,
    PreprocessSuperscript: tc.clear_superscript ?? false,
    PreprocessSoftReturn: tc.soft_enter_to_hard ?? false,
    PreprocessMarkdownToPlain: tc.markdown_tags_to_plaintext ?? false,
    PreprocessTabEnabled: tc.tab_to_spaces_enabled ?? false,
    PreprocessTabMode: tab_mode,

    PreprocessClearExtraSpaces: sc.clear_extra_spaces ?? false,
    PreprocessClearIndents: sc.clear_paragraph_indent ?? false,
    PreprocessClearHeadingIndent: sc.clear_heading_indent ?? false,
    PreprocessClearHeadingLeftIndent: sc.clear_heading_left_indent ?? false,
    PreprocessClearHeadingRightIndent: sc.clear_heading_right_indent ?? false,
    PreprocessClearHeadingSpecialIndent: sc.clear_heading_special_indent ?? false,
    PreprocessDeleteEmptyLines: sc.remove_extra_blank_lines ?? false,
    PreprocessClearChartFormat: sc.clear_chart_format ?? false,
    PreprocessClearAllStyles: sc.clear_all_styles ?? true,
    PreprocessClearSnapToGrid: sc.clear_align_grid ?? true,
    PreprocessPostCleanStyles: sc.clean_after_formatting ?? false,

    PreprocessSpaces: config.body?.add_space ?? true,

    PreprocessObjectWrapping: os.object_wrapping ?? true,
    PreprocessFlattenSdt: os.collapse_sdt_tags ?? false,

    PreprocessFigCaption: cd.fig_detection_enabled ?? true,
    PreprocessFigCaptionSpaces: cd.fig_detection_spacing ?? 2,
    PreprocessTblCaption: cd.tbl_detection_enabled ?? true,
    PreprocessTblCaptionSpaces: cd.tbl_detection_spacing ?? 2,

    AutoRefreshFields: c.global_switches?.auto_refresh_fields ?? false,
    CloseWordAfterRefresh: c.global_switches?.close_word_after_refresh ?? true,

    // Table cell settings (from formatParams.table_settings)
    PreprocessTableCellEnable: config.table_settings?.enable ?? false,
    PreprocessTableCellFont: config.table_settings?.cn_font ?? '宋体',
    PreprocessTableCellSize: config.table_settings?.size_cn ?? '四号',
    preprocess_table_cell_line_spacing: config.table_settings?.line_spacing_value ?? 20,
    PreprocessTableCellMinHeight: config.table_settings?.min_line_height ?? 15,
    PreprocessTableCellAlign: config.table_settings?.align ?? 'CENTER',
    PreprocessTableCellBorder: config.table_settings?.border_style ?? 'single',
    PreprocessTableAutoWidth: config.table_settings?.auto_width ?? true,
  }
}

export async function formatDocument(file, config) {
  const formData = new FormData()
  formData.append('file', file)

  const backendConfig = { ...config, ...flattenCleanup(config) }
  delete backendConfig.cleanup

  formData.append('config', JSON.stringify(backendConfig))

  const res = await fetch(`${API_BASE}/api/format`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return await res.blob()
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`)
  return res.ok
}
