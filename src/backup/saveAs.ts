// Save As helper for backup exports
export type SaveOptions = {
  defaultName?: string;
  onError?: (err: any) => void;
};
export async function saveAsBlob(blob: Blob, name: string, options?: SaveOptions): Promise<boolean> {
  // Try File System Access API first
  if ('showSaveFilePicker' in window) {
    try {
      const pickerOpts: any = {
        suggestedName: name,
        types: [
          {
            description: 'Backup file',
            accept: { 'application/octet-stream': ['.bin', '.backup', '.zip', '.json'] },
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
  // Fallback: download
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
  return true;
}
export async function exportJsonAsBackup(payload: any, fileName: string): Promise<boolean> {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  return saveAsBlob(blob, fileName);
}
