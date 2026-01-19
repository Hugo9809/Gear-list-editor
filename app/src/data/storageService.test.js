import { describe, expect, it, vi } from 'vitest';

const loadStorageService = async () => {
  const { createStorageService } = await import('./storageService.js');
  return createStorageService();
};

describe('storageService importBackup', () => {
  it('returns warning for invalid JSON', async () => {
    const { createEmptyState, migratePayload } = await import('./migrate.js');
    const { STORAGE_MESSAGE_KEYS } = await import('./normalize.js');
    const service = await loadStorageService();
    const currentState = createEmptyState();

    const result = service.importBackup('{bad json', currentState);

    expect(result.warnings).toEqual([STORAGE_MESSAGE_KEYS.warnings.importInvalid]);
    expect(result.state).toEqual(migratePayload(currentState));
  });

  it('returns warning and keeps state when validation fails', async () => {
    vi.resetModules();
    vi.doMock('./normalize.js', async () => {
      const actual = await vi.importActual('./normalize.js');
      return {
        ...actual,
        validatePayload: vi.fn(() => ({ valid: false, errors: ['errors.payload_invalid'] }))
      };
    });

    const { createEmptyState, migratePayload } = await import('./migrate.js');
    const { STORAGE_MESSAGE_KEYS } = await import('./normalize.js');
    const service = await loadStorageService();
    const currentState = createEmptyState();
    const rawText = JSON.stringify({
      version: 2,
      projects: [],
      templates: [],
      history: { items: [], categories: [] }
    });

    const result = service.importBackup(rawText, currentState);

    expect(result.warnings).toEqual([STORAGE_MESSAGE_KEYS.warnings.importValidationFailed]);
    expect(result.state).toEqual(migratePayload(currentState));
  });

  it('merges valid backups into the current state', async () => {
    vi.resetModules();
    vi.doUnmock('./normalize.js');

    const { createEmptyState } = await import('./migrate.js');
    const service = await loadStorageService();
    const currentState = {
      ...createEmptyState(),
      projects: [{ id: 'project-a', name: 'Project A', categories: [] }],
      activeProjectId: 'project-a'
    };
    const rawText = JSON.stringify({
      version: 2,
      projects: [{ id: 'project-b', name: 'Project B', categories: [] }],
      templates: [],
      history: { items: [], categories: [] }
    });

    const result = service.importBackup(rawText, currentState);

    expect(result.warnings).toEqual([]);
    expect(result.state.projects).toHaveLength(2);
    expect(result.state.projects.map((project) => project.name)).toEqual(
      expect.arrayContaining(['Project A', 'Project B'])
    );
  });
});
