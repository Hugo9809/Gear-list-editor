export type { Skill } from './skill'

// Runtime registry of loaded skills
class SkillRegistry {
  private skills: Map<string, import('./skill').Skill> = new Map()

  register(skill: import('./skill').Skill): void {
    this.skills.set(skill.id, skill)
  }

  get(id: string): import('./skill').Skill | undefined {
    return this.skills.get(id)
  }

  list(): string[] {
    return Array.from(this.skills.values()).map(s => s.id)
  }
}

export const registry = new SkillRegistry()
