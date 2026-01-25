
/**
 * Triggers a browser download for the given text content.
 * Uses robust methods to ensure filename is respected and download is not blocked.
 * 
 * @param {string} content - The text/json content to download
 * @param {string} fileName - The desired filename (e.g. "project.json")
 * @param {string} mimeType - The mime type (default: application/json)
 */
export const triggerDownload = (content, fileName, mimeType = 'application/json') => {
    // Use File constructor if available for better filename handling support
    let url;
    if (typeof File !== 'undefined') {
        try {
            const file = new File([content], fileName, { type: mimeType });
            url = URL.createObjectURL(file);
        } catch (e) {
            // Fallback if File constructor fails (e.g. strict mode or old browser)
            console.warn('File constructor failed, falling back to Blob', e);
            const blob = new Blob([content], { type: mimeType });
            url = URL.createObjectURL(blob);
        }
    } else {
        const blob = new Blob([content], { type: mimeType });
        url = URL.createObjectURL(blob);
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none'; // Ensure it's not visible

    // Appending to body is required for Firefox and some Chrome contexts
    document.body.appendChild(link);

    try {
        link.click();
    } finally {
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 1000); // 1s delay to ensure event processes
    }
};
