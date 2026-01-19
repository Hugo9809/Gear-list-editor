import { describe, it, expect } from 'vitest';
import { buildExportSnapshot } from '../../src/data/pdf/snapshotTypes.js';

describe('snapshotTypes', () => {
  describe('buildExportSnapshot', () => {
    it('creates a valid snapshot from a project', () => {
      const project = {
        id: 'proj-123',
        name: 'Test Project',
        categories: [
          {
            id: 'cat-1',
            items: [
              { id: 'item-1', name: 'Item 1' },
              { id: 'item-2', name: 'Item 2' }
            ]
          }
        ]
      };

      const snapshot = buildExportSnapshot(project, 'en');

      expect(snapshot).toMatchObject({
        schemaVersion: '1.0',
        documentId: 'proj-123',
        locale: 'en',
        data: {
          project: project,
          totals: {
            categories: 1,
            items: 2
          }
        }
      });

      expect(snapshot.createdAtISO).toBeDefined();
    });

    it('handles empty projects robustly', () => {
      const project = { id: 'empty', categories: [] };
      const snapshot = buildExportSnapshot(project, 'de');

      expect(snapshot.data.totals).toEqual({ categories: 0, items: 0 });
    });

    it('handles undefined categories gracefully', () => {
      const project = { id: 'no-cats' }; // Missing categories array
      const snapshot = buildExportSnapshot(project, 'en');

      expect(snapshot.data.totals).toEqual({ categories: 0, items: 0 });
    });
  });
});
