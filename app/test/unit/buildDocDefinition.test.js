import { describe, it, expect } from 'vitest';
import { buildDocDefinition } from '../../src/data/pdf/buildDocDefinition.js';

describe('buildDocDefinition', () => {
  const mockT = (key, fallback) => fallback || key; // Simple mock translator

  it('generates basic document structure', () => {
    const snapshot = {
      data: {
        project: {
          name: 'My Shoot',
          client: 'Client A',
          categories: []
        }
      }
    };

    const doc = buildDocDefinition(snapshot, mockT);

    expect(doc).toHaveProperty('content');
    expect(doc).toHaveProperty('styles');
    expect(doc.pageSize).toBe('A4');

    // Check title in content
    const titleObj = doc.content.find((c) => c.text === 'My Shoot' && c.fontSize === 26);
    expect(titleObj).toBeDefined();
  });

  it('generates tables for categories', () => {
    const snapshot = {
      data: {
        project: {
          categories: [
            {
              name: 'Camera',
              items: [{ quantity: 2, name: 'Body', details: 'Serial 123' }]
            }
          ]
        }
      }
    };

    const doc = buildDocDefinition(snapshot, mockT);

    // Flatten content logic is hard to search directly if deep nested,
    // but our builder puts categories directly in top-level content array (spread).

    // Look for category header
    const catHeader = doc.content.find((c) => c.style === 'categoryHeader' && c.text === 'Camera');
    expect(catHeader).toBeDefined();

    // Look for table
    const tableObj = doc.content.find((c) => c.table);
    expect(tableObj).toBeDefined();
    expect(tableObj.table.body.length).toBe(1); // Just items, no headeritems, no header

    // Check row data
    const dataRow = tableObj.table.body[0];
    expect(dataRow[0].text).toBe('2x'); // Qty (with 'x')
    // Name is structured differently now: { text: [ { text: 'Body', bold: true }, item.details... ] }
    // We need to check the inner structure or just text containment if appropriate.
    // Based on implementation:
    // { text: [ { text: formatValue(item.name), bold: true }, ... ] }

    // Let's inspect the structure of the name cell (index 2)
    const nameCell = dataRow[2];
    expect(nameCell.text[0].text).toBe('Body');
  });

  it('handles empty items robustly', () => {
    const snapshot = {
      data: {
        project: {
          categories: [{ name: 'Empty Cat', items: [] }]
        }
      }
    };

    const doc = buildDocDefinition(snapshot, mockT);

    // Should not generate table for empty category
    const catHeader = doc.content.find((c) => c.text === 'Empty Cat');
    expect(catHeader).toBeUndefined();
  });
});
