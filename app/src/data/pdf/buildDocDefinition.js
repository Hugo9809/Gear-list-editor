import { format } from 'date-fns';
import { getShootScheduleDates } from '../../shared/utils/shootSchedule.js';

const CAMERA_BADGE_COLOR = '#E10078';
const LINE_COLOR = '#9CA3AF';
const PAGE_LINE_WIDTH = 515;

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
  if (normalized === 'camera' || normalized === 'kamera') return true;
  if (normalized.startsWith('camera ') || normalized.startsWith('kamera ')) {
    return !normalized.includes('support') && !normalized.includes('zubehoer');
  }
  return false;
};

const extractCameraLetter = (name) => {
  const match = normalizeText(name).match(/\b(?:camera|kamera)\s*([a-z])\b/i);
  return match?.[1]?.toUpperCase() || 'A';
};

const buildCameraSpec = (categories) => {
  const category = categories.find(
    (candidate) => isPrimaryCameraCategory(candidate.name) && (candidate.items || []).length > 0
  );
  if (!category) return null;

  const specItem = category.items[0];
  const rawDetails = normalizeText(specItem.details);
  const detailSegments = rawDetails.includes('|')
    ? rawDetails.split('|').map((segment) => segment.trim()).filter(Boolean)
    : [];
  const values = [normalizeText(specItem.name), ...detailSegments].filter((value) => value !== '');
  while (values.length < 5) {
    values.push('');
  }
  return {
    label: normalizeText(category.name) || 'Camera',
    letter: extractCameraLetter(category.name),
    values: values.slice(0, 5)
  };
};

const formatCrewValue = (entry) => {
  if (!entry) return '';
  const name = normalizeText(entry.name);
  const asideParts = [normalizeText(entry.phone), normalizeText(entry.email)].filter(Boolean);
  const aside = asideParts.join(' / ');
  return [name, aside].filter(Boolean).join(' | ');
};

/**
 * Build pdfmake document definition from export snapshot.
 * @param {import('./snapshotTypes.js').PdfExportSnapshot} snapshot
 * @param {(key: string, fallback?: string) => string} t - Translation function
 * @param {string} theme - 'pink', 'dark', or 'light'
 * @returns {Object} pdfmake docDefinition
 */
export function buildDocDefinition(snapshot, t, theme) {
  const { project } = snapshot.data;
  const categories = project.categories || [];
  const shootSchedule = getShootScheduleDates(project.shootSchedule ?? project.shootDate);
  const emptyValue = t('ui.emptyValue', '—');
  const rawProjectName = normalizeText(project.name);
  const projectName = rawProjectName && !rawProjectName.startsWith('defaults.')
    ? rawProjectName
    : t('project.untitled', 'Untitled Project');

  const isPinkMode = theme === 'pink';
  const themeColor = isPinkMode ? '#E10078' : '#001589';
  const subtitleColor = isPinkMode ? '#F06292' : '#5C6BC0';

  const subtitle = shootSchedule.shootingPeriods.length
    ? formatDateList(shootSchedule.shootingPeriods, emptyValue)
    : '';

  const resolveCategoryName = (name, index) => {
    const normalized = normalizeText(name);
    if (!normalized || normalized.startsWith('defaults.')) {
      return `${t('project.category.defaultName', 'Category')} ${index + 1}`;
    }
    return normalized;
  };

  const resolveItemName = (name, index) => {
    const normalized = normalizeText(name);
    if (!normalized || normalized.startsWith('defaults.')) {
      return `${t('items.print.headers.item', 'Item')} ${index + 1}`;
    }
    return normalized;
  };

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
    { label: t('project.print.labels.client', 'Client'), value: project.client },
    { label: t('project.print.labels.location', 'Location'), value: project.location },
    { label: t('project.print.labels.contact', 'Rental house'), value: project.contact },
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

  const metaTableBody = metaEntries.map(({ label, value }) => {
    const { main, aside } = splitMetaValue(value, emptyValue);
    return [
      {
        text: [{ text: `${label} `, style: 'metaLabel' }, { text: main, style: 'metaValue' }],
        style: 'metaRow'
      },
      { text: aside, style: 'metaAside', alignment: 'right' }
    ];
  });

  const cameraSpec = buildCameraSpec(categories);
  const cameraSpecRow = cameraSpec
    ? {
        table: {
          widths: [90, '*', '*', '*', '*', '*'],
          body: [
            [
              {
                text: [
                  {
                    text: `${
                      cameraSpec.label.replace(/\s+[a-z]$/i, '').trim() || cameraSpec.label
                    } `,
                    bold: true
                  },
                  { text: cameraSpec.letter, bold: true, color: CAMERA_BADGE_COLOR }
                ],
                fontSize: 9
              },
              ...cameraSpec.values.map((value) => ({ text: value, alignment: 'center', fontSize: 9 }))
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: (index, node) =>
            index === 0 || index === node.table.widths.length ? 0 : 0.5,
          hLineColor: () => LINE_COLOR,
          vLineColor: () => LINE_COLOR,
          paddingLeft: (index) => (index === 0 ? 0 : 6),
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4
        },
        margin: [0, 6, 0, 10]
      }
    : null;

  const categoryContent = categories.flatMap((category, idx) => {
    const items = category.items || [];
    if (items.length === 0) return [];
    const categoryName = resolveCategoryName(category.name, idx);
    const itemLines = items.map((item, itemIndex) => {
      const quantity = normalizeText(item.quantity) || '1';
      const name = resolveItemName(item.name, itemIndex);
      const details = normalizeItemDetails(item.details);
      const fullName = details ? `${name} - ${details}` : name;
      return {
        text: [{ text: `${quantity}x `, bold: true }, { text: fullName }],
        fontSize: 9.5,
        margin: [0, 0, 0, 2]
      };
    });
    return [
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: PAGE_LINE_WIDTH,
            y2: 0,
            lineWidth: 0.5,
            lineColor: LINE_COLOR
          }
        ],
        margin: [0, 6, 0, 4]
      },
      {
        text: categoryName,
        style: 'categoryHeader',
        color: themeColor,
        margin: [0, 0, 0, 4]
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: PAGE_LINE_WIDTH,
            y2: 0,
            lineWidth: 0.5,
            lineColor: LINE_COLOR
          }
        ],
        margin: [0, 0, 0, 6]
      },
      { stack: itemLines, margin: [0, 0, 0, 6] }
    ];
  });

  const projectNotes = normalizeText(project.notes);
  const notesSection = projectNotes
    ? [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: PAGE_LINE_WIDTH,
              y2: 0,
              lineWidth: 0.5,
              lineColor: LINE_COLOR
            }
          ],
          margin: [0, 10, 0, 4]
        },
        {
          text: t('project.print.notes.title', 'Project notes'),
          style: 'categoryHeader',
          color: themeColor,
          margin: [0, 0, 0, 4]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: PAGE_LINE_WIDTH,
              y2: 0,
              lineWidth: 0.5,
              lineColor: LINE_COLOR
            }
          ],
          margin: [0, 0, 0, 6]
        },
        { text: projectNotes, fontSize: 9.5 }
      ]
    : [];

  const locale = snapshot.locale || 'en';
  const pageLabel = locale.startsWith('de') ? 'Seite' : 'Page';
  const ofLabel = locale.startsWith('de') ? 'von' : 'of';
  const listLabel = t('ui.gearList', 'Gear list');

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    footer: (currentPage, pageCount) => ({
      text: `${pageLabel} ${currentPage} ${ofLabel} ${pageCount} | ${listLabel} | ${projectName}`,
      alignment: 'center',
      color: '#666',
      fontSize: 9,
      margin: [40, 20, 40, 0]
    }),
    content: [
      {
        text: projectName,
        style: 'title',
        color: themeColor,
        margin: [0, 0, 0, 2]
      },
      ...(subtitle
        ? [
            {
              text: subtitle,
              style: 'subtitle',
              color: subtitleColor,
              margin: [0, 0, 0, 16]
            }
          ]
        : []),
      {
        table: {
          widths: ['*', 'auto'],
          body: metaTableBody
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 2,
          paddingBottom: () => 2
        },
        margin: [0, 0, 0, 12]
      },
      ...(cameraSpecRow
        ? [cameraSpecRow]
        : [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: PAGE_LINE_WIDTH,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: LINE_COLOR
                }
              ],
              margin: [0, 6, 0, 10]
            }
          ]),
      ...categoryContent,
      ...notesSection
    ],
    styles: {
      title: { fontSize: 20, bold: true },
      subtitle: { fontSize: 11, bold: true, characterSpacing: 1 },
      metaRow: { fontSize: 9.5 },
      metaLabel: { bold: true },
      metaValue: { color: '#222' },
      metaAside: { fontSize: 9.5, color: '#444' },
      categoryHeader: { fontSize: 10.5, bold: true }
    },
    defaultStyle: {
      font: 'Ubuntu',
      fontSize: 10,
      color: '#111'
    }
  };
}
