/**
 * Helper to get Blob from pdfMake generator, supporting both Promise and Callback APIs.
 * @param {Object} generator - The pdfMake generator instance.
 * @returns {Promise<Blob>}
 */
export function getBlobFromGenerator(generator) {
    return new Promise((resolve, reject) => {
        try {
            const result = generator.getBlob((blob) => {
                resolve(blob);
            });
            // If result is a Promise (newer pdfmake), wait for it.
            if (result && typeof result.then === 'function') {
                result.then(resolve).catch(reject);
            }
        } catch (error) {
            reject(error);
        }
    });
}
