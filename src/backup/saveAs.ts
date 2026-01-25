// Save As helper for backup exports
// Fallback in-app Save-As modal (no external UI dependency). See src/ui/saveAsModal.ts for a generic UI version.
async function showInAppSaveAsDialog(suggestedName: string): Promise<string | null> {
  // Minimal inline DOM modal (no styling heavy – keeps patch small)
  return new Promise(resolve => {
    const existing = document.getElementById('oc-save-as-inline');
    if (existing) {
      existing.remove();
    }
    const overlay = document.createElement('div');
    overlay.id = 'oc-save-as-inline';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.2)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.borderRadius = '6px';
    modal.style.padding = '12px';
    modal.style.minWidth = '320px';
    modal.style.boxShadow = '0 2px 8px rgba(0,0,0,.15)';

    const label = document.createElement('div');
    label.textContent = 'Save backup as';
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '6px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = suggestedName || '';
    input.style.width = '100%';
    input.style.padding = '6px';
    input.style.boxSizing = 'border-box';
    input.style.marginBottom = '8px';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '6px';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.padding = '6px 12px';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '6px 12px';

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    modal.appendChild(label);
    modal.appendChild(input);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };
    cancelBtn.addEventListener('click', close);
    const onSave = () => {
      const v = input.value.trim();
      const chosen = v.length ? v : suggestedName || 'backup.json';
      document.body.removeChild(overlay);
      resolve(chosen);
    };
    saveBtn.addEventListener('click', onSave);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') onSave(); });
    setTimeout(() => input.focus(), 0);
  });
}
// Simple debug toggle for troubleshooting Save-As flow
const DEBUG_SAVE_AS = true;

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
  if (DEBUG_SAVE_AS) console.debug('[SaveAs] saveAsBlob invoked', { name });
  // File System Access API path
  if ('showSaveFilePicker' in window) {
    try {
      if (DEBUG_SAVE_AS) console.debug('[SaveAs] FS API path available, attempting write', { name });
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
      if (DEBUG_SAVE_AS) console.debug('[SaveAs] FS API write succeeded', { name });
      return true;
    } catch (e) {
      if (DEBUG_SAVE_AS) console.debug('[SaveAs] FS API write failed', { name, error: e });
      if (options?.onError) options.onError(e);
    }
  }

  // Legacy app Save-As bridge (in-app UI dialog) if provided
  if (legacySaveHandler) {
    try {
      if (DEBUG_SAVE_AS) console.debug('[SaveAs] Legacy Save-As path provided, delegating', { name });
      const ok = await legacySaveHandler(blob, name);
      if (ok) return true;
    } catch (e) {
      if (DEBUG_SAVE_AS) console.debug('[SaveAs] Legacy Save-As failed', { name, error: e });
      if (options?.onError) options.onError(e);
    }
  }

  // No automatic download; require explicit Save-As path
  if (DEBUG_SAVE_AS) console.debug('[SaveAs] No Save-As path available; returning false', { name });
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
  // First, prompt the user with an in-app Save-As dialog to ensure a user gesture is involved
  let chosenName = await showInAppSaveAsDialog(fileName);
  if (!chosenName) return false;
  // Then try the OS Save-As path with the chosen name
  let ok = await saveAsBlob(blob, chosenName);
  if (ok) return true;
  // If OS path failed, try legacy app path as a fallback
  try {
    // @ts-ignore
    if (typeof legacySaveHandler === 'function') {
      ok = await legacySaveHandler(blob, chosenName);
      if (ok) return true;
    }
  } catch {
    // ignore
  }
  return false;
}
