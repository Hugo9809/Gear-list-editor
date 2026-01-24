import { Item } from '../domain/entities/Item';
import { ItemId } from '../domain/ValueObjects/ItemId';
import { describe, it, expect } from 'vitest';

describe('Item domain', () => {
  it('should create item with id and name', () => {
    const id = ItemId.create('test-id');
    const item = new Item(id, 'Test', 3);
    // Basic sanity checks
    // @ts-ignore
    expect(item.name).toBe('Test');
    // @ts-ignore
    expect(item.id.value).toBe('test-id');
    // @ts-ignore
    expect(item.quantity).toBe(3);
  });
});
