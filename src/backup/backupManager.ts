import { saveAsBlob } from './saveAs';

const DEBUG_BACKUP = true;

export async function collectBackupPayload(): Promise<any> {
  const data: any = {};
  if (DEBUG_BACKUP) {
    try {
      // Log available keys for debugging
      console.debug('[Backup] collectBackupPayload', { storageKeys: Object.keys(localStorage) });
    } catch {
      // ignore if localStorage not available
      console.debug('[Backup] collectBackupPayload: localStorage unavailable');
    }
  }
  // Populate from your app state; adjust keys to match your storage
  try { data.settings = JSON.parse(localStorage.getItem('settings') || '{}'); } catch { data.settings = {}; }
  try { data.projects = JSON.parse(localStorage.getItem('projects') || '[]'); } catch { data.projects = []; }
  // Add any other data you store in localStorage/IndexedDB as needed
  return {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    data
  };
}

// Build a full export-like envelope around the basic payload
export async function collectFullBackupPayload(): Promise<any> {
  const data = await collectBackupPayload();
  if (DEBUG_BACKUP) console.debug('[Backup] collectFullBackupPayload envelope', { data });
  return {
    exportFormat: 'gear-list-export',
    exportVersion: '2.0.0',
    createdAt: new Date().toISOString(),
    payload: data,
  };
}

export async function saveBackup(payload: any, fileName: string): Promise<boolean> {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  if (DEBUG_BACKUP) console.debug('[Backup] saveBackup', { fileName, payload: typeof payload });
  return saveAsBlob(blob, fileName);
}

export async function backupBeforeReset(): Promise<boolean> {
  const payload = await collectFullBackupPayload();
  if (DEBUG_BACKUP) console.debug('[Backup] backupBeforeReset saving', { fileName: 'backup-before-reset-export.json' });
  await saveBackup(payload, 'backup-before-reset-export.json');
  return true;
}
