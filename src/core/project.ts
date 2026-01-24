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

// --- Form schema support for UI integration ---
export type FieldType = 'text' | 'number'

export interface ProjectFormField {
  id: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  options?: string[]
}

// Build a simple, stable form schema for creating a Project
export function getProjectFormSchema(): ProjectFormField[] {
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
  ]
}

// Translate a raw form input into the internal ProjectParameters type
export function formToProjectParameters(input: { [key: string]: any }): ProjectParameters {
  const params: ProjectParameters = {}
  if (typeof input.resolution === 'string' && input.resolution.trim()) {
    params.resolution = input.resolution
  }
  if (typeof input.aspectRatio === 'string' && input.aspectRatio.trim()) {
    params.aspectRatio = input.aspectRatio
  }
  if (typeof input.codec === 'string' && input.codec.trim()) {
    params.codec = input.codec
  }
  if (typeof input.framerate === 'number') {
    params.framerate = input.framerate
  }
  return params
}

// Convenience: extract the PDF-related metadata for a given project
export function extractProjectPdfMeta(project: Project): ProjectParameters {
  return project.parameters ?? {}
}
