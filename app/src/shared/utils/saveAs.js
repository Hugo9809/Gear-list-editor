// Shared Save-As helper that mirrors the project export flow.
// Uses File System Access API when available, falls back to anchor download.
export async function saveJsonWithPicker(json, fileName, options = {}) {
  const description = options.description || 'JSON File';

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description,
          accept: { 'application/json': ['.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return { status: 'saved', method: 'file-picker' };
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return { status: 'cancelled', method: 'file-picker' };
      }
      if (!options.quiet) {
        console.warn('File System Access API failed, falling back to download link:', err);
      }
    }
  }

  // Legacy fallback: Blob + Anchor trigger with robust event dispatching
  let blob;
  try {
    blob = new File([json], fileName, { type: 'application/octet-stream' });
  } catch {
    blob = new Blob([json], { type: 'application/octet-stream' });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);

  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  link.dispatchEvent(clickEvent);

  // Long timeout to ensure browser has time to handoff to download manager
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 60000);

  return { status: 'saved', method: 'download' };
}
