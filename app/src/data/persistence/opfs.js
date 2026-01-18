import { safeParse } from '../normalize.js';

const OPFS_DIR = 'gear-list-editor';
const OPFS_BACKUP_FILE = 'gear-list-backup.json';
const OPFS_BACKUP_PREVIOUS_FILE = 'gear-list-backup-prev.json';

export const hasOpfs = () => typeof navigator !== 'undefined' && navigator.storage?.getDirectory;

// OPFS acts as a redundant on-device backup; failures here never block primary IndexedDB writes.
export const readFromOpfsFile = async (fileName) => {
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

export const writeOpfsFile = async (fileName, payload) => {
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

// We keep latest + previous OPFS backups to guard against partial writes or bad payloads.
export const writeOpfsBackup = async (payload) => {
  if (!hasOpfs()) {
    return;
  }
  const latest = await readFromOpfsFile(OPFS_BACKUP_FILE);
  if (latest) {
    await writeOpfsFile(OPFS_BACKUP_PREVIOUS_FILE, latest);
  }
  await writeOpfsFile(OPFS_BACKUP_FILE, payload);
};

export const clearOpfsDirectory = async () => {
  if (!hasOpfs()) {
    return;
  }
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(OPFS_DIR, { recursive: true });
  } catch {
    // Ignore; OPFS might not exist or be accessible.
  }
};

export const OPFS_BACKUP_FILES = {
  latest: OPFS_BACKUP_FILE,
  previous: OPFS_BACKUP_PREVIOUS_FILE
};
