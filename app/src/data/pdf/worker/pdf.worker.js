import pdfMake from 'pdfmake/build/pdfmake';

import { ubuntuVfs } from '../fonts/ubuntu-vfs.js';

import { buildDocDefinition } from '../buildDocDefinition.js';

// Debugging fonts (keep logs for now)
console.log('PDF Worker Initializing...');
console.log('Ubuntu VFS keys:', Object.keys(ubuntuVfs));

// Use ONLY Ubuntu VFS

// Ensure pdfMake uses the provided VFS
// We assign it globally and inside the handler to be safe against bundling quirks
pdfMake.vfs = ubuntuVfs;
if (pdfMake.virtualfs) {
  pdfMake.virtualfs.storage = ubuntuVfs;
}

import { getBlobFromGenerator } from '../pdfUtils.js';

self.onmessage = async (event) => {
  const { snapshot, translations, theme } = event.data;

  if (!snapshot) {
    self.postMessage({ success: false, error: 'No snapshot data provided' });
    return;
  }

  try {
    // Re-assign VFS/Fonts inside the request handling to prevent any state staleness
    // and verify keys exist
    pdfMake.vfs = ubuntuVfs;
    if (pdfMake.virtualfs) {
      pdfMake.virtualfs.storage = ubuntuVfs;
    }

    const vfsKeys = Object.keys(pdfMake.vfs || {});
    const boldExists = vfsKeys.includes('Ubuntu-Bold.ttf');

    if (!boldExists) {
      console.error('CRITICAL: Ubuntu-Bold.ttf missing from VFS in worker handler!', vfsKeys);
    }

    pdfMake.fonts = {
      Ubuntu: {
        normal: 'Ubuntu-Regular.ttf',
        bold: 'Ubuntu-Bold.ttf',
        italics: 'Ubuntu-Italic.ttf',
        bolditalics: 'Ubuntu-BoldItalic.ttf'
      }
    };

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
    const blob = await getBlobFromGenerator(generator);
    self.postMessage({ success: true, blob });
  } catch (error) {
    console.error('PDF Worker Error:', error);
    // Log additional context if it's a VFS error
    if (error.message && error.message.includes('not found in virtual file system')) {
      console.error('Current VFS Keys:', Object.keys(pdfMake.vfs || {}));
    }
    self.postMessage({ success: false, error: error.message });
  }
};
