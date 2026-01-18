const STORAGE_VERSION = 1;
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
  items: [],
  notes: '',
  lastSaved: null
});

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

export const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item, index) => {
    const rawName =
      typeof item?.name === 'string'
        ? item.name
        : item?.name !== undefined && item?.name !== null
          ? String(item.name)
          : '';
    const name = rawName.trim();
    const quantityCandidate = item?.quantity ?? item?.qty ?? 1;
    const parsedQuantity = Number(quantityCandidate);
    return {
      id: typeof item?.id === 'string' && item.id ? item.id : createId(),
      name: name || `Untitled item ${index + 1}`,
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1
    };
  });
};

export const validatePayload = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('Payload is missing or invalid.');
    return { valid: false, errors };
  }
  if (!Array.isArray(payload.items)) {
    errors.push('Items must be an array.');
  }
  if (payload.notes !== undefined && payload.notes !== null && typeof payload.notes !== 'string') {
    errors.push('Notes must be a string when provided.');
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
  const items = normalizeItems(payload.items);
  const notes = normalizeNotes(payload.notes);
  const lastSaved = typeof payload.lastSaved === 'string' ? payload.lastSaved : null;

  if (version <= 0) {
    return {
      version: STORAGE_VERSION,
      items,
      notes,
      lastSaved
    };
  }

  return {
    version: STORAGE_VERSION,
    items,
    notes,
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

const mergeNotes = (first, second) => {
  const trimmedFirst = first.trim();
  const trimmedSecond = second.trim();
  if (!trimmedSecond) {
    return trimmedFirst;
  }
  if (!trimmedFirst) {
    return trimmedSecond;
  }
  if (trimmedFirst.includes(trimmedSecond)) {
    return trimmedFirst;
  }
  return `${trimmedFirst}\n${trimmedSecond}`.trim();
};

export const mergePayloads = (current, incoming) => {
  const base = migratePayload(current);
  const next = migratePayload(incoming);
  const items = [...base.items];
  const existingIds = new Set(items.map((item) => item.id));
  next.items.forEach((item) => {
    if (existingIds.has(item.id)) {
      items.push({ ...item, id: createId() });
    } else {
      items.push(item);
      existingIds.add(item.id);
    }
  });

  return {
    ...base,
    items,
    notes: mergeNotes(base.notes, next.notes)
  };
};

export const exportState = (state) => {
  const payload = preparePayload(state, 'export');
  const json = JSON.stringify(payload, null, 2);
  const fileName = `gear-list-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return { json, fileName, payload };
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
    importBackup,
    restoreFromBackup,
    dispose
  };
};

export const validationSamples = () => ({
  validPayload: {
    version: STORAGE_VERSION,
    items: [{ id: 'sample', name: 'Camera', quantity: 1 }],
    notes: 'Packed',
    lastSaved: new Date().toISOString()
  },
  legacyPayload: {
    items: [{ name: 'Legacy mic', quantity: '2' }],
    notes: ['legacy note']
  }
});
