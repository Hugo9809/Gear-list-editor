/**
 * Lightweight Project model for Gear-list-editor.
 * These fields are intended to be included when exporting a PDF for a given project.
 * They mirror the metadata commonly found in the example PDFs.
 */
/**
 * Create a new Project instance.
 * Generates a deterministic-ish id but does not rely on any external systems.
 */
export function createProject(name, parameters) {
    const id = `proj-${Date.now().toString(36)}-${(Math.random() * 1e6).toFixed(0)}`;
    return {
        id,
        name,
        createdAt: new Date(),
        parameters: parameters
    };
}
// Build a simple, stable form schema for creating a Project
export function getProjectFormSchema() {
    return [
        {
            id: 'name',
            label: 'Project Name',
            type: 'text',
            required: true,
            placeholder: 'Enter project name',
            minLength: 1,
        },
        {
            id: 'resolution',
            label: 'Resolution',
            type: 'text',
            placeholder: 'e.g. 1920x1080',
        },
        {
            id: 'aspectRatio',
            label: 'Aspect Ratio',
            type: 'text',
            placeholder: 'e.g. 16:9',
        },
        {
            id: 'codec',
            label: 'Codec',
            type: 'text',
            placeholder: 'e.g. H.264',
        },
        {
            id: 'framerate',
            label: 'Framerate (fps)',
            type: 'number',
            min: 1,
            max: 240,
            placeholder: 'e.g. 30',
        }
    ];
}
// Translate a raw form input into the internal ProjectParameters type
export function formToProjectParameters(input) {
    const params = {};
    if (typeof input.resolution === 'string' && input.resolution.trim()) {
        params.resolution = input.resolution;
    }
    if (typeof input.aspectRatio === 'string' && input.aspectRatio.trim()) {
        params.aspectRatio = input.aspectRatio;
    }
    if (typeof input.codec === 'string' && input.codec.trim()) {
        params.codec = input.codec;
    }
    if (typeof input.framerate === 'number') {
        params.framerate = input.framerate;
    }
    return params;
}
// Convenience: extract the PDF-related metadata for a given project
export function extractProjectPdfMeta(project) {
    return project.parameters ?? {};
}
