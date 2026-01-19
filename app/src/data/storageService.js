// @ts-check
/**
 * @fileoverview Central storage service facade for the Gear List Editor.
 * Handles persistence to IndexedDB (primary), OPFS (backup), and localStorage (legacy).
 */

/** @typedef {import('../types.js').AppState} AppState */
/** @typedef {import('../types.js').StorageService} StorageService */
/** @typedef {import('../types.js').StorageServiceOptions} StorageServiceOptions */
/** @typedef {import('../types.js').LoadStateResult} LoadStateResult */
/** @typedef {import('../types.js').SaveResult} SaveResult */
/** @typedef {import('../types.js').ExportResult} ExportResult */
/** @typedef {import('../types.js').BackupSummary} BackupSummary */

import { STORAGE_MESSAGE_KEYS, createId, safeParse, validatePayload } from './normalize.js';
import { createEmptyState, migratePayload, mergePayloads } from './migrate.js';
import {
  deleteIndexedDb,
  hasIndexedDb,
  readFromIndexedDb,
  writeToIndexedDb
} from './persistence/indexedDb.js';
import {
  clearOpfsDirectory,
  OPFS_BACKUP_FILES,
  readFromOpfsFile,
  writeOpfsBackup
} from './persistence/opfs.js';

const LEGACY_STORAGE_KEY = 'gear-list-editor.data';
const LEGACY_BACKUP_KEY = 'gear-list-editor.backup';
const AUTOSAVE_DELAY = 700;
const MAX_AUTOSAVE_DELAY = 5000;
const OPFS_BACKUP_INTERVAL = 30 * 60 * 1000;

const hasLegacyStorage = () => typeof localStorage !== 'undefined';

/**
 * Reads the legacy backup from localStorage (if available).
 * @returns {AppState|null} The parsed backup or null if missing/invalid.
 */
const readLegacyBackup = () => {
  if (!hasLegacyStorage()) {
    return null;
  }
  try {
    return safeParse(localStorage.getItem(LEGACY_BACKUP_KEY));
  } catch {
    return null;
  }
};

/**
 * Persists the payload to legacy localStorage as a fallback.
 * @param {AppState} payload - The state to persist.
 */
const writeLegacyBackups = (payload) => {
  if (!hasLegacyStorage()) {
    return;
  }
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors; OPFS or IndexedDB may still succeed.
  }
};

/**
 * Clears legacy localStorage data.
 */
const clearLegacyStorage = () => {
  if (!hasLegacyStorage()) {
    return;
  }
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_BACKUP_KEY);
  } catch {
    // Ignore failures; other storage layers may still clear.
  }
};

/**
 * Prepares the state payload for storage.
 * @param {AppState} state - Current application state.
 * @param {string} [reason='autosave'] - Reason for saving.
 * @returns {AppState} The active payload stamped with metadata.
 */
const preparePayload = (state, reason = 'autosave') => {
  const migrated = migratePayload(state);
  return {
    ...migrated,
    lastSaved: new Date().toISOString(),
    savedBy: reason
  };
};

/**
 * Extracts the timestamp from a payload for comparison.
 * @param {AppState|null} payload - The state payload.
 * @returns {number|null} Timestamp or null if invalid.
 */
const getPayloadTimestamp = (payload) => {
  if (!payload) {
    return null;
  }
  const timestamp = Date.parse(payload.lastSaved ?? '');
  return Number.isFinite(timestamp) ? timestamp : null;
};

/**
 * Collects warning messages from caught errors.
 * @param {Error[]} errors - List of errors encountered.
 * @returns {string[]} List of warning keys.
 */
const collectWarnings = (errors) =>
  errors.length === 0 ? [] : [STORAGE_MESSAGE_KEYS.warnings.storageLocationsUnavailable];

/**
 * Retrieves the best available backup from OPFS or legacy storage.
 * Strategy: OPFS Latest -> OPFS Previous -> Legacy LocalStorage.
 * @returns {Promise<{payload: AppState|null, source: string|null}>} Best backup found.
 */
const getBestBackup = async () => {
  // Fallback order: OPFS latest -> OPFS previous -> legacy localStorage backup.
  const opfsLatest = await readFromOpfsFile(OPFS_BACKUP_FILES.latest);
  if (opfsLatest) {
    return { payload: opfsLatest, source: STORAGE_MESSAGE_KEYS.sources.deviceBackupLatest };
  }
  const opfsPrevious = await readFromOpfsFile(OPFS_BACKUP_FILES.previous);
  if (opfsPrevious) {
    return { payload: opfsPrevious, source: STORAGE_MESSAGE_KEYS.sources.deviceBackupPrevious };
  }
  const legacyBackup = readLegacyBackup();
  if (legacyBackup) {
    return { payload: legacyBackup, source: STORAGE_MESSAGE_KEYS.sources.legacyLocalBackup };
  }
  return { payload: null, source: null };
};

const buildAutoBackupSummary = (payload, source) => {
  if (!payload) {
    return null;
  }
  const timestamp = getPayloadTimestamp(payload);
  const lastSaved = typeof payload.lastSaved === 'string' ? payload.lastSaved : null;
  return {
    id: `${source}-${lastSaved || createId()}`,
    source,
    lastSaved,
    projectCount: Array.isArray(payload.projects) ? payload.projects.length : 0,
    templateCount: Array.isArray(payload.templates) ? payload.templates.length : 0,
    savedBy: typeof payload.savedBy === 'string' ? payload.savedBy : null,
    timestamp
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
  const project = migrated.projects.find((entry) => entry.id === projectId) || null;
  const filteredState = {
    ...migrated,
    projects: project ? [project] : [],
    templates: [],
    history: { items: [], categories: [] },
    activeProjectId: project?.id || null
  };
  return exportState(filteredState);
};

export const createStorageService = (options = {}) => {
  let autosaveTimer = null;
  let autosaveStart = null;
  let pendingState = null;
  let saveQueue = Promise.resolve();
  let lastKnownState = null;
  let opfsBackupInterval = null;

  const queueSave = (task) => {
    saveQueue = saveQueue.then(task).catch((error) => {
      options.onWarning?.(STORAGE_MESSAGE_KEYS.warnings.autosaveStorageError);
      return {
        payload: null,
        warnings: [STORAGE_MESSAGE_KEYS.warnings.autosaveStorageError],
        error
      };
    });
    return saveQueue;
  };

  const persist = async (state, reason) => {
    const payload = preparePayload(state, reason);
    const errors = [];

    try {
      // Primary store: write to IndexedDB first for durable offline persistence.
      await writeToIndexedDb(payload);
    } catch (error) {
      errors.push(error);
    }

    try {
      // Secondary store: OPFS backups are redundant safety copies (latest + previous).
      await writeOpfsBackup(payload);
    } catch (error) {
      errors.push(error);
    }

    // Final fallback: legacy localStorage for older browsers or migration recovery.
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
    let source = STORAGE_MESSAGE_KEYS.sources.empty;
    let warnings = [];
    let backup = { payload: null, source: null };

    if (hasIndexedDb()) {
      try {
        // Load order: IndexedDB primary -> OPFS backups -> legacy localStorage.
        payload = await readFromIndexedDb();
        if (payload) {
          source = STORAGE_MESSAGE_KEYS.sources.indexedDb;
        }
      } catch {
        warnings = [STORAGE_MESSAGE_KEYS.warnings.indexedDbUnavailable];
      }
    }

    backup = await getBestBackup();
    if (!payload && backup.payload) {
      payload = backup.payload;
      source = backup.source || STORAGE_MESSAGE_KEYS.sources.deviceBackup;
    }

    if (payload && backup.payload && source === STORAGE_MESSAGE_KEYS.sources.indexedDb) {
      const primaryTime = getPayloadTimestamp(payload);
      const backupTime = getPayloadTimestamp(backup.payload);
      const hasPrimaryTime = primaryTime !== null;
      const hasBackupTime = backupTime !== null;
      if (
        (!hasPrimaryTime && hasBackupTime) ||
        (hasPrimaryTime && hasBackupTime && backupTime > primaryTime)
      ) {
        payload = backup.payload;
        source = backup.source || STORAGE_MESSAGE_KEYS.sources.deviceBackup;
      }
    }

    const migrated = migratePayload(payload);
    const validation = validatePayload(migrated);
    const state = validation.valid ? migrated : createEmptyState();
    if (!validation.valid) {
      warnings = warnings.concat(validation.errors);
    }

    if (payload && source !== STORAGE_MESSAGE_KEYS.sources.indexedDb) {
      await queueSave(() => persist(state, 'rehydrate'));
    }

    lastKnownState = state;

    return {
      state,
      source,
      warnings
    };
  };

  const startOpfsBackupInterval = () => {
    if (opfsBackupInterval) {
      return;
    }
    opfsBackupInterval = setInterval(() => {
      if (!lastKnownState) {
        return;
      }
      queueSave(() => persist(lastKnownState, 'opfs-interval'));
    }, OPFS_BACKUP_INTERVAL);
  };

  startOpfsBackupInterval();

  const scheduleAutosave = (state) => {
    pendingState = state;
    lastKnownState = state;
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

  const saveNow = (state) => {
    lastKnownState = state;
    return queueSave(() => persist(state, 'explicit'));
  };

  const exportBackup = (state) => exportState(state);
  const exportProjectBackupWithId = (state, projectId) => exportProjectBackup(state, projectId);
  const listAutoBackups = async () => {
    const [latest, previous] = await Promise.all([
      readFromOpfsFile(OPFS_BACKUP_FILES.latest),
      readFromOpfsFile(OPFS_BACKUP_FILES.previous)
    ]);
    const legacy = readLegacyBackup();
    const summaries = [
      buildAutoBackupSummary(latest, STORAGE_MESSAGE_KEYS.sources.deviceBackupLatest),
      buildAutoBackupSummary(previous, STORAGE_MESSAGE_KEYS.sources.deviceBackupPrevious),
      buildAutoBackupSummary(legacy, STORAGE_MESSAGE_KEYS.sources.legacyLocalBackup)
    ].filter(Boolean);

    return summaries.sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        return 0;
      }
      if (a.timestamp === null) {
        return 1;
      }
      if (b.timestamp === null) {
        return -1;
      }
      return b.timestamp - a.timestamp;
    });
  };

  const importBackup = (rawText, currentState) => {
    const parsed = safeParse(rawText);
    if (!parsed) {
      return {
        state: migratePayload(currentState),
        warnings: [STORAGE_MESSAGE_KEYS.warnings.importInvalid]
      };
    }
    const merged = mergePayloads(currentState, parsed);
    const validation = validatePayload(merged);
    if (!validation.valid) {
      return {
        state: migratePayload(currentState),
        warnings: [STORAGE_MESSAGE_KEYS.warnings.importValidationFailed]
      };
    }
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
        source: null,
        warnings: [STORAGE_MESSAGE_KEYS.warnings.noDeviceBackup]
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

  const factoryReset = async () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
    autosaveTimer = null;
    autosaveStart = null;
    pendingState = null;

    await deleteIndexedDb();
    clearLegacyStorage();
    await clearOpfsDirectory();

    const emptyState = createEmptyState();
    lastKnownState = emptyState;
    await queueSave(() => persist(emptyState, 'factory-reset'));

    return {
      state: emptyState,
      warnings: []
    };
  };

  const dispose = () => {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
    if (opfsBackupInterval) {
      clearInterval(opfsBackupInterval);
    }
    autosaveTimer = null;
    autosaveStart = null;
    pendingState = null;
    opfsBackupInterval = null;
    lastKnownState = null;
  };

  return {
    loadState,
    scheduleAutosave,
    saveNow,
    exportBackup,
    exportProjectBackup: exportProjectBackupWithId,
    listAutoBackups,
    importBackup,
    restoreFromBackup,
    factoryReset,
    dispose
  };
};
