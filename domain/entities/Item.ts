import { ItemId } from '../ValueObjects/ItemId';

export class Item {
  constructor(
    public readonly id: ItemId,
    public readonly name: string,
    public readonly quantity: number
  ) {}
}
