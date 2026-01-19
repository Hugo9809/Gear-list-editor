
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
                        items: [
                            { quantity: 1, name: 'Alexa 35', details: 'Sensor Mode' }
                        ]
                    }
                ]
            }
        }
    };

    it('should use pink accent in pink mode', () => {
        const docDef = buildDocDefinition(mockSnapshot, mockT, 'pink');
        // Check for specific pink color #E10078
        const pinkColorFound = JSON.stringify(docDef).includes('#E10078');
        expect(pinkColorFound).toBe(true);
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
