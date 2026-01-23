export class RuleEngine {
    constructor(rules) {
        this.rules = [];
        if (rules)
            this.rules = rules;
    }
    register(rule) {
        this.rules.push(rule);
    }
    async run(context) {
        const results = [];
        for (const r of this.rules) {
            const res = await r.apply(context);
            results.push({ id: r.id, result: res });
        }
        return results;
    }
}
