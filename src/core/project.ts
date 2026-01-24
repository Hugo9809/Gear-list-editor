/**
 * Lightweight Project model for Gear-list-editor.
 * These fields are intended to be included when exporting a PDF for a given project.
 * They mirror the metadata commonly found in the example PDFs.
 */

export interface ProjectParameters {
  // Example formats: "1920x1080", "2560x1440" or any custom string used by the exporter
  resolution?: string
  // Common aspect ratios like "16:9", "4:3", etc.
  aspectRatio?: string
  // Video codec, e.g., "H.264", "HEVC", etc.
  codec?: string
  // Frame rate in frames per second
  framerate?: number
}

export interface Project {
  id: string
  name: string
  createdAt?: Date
  parameters?: ProjectParameters
}

/**
 * Create a new Project instance.
 * Generates a deterministic-ish id but does not rely on any external systems.
 */
export function createProject(name: string, parameters?: ProjectParameters): Project {
  const id = `proj-${Date.now().toString(36)}-${(Math.random() * 1e6).toFixed(0)}`
  return {
    id,
    name,
    createdAt: new Date(),
    parameters: parameters
  }
}
