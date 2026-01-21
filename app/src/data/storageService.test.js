import { afterEach, describe, expect, it, vi } from 'vitest';

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

  it('merges device library items correctly', async () => {
    vi.resetModules();
    vi.doUnmock('./normalize.js');

    const { createEmptyState } = await import('./migrate.js');
    const service = await loadStorageService();
    const currentState = {
      ...createEmptyState(),
      deviceLibrary: {
        items: [{ id: 'item-1', name: 'Lens', quantity: 1, details: '85mm' }]
      }
    };
    const rawText = JSON.stringify({
      version: 2,
      projects: [],
      templates: [],
      deviceLibrary: {
        items: [{ id: 'item-2', name: 'Camera', quantity: 1, details: 'FX3' }]
      },
      history: { items: [], categories: [] }
    });

    const result = service.importBackup(rawText, currentState);

    expect(result.warnings).toEqual([]);
    expect(result.state.deviceLibrary.items).toHaveLength(2);
    expect(result.state.deviceLibrary.items.map((i) => i.name)).toEqual(
      expect.arrayContaining(['Lens', 'Camera'])
    );
  });
});

describe('storageService legacy backups', () => {
  const originalLocalStorage = globalThis.localStorage;

  afterEach(() => {
    if (originalLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true
      });
    }
  });

  it('returns empty auto backups when localStorage is missing', async () => {
    delete globalThis.localStorage;

    const service = await loadStorageService();
    const backups = await service.listAutoBackups();

    expect(backups).toEqual([]);
  });

  it('loads state safely when legacy storage read throws', async () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('localStorage disabled');
        },
        setItem: () => {},
        removeItem: () => {}
      },
      configurable: true
    });

    const service = await loadStorageService();
    const result = await service.loadState();

    expect(result.state.projects).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
