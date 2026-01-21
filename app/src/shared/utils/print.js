import { getDictionary, translate } from '../../i18n/index.js';
import { getShootScheduleDates } from './shootSchedule.js';

/**
 * Escape content for safe injection into printable HTML markup.
 * Assumes values can be stringified and should not include HTML tags.
 */
export const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/**
 * Build the printable HTML document for a project export.
 * Assumes project categories/items follow the storage schema.
 */
export const buildPrintableHtml = (project, dictionaryOrT, projectIndex = 0) => {
  const t =
    typeof dictionaryOrT === 'function'
      ? dictionaryOrT
      : (key, fallback, variables) =>
          translate(dictionaryOrT || getDictionary('en'), key, fallback, variables);
  const resolveLabel = (value, variables) =>
    typeof value === 'string' && value.startsWith('defaults.')
      ? t(value, undefined, variables)
      : value || '';
  const shootSchedule = getShootScheduleDates(project.shootSchedule ?? project.shootDate);
  const formatRange = (range) => {
    if (range.start && range.end) {
      return `${range.start} - ${range.end}`;
    }
    return range.start || range.end || '';
  };
  const formatScheduleList = (values) => {
    const formatted = values.map(formatRange).filter(Boolean);
    return formatted.length ? formatted.join(', ') : t('ui.emptyValue', '—');
  };
  const categoriesHtml = project.categories
    .map((category, categoryIndex) => {
      const rows = category.items
        .map(
          (item, itemIndex) => `
            <tr>
              <td>${escapeHtml(item.quantity)}</td>
              <td>${escapeHtml(
                resolveLabel(item.name, { index: itemIndex + 1 }) ||
                  t('defaults.untitled_item', undefined, { index: itemIndex + 1 })
              )}</td>
              <td>${escapeHtml(item.details)}</td>
            </tr>
          `
        )
        .join('');
      return `
        <section>
          <h3>${escapeHtml(
            resolveLabel(category.name, { index: categoryIndex + 1 }) ||
              t('defaults.untitled_category', undefined, { index: categoryIndex + 1 })
          )}</h3>
          <table>
            <thead>
              <tr>
                <th>${escapeHtml(t('items.print.headers.quantity'))}</th>
                <th>${escapeHtml(t('items.print.headers.item'))}</th>
                <th>${escapeHtml(t('items.print.headers.details'))}</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="3">${escapeHtml(t('items.print.empty'))}</td></tr>`}
            </tbody>
          </table>
        </section>
      `;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(
          resolveLabel(project.name, { index: projectIndex + 1 }) ||
            t('defaults.untitled_project', undefined, { index: projectIndex + 1 })
        )} - ${escapeHtml(t('ui.gearList'))}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            color: #0f172a;
            margin: 32px;
          }
          header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 28px;
            margin: 0 0 8px;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px 24px;
            font-size: 13px;
          }
          section {
            margin-bottom: 24px;
            break-inside: avoid;
          }
          h3 {
            margin: 0 0 8px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #cbd5f5;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
          }
          thead {
            background: #e2e8f0;
          }
          .notes {
            margin-top: 16px;
            font-size: 12px;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(
            resolveLabel(project.name, { index: projectIndex + 1 }) ||
              t('defaults.untitled_project', undefined, { index: projectIndex + 1 })
          )}</h1>
          <div class="meta">
            <div><strong>${escapeHtml(t('project.print.labels.client'))}:</strong> ${escapeHtml(project.client || t('ui.emptyValue', '—'))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.prep'))}:</strong> ${escapeHtml(formatScheduleList(shootSchedule.prepPeriods))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.shooting'))}:</strong> ${escapeHtml(formatScheduleList(shootSchedule.shootingPeriods))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.return'))}:</strong> ${escapeHtml(formatScheduleList(shootSchedule.returnDays))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.location'))}:</strong> ${escapeHtml(project.location || t('ui.emptyValue', '—'))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.contact'))}:</strong> ${escapeHtml(project.contact || t('ui.emptyValue', '—'))}</div>
          </div>
        </header>
        ${categoriesHtml}
        <div class="notes">
          <strong>${escapeHtml(t('project.print.notes.title'))}:</strong> ${escapeHtml(
            project.notes || t('project.notes.empty', 'No notes added.')
          )}
        </div>
      </body>
    </html>
  `;
};
