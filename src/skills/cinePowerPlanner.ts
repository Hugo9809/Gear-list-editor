// Placeholder migration adapter for Cine Power Planner
// This module translates Cine Power Planner's skill definitions
// into the internal Skill interface used by this repo.

import type { Skill } from './skill'

export interface CinePowerSkillInput {
  id: string
  title: string
  summary?: string
  // Cine Power Planner may use different field names; support common ones
  description?: string
  // copy of executable contract or function name
  execute?: string
}

export function migrateFromCinePowerPlanner(data: CinePowerSkillInput[]): Skill[] {
  // Simple mapper: map CinePowerSkillInput to internal Skill with a no-op runner.
  // In real migration, adapt fields according to CinePower Planner schema.
  const toSkill = (s: CinePowerSkillInput): Skill => {
    const id = s.id
    const name = s.title || id
    const description = s.summary || s.description
    const capability = s.execute ? `execute:${s.execute}` : undefined
    const runner = async (_input: any, _ctx: any) => {
      // Migration placeholder: no actual work
      return { ok: true, id, name, description }
    }
    // Return as a minimal inline object implementing Skill
    return {
      id,
      name,
      description,
      capability,
      run: runner
    }
  }
  // data is guaranteed to be an array by the function signature, so a direct map is fine
  return data.map(toSkill)
}
