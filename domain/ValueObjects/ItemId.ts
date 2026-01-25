export class ItemId {
  constructor(public readonly value: string) {}

  static create(value: string): ItemId {
    return new ItemId(value);
  }
}
