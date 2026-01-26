import { format } from 'date-fns';
import { getDictionary, translate } from '../../i18n/index.js';
import { getShootScheduleDates } from './shootSchedule.js';

const CAMERA_BADGE_COLOR = '#E10078';
const LINE_COLOR = '#9CA3AF';

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

const normalizeText = (value) => (value != null && value !== '' ? String(value).trim() : '');

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'P');
  } catch (_error) {
    return dateStr;
  }
};

const formatRange = (range) => {
  const startValue = range?.start ? formatDate(range.start) : '';
  const endValue = range?.end ? formatDate(range.end) : '';
  if (startValue && endValue) {
    return `${startValue} - ${endValue}`;
  }
  return startValue || endValue || '';
};

const formatDateList = (values, emptyValue) => {
  const formatted = values.map(formatRange).filter(Boolean);
  return formatted.length ? formatted.join(', ') : emptyValue;
};

const splitMetaValue = (value, emptyValue) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return { main: emptyValue, aside: '' };
  }
  const parts = normalized
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    return { main: normalized, aside: '' };
  }
  return {
    main: parts.slice(0, -1).join(' | '),
    aside: parts[parts.length - 1]
  };
};

const normalizeItemDetails = (details) => {
  const normalized = normalizeText(details);
  if (!normalized) return '';
  return normalized.replace(/\s*\|\s*/g, ' - ');
};

const isPrimaryCameraCategory = (name) => {
  const normalized = normalizeText(name).toLowerCase();
  if (!normalized) return false;

  const exclusions = ['support', 'zubehoer', 'access', 'assistent', 'assistant', 'tripod', 'cart'];
  if (exclusions.some((ex) => normalized.includes(ex))) {
    return false;
  }

  return /\b(camera|kamera|cameras|kameras)\b/.test(normalized);
};

const extractCameraLetter = (name) => {
  const match = normalizeText(name).match(/\b(?:camera|kamera)\s*([a-z])\b/i);
  return match?.[1]?.toUpperCase() || 'A';
};

const buildCameraSpec = (categories, project, resolveItemName) => {
  const category = categories.find(
    (candidate) => isPrimaryCameraCategory(candidate.name) && (candidate.items || []).length > 0
  );

  if (category) {
    const specItem = category.items[0];
    const rawDetails = normalizeText(specItem.details);
    const detailSegments = rawDetails.includes('|')
      ? rawDetails.split('|').map((segment) => segment.trim()).filter(Boolean)
      : [];
    const itemName = resolveItemName ? resolveItemName(specItem.name, 0) : normalizeText(specItem.name);
    const values = [itemName, ...detailSegments].filter((value) => value !== '');
    while (values.length < 5) {
      values.push('');
    }
    return {
      label: normalizeText(category.name) || 'Camera',
      letter: extractCameraLetter(category.name),
      values: values.slice(0, 5)
    };
  }

  const hasMetadata = [project?.resolution, project?.aspectRatio, project?.codec, project?.framerate]
    .some((value) => normalizeText(value));

  if (hasMetadata) {
    const emptyCategory = categories.find((candidate) => isPrimaryCameraCategory(candidate.name));
    const label = emptyCategory ? normalizeText(emptyCategory.name) : 'Camera';
    return {
      label: label || 'Camera',
      letter: emptyCategory ? extractCameraLetter(emptyCategory.name) : '',
      values: ['', '', '', '', '']
    };
  }

  return null;
};

const formatCrewValue = (entry) => {
  if (!entry) return '';
  const name = normalizeText(entry.name);
  const asideParts = [normalizeText(entry.phone), normalizeText(entry.email)].filter(Boolean);
  const aside = asideParts.join(' / ');
  return [name, aside].filter(Boolean).join(' | ');
};

/**
 * Build the printable HTML document for a project export.
 * Assumes project categories/items follow the storage schema.
 */
export const buildPrintableHtml = (project, dictionaryOrT, projectIndex = 0, theme = 'light') => {
  const t =
    typeof dictionaryOrT === 'function'
      ? dictionaryOrT
      : (key, fallback, variables) =>
        translate(dictionaryOrT || getDictionary('en'), key, fallback, variables);
  const emptyValue = t('ui.emptyValue', '—');
  const isPinkMode = theme === 'pink';
  const accentColor = isPinkMode ? '#E10078' : '#001589';
  const subtitleColor = isPinkMode ? '#F06292' : '#5C6BC0';
  const lineColor = isPinkMode ? '#F06292' : '#9CA3AF';
  const resolveLabel = (value, variables) =>
    typeof value === 'string' && value.startsWith('defaults.')
      ? t(value, undefined, variables)
      : normalizeText(value);
  const resolveCategoryName = (value, index) =>
    resolveLabel(value, { index: index + 1 }) ||
    t('defaults.untitled_category', `Category ${index + 1}`, { index: index + 1 });
  const resolveItemName = (value, index) =>
    resolveLabel(value, { index: index + 1 }) ||
    t('defaults.untitled_item', `Item ${index + 1}`, { index: index + 1 });

  const projectName =
    resolveLabel(project.name, { index: projectIndex + 1 }) ||
    t('defaults.untitled_project', `Untitled project ${projectIndex + 1}`, { index: projectIndex + 1 });
  const shootSchedule = getShootScheduleDates(project.shootSchedule ?? project.shootDate);
  const subtitle = shootSchedule.shootingPeriods.length
    ? formatDateList(shootSchedule.shootingPeriods, emptyValue)
    : '';

  const crewEntries = Array.isArray(project.crew) ? project.crew : [];
  const crewMetaEntries = crewEntries
    .map((entry) => {
      const label = normalizeText(entry.role) || t('project.print.labels.crew', 'Crew');
      const value = formatCrewValue(entry);
      if (!value) {
        return null;
      }
      return { label, value };
    })
    .filter(Boolean);

  const metaEntries = [
    {
      label: t('project.print.labels.client', 'Client'),
      value: normalizeText(project.client) || emptyValue
    },
    {
      label: t('project.print.labels.location', 'Location'),
      value: normalizeText(project.location) || emptyValue
    },
    {
      label: t('project.print.labels.contact', 'Rental house'),
      value: normalizeText(project.contact) || emptyValue
    },
    {
      label: t('project.print.labels.resolution', 'Resolution'),
      value: normalizeText(project.resolution)
    },
    {
      label: t('project.print.labels.aspectRatio', 'Aspect ratio'),
      value: normalizeText(project.aspectRatio)
    },
    {
      label: t('project.print.labels.codec', 'Codec'),
      value: normalizeText(project.codec)
    },
    {
      label: t('project.print.labels.framerate', 'Framerate'),
      value: normalizeText(project.framerate)
    },
    ...crewMetaEntries,
    {
      label: t('project.print.labels.prep', 'Prep'),
      value: formatDateList(shootSchedule.prepPeriods, emptyValue)
    },
    {
      label: t('project.print.labels.shooting', 'Shoot'),
      value: formatDateList(shootSchedule.shootingPeriods, emptyValue)
    },
    {
      label: t('project.print.labels.return', 'Return'),
      value: formatDateList(shootSchedule.returnDays, emptyValue)
    }
  ];

  const metaRowsHtml = metaEntries
    .map(({ label, value }) => {
      const { main, aside } = splitMetaValue(value, emptyValue);
      return `
        <tr>
          <td class="meta-main">
            <span class="meta-label">${escapeHtml(label)}</span>
            <span class="meta-value">${escapeHtml(main)}</span>
          </td>
          <td class="meta-aside">${escapeHtml(aside)}</td>
        </tr>
      `;
    })
    .join('');

  const cameraSpec = buildCameraSpec(project.categories || [], project, resolveItemName);
  const cameraLabel = cameraSpec
    ? cameraSpec.label.replace(/\s+[a-z]$/i, '').trim() || cameraSpec.label || 'Camera'
    : '';
  const cameraMetadataValues = [
    normalizeText(project.resolution),
    normalizeText(project.aspectRatio),
    normalizeText(project.codec),
    normalizeText(project.framerate)
  ];
  const itemValue = cameraSpec ? normalizeText(cameraSpec.values[0]) : '';
  const detailValues = cameraSpec
    ? cameraSpec.values
      .slice(1, 5)
      .map((value) => normalizeText(value))
      .filter((value) => value !== '')
    : [];
  const cameraSpecValues = cameraSpec
    ? [itemValue, ...detailValues, ...cameraMetadataValues]
    : [];
  const detailHeaders = [
    t('project.print.headers.detail1', 'Detail 1'),
    t('project.print.headers.detail2', 'Detail 2'),
    t('project.print.headers.detail3', 'Detail 3'),
    t('project.print.headers.detail4', 'Detail 4')
  ].slice(0, detailValues.length);
  const cameraSpecHeaders = [
    t('items.print.headers.item', 'Item'),
    ...detailHeaders,
    t('project.print.labels.resolution', 'Res'),
    t('project.print.labels.aspectRatio', 'Aspect'),
    t('project.print.labels.codec', 'Codec'),
    t('project.print.labels.framerate', 'FPS')
  ];
  const cameraSpecHtml = cameraSpec
    ? `
        <table class="camera-spec">
          <tr class="camera-spec-header">
            <td></td>
            ${cameraSpecHeaders.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}
          </tr>
          <tr>
            <td class="camera-label">
              <strong>${escapeHtml(cameraLabel)}</strong>
              ${cameraSpec.letter
                  ? `<strong class="camera-badge">${escapeHtml(cameraSpec.letter)}</strong>`
                  : ''}
            </td>
            ${cameraSpecValues
      .map((value) => `<td>${escapeHtml(value)}</td>`)
      .join('')}
          </tr>
        </table>
      `
    : '<div class="divider"></div>';

  const categoriesHtml = (project.categories || [])
    .map((category, categoryIndex) => {
      const items = Array.isArray(category.items) ? category.items : [];
      if (items.length === 0) return '';
      const categoryName = resolveCategoryName(category.name, categoryIndex);
      const itemsHtml = items
        .map((item, itemIndex) => {
          const quantity = normalizeText(item.quantity) || '1';
          const name = resolveItemName(item.name, itemIndex);
          const details = normalizeItemDetails(item.details);
          const fullName = details ? `${name} - ${details}` : name;
          return `
            <div class="item">
              <span class="item-qty">${escapeHtml(`${quantity}x`)}</span>
              <span>${escapeHtml(fullName)}</span>
            </div>
          `;
        })
        .join('');
      return `
        <section class="category">
          <div class="divider"></div>
          <h3>${escapeHtml(categoryName)}</h3>
          <div class="divider"></div>
          ${itemsHtml}
        </section>
      `;
    })
    .join('');

  const projectNotes = normalizeText(project.notes);
  const notesHtml = projectNotes
    ? `
        <section class="notes">
          <div class="divider"></div>
          <h3>${escapeHtml(t('project.print.notes.title', 'Project notes'))}</h3>
          <div class="divider"></div>
          <div class="notes-body">${escapeHtml(projectNotes)}</div>
        </section>
      `
    : '';

  const footerText = `${t('ui.gearList', 'Gear list')} | ${projectName}`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(projectName)} - ${escapeHtml(t('ui.gearList', 'Gear list'))}</title>
        <style>
          @page {
            margin: 20mm 20mm 10mm;
            size: A4;
          }
          body {
            margin: 0;
            color: #111;
            font-family: 'Ubuntu', 'Arial', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          main {
            padding: 0 0 35mm;
          }
          h1 {
            font-size: 22px;
            margin: 0 0 4px;
            color: ${accentColor};
          }
          .subtitle {
            font-size: 11px;
            letter-spacing: 1px;
            font-weight: 700;
            color: ${subtitleColor};
            margin-bottom: 14px;
            text-transform: uppercase;
          }
          .meta {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 12px;
          }
          .meta td {
            padding: 2px 0;
            vertical-align: top;
          }
          .meta-main {
            width: 75%;
          }
          .meta-label {
            font-weight: 700;
            margin-right: 4px;
          }
          .meta-aside {
            text-align: right;
            white-space: nowrap;
            color: #444;
          }
          .camera-spec {
            width: 100%;
            border-collapse: collapse;
            border-top: 1px solid ${lineColor};
            border-bottom: 1px solid ${lineColor};
            margin: 8px 0 12px;
            font-size: 10px;
          }
          .camera-spec td {
            padding: 4px 6px;
          }
          .camera-spec .camera-spec-header td {
            padding: 2px 6px;
            font-size: 8px;
            color: #666;
            font-weight: 700;
            border-bottom: 1px solid ${lineColor};
          }
          .camera-spec .camera-spec-header td + td {
            text-align: center;
          }
          .camera-spec td + td {
            border-left: 1px solid ${lineColor};
            text-align: center;
          }
          .camera-badge {
            color: ${CAMERA_BADGE_COLOR};
            margin-left: 4px;
          }
          .divider {
            border-top: 1px solid ${lineColor};
            margin: 8px 0 6px;
          }
          .category {
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .category h3,
          .notes h3 {
            margin: 0 0 4px;
            font-size: 11px;
            font-weight: 700;
            color: ${accentColor};
          }
          .item {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .item-qty {
            font-weight: 700;
            margin-right: 4px;
          }
          .notes {
            margin-top: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
            break-inside: avoid-page;
          }
          .notes-body {
            font-size: 10px;
            white-space: pre-wrap;
          }
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(projectName)}</h1>
          ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ''}
          <table class="meta">
            <tbody>
              ${metaRowsHtml}
            </tbody>
          </table>
          ${cameraSpecHtml}
          ${categoriesHtml}
          ${notesHtml}
        </main>
        <div class="footer">${escapeHtml(footerText)}</div>
      </body>
    </html>
  `;
};
