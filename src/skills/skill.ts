export interface Skill {
  id: string;
  name: string;
  description?: string;
  capability?: string;
  run(input: any, context: any): Promise<any>;
}
