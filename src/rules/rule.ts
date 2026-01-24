/**
 * Rule contract used by the RuleEngine.
 * Each rule must provide a unique id, an optional description,
 * and an asynchronous apply(context) method that returns a result.
 */
export interface Rule {
  id: string
  description?: string
  apply(context: any): Promise<any>
}
