import { describe, it, expect } from 'vitest';
import { createStorageService, exportState } from './storageService.js';

const emptyState = (overrides = {}) => ({
  theme: 'light',
  projects: [],
  templates: [],
  history: { items: [], categories: [] },
  activeProjectId: null,
  lastSaved: null,
  showAutoBackups: false,
  ...overrides
});

describe('storageService', () => {
  it('exports theme and auto-backup preferences in payload', () => {
    const { payload } = exportState(
      emptyState({
        theme: 'dark',
        showAutoBackups: true
      })
    );

    expect(payload.theme).toBe('dark');
    expect(payload.showAutoBackups).toBe(true);
  });

  it('imports theme and auto-backup preferences when provided', () => {
    const storage = createStorageService();
    const currentState = emptyState({ theme: 'light', showAutoBackups: false });
    const rawText = JSON.stringify({
      version: 2,
      theme: 'dark',
      showAutoBackups: true,
      projects: [],
      templates: [],
      history: { items: [], categories: [] }
    });

    const result = storage.importBackup(rawText, currentState);

    expect(result.warnings).toEqual([]);
    expect(result.state.theme).toBe('dark');
    expect(result.state.showAutoBackups).toBe(true);

    storage.dispose();
  });

  it('keeps current preferences when import omits them', () => {
    const storage = createStorageService();
    const currentState = emptyState({ theme: 'dark', showAutoBackups: true });
    const rawText = JSON.stringify({
      version: 2,
      projects: [],
      templates: [],
      history: { items: [], categories: [] }
    });

    const result = storage.importBackup(rawText, currentState);

    expect(result.state.theme).toBe('dark');
    expect(result.state.showAutoBackups).toBe(true);

    storage.dispose();
  });

  it('returns a warning for invalid backup JSON', () => {
    const storage = createStorageService();
    const currentState = emptyState({ theme: 'dark', showAutoBackups: true });
    const result = storage.importBackup('not-json', currentState);

    expect(result.warnings.length).toBe(1);
    expect(result.state.theme).toBe('dark');
    expect(result.state.showAutoBackups).toBe(true);

    storage.dispose();
  });
});
