import { describe, it, expect } from 'vitest';
import { buildDocDefinition } from './buildDocDefinition';

describe('buildDocDefinition', () => {
  const mockT = (key, fallback) => fallback || key;
  const mockSnapshot = {
    data: {
      project: {
        name: 'Test Project',
        categories: [
          {
            name: 'Camera',
            items: [{ quantity: 1, name: 'Alexa 35', details: 'Sensor Mode' }]
          }
        ]
      }
    }
  };

  it('should use pink accent and lines in pink mode', () => {
    // Add notes to trigger canvas line elements which expose the color in JSON
    const snapshotWithNotes = {
      ...mockSnapshot,
      data: {
        ...mockSnapshot.data,
        project: {
          ...mockSnapshot.data.project,
          notes: 'Test Notes'
        }
      }
    };
    const docDef = buildDocDefinition(snapshotWithNotes, mockT, 'pink');

    // Check for specific pink color #E10078 (Header/Theme)
    const pinkThemeColorFound = JSON.stringify(docDef).includes('#E10078');
    expect(pinkThemeColorFound).toBe(true);
    // Check for specific pink line color #F06292
    const pinkLineColorFound = JSON.stringify(docDef).includes('#F06292');
    expect(pinkLineColorFound).toBe(true);
  });

  it('should use blue accent in light mode', () => {
    const docDef = buildDocDefinition(mockSnapshot, mockT, 'light');
    // Check for specific blue color #001589
    const blueColorFound = JSON.stringify(docDef).includes('#001589');
    expect(blueColorFound).toBe(true);
  });

  it('should use blue accent in dark mode', () => {
    const docDef = buildDocDefinition(mockSnapshot, mockT, 'dark');
    const blueColorFound = JSON.stringify(docDef).includes('#001589');
    expect(blueColorFound).toBe(true);
  });

  it('should identify camera category (smoke test)', () => {
    const docDef = buildDocDefinition(mockSnapshot, mockT, 'light');
    // We expect to find 'Camera' text
    const str = JSON.stringify(docDef);
    expect(str).toContain('Camera');
    expect(str).toContain('Alexa 35');
  });
});
