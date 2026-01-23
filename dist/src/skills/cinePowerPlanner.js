// Placeholder migration adapter for Cine Power Planner
// This module translates Cine Power Planner's skill definitions
// into the internal Skill interface used by this repo.
export function migrateFromCinePowerPlanner(data) {
    // Simple mapper: map CinePowerSkillInput to internal Skill with a no-op runner.
    // In real migration, adapt fields according to CinePower Planner schema.
    const toSkill = (s) => {
        const id = s.id;
        const name = s.title || id;
        const description = s.summary || s.description;
        const capability = s.execute ? `execute:${s.execute}` : undefined;
        const runner = async (_input, _ctx) => {
            // Migration placeholder: no actual work
            return { ok: true, id, name, description };
        };
        // Return as a minimal inline object implementing Skill
        return {
            id,
            name,
            description,
            capability,
            run: runner
        };
    };
    // data is guaranteed to be an array by the function signature, so a direct map is fine
    return data.map(toSkill);
}
