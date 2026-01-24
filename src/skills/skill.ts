/**
 * Describes a capability that can be executed within the engine
 * given an input and a context. Implementations should return a
 * promise resolving to the operation's result.
 */
export interface Skill {
  id: string;
  name: string;
  description?: string;
  capability?: string;
  run(input: any, context: any): Promise<any>;
}
