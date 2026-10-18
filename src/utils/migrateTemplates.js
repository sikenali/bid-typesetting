// 一次性把旧 useTemplates.js 的 localStorage 'bid-page-user-templates' 迁入
// 新 settings 'templates' 存储，标记 'migrated.from-use-templates'。

const OLD_KEY = 'bid-page-user-templates';
const MIGRATION_FLAG = 'migrated.from-use-templates';

export function migrateLegacyTemplates() {
  try {
    const settings = JSON.parse(localStorage.getItem('bid-typesetting-settings') || '{}');
    if (settings[MIGRATION_FLAG]) return;

    const raw = localStorage.getItem(OLD_KEY);
    let legacy = [];
    try { legacy = raw ? JSON.parse(raw) : []; } catch { legacy = []; }

    if (Array.isArray(legacy) && legacy.length > 0) {
      const templates = settings.templates || [];
      let maxId = templates.reduce((m, t) => Math.max(m, t.id || 0), 0);
      const migrated = legacy.map((t) => {
        maxId += 1;
        return {
          ...t,
          id: maxId,
          kind: 'typography',
          builtIn: false,
          enabled: 1,
          content: [],
          keywords: [],
          type: 'custom',
          createdAt: Date.now(),
        };
      });
      settings.templates = [...templates, ...migrated];
    }

    settings[MIGRATION_FLAG] = true;
    localStorage.setItem('bid-typesetting-settings', JSON.stringify(settings));
    localStorage.removeItem(OLD_KEY);
    localStorage.removeItem('bid-page-templates-initialized');
  } catch (e) {
    console.warn('[migrateTemplates] migration failed:', e);
  }
}
