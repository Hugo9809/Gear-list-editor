const STORAGE_VERSION = 2;
const DB_NAME = 'gear-list-editor';
const STORE_NAME = 'state';
const PRIMARY_KEY = 'primary';
const LEGACY_STORAGE_KEY = 'gear-list-editor.data';
const LEGACY_BACKUP_KEY = 'gear-list-editor.backup';
const OPFS_DIR = 'gear-list-editor';
const OPFS_BACKUP_FILE = 'gear-list-backup.json';
const OPFS_BACKUP_PREVIOUS_FILE = 'gear-list-backup-prev.json';
const AUTOSAVE_DELAY = 700;
const MAX_AUTOSAVE_DELAY = 5000;

const hasIndexedDb = () => typeof indexedDB !== 'undefined';
const hasOpfs = () => typeof navigator !== 'undefined' && navigator.storage?.getDirectory;

export const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

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
  lastSaved: null
});

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

const normalizeNotes = (notes) => {
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
  return items.map((item, index) => {
    const rawName = normalizeText(item?.name);
    const quantityCandidate = item?.quantity ?? item?.qty ?? 1;
    const parsedQuantity = Number(quantityCandidate);
    return {
      id: typeof item?.id === 'string' && item.id ? item.id : createId(),
      name: rawName || `Untitled item ${index + 1}`,
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
      unit: normalizeText(item?.unit),
      details: normalizeText(item?.details),
      status: normalizeStatus(item?.status)
    };
  });
};

const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }
  return categories.map((category, index) => {
    const rawName = normalizeText(category?.name);
    return {
      id: typeof category?.id === 'string' && category.id ? category.id : createId(),
      name: rawName || `Category ${index + 1}`,
      notes: normalizeNotes(category?.notes),
      items: normalizeItems(category?.items)
    };
  });
};

const normalizeProject = (project, index) => {
  const rawName = normalizeText(project?.name);
  return {
    id: typeof project?.id === 'string' && project.id ? project.id : createId(),
    name: rawName || `Untitled project ${index + 1}`,
    client: normalizeText(project?.client),
    shootDate: normalizeText(project?.shootDate),
    location: normalizeText(project?.location),
    contact: normalizeText(project?.contact),
    notes: normalizeNotes(project?.notes),
    categories: normalizeCategories(project?.categories)
  };
};

const normalizeTemplate = (template, index) => {
  const rawName = normalizeText(template?.name);
  return {
    id: typeof template?.id === 'string' && template.id ? template.id : createId(),
    name: rawName || `Template ${index + 1}`,
    description: normalizeText(template?.description),
    notes: normalizeNotes(template?.notes),
    categories: normalizeCategories(template?.categories),
    lastUsed: normalizeText(template?.lastUsed)
  };
};

const normalizeHistory = (history) => {
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

const mergeHistoryEntries = (current, incoming) => {
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

const deriveHistoryFromProjects = (projects, baseHistory) => {
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
    errors.push('Payload is missing or invalid.');
    return { valid: false, errors };
  }
  if (!Array.isArray(payload.projects)) {
    errors.push('Projects must be an array.');
  }
  if (!Array.isArray(payload.templates)) {
    errors.push('Templates must be an array.');
  }
  if (payload.history && typeof payload.history !== 'object') {
    errors.push('History must be an object when provided.');
  }
  if (payload.version !== undefined && !Number.isFinite(Number(payload.version))) {
    errors.push('Version must be numeric when provided.');
  }
  return { valid: errors.length === 0, errors };
};

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
    const defaultProject = normalizeProject(
      {
        name: 'Imported gear list',
        notes: legacyNotes,
        categories: [
          {
            name: 'General gear',
            items: legacyItems
          }
        ]
      },
      0
    );
    projects = [defaultProject, ...projects];
  }

  const templates = Array.isArray(payload.templates) ? payload.templates.map(normalizeTemplate) : [];
  const history = normalizeHistory(payload.history);
  const mergedHistory = {
    ...history,
    items: deriveHistoryFromProjects(projects, history.items)
  };

  const lastSaved = typeof payload.lastSaved === 'string' ? payload.lastSaved : null;
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
    lastSaved
  };
};

const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const openDb = () =>
  new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed.'));
  });

const readFromIndexedDb = async () => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(PRIMARY_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error || new Error('IndexedDB read failed.'));
  });
};

const writeToIndexedDb = async (payload) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(payload, PRIMARY_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('IndexedDB write failed.'));
  });
};

const readFromOpfsFile = async (fileName) => {
  if (!hasOpfs()) {
    return null;
  }
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(OPFS_DIR, { create: true });
    const fileHandle = await dir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return safeParse(text);
  } catch {
    return null;
  }
};

const writeOpfsFile = async (fileName, payload) => {
  if (!hasOpfs()) {
    return;
  }
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle(OPFS_DIR, { create: true });
  const handle = await dir.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(payload, null, 2));
  await writable.close();
};

const writeOpfsBackup = async (payload) => {
  if (!hasOpfs()) {
    return;
  }
  const latest = await readFromOpfsFile(OPFS_BACKUP_FILE);
  if (latest) {
    await writeOpfsFile(OPFS_BACKUP_PREVIOUS_FILE, latest);
  }
  await writeOpfsFile(OPFS_BACKUP_FILE, payload);
};

const readLegacyBackup = () => safeParse(localStorage.getItem(LEGACY_BACKUP_KEY));

const writeLegacyBackups = (payload) => {
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors; OPFS or IndexedDB may still succeed.
  }
};

const preparePayload = (state, reason = 'autosave') => {
  const migrated = migratePayload(state);
  return {
    ...migrated,
    lastSaved: new Date().toISOString(),
    savedBy: reason
  };
};

const getPayloadTimestamp = (payload) => {
  if (!payload) {
    return null;
  }
  const timestamp = Date.parse(payload.lastSaved ?? '');
  return Number.isFinite(timestamp) ? timestamp : null;
};

const collectWarnings = (errors) =>
  errors.length === 0
    ? []
    : [
        'Some storage locations could not be updated. Your latest data is still preserved in other backups.'
      ];

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
    activeProjectId: base.activeProjectId || next.activeProjectId || projects[0]?.id || null
  };
};

export const exportState = (state) => {
  const payload = preparePayload(state, 'export');
  const json = JSON.stringify(payload, null, 2);
  const fileName = `gear-list-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return { json, fileName, payload };
};

export const exportProjectBackup = (state, projectId) => {
  const migrated = migratePayload(state);
  const project = migrated.projects.find((item) => item.id === projectId);
  const exportDate = new Date().toISOString().slice(0, 10);
  if (!project) {
    return exportState({
      ...migrated,
      projects: [],
      templates: [],
      history: { items: [], categories: [] },
      activeProjectId: null
    });
  }
  const historyFromProject = deriveHistoryFromProjects([project], { items: [], categories: [] });
  const categoryNames = Array.from(
    new Set(project.categories.map((category) => normalizeText(category.name)).filter(Boolean))
  );
  const filteredState = {
    ...migrated,
    projects: [project],
    templates: [],
    history: {
      items: historyFromProject.items,
      categories: categoryNames
    },
    activeProjectId: project.id
  };
  const exported = exportState(filteredState);
  const safeProjectName = normalizeText(project.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = safeProjectName
    ? `gear-list-project-${safeProjectName}-${exportDate}.json`
    : `gear-list-project-${exportDate}.json`;
  return {
    ...exported,
    fileName
  };
};

const getBestBackup = async () => {
  const opfsLatest = await readFromOpfsFile(OPFS_BACKUP_FILE);
  if (opfsLatest) {
    return { payload: opfsLatest, source: 'Device backup (latest)' };
  }
  const opfsPrevious = await readFromOpfsFile(OPFS_BACKUP_PREVIOUS_FILE);
  if (opfsPrevious) {
    return { payload: opfsPrevious, source: 'Device backup (previous)' };
  }
  const legacyBackup = readLegacyBackup();
  if (legacyBackup) {
    return { payload: legacyBackup, source: 'Legacy local backup' };
  }
  return { payload: null, source: null };
};

export const createStorageService = (options = {}) => {
  let autosaveTimer = null;
  let autosaveStart = null;
  let pendingState = null;
  let saveQueue = Promise.resolve();

  const queueSave = (task) => {
    saveQueue = saveQueue.then(task).catch((error) => {
      options.onWarning?.('Autosave encountered a storage error. Your data is still safe in memory.');
      return { payload: null, warnings: ['Autosave encountered a storage error.'], error };
    });
    return saveQueue;
  };

  const persist = async (state, reason) => {
    const payload = preparePayload(state, reason);
    const errors = [];

    try {
      await writeToIndexedDb(payload);
    } catch (error) {
      errors.push(error);
    }

    try {
      await writeOpfsBackup(payload);
    } catch (error) {
      errors.push(error);
    }

    writeLegacyBackups(payload);

    const warnings = collectWarnings(errors);
    if (warnings.length > 0) {
      options.onWarning?.(warnings[0]);
    }
    options.onSaved?.(payload, { reason, warnings });
    return { payload, warnings };
  };

  const loadState = async () => {
    let payload = null;
    let source = 'Empty';
    let warnings = [];
    let backup = { payload: null, source: null };

    if (hasIndexedDb()) {
      try {
        payload = await readFromIndexedDb();
        if (payload) {
          source = 'IndexedDB';
        }
      } catch {
        warnings = ['IndexedDB was unavailable. Checking device backups instead.'];
      }
    }

    backup = await getBestBackup();
    if (!payload && backup.payload) {
      payload = backup.payload;
      source = backup.source || 'Device backup';
    }

    if (payload && backup.payload && source === 'IndexedDB') {
      const primaryTime = getPayloadTimestamp(payload);
      const backupTime = getPayloadTimestamp(backup.payload);
      const hasPrimaryTime = primaryTime !== null;
      const hasBackupTime = backupTime !== null;
      if ((!hasPrimaryTime && hasBackupTime) || (hasPrimaryTime && hasBackupTime && backupTime > primaryTime)) {
        payload = backup.payload;
        source = backup.source || 'Device backup';
      }
    }

    const migrated = migratePayload(payload);
    const validation = validatePayload(migrated);
    const state = validation.valid ? migrated : createEmptyState();
    if (!validation.valid) {
      warnings = warnings.concat(validation.errors);
    }

    if (payload && source !== 'IndexedDB') {
      await queueSave(() => persist(state, 'rehydrate'));
    }

    return {
      state,
      source,
      warnings
    };
  };

  const scheduleAutosave = (state) => {
    pendingState = state;
    const now = Date.now();
    if (!autosaveStart) {
      autosaveStart = now;
    }
    const shouldFlush = autosaveTimer && now - autosaveStart >= MAX_AUTOSAVE_DELAY;
    if (shouldFlush) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    if (!autosaveTimer) {
      autosaveTimer = setTimeout(() => {
        autosaveTimer = null;
        autosaveStart = null;
        const stateToSave = pendingState;
        pendingState = null;
        queueSave(() => persist(stateToSave, 'autosave'));
      }, AUTOSAVE_DELAY);
    }
  };

  const saveNow = (state) => queueSave(() => persist(state, 'explicit'));

  const exportBackup = (state) => exportState(state);
  const exportProject = (state, projectId) => exportProjectBackup(state, projectId);

  const importBackup = (rawText, currentState) => {
    const parsed = safeParse(rawText);
    if (!parsed) {
      return {
        state: migratePayload(currentState),
        warnings: ['Import failed. Please choose a valid backup file.']
      };
    }
    const merged = mergePayloads(currentState, parsed);
    return {
      state: merged,
      warnings: []
    };
  };

  const restoreFromBackup = async () => {
    const backup = await getBestBackup();
    if (!backup.payload) {
      return {
        state: createEmptyState(),
        source: 'None',
        warnings: ['No device backup was found yet.']
      };
    }
    const migrated = migratePayload(backup.payload);
    await queueSave(() => persist(migrated, 'restore'));
    return {
      state: migrated,
      source: backup.source,
      warnings: []
    };
  };

  const dispose = () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
    autosaveTimer = null;
    autosaveStart = null;
    pendingState = null;
  };

  return {
    loadState,
    scheduleAutosave,
    saveNow,
    exportBackup,
    exportProjectBackup: exportProject,
    importBackup,
    restoreFromBackup,
    dispose
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
