import { describe, it, expect } from 'vitest';
import { buildDocDefinition } from '../../src/data/pdf/buildDocDefinition.js';

describe('buildDocDefinition - multiple categories', () => {
  const mockT = (key, fallback) => fallback || key;
  const snapshot = {
    data: {
      project: {
        name: 'Multi Cat Shoot',
        categories: [
          {
            name: 'Camera',
            items: [{ quantity: 1, name: 'Body', details: 'Detail A' }]
          },
          {
            name: 'Lights',
            items: [{ quantity: 2, name: 'LED Panel', details: '' }]
          }
        ]
      }
    }
  };

  const doc = buildDocDefinition(snapshot, mockT);

  it('produces two category tables', () => {
    const tables = doc.content.filter((c) => c.table);
    expect(tables.length).toBe(2);
  });

  it('each table has one row per item and proper cell layout', () => {
    const tables = doc.content.filter((c) => c.table);
    // First table: 1 item -> 1 row
    expect(tables[0].table.body.length).toBe(1);
    // Row cell layout: [qty, blank, name/details]
    const row0 = tables[0].table.body[0];
    expect(row0[0].text).toBe('1x');
    const nameCell0 = row0[2];
    expect(nameCell0.text[0].text).toBe('Body');

    // Second table: 1 item as well
    expect(tables[1].table.body.length).toBe(1);
    const row1 = tables[1].table.body[0];
    expect(row1[0].text).toBe('2x');
    const nameCell1 = row1[2];
    expect(nameCell1.text[0].text).toBe('LED Panel');
  });
});
