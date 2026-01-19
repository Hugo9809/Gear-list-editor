import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ubuntuVfs } from '../fonts/ubuntu-vfs.js';

// Merge default Roboto VFS with Ubuntu VFS (if available)
pdfMake.vfs = {
    ...(pdfFonts?.pdfMake?.vfs || {}),
    ...ubuntuVfs
};

// Register font families
pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    },
    Ubuntu: {
        normal: 'Ubuntu-Regular.ttf',
        bold: 'Ubuntu-Bold.ttf',
        italics: 'Ubuntu-Italic.ttf',
        bolditalics: 'Ubuntu-BoldItalic.ttf'
    }
};

self.onmessage = (event) => {
    const { docDefinition } = event.data;

    if (!docDefinition) {
        self.postMessage({ success: false, error: 'No document definition provided' });
        return;
    }

    try {
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
