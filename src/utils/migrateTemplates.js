// 一次性把旧 useTemplates.js 的 localStorage 'bid-page-user-templates' 迁入
// 新 settings 'templates' 存储，标记 'migrated.from-use-templates'。

import { getTemplateList } from '@/api/settings';

const OLD_KEY = 'bid-page-user-templates';
const MIGRATION_FLAG = 'migrated.from-use-templates';

export function migrateLegacyTemplates() {
  try {
    const stored = localStorage.getItem('bid-typesetting-settings');
    const settings = stored ? (JSON.parse(stored) || {}) : {};
    if (typeof settings !== 'object' || settings === null) return;
    if (settings[MIGRATION_FLAG]) return;

    const raw = localStorage.getItem(OLD_KEY);
    let legacy = [];
    let legacyParseFailed = false;
    try {
      legacy = raw ? JSON.parse(raw) : [];
    } catch (e) {
      legacyParseFailed = true;
      console.warn('[migrateTemplates] legacy parse failed:', e);
      legacy = [];
    }

    const baseTemplates = getTemplateList().templates;
    const existing = Array.isArray(settings.templates) ? settings.templates : [];
    const seen = new Set(existing.map(t => t.id));
    const merged = [...existing];
    for (const t of baseTemplates) {
      if (!seen.has(t.id)) {
        merged.push(t);
        seen.add(t.id);
      }
    }
    let maxId = merged.reduce((m, t) => Math.max(m, t.id || 0), 0);

    if (Array.isArray(legacy) && legacy.length > 0) {
      const migrated = legacy.map((t) => {
        let nextId = maxId + 1;
        while (seen.has(nextId)) nextId += 1;
        seen.add(nextId);
        maxId = nextId;
        return {
          ...t,
          id: nextId,
          kind: 'typography',
          builtIn: false,
          enabled: 1,
          content: [],
          keywords: t.keywords || [],
          type: 'custom',
          createdAt: t.createdAt || Date.now(),
        };
      });
      settings.templates = [...merged, ...migrated];
      console.log(`[migrateTemplates] migrated ${migrated.length} templates`);
    } else {
      settings.templates = merged;
    }

    settings[MIGRATION_FLAG] = true;
    localStorage.setItem('bid-typesetting-settings', JSON.stringify(settings));

    if (!legacyParseFailed) {
      localStorage.removeItem(OLD_KEY);
      localStorage.removeItem('bid-page-templates-initialized');
    }
  } catch (e) {
    console.warn('[migrateTemplates] migration failed:', e);
  }
}
