import { format } from 'date-fns';
import { getShootScheduleDates } from '../../shared/utils/shootSchedule.js';

const CAMERA_BADGE_COLOR = '#E10078';
const LINE_COLOR = '#9CA3AF';
const PAGE_LINE_WIDTH = 435;

const normalizeText = (value) => (value != null && value !== '' ? String(value).trim() : '');

// Parse inline bold markers using *...* and return segments
// Each segment has { text, bold } indicating styling per portion.
const parseBoldParts = (text) => {
  const t = (text ?? '').toString();
  const segments = [];
  let buffer = '';
  let bold = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '*') {
      if (buffer.length > 0) {
        segments.push({ text: buffer, bold });
        buffer = '';
      }
      bold = !bold;
      continue;
    }
    buffer += ch;
  }
  if (buffer.length > 0) {
    segments.push({ text: buffer, bold });
  }
  // If no explicit bold markers were provided, treat whole piece as bold
  if (segments.length === 1 && segments[0].bold === false) {
    segments[0].bold = true;
  }
  return segments;
};

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

  // Exclude common non-primary strings
  const exclusions = ['support', 'zubehoer', 'zubehör', 'access', 'assistent', 'assistant', 'tripod', 'cart'];
  if (exclusions.some((ex) => normalized.includes(ex))) {
    return false;
  }

  // Match "camera", "kamera", "cameras", "kameras" as whole words
  return /\b(camera|kamera|cameras|kameras)\b/.test(normalized);
};

const extractCameraLetter = (name) => {
  const match = normalizeText(name).match(/\b(?:camera|kamera)\s*([a-z])\b/i);
  return match?.[1]?.toUpperCase() || 'A';
};

const buildCameraSpec = (categories, project) => {
  // 1. Try to find a populated camera category
  const category = categories.find(
    (candidate) => isPrimaryCameraCategory(candidate.name) && (candidate.items || []).length > 0
  );

  if (category) {
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
  }

  // 2. Fallback: If no populated camera category, check for technical metadata
  const hasMetadata = [project.resolution, project.aspectRatio, project.codec, project.framerate]
    .some((val) => val != null && String(val).trim() !== '');

  if (hasMetadata) {
    // Try to find a camera category even if empty to use its name
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

  const resolvedTheme = theme === 'dark' || !theme ? 'light' : theme;
  const isPinkMode = resolvedTheme === 'pink';
  const isLightMode = resolvedTheme === 'light';
  const themeColor = isPinkMode ? '#E10078' : '#001589';
  const subtitleColor = isPinkMode ? '#F06292' : '#5C6BC0';
  const lineColor = isPinkMode ? '#F06292' : isLightMode ? '#001589' : '#9CA3AF';

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
    // PDF metadata fields for new project properties
    {
      label: t('project.print.labels.resolution', 'Resolution'),
      value: project.resolution
    },
    {
      label: t('project.print.labels.aspectRatio', 'Aspect ratio'),
      value: project.aspectRatio
    },
    {
      label: t('project.print.labels.codec', 'Codec'),
      value: project.codec
    },
    {
      label: t('project.print.labels.framerate', 'Framerate'),
      value: project.framerate
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

  const cameraSpec = buildCameraSpec(categories, project);
  let cameraSpecRow = null;
  if (cameraSpec) {
    const extValues = [
      String(project?.resolution ?? ''),
      String(project?.aspectRatio ?? ''),
      String(project?.codec ?? ''),
      String(project?.framerate ?? '')
    ];
    const itemValue = normalizeText(cameraSpec.values[0]);
    const detailValues = cameraSpec.values
      .slice(1, 5)
      .map((value) => normalizeText(value))
      .filter((value) => value !== '');
    const allValues = [itemValue, ...detailValues, ...extValues];

    const widths = [90, ...Array(allValues.length).fill('*')];

    cameraSpecRow = {
      table: {
        widths,
        body: [
          [
            {
              text: [
                {
                  text: `${cameraSpec.label.replace(/\s+[a-z]$/i, '').trim() || cameraSpec.label} `,
                  bold: true
                },
                { text: cameraSpec.letter, bold: true, color: CAMERA_BADGE_COLOR }
              ],
              fontSize: 9
            },
            ...allValues.map((value) => ({ text: value, alignment: 'center', fontSize: 9 }))
          ]
        ]
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0 : 0.5),
        hLineColor: () => lineColor,
        vLineColor: () => lineColor,
        paddingLeft: (i) => (i === 0 ? 0 : 4),
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, 6, 0, 10]
    };
  }

  const categoryContent = categories.flatMap((category, idx) => {
    const items = category.items || [];
    if (items.length === 0) return [];

    const categoryName = resolveCategoryName(category.name, idx);

    // Header Row mimicking the previous independent header style
    const headerRow = [
      {
        text: categoryName,
        style: 'categoryHeader',
        color: themeColor,
        colSpan: 3,
        border: [false, false, false, false]
      },
      {}, // Empty cells for colspan
      {}
    ];

    // Build a table per category: one row per item
    const rows = items.map((item, itemIndex) => {
      const quantity = normalizeText(item.quantity) || '1';
      const name = resolveItemName(item.name, itemIndex);
      const details = normalizeItemDetails(item.details);
      const nameSegments = parseBoldParts(name);
      const nameSegs = nameSegments.map((seg) => ({ text: seg.text, bold: seg.bold }));
      const detailsSegments = details ? parseBoldParts(details) : [];
      const nameCell = {
        text: [
          ...nameSegs,
          ...(details
            ? [{ text: ' - ' }, ...detailsSegments.map((seg) => ({ text: seg.text, bold: seg.bold }))]
            : [])
        ]
      };
      return [{ text: `${quantity}x`, bold: true }, { text: '' }, nameCell];
    });

    return [
      {
        unbreakable: true,
        table: {
          widths: ['auto', 'auto', '*'],
          headerRows: 1,
          keepWithHeaderRows: 1,
          dontBreakRows: true, // Prevent splitting inside an item row (optional but good)
          body: [headerRow, ...rows]
        },
        layout: {
          hLineWidth: (i, node) => 0.5, // Draw all horizontal lines (Top, Middle, Bottom)
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0 : 0.5),
          hLineColor: () => lineColor,
          vLineColor: () => lineColor,
          paddingLeft: (i) => (i === 0 ? 0 : 6),
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4
        },
        margin: [0, 6, 0, 6]
      }
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
            lineColor: lineColor
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
            lineColor: lineColor
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
    pageMargins: [80, 80, 80, 110],
    footer: (currentPage, pageCount) => ({
      text: `${pageLabel} ${currentPage} ${ofLabel} ${pageCount} | ${listLabel} | ${projectName}`,
      alignment: 'center',
      color: '#666',
      fontSize: 9,
      margin: [80, 90, 80, 0]
    }),
    content: [
      {
        text: projectName,
        style: 'title',
        color: themeColor,
        margin: [0, 0, 0, 2],
        fontSize: 26
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
                lineColor: lineColor
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
      categoryHeader: { fontSize: 10.5, bold: true },
      specHeader: { fontSize: 7, color: '#666', bold: true }
    },
    defaultStyle: {
      font: 'Ubuntu',
      fontSize: 10,
      color: '#111'
    }
  };
}
