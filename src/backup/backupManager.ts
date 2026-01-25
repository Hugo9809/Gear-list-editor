import { saveAsBlob } from './saveAs';

export async function collectBackupPayload(): Promise<any> {
  const data: any = {};
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
  return {
    exportFormat: 'gear-list-export',
    exportVersion: '2.0.0',
    createdAt: new Date().toISOString(),
    payload: data,
  };
}

export async function saveBackup(payload: any, fileName: string): Promise<boolean> {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  return saveAsBlob(blob, fileName);
}

export async function backupBeforeReset(): Promise<boolean> {
  const payload = await collectFullBackupPayload();
  await saveBackup(payload, 'backup-before-reset-export.json');
  return true;
}
