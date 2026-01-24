// Minimal HTML form generator for creating a Project.
// This module relies on the core form schema to render fields and can be consumed by a UI layer.

import type { ProjectFormField, ProjectParameters } from '../core/project'
import { getProjectFormSchema } from '../core/project'

export interface ProjectFormValue extends Partial<ProjectParameters> {
  name?: string
}

/**
 * Render a simple HTML form for creating a Project.
 * This is a lightweight, framework-agnostic helper meant for server-side rendering or static pages.
 */
export function renderProjectFormHtml(initial?: ProjectFormValue): string {
  const schema: ProjectFormField[] = getProjectFormSchema()
  const nameValue = (initial?.name ?? '')
  const parts: string[] = []
  parts.push('<form id="project-create-form" method="post">')
  // Name (required)
  parts.push('<label>Project Name</label>')
  parts.push(`<input type="text" name="name" value="${escapeHtml(nameValue)}" required />`)

  // Other fields from schema
  for (const field of schema) {
    if (field.id === 'name') continue // already rendered
    const value = (initial && (initial as any)[field.id as keyof ProjectParameters]) ?? ''
    const placeholder = field.placeholder ?? ''
    if (field.type === 'text') {
      parts.push(`<label>${field.label}</label>`)
      parts.push(`<input type="text" name="${field.id}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(String(value))}" />`)
    } else if (field.type === 'number') {
      parts.push(`<label>${field.label}</label>`)
      parts.push(`<input type="number" name="${field.id}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(String(value))}" ${field.min != null ? `min="${field.min}"` : ''} ${field.max != null ? `max="${field.max}"` : ''} />`)
    }
  }
  parts.push('<button type="submit">Create Project</button>')
  parts.push('</form>')
  return parts.join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
