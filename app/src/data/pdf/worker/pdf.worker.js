import pdfMake from 'pdfmake/build/pdfmake';

import { ubuntuVfs } from '../fonts/ubuntu-vfs.js';

import { buildDocDefinition } from '../buildDocDefinition.js';

// Debugging fonts (keep logs for now)
console.log('PDF Worker Initializing...');
console.log('Ubuntu VFS keys:', Object.keys(ubuntuVfs));

// Use ONLY Ubuntu VFS
pdfMake.vfs = ubuntuVfs;

console.log('PDF vfs assigned keys:', Object.keys(pdfMake.vfs));

// Register font families
pdfMake.fonts = {
    Ubuntu: {
        normal: 'Ubuntu-Regular.ttf',
        bold: 'Ubuntu-Bold.ttf',
        italics: 'Ubuntu-Italic.ttf',
        bolditalics: 'Ubuntu-BoldItalic.ttf'
    }
};

self.onmessage = (event) => {
    const { snapshot, translations, theme } = event.data;

    if (!snapshot) {
        self.postMessage({ success: false, error: 'No snapshot data provided' });
        return;
    }

    try {
        // Create a simple translation helper using the passed object
        const t = (key, fallback) => {
            return translations[key] || fallback || key;
        };

        // Build the doc definition inside the worker
        const docDefinition = buildDocDefinition(snapshot, t, theme);

        // Explicitly set default style font to Ubuntu if it's not set
        if (!docDefinition.defaultStyle) {
            docDefinition.defaultStyle = {};
        }
        if (!docDefinition.defaultStyle.font) {
            docDefinition.defaultStyle.font = 'Ubuntu';
        }

        const generator = pdfMake.createPdf(docDefinition);

        generator.getBlob((blob) => {
            self.postMessage({ success: true, blob });
        });
    } catch (error) {
        console.error('PDF Worker Error:', error);
        self.postMessage({ success: false, error: error.message });
    }
};
