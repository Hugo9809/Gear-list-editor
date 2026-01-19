// @ts-check
/**
 * @fileoverview Data normalization and validation utilities.
 * All data entering the system flows through these functions.
 */

/** @typedef {import('../types.js').Item} Item */
/** @typedef {import('../types.js').Category} Category */
/** @typedef {import('../types.js').Project} Project */
/** @typedef {import('../types.js').Template} Template */
/** @typedef {import('../types.js').History} History */
/** @typedef {import('../types.js').HistoryEntry} HistoryEntry */

export const STORAGE_MESSAGE_KEYS = {
  defaults: {
    item: 'defaults.untitled_item',
    category: 'defaults.untitled_category',
    project: 'defaults.untitled_project',
    template: 'defaults.untitled_template',
    importedProject: 'defaults.imported_project',
    importedCategory: 'defaults.imported_category'
  },
  errors: {
    payloadInvalid: 'errors.payload_invalid',
    projectsInvalid: 'errors.projects_invalid',
    templatesInvalid: 'errors.templates_invalid',
    historyInvalid: 'errors.history_invalid',
    deviceLibraryInvalid: 'errors.device_library_invalid',
    versionInvalid: 'errors.version_invalid'
  },
  warnings: {
    storageLocationsUnavailable: 'warnings.storage_locations_unavailable',
    autosaveStorageError: 'warnings.autosave_storage_error',
    indexedDbUnavailable: 'warnings.indexeddb_unavailable',
    importInvalid: 'warnings.import_invalid',
    importValidationFailed: 'warnings.import_validation_failed',
    noDeviceBackup: 'warnings.no_device_backup'
  },
  sources: {
    empty: 'sources.empty',
    indexedDb: 'sources.indexeddb',
    deviceBackupLatest: 'sources.device_backup_latest',
    deviceBackupPrevious: 'sources.device_backup_previous',
    legacyLocalBackup: 'sources.legacy_local_backup',
    deviceBackup: 'sources.device_backup'
  }
};

export const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

const normalizeText = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  try {
    return String(value).trim();
  } catch {
    return '';
  }
};

export const normalizeNotes = (notes) => {
  if (typeof notes === 'string') {
    return notes;
  }
  if (notes === null || notes === undefined) {
    return '';
  }
  try {
    return JSON.stringify(notes);
  } catch {
    return String(notes);
  }
};

const normalizeStatus = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  const allowed = new Set(['needed', 'packed', 'missing', 'rented']);
  return allowed.has(normalized) ? normalized : 'needed';
};

export const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => {
    const rawName = normalizeText(item?.name);
    const quantityCandidate = item?.quantity ?? item?.qty ?? 1;
    const parsedQuantity = Number(quantityCandidate);
    return {
      id: typeof item?.id === 'string' && item.id ? item.id : createId(),
      name: rawName || STORAGE_MESSAGE_KEYS.defaults.item,
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
      unit: normalizeText(item?.unit),
      details: normalizeText(item?.details),
      status: normalizeStatus(item?.status)
    };
  });
};

export const normalizeLibraryItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => {
    const rawName = normalizeText(item?.name);
    const quantityCandidate = item?.quantity ?? item?.qty ?? 1;
    const parsedQuantity = Number(quantityCandidate);
    return {
      id: typeof item?.id === 'string' && item.id ? item.id : createId(),
      name: rawName || STORAGE_MESSAGE_KEYS.defaults.item,
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
      unit: normalizeText(item?.unit),
      details: normalizeText(item?.details),
      category: normalizeText(item?.category),
      dateAdded: normalizeText(item?.dateAdded) || new Date().toISOString()
    };
  });
};

const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }
  return categories.map((category) => {
    const rawName = normalizeText(category?.name);
    return {
      id: typeof category?.id === 'string' && category.id ? category.id : createId(),
      name: rawName || STORAGE_MESSAGE_KEYS.defaults.category,
      notes: normalizeNotes(category?.notes),
      items: normalizeItems(category?.items)
    };
  });
};

export const normalizeProject = (project) => {
  const rawName = normalizeText(project?.name);
  return {
    id: typeof project?.id === 'string' && project.id ? project.id : createId(),
    name: rawName || STORAGE_MESSAGE_KEYS.defaults.project,
    client: normalizeText(project?.client),
    shootDate: normalizeText(project?.shootDate),
    location: normalizeText(project?.location),
    contact: normalizeText(project?.contact),
    notes: normalizeNotes(project?.notes),
    categories: normalizeCategories(project?.categories)
  };
};

export const normalizeTemplate = (template) => {
  const rawName = normalizeText(template?.name);
  return {
    id: typeof template?.id === 'string' && template.id ? template.id : createId(),
    name: rawName || STORAGE_MESSAGE_KEYS.defaults.template,
    description: normalizeText(template?.description),
    notes: normalizeNotes(template?.notes),
    categories: normalizeCategories(template?.categories),
    lastUsed: normalizeText(template?.lastUsed)
  };
};

export const normalizeHistory = (history) => {
  const items = Array.isArray(history?.items) ? history.items : [];
  const categories = Array.isArray(history?.categories) ? history.categories : [];
  return {
    items: items
      .map((entry) => ({
        name: normalizeText(entry?.name),
        unit: normalizeText(entry?.unit),
        details: normalizeText(entry?.details),
        lastUsed: normalizeText(entry?.lastUsed)
      }))
      .filter((entry) => entry.name),
    categories: categories.map((entry) => normalizeText(entry)).filter(Boolean)
  };
};

export const mergeHistoryEntries = (current, incoming) => {
  const map = new Map();
  const upsert = (entry) => {
    const key = entry.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, entry);
      return;
    }
    const existing = map.get(key);
    map.set(key, {
      ...existing,
      ...entry,
      lastUsed: entry.lastUsed || existing.lastUsed
    });
  };
  current.forEach(upsert);
  incoming.forEach(upsert);
  return Array.from(map.values());
};

export const deriveHistoryFromProjects = (projects, baseHistory) => {
  const items = [];
  projects.forEach((project) => {
    project.categories.forEach((category) => {
      category.items.forEach((item) => {
        items.push({
          name: item.name,
          unit: item.unit,
          details: item.details,
          lastUsed: project.shootDate || ''
        });
      });
    });
  });
  return mergeHistoryEntries(baseHistory, items);
};

export const validatePayload = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push(STORAGE_MESSAGE_KEYS.errors.payloadInvalid);
    return { valid: false, errors };
  }
  if (!Array.isArray(payload.projects)) {
    errors.push(STORAGE_MESSAGE_KEYS.errors.projectsInvalid);
  }
  if (!Array.isArray(payload.templates)) {
    errors.push(STORAGE_MESSAGE_KEYS.errors.templatesInvalid);
  }
  if (payload.history && typeof payload.history !== 'object') {
    errors.push(STORAGE_MESSAGE_KEYS.errors.historyInvalid);
  }
  if (payload.deviceLibrary && typeof payload.deviceLibrary !== 'object') {
    errors.push(STORAGE_MESSAGE_KEYS.errors.deviceLibraryInvalid);
  }
  if (payload.version !== undefined && !Number.isFinite(Number(payload.version))) {
    errors.push(STORAGE_MESSAGE_KEYS.errors.versionInvalid);
  }
  return { valid: errors.length === 0, errors };
};

export const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
