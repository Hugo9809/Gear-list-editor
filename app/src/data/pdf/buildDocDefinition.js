import { format } from 'date-fns';

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

    // Theme Configuration
    const isPinkMode = theme === 'pink';
    const THEME_COLOR = isPinkMode ? '#E10078' : '#001589'; // Pink vs Brightmode Blue
    const LOGO_SUBTITLE_COLOR = isPinkMode ? '#F06292' : '#5C6BC0'; // Lighter variation
    const TEXT_COLOR = '#000000'; // Black text as per reference
    const LINE_COLOR = '#000000'; // Black lines

    // Helper to format values
    const formatValue = (val) => (val != null && val !== '') ? String(val) : '';
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return format(new Date(dateStr), 'P'); // Localized date format
        } catch (e) {
            return dateStr;
        }
    };

    // Helper: Check if category is a Camera category
    const isCameraCategory = (name) => {
        const n = (name || '').toLowerCase();
        return n.includes('camera') || n.includes('kamera');
    };

    // Build category tables
    const categoryContent = categories.flatMap((category, idx) => {
        const items = category.items || [];
        if (items.length === 0) return [];

        const isCam = isCameraCategory(category.name);

        // Special render for Camera A in Camera category?
        // For now, we'll render a special "Spec Box" if it's the Camera category and has items.
        // We act as if the first item is the main camera body.
        let specialCameraBlock = null;
        let tableItems = items;

        // If strict design matching is needed, one could extract the first item here
        // but for safety, we just keep the list uniform for now unless we are sure.
        // Let's implement the "Header" style and standard list first.

        return [
            // Section Divider Line (thin black)
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: LINE_COLOR }], margin: [0, 8, 0, 8] },

            // Category header
            {
                text: category.name || `${t('project.category.defaultName', 'Category')} ${idx + 1}`,
                style: 'categoryHeader',
                color: THEME_COLOR,
                pageBreak: 'avoid',
                margin: [0, 0, 0, 8] // Spacing after line
            },

            // Items table
            {
                table: {
                    headerRows: 0, // No header row in the "list" style reference described (or it was simple)
                    // "Equipment is listed line-by-line starting with quantities... no vertical borders"
                    widths: [20, 30, '*', '*'],
                    body: [
                        // Data rows
                        ...tableItems.map(item => [
                            { text: formatValue(item.quantity) + 'x', alignment: 'right', bold: true }, // "1x" style
                            { text: '', margin: [0, 0, 0, 0] }, // Spacer/Unit implicitly handled or empty
                            {
                                text: [
                                    { text: formatValue(item.name), bold: true },
                                    item.details ? { text: ` | ${formatValue(item.details)}`, color: '#444' } : ''
                                ]
                            },
                            { text: '' } // Extra filler if needed or used for "Notes"
                        ])
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return 0; // No horizontal lines between list items for "open list" look? 
                        // Reference said "horizontal separators... thin black". 
                        // Let's use light lines.
                        // Actually subagent said "no vertical borders... clean, open list look".
                        // "Each section is preceded by a thin black horizontal line".
                        // Use default 'noBorders' for the items themselves?
                        // Let's try 'noBorders' for the clean look.
                    },
                    vLineWidth: function (i, node) { return 0; },
                    paddingLeft: function (i) { return i === 0 ? 0 : 4; },
                    paddingRight: function (i) { return 0; },
                }
            }
        ];
    });

    return {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 60], // Standard margins

        // Dynamic footer
        footer: (currentPage, pageCount) => ({
            columns: [
                { text: `Seite ${currentPage} von ${pageCount} | ${project.name || ''}`, alignment: 'center', color: '#666', fontSize: 9 }
            ],
            margin: [40, 20, 40, 0]
        }),

        content: [
            // Title Header
            {
                text: project.name || t('project.untitled', 'Untitled Project'),
                fontSize: 26,
                bold: true,
                color: THEME_COLOR,
                margin: [0, 0, 0, 2]
            },
            // Subtitle (Client or custom)
            project.client ? {
                text: project.client,
                fontSize: 14,
                bold: true,
                color: LOGO_SUBTITLE_COLOR,
                margin: [0, 0, 0, 20]
            } : null,

            // Metadata Grid (Production Company, AC, etc.)
            {
                columns: [
                    // Column 1
                    {
                        width: 'auto',
                        stack: [
                            { text: t('project.print.labels.date', 'Date'), bold: true },
                            { text: t('project.print.labels.location', 'Location'), bold: true },
                            { text: t('project.print.labels.contact', 'Contact'), bold: true },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: formatDate(project.shootDate) },
                            { text: formatValue(project.location) || '—' },
                            { text: formatValue(project.contact) || '—' },
                        ],
                        margin: [10, 0, 0, 0]
                    }
                ],
                columnGap: 20,
                margin: [0, 0, 0, 20]
            },

            // Categories
            ...categoryContent,

            // Notes
            project.notes ? [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: LINE_COLOR }], margin: [0, 16, 0, 8] },
                { text: t('project.print.notes.title', 'Notes'), style: 'categoryHeader', color: THEME_COLOR, margin: [0, 0, 0, 8] },
                { text: project.notes, color: '#333' }
            ] : []
        ],

        styles: {
            categoryHeader: { fontSize: 14, bold: true },
            tableHeader: { bold: true, color: '#000' }
        },

        defaultStyle: {
            font: 'Ubuntu',
            fontSize: 10,
            color: '#000'
        }
    };
}

