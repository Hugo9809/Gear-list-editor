import { buildExportSnapshot } from './snapshotTypes.js';

/**
 * Exports the project as a PDF file.
 * @param {import('../../types.js').Project} project - The project to export.
 * @param {string} locale - The user's locale (e.g., 'en', 'de').
 * @param {(key: string, fallback?: string) => string} t - Translation function.
 * @param {'light'|'dark'|'pink'} theme - The current theme for styling.
 * @returns {Promise<void>} Resolves when download is initiated.
 */
export async function exportPdf(project, locale, t, theme) {
  let previewWindow;
  try {
    // 1. Build deterministic snapshot
    const snapshot = buildExportSnapshot(project, locale);

    previewWindow = preparePdfWindow();
    if (previewWindow === null && shouldOpenPreviewWindow()) {
      throw new Error('popup-blocked');
    }

    // 2. Prepare translations needed for PDF
    const translations = {
      'project.category.defaultName': t('project.category.defaultName', 'Category'),
      'project.untitled': t('project.untitled', 'Untitled Project'),
      'ui.emptyValue': t('ui.emptyValue', '—'),
      'ui.gearList': t('ui.gearList', 'Gear list'),
      'project.print.labels.client': t('project.print.labels.client', 'Production Company'),
      'project.print.labels.prep': t('project.print.labels.prep', 'Prep'),
      'project.print.labels.shooting': t('project.print.labels.shooting', 'Shooting'),
      'project.print.labels.return': t('project.print.labels.return', 'Return'),
      'project.print.labels.location': t('project.print.labels.location', 'Rental House'),
      'project.print.labels.contact': t('project.print.labels.contact', 'Production Manager'),
      'project.print.notes.title': t('project.print.notes.title', 'Project notes')
    };

    // 3. Generate PDF Blob in Web Worker
    // Pass primitive data only to avoid DataCloneError (functions in docDefinition)
    let blob;
    try {
      blob = await generatePdfInWorker(snapshot, translations, theme);
    } catch (error) {
      console.warn('PDF export worker failed, retrying on main thread.', error);
      blob = await generatePdfOnMainThread(snapshot, translations, theme);
    }

    // 4. Download file
    const filename = `${project.name || 'gear-list'}.pdf`;
    downloadBlob(blob, filename, previewWindow);
  } catch (error) {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }
    console.error('PDF Export failed:', error);
    throw error;
  }
}

/**
 * Generate PDF blob in Web Worker to avoid freezing UI.
 * @param {Object} snapshot
 * @param {Object} translations
 * @param {string} theme
 * @returns {Promise<Blob>}
 */
function generatePdfInWorker(snapshot, translations, theme) {
  return new Promise((resolve, reject) => {
    let worker;
    let timeoutId;
    try {
      // Vite handles this syntax to bundle the worker
      worker = new Worker(new URL('./worker/pdf.worker.js', import.meta.url), {
        type: 'module'
      });
    } catch (error) {
      reject(error);
      return;
    }

    timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('worker-timeout'));
    }, 15000);

    worker.onmessage = (event) => {
      clearTimeout(timeoutId);
      worker.terminate();
      if (event.data.success) {
        resolve(event.data.blob);
      } else {
        reject(new Error(event.data.error || 'Unknown worker error'));
      }
    };

    worker.onerror = (error) => {
      clearTimeout(timeoutId);
      worker.terminate();
      reject(error);
    };

    worker.postMessage({ snapshot, translations, theme });
  });
}

async function generatePdfOnMainThread(snapshot, translations, theme) {
  const [{ default: pdfMake }, { ubuntuVfs }, { buildDocDefinition }] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('./fonts/ubuntu-vfs.js'),
    import('./buildDocDefinition.js')
  ]);
  pdfMake.vfs = ubuntuVfs;
  pdfMake.fonts = {
    Ubuntu: {
      normal: 'Ubuntu-Regular.ttf',
      bold: 'Ubuntu-Bold.ttf',
      italics: 'Ubuntu-Italic.ttf',
      bolditalics: 'Ubuntu-BoldItalic.ttf'
    }
  };
  const t = (key, fallback) => translations[key] || fallback || key;
  const docDefinition = buildDocDefinition(snapshot, t, theme);
  if (!docDefinition.defaultStyle) {
    docDefinition.defaultStyle = {};
  }
  if (!docDefinition.defaultStyle.font) {
    docDefinition.defaultStyle.font = 'Ubuntu';
  }
  const generator = pdfMake.createPdf(docDefinition);
  return generator.getBlob();
}

/**
 * Trigger browser download for a Blob
 * @param {Blob} blob
 * @param {string} filename
 */
function downloadBlob(blob, filename, previewWindow) {
  // Use navigator.msSaveBlob for IE/Edge legacy if needed, but we're likely modern only.
  // Standard anchor method:
  const url = URL.createObjectURL(blob);
  if (previewWindow) {
    previewWindow.location.href = url;
    previewWindow.focus();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  if ('download' in link) {
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(url, '_blank');
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function shouldOpenPreviewWindow() {
  if (typeof document === 'undefined') return false;
  const link = document.createElement('a');
  const isIOS =
    typeof navigator !== 'undefined' && /iP(ad|hone|od)/.test(navigator.userAgent || '');
  return isIOS || !('download' in link);
}

function preparePdfWindow() {
  if (typeof window === 'undefined') return null;
  if (!shouldOpenPreviewWindow()) return null;
  return window.open('', '_blank');
}
