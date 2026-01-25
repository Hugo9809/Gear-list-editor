// Save As helper for backup exports
export type SaveOptions = {
  defaultName?: string;
  onError?: (err: any) => void;
};

// Legacy (in-app) Save-As bridge
export type LegacySaveHandler = (blob: Blob, suggestedName: string) => Promise<boolean>;
let legacySaveHandler: LegacySaveHandler | null = null;

export function registerLegacySaveHandler(handler: LegacySaveHandler): void {
  legacySaveHandler = handler;
}

// Primary Save-As path: File System Access API when available, otherwise delegate to app UI
export async function saveAsBlob(blob: Blob, name: string, options?: SaveOptions): Promise<boolean> {
  // File System Access API path
  if ('showSaveFilePicker' in window) {
    try {
      const pickerOpts: any = {
        suggestedName: name,
        types: [
          {
            description: 'Backup file',
            accept: { 'application/json': ['.json'], 'application/octet-stream': ['.bin', '.backup', '.zip'] },
          },
        ],
      };
      // @ts-ignore
      const handle = await (window as any).showSaveFilePicker(pickerOpts);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e) {
      if (options?.onError) options.onError(e);
    }
  }

  // Legacy app Save-As bridge (in-app UI dialog) if provided
  if (legacySaveHandler) {
    try {
      const ok = await legacySaveHandler(blob, name);
      if (ok) return true;
    } catch (e) {
      if (options?.onError) options.onError(e);
    }
  }

  // No automatic download; require explicit Save-As path
  return false;
}

export async function exportJsonAsBackup(payload: any, fileName: string): Promise<boolean> {
  // Ensure envelope shape if not already enveloped
  let toSave = payload;
  if (payload && (payload as any).exportFormat == null) {
    toSave = {
      exportFormat: 'gear-list-export',
      exportVersion: '2.0.0',
      createdAt: new Date().toISOString(),
      payload,
    };
  }
  const blob = new Blob([JSON.stringify(toSave, null, 2)], { type: 'application/json' });
  return saveAsBlob(blob, fileName);
}
