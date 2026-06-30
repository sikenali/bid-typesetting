const API_BASE = 'http://localhost:8099'

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
    preprocess_punctuation: tc.punctuation_clean ?? false,
    preprocess_superscript: tc.clear_superscript ?? false,
    preprocess_soft_return: tc.soft_enter_to_hard ?? false,
    preprocess_markdown_to_plaintext: tc.markdown_tags_to_plaintext ?? false,
    preprocess_tab_enabled: tc.tab_to_spaces_enabled ?? false,
    preprocess_tab_mode: tab_mode,

    preprocess_clear_extra_spaces: sc.clear_extra_spaces ?? false,
    preprocess_clear_indents: sc.clear_paragraph_indent ?? false,
    preprocess_clear_heading_indent: sc.clear_heading_indent ?? false,
    preprocess_clear_heading_left_indent: sc.clear_heading_left_indent ?? false,
    preprocess_clear_heading_right_indent: sc.clear_heading_right_indent ?? false,
    preprocess_clear_heading_special_indent: sc.clear_heading_special_indent ?? false,
    preprocess_delete_empty_lines: sc.remove_extra_blank_lines ?? false,
    preprocess_clear_chart_format: sc.clear_chart_format ?? false,
    preprocess_clear_all_styles: sc.clear_all_styles ?? true,
    preprocess_clear_snap_to_grid: sc.clear_align_grid ?? true,
    preprocess_post_clean_styles: sc.clean_after_formatting ?? false,

    preprocess_spaces: config.body?.add_space ?? true,

    preprocess_object_wrapping: os.object_wrapping ?? true,
    preprocess_flatten_sdt: os.collapse_sdt_tags ?? false,

    preprocess_fig_caption: cd.fig_detection_enabled ?? true,
    preprocess_fig_caption_spaces: cd.fig_detection_spacing ?? 2,
    preprocess_tbl_caption: cd.tbl_detection_enabled ?? true,
    preprocess_tbl_caption_spaces: cd.tbl_detection_spacing ?? 2,

    auto_refresh_fields: c.global_switches?.auto_refresh_fields ?? false,
    close_word_after_refresh: c.global_switches?.close_word_after_refresh ?? true,

    // Table cell settings (from formatParams.table_settings)
    preprocess_table_cell_enable: config.table_settings?.enable ?? false,
    preprocess_table_cell_font: config.table_settings?.cn_font ?? '宋体',
    preprocess_table_cell_size: config.table_settings?.size_cn ?? '四号',
    preprocess_table_cell_line_spacing: config.table_settings?.line_spacing_value ?? 20,
    preprocess_table_cell_min_height: config.table_settings?.min_line_height ?? 15,
    preprocess_table_cell_align: config.table_settings?.align ?? 'CENTER',
    preprocess_table_cell_border: config.table_settings?.border_style ?? 'single',
    preprocess_table_auto_width: config.table_settings?.auto_width ?? true,
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
