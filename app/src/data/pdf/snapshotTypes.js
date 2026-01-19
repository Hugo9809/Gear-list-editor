/**
 * @typedef {Object} PdfExportSnapshot
 * @property {'1.0'} schemaVersion
 * @property {string} documentId
 * @property {string} createdAtISO
 * @property {string} locale
 * @property {Object} data
 * @property {import('../../types.js').Project} data.project
 * @property {{categories: number, items: number}} data.totals
 */

/**
 * Build deterministic export snapshot from project.
 * @param {import('../../types.js').Project} project
 * @param {string} locale
 * @returns {PdfExportSnapshot}
 */
export function buildExportSnapshot(project, locale) {
  const categories = project.categories || [];
  const totals = {
    categories: categories.length,
    items: categories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)
  };
  return {
    schemaVersion: '1.0',
    documentId: project.id || crypto.randomUUID(),
    createdAtISO: new Date().toISOString(),
    locale,
    data: { project, totals }
  };
}
