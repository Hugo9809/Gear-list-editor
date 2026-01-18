// @ts-check
/**
 * @fileoverview Data migration and schema versioning utilities.
 * Handles legacy data formats and payload merging.
 */

/** @typedef {import('../types.js').AppState} AppState */
/** @typedef {import('../types.js').Project} Project */
/** @typedef {import('../types.js').Template} Template */
/** @typedef {import('../types.js').History} History */

import {
  STORAGE_MESSAGE_KEYS,
  createId,
  deriveHistoryFromProjects,
  mergeHistoryEntries,
  normalizeHistory,
  normalizeItems,
  normalizeNotes,
  normalizeProject,
  normalizeTemplate
} from './normalize.js';

export const STORAGE_VERSION = 2;

export const createEmptyState = () => ({
  version: STORAGE_VERSION,
  theme: 'light',
  projects: [],
  templates: [],
  history: {
    items: [],
    categories: []
  },
  activeProjectId: null,
  lastSaved: null,
  showAutoBackups: false
});

export const migratePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return createEmptyState();
  }
  const version = Number.isFinite(Number(payload.version)) ? Number(payload.version) : 0;
  const legacyItems = normalizeItems(payload.items);
  const legacyNotes = normalizeNotes(payload.notes);
  const theme =
    typeof payload.theme === 'string' && payload.theme.trim() ? payload.theme.trim() : 'light';

  let projects = Array.isArray(payload.projects) ? payload.projects.map(normalizeProject) : [];
  if (version <= 1 && legacyItems.length > 0) {
    const defaultProject = normalizeProject({
      name: STORAGE_MESSAGE_KEYS.defaults.importedProject,
      notes: legacyNotes,
      categories: [
        {
          name: STORAGE_MESSAGE_KEYS.defaults.importedCategory,
          items: legacyItems
        }
      ]
    });
    projects = [defaultProject, ...projects];
  }

  const templates = Array.isArray(payload.templates) ? payload.templates.map(normalizeTemplate) : [];
  const history = normalizeHistory(payload.history);
  const mergedHistory = {
    ...history,
    items: deriveHistoryFromProjects(projects, history.items)
  };

  const lastSaved = typeof payload.lastSaved === 'string' ? payload.lastSaved : null;
  const showAutoBackups = typeof payload.showAutoBackups === 'boolean' ? payload.showAutoBackups : false;
  const activeProjectId =
    typeof payload.activeProjectId === 'string'
      ? payload.activeProjectId
      : projects[0]?.id || null;

  return {
    version: STORAGE_VERSION,
    theme,
    projects,
    templates,
    history: mergedHistory,
    activeProjectId,
    lastSaved,
    showAutoBackups
  };
};

const mergeProjectArrays = (current, incoming) => {
  const merged = [...current];
  const existingIds = new Set(current.map((project) => project.id));
  incoming.forEach((project) => {
    if (existingIds.has(project.id)) {
      merged.push({ ...project, id: createId() });
    } else {
      merged.push(project);
      existingIds.add(project.id);
    }
  });
  return merged;
};

const mergeTemplates = (current, incoming) => {
  const merged = [...current];
  const existingIds = new Set(current.map((template) => template.id));
  incoming.forEach((template) => {
    if (existingIds.has(template.id)) {
      merged.push({ ...template, id: createId() });
    } else {
      merged.push(template);
      existingIds.add(template.id);
    }
  });
  return merged;
};

export const mergePayloads = (current, incoming) => {
  const base = migratePayload(current);
  const next = migratePayload(incoming);
  const projects = mergeProjectArrays(base.projects, next.projects);
  const templates = mergeTemplates(base.templates, next.templates);
  const history = {
    items: mergeHistoryEntries(base.history.items, next.history.items),
    categories: Array.from(
      new Set([...(base.history.categories || []), ...(next.history.categories || [])])
    )
  };

  return {
    ...base,
    theme: base.theme,
    projects,
    templates,
    history,
    showAutoBackups: base.showAutoBackups,
    activeProjectId: base.activeProjectId || next.activeProjectId || projects[0]?.id || null
  };
};

export const validationSamples = () => ({
  validPayload: {
    version: STORAGE_VERSION,
    theme: 'light',
    projects: [
      {
        id: 'sample-project',
        name: 'Demo shoot',
        client: 'Studio A',
        categories: [
          {
            id: 'cat-1',
            name: 'Camera',
            items: [{ id: 'sample-item', name: 'Camera body', quantity: 1, unit: 'pcs', details: 'FX6' }]
          }
        ]
      }
    ],
    templates: [],
    history: {
      items: [{ name: 'Camera body', unit: 'pcs', details: 'FX6', lastUsed: new Date().toISOString() }],
      categories: ['Camera']
    },
    activeProjectId: 'sample-project',
    lastSaved: new Date().toISOString()
  },
  legacyPayload: {
    items: [{ name: 'Legacy mic', quantity: '2' }],
    notes: ['legacy note']
  }
});
