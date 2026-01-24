/**
 * RuleEngine
 * A small orchestrator that maintains a collection of Rule instances
 * and executes them in sequence against a given context.
 */
export class RuleEngine {
    constructor(rules) {
        this.rules = [];
        if (rules)
            this.rules = rules;
    }
    /**
     * Register a new rule to be executed by the engine.
     * @param {Rule} rule - The rule instance to register.
     */
    register(rule) {
        this.rules.push(rule);
    }
    /**
     * Run all registered rules in order, collecting their results.
     * @param {any} context - The execution context passed to each rule.
     * @returns {Promise<any[]>} Array of { id, result } objects corresponding to each rule.
     */
    async run(context) {
        const results = [];
        for (const r of this.rules) {
            const res = await r.apply(context);
            results.push({ id: r.id, result: res });
        }
        return results;
    }
}
