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
