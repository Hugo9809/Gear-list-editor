import type { Rule } from './rule'

export class RuleEngine {
  private rules: Rule[] = []

  constructor(rules?: Rule[]) {
    if (rules) this.rules = rules
  }

  register(rule: Rule): void {
    this.rules.push(rule)
  }

  async run(context: any): Promise<any> {
    const results: any[] = []
    for (const r of this.rules) {
      const res = await r.apply(context)
      results.push({ id: r.id, result: res })
    }
    return results
  }
}
