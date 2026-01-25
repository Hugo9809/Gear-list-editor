
import pdfMakeModule from 'pdfmake/build/pdfmake.js';
import { ubuntuVfs } from './ubuntu-vfs.js';

console.log('--- Debugging pdfMake Import ---');

// simulate what the worker handles
const effectivePdfMake = pdfMakeModule.default || pdfMakeModule;

if (effectivePdfMake.virtualfs) {
    console.log('pdfMakeModule.virtualfs exists');
    console.log('Keys of virtualfs:', Object.keys(effectivePdfMake.virtualfs));

    // Check if storage is an object we can write to
    if (effectivePdfMake.virtualfs.storage) {
        console.log('Storage type:', typeof effectivePdfMake.virtualfs.storage);
        // Try copying keys instead of replacing the object
        Object.assign(effectivePdfMake.virtualfs.storage, ubuntuVfs);
        console.log('Copied keys to virtualfs.storage');
        console.log('Storage keys count:', Object.keys(effectivePdfMake.virtualfs.storage).length);
    }
} else {
    // Fallback
    effectivePdfMake.vfs = ubuntuVfs;
}

// Try to create a dummy PDF
const docDefinition = {
    content: ['Test'],
    defaultStyle: {
        font: 'Ubuntu'
    }
};

effectivePdfMake.fonts = {
    Ubuntu: {
        normal: 'Ubuntu-Regular.ttf',
        bold: 'Ubuntu-Bold.ttf',
        italics: 'Ubuntu-Italic.ttf',
        bolditalics: 'Ubuntu-BoldItalic.ttf'
    }
};

try {
    const pdfDoc = effectivePdfMake.createPdf(docDefinition);
    console.log('createPdf returned object:', !!pdfDoc);

    pdfDoc.getBuffer((buffer) => {
        console.log('PDF generated successfully, buffer length:', buffer.length);
    });

} catch (e) {
    console.error('Error generating PDF:', e);
}
