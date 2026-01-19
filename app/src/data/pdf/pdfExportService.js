import { buildExportSnapshot } from './snapshotTypes.js';
import { buildDocDefinition } from './buildDocDefinition.js';

/**
 * Export project as PDF.
 * @param {import('../../types.js').Project} project
 * @param {string} locale
 * @param {(key: string, fallback?: string) => string} t - Translation function
 * @returns {Promise<void>}
 */
export async function exportPdf(project, locale, t, theme) {
    try {
        // 1. Build deterministic snapshot
        const snapshot = buildExportSnapshot(project, locale);

        // 2. Build pdfmake document definition
        const docDefinition = buildDocDefinition(snapshot, t, theme);

        // 3. Generate PDF Blob in Web Worker
        const blob = await generatePdfInWorker(docDefinition);

        // 4. Download file
        const filename = `${project.name || 'gear-list'}.pdf`;
        downloadBlob(blob, filename);

    } catch (error) {
        console.error('PDF Export failed:', error);
        throw error;
    }
}

/**
 * Generate PDF blob in Web Worker to avoid freezing UI.
 * @param {Object} docDefinition
 * @returns {Promise<Blob>}
 */
function generatePdfInWorker(docDefinition) {
    return new Promise((resolve, reject) => {
        // Vite handles this syntax to bundle the worker
        const worker = new Worker(
            new URL('./worker/pdf.worker.js', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (event) => {
            worker.terminate();
            if (event.data.success) {
                resolve(event.data.blob);
            } else {
                reject(new Error(event.data.error || 'Unknown worker error'));
            }
        };

        worker.onerror = (error) => {
            worker.terminate();
            reject(error);
        };

        worker.postMessage({ docDefinition });
    });
}

/**
 * Trigger browser download for a Blob
 * @param {Blob} blob 
 * @param {string} filename 
 */
function downloadBlob(blob, filename) {
    // Use navigator.msSaveBlob for IE/Edge legacy if needed, but we're likely modern only.
    // Standard anchor method:
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
