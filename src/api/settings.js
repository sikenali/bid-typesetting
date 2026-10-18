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
];

export function getTemplateList() {
  return { templates: getSetting('templates', DEFAULT_TEMPLATES) };
}

export async function createTemplate(data) {
  const templates = getSetting('templates', DEFAULT_TEMPLATES);
  const maxId = templates.reduce((max, t) => Math.max(max, t.id || 0), 0);
  templates.push({
    ...data,
    id: maxId + 1,
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
