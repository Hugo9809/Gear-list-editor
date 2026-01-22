export interface Rule {
  id: string
  description?: string
  apply(context: any): Promise<any>
}
