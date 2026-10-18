// 本地设置持久化 —— 移植自 bid-maker frontend/src/api/settings.ts
// 所有设置使用 localStorage 持久化
import { getApiBase } from '@/utils/apiBase';

const STORAGE_KEY = 'bid-typesetting-settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSettings(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getSetting(key, defaultVal) {
  const settings = loadSettings();
  return settings[key] ?? defaultVal;
}

function setSetting(key, value) {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
}

// ── Theme ──────────────────────────────────────────────────────
export async function getTheme() {
  return { type: getSetting('theme.type', 'parchment') };
}

export async function setTheme(type) {
  setSetting('theme.type', type);
  return { type };
}

// ── Export Settings ────────────────────────────────────────────
const DEFAULT_EXPORT = {
  format: 'docx',
  include_table_of_contents: 1,
  page_numbers: 1,
  header_footer: 1,
  word_keep_style: 1,
  word_toc: 1,
  word_embed_font: 0,
  pdf_high_res: 1,
  pdf_bookmarks: 1,
  pdf_watermark: 0,
  md_keep_tables: 1,
  md_demote_heading: 0,
};

export async function getExportSettings() {
  return getSetting('export', DEFAULT_EXPORT);
}

export async function setExportSettings(data) {
  setSetting('export', data);
}

// ── API Keys ───────────────────────────────────────────────────
export function getApiKeyList() {
  return getSetting('apikeys', []);
}

export async function addApiKey(data) {
  const keys = getSetting('apikeys', []);
  keys.push({
    ...data,
    id: Date.now().toString(),
    enabled: 1,
    createdAt: Date.now(),
  });
  setSetting('apikeys', keys);
}

export async function toggleApiKey(id) {
  const keys = getSetting('apikeys', []);
  const key = keys.find((k) => k.id === id);
  if (key) {
    key.enabled = key.enabled === 1 ? 0 : 1;
    setSetting('apikeys', keys);
    return { enabled: key.enabled };
  }
  return { enabled: 0 };
}

export async function deleteApiKey(id) {
  const keys = getSetting('apikeys', []);
  setSetting('apikeys', keys.filter((k) => k.id !== id));
}

export async function testApiKey(data) {
  const keys = getSetting('apikeys', []);
  const key = data.id ? keys.find((k) => k.id === data.id) : null;
  const apiKey = data.key || key?.api_key || '';
  const provider = data.provider || key?.provider || '';
  const format = data.format || key?.format || 'openai';

  if (!apiKey) return { available: false, error: '未配置 API Key' };

  try {
    const resp = await fetch(getApiBase() + '/api/config/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        model: data.model || key?.model || '',
        key: apiKey,
        endpoint: data.endpoint || key?.base_url || '',
        format,
      }),
    });
    return await resp.json();
  } catch (err) {
    return { available: false, error: err?.message || '测试失败' };
  }
}

export async function updateApiKey(id, data) {
  const keys = getSetting('apikeys', []);
  const key = keys.find((k) => k.id === id);
  if (key) {
    if (data.provider) key.provider = data.provider;
    if (data.model) key.model = data.model;
    if (data.api_key) key.api_key = data.api_key;
    if (data.base_url !== undefined) key.base_url = data.base_url;
    if (data.format !== undefined) key.format = data.format;
    setSetting('apikeys', keys);
  }
}

// ── Templates ──────────────────────────────────────────────────
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: '标准投标模板',
    type: 'bidding',
    category: '综合类',
    description: '适用于大多数招标项目的标准投标文件模板',
    keywords: ['标准', '通用', '综合'],
    content: [
      { title: '第一章 投标函', level: 1 },
      { title: '第二章 法定代表人身份证明', level: 1 },
      { title: '第三章 授权委托书', level: 1 },
      { title: '第四章 投标保证金', level: 1 },
      {
        title: '第五章 商务标',
        level: 1,
        children: [
          { title: '5.1 投标报价表', level: 2 },
          { title: '5.2 企业资质证书', level: 2 },
          { title: '5.3 业绩清单', level: 2 },
        ],
      },
      {
        title: '第六章 技术标',
        level: 1,
        children: [
          { title: '6.1 技术方案', level: 2 },
          { title: '6.2 质量保障措施', level: 2 },
          { title: '6.3 售后服务方案', level: 2 },
        ],
      },
    ],
    createdAt: Date.now(),
  },
  {
    id: 2,
    name: '技术方案模板',
    type: 'proposal',
    category: '技术类',
    description: '专注于技术方案部分的专业模板',
    keywords: ['技术', '方案', '专业'],
    content: [
      { title: '一、项目概述', level: 1 },
      { title: '二、技术需求分析', level: 1 },
      {
        title: '三、总体技术方案',
        level: 1,
        children: [
          { title: '3.1 系统架构设计', level: 2 },
          { title: '3.2 关键技术选型', level: 2 },
        ],
      },
      {
        title: '四、实施方案',
        level: 1,
        children: [
          { title: '4.1 实施计划', level: 2 },
          { title: '4.2 人员配置', level: 2 },
          { title: '4.3 质量保证', level: 2 },
        ],
      },
      { title: '五、售后服务', level: 1 },
    ],
    createdAt: Date.now(),
  },
  {
    id: 3,
    name: '商务标模板',
    type: 'bidding',
    category: '商务类',
    description: '商务标专用模板，包含资质、业绩等模块',
    keywords: ['商务', '资质', '业绩'],
    content: [
      { title: '第一章 投标报价', level: 1 },
      {
        title: '第二章 企业资质',
        level: 1,
        children: [
          { title: '2.1 营业执照', level: 2 },
          { title: '2.2 资质证书', level: 2 },
          { title: '2.3 质量管理体系认证', level: 2 },
        ],
      },
      { title: '第三章 业绩证明', level: 1 },
      { title: '第四章 财务状况', level: 1 },
      { title: '第五章 售后服务承诺', level: 1 },
    ],
    createdAt: Date.now(),
  },
  {
    id: 201,
    kind: 'typography',
    type: 'custom',
    name: 'GB/T 7714 顺序编码制',
    category: '学术',
    description: 'GB/T 7714-2015 顺序编码制参考文献格式',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-jade-light',
    iconColor: '#5B8C5A',
    createdAt: Date.now(),
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
    id: 202,
    kind: 'typography',
    type: 'custom',
    name: 'GB/T 7714 著者-出版年制',
    category: '学术',
    description: 'GB/T 7714-2015 著者-出版年制参考文献格式',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-jade-light',
    iconColor: '#5B8C5A',
    createdAt: Date.now(),
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
    id: 203,
    kind: 'typography',
    type: 'custom',
    name: 'GB/T 9704 标准公文',
    category: '公文',
    description: 'GB/T 9704-2012 党政机关公文格式标准',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-cinnabar',
    iconColor: '#C23B22',
    createdAt: Date.now(),
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
    id: 204,
    kind: 'typography',
    type: 'custom',
    name: 'GJB438C 软件需求规格说明',
    category: '军标',
    description: 'GJB 438C-2021 [5.10] 军用软件开发文档通用要求',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    createdAt: Date.now(),
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
    id: 205,
    kind: 'typography',
    type: 'custom',
    name: 'GJB438C 软件设计说明',
    category: '军标',
    description: 'GJB 438C-2021 [5.11] 军用软件开发文档通用要求',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    createdAt: Date.now(),
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
    id: 206,
    kind: 'typography',
    type: 'custom',
    name: 'GJB438C 软件测试计划',
    category: '军标',
    description: 'GJB 438C-2021 [5.14] 军用软件开发文档通用要求',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    createdAt: Date.now(),
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
    id: 207,
    kind: 'typography',
    type: 'custom',
    name: 'GJB438C 软件测试说明',
    category: '军标',
    description: 'GJB 438C-2021 [5.13] 军用软件开发文档通用要求',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    createdAt: Date.now(),
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
    id: 208,
    kind: 'typography',
    type: 'custom',
    name: 'GJB438C 软件测试报告',
    category: '军标',
    description: 'GJB 438C-2021 [5.14] 军用软件开发文档通用要求',
    builtIn: true,
    enabled: 1,
    content: [],
    keywords: [],
    spineColor: 'bg-indigo-500',
    iconColor: '#4F46E5',
    createdAt: Date.now(),
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
];

export function getTemplateList() {
  const raw = getSetting('templates', DEFAULT_TEMPLATES);
  const templates = raw.map(t => ({
    ...t,
    kind: t.kind || 'outline',
    enabled: t.enabled ?? 1,
    builtIn: t.builtIn ?? false,
    content: t.content || [],
  }));
  return { templates };
}

export async function createTemplate(data) {
  const templates = getSetting('templates', DEFAULT_TEMPLATES);
  const maxId = templates.reduce((max, t) => Math.max(max, t.id || 0), 0);
  const newId = Math.max(maxId + 1, 1000);
  templates.push({
    ...data,
    id: newId,
    kind: data.kind || 'outline',
    builtIn: false,
    enabled: 1,
    content: data.kind === 'typography' ? [] : (data.content || []),
    createdAt: Date.now(),
  });
  setSetting('templates', templates);
}

export async function updateTemplate(id, data) {
  const templates = getSetting('templates', DEFAULT_TEMPLATES);
  const idx = templates.findIndex((t) => t.id === id);
  if (idx >= 0) {
    templates[idx] = { ...templates[idx], ...data };
    setSetting('templates', templates);
  }
}

export async function deleteTemplate(id) {
  const templates = getSetting('templates', DEFAULT_TEMPLATES);
  setSetting('templates', templates.filter((t) => t.id !== id));
}

export async function resetTemplates() {
  setSetting('templates', DEFAULT_TEMPLATES);
  return { templates: DEFAULT_TEMPLATES };
}
