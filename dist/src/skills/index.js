// Runtime registry of loaded skills
class SkillRegistry {
    constructor() {
        this.skills = new Map();
    }
    register(skill) {
        this.skills.set(skill.id, skill);
    }
    get(id) {
        return this.skills.get(id);
    }
    list() {
        return Array.from(this.skills.values()).map(s => s.id);
    }
}
export const registry = new SkillRegistry();
