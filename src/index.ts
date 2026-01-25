// Re-export core library surface area explicitly to avoid circular barrels
export { Skill } from './skills/skill'
export { RuleEngine } from './rules/engine'
export { createProject, getProjectFormSchema, formToProjectParameters, extractProjectPdfMeta } from './core/project'
export type { Project } from './core/project'
export type { ProjectFormField } from './core/project'
