import { describe, it, expect, vi } from 'vitest';
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
        const titleObj = doc.content.find(c => c.style === 'title');
        expect(titleObj).toBeDefined();
        expect(titleObj.text).toBe('My Shoot');
    });

    it('generates tables for categories', () => {
        const snapshot = {
            data: {
                project: {
                    categories: [
                        {
                            name: 'Camera',
                            items: [
                                { quantity: 2, unit: 'pcs', name: 'Body', details: 'Serial 123' }
                            ]
                        }
                    ]
                }
            }
        };

        const doc = buildDocDefinition(snapshot, mockT);

        // Flatten content logic is hard to search directly if deep nested, 
        // but our builder puts categories directly in top-level content array (spread).

        // Look for category header
        const catHeader = doc.content.find(c => c.style === 'categoryHeader' && c.text === 'Camera');
        expect(catHeader).toBeDefined();

        // Look for table
        const tableObj = doc.content.find(c => c.table);
        expect(tableObj).toBeDefined();
        expect(tableObj.table.body.length).toBe(2); // Header + 1 row

        // Check row data
        const dataRow = tableObj.table.body[1];
        expect(dataRow[0].text).toBe('2'); // Qty
        expect(dataRow[2].text).toBe('Body'); // Name
    });

    it('handles empty items robustly', () => {
        const snapshot = {
            data: {
                project: {
                    categories: [
                        { name: 'Empty Cat', items: [] }
                    ]
                }
            }
        };

        const doc = buildDocDefinition(snapshot, mockT);

        // Should not generate table for empty category
        const catHeader = doc.content.find(c => c.text === 'Empty Cat');
        expect(catHeader).toBeUndefined();
    });
});
