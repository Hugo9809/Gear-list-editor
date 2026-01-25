import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjects } from './useProjects';

// Mock dependencies
const mockT = (key, defaultText) => defaultText || key;
const mockSetStatus = vi.fn();

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty projects', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));
    expect(result.current.projects).toEqual([]);
  });

  it('should add a project and return its ID', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    let newProjectId;
    act(() => {
      // simulate event preventDefault
      const event = { preventDefault: vi.fn() };
      newProjectId = result.current.addProject(event);
    });

    expect(newProjectId).toBeTruthy();
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].id).toBe(newProjectId);
    expect(result.current.projects[0].name).toBe('Test Project');
  });

  it('should update a project field', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    act(() => {
      result.current.updateProjectField(projectId, 'client', 'Acme Corp');
    });

    expect(result.current.projects[0].client).toBe('Acme Corp');
  });

  it('should add a category to a project', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    act(() => {
      // First we need to set the category name state
      result.current.setNewCategoryName('Camera');
    });

    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    expect(result.current.projects[0].categories).toHaveLength(1);
    expect(result.current.projects[0].categories[0].name).toBe('Camera');
    expect(result.current.newCategoryName).toBe(''); // Should reset
  });

  it('should permanently delete a project', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    expect(result.current.projects).toHaveLength(1);

    act(() => {
      result.current.deleteProjectPermanently(projectId);
    });

    expect(result.current.projects).toHaveLength(0);
  });

  it('should archive and restore a project', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    expect(result.current.projects[0].archived).toBe(false);

    act(() => {
      result.current.archiveProject(projectId);
    });

    expect(result.current.projects[0].archived).toBe(true);

    act(() => {
      result.current.restoreProject(projectId);
    });

    expect(result.current.projects[0].archived).toBe(false);
  });

  it('should move a category up', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    // Add two categories
    act(() => {
      result.current.setNewCategoryName('Camera');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });
    act(() => {
      result.current.setNewCategoryName('Lighting');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    const lightingId = result.current.projects[0].categories[1].id;

    act(() => {
      result.current.moveCategoryUp(projectId, lightingId);
    });

    expect(result.current.projects[0].categories[0].name).toBe('Lighting');
    expect(result.current.projects[0].categories[1].name).toBe('Camera');
  });

  it('should not move the first category up', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    act(() => {
      result.current.setNewCategoryName('Camera');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    const cameraId = result.current.projects[0].categories[0].id;

    act(() => {
      result.current.moveCategoryUp(projectId, cameraId);
    });

    // Should remain in same position
    expect(result.current.projects[0].categories[0].name).toBe('Camera');
  });

  it('should move a category down', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    // Add two categories
    act(() => {
      result.current.setNewCategoryName('Camera');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });
    act(() => {
      result.current.setNewCategoryName('Lighting');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    const cameraId = result.current.projects[0].categories[0].id;

    act(() => {
      result.current.moveCategoryDown(projectId, cameraId);
    });

    expect(result.current.projects[0].categories[0].name).toBe('Lighting');
    expect(result.current.projects[0].categories[1].name).toBe('Camera');
  });

  it('should move an item up within a category', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    // Add a category to host items
    act(() => {
      result.current.setNewCategoryName('Camera');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    const categoryId = result.current.projects[0].categories[0].id;

    // Add two items to the category
    act(() => {
      result.current.updateDraftItem(categoryId, 'name', 'First Item');
      result.current.updateDraftItem(categoryId, 'quantity', 1);
      result.current.updateDraftItem(categoryId, 'details', '');
      result.current.addItemToCategory(projectId, { preventDefault: vi.fn() }, categoryId);
    });

    // Second item
    act(() => {
      result.current.updateDraftItem(categoryId, 'name', 'Second Item');
      result.current.updateDraftItem(categoryId, 'quantity', 1);
      result.current.updateDraftItem(categoryId, 'details', '');
      result.current.addItemToCategory(projectId, { preventDefault: vi.fn() }, categoryId);
    });

    const secondItemId = result.current.projects[0].categories[0].items[1].id;

    act(() => {
      result.current.moveItemUp(projectId, categoryId, secondItemId);
    });

    expect(result.current.projects[0].categories[0].items[0].name).toBe('Second Item');
    expect(result.current.projects[0].categories[0].items[1].name).toBe('First Item');
  });

  it('should move an item down within a category', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project 2');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    // Add a category to host items
    act(() => {
      result.current.setNewCategoryName('Camera');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    const categoryId = result.current.projects[0].categories[0].id;

    // First item
    act(() => {
      result.current.updateDraftItem(categoryId, 'name', 'Alpha');
      result.current.updateDraftItem(categoryId, 'quantity', 1);
      result.current.updateDraftItem(categoryId, 'details', '');
      result.current.addItemToCategory(projectId, { preventDefault: vi.fn() }, categoryId);
    });

    // Second item
    act(() => {
      result.current.updateDraftItem(categoryId, 'name', 'Beta');
      result.current.updateDraftItem(categoryId, 'quantity', 1);
      result.current.updateDraftItem(categoryId, 'details', '');
      result.current.addItemToCategory(projectId, { preventDefault: vi.fn() }, categoryId);
    });

    const firstItemId = result.current.projects[0].categories[0].items[0].id;
    const secondItemId = result.current.projects[0].categories[0].items[1].id;

    // Move first item down
    act(() => {
      result.current.moveItemDown(projectId, categoryId, firstItemId);
    });

    expect(result.current.projects[0].categories[0].items[0].name).toBe('Beta');
    expect(result.current.projects[0].categories[0].items[1].name).toBe('Alpha');
  });

  it('should not move the last category down', () => {
    const { result } = renderHook(() => useProjects({ t: mockT, setStatus: mockSetStatus }));

    let projectId;
    act(() => {
      result.current.updateProjectDraftField('name', 'Test Project');
    });

    act(() => {
      projectId = result.current.addProject({ preventDefault: vi.fn() });
    });

    act(() => {
      result.current.setNewCategoryName('Camera');
    });
    act(() => {
      result.current.addCategory(projectId, { preventDefault: vi.fn() });
    });

    const cameraId = result.current.projects[0].categories[0].id;

    act(() => {
      result.current.moveCategoryDown(projectId, cameraId);
    });

    // Should remain in same position (only one category)
    expect(result.current.projects[0].categories[0].name).toBe('Camera');
  });

  it('should include device library items in suggestions', () => {
    const mockDeviceLibrary = {
      items: [
        { id: '1', name: 'Arri Alexa 35', category: 'Camera' },
        { id: '2', name: 'Summicon Lenses', category: 'Lenses' }
      ]
    };

    const { result } = renderHook(() =>
      useProjects({ t: mockT, setStatus: mockSetStatus, deviceLibrary: mockDeviceLibrary })
    );

    expect(result.current.itemSuggestions).toHaveLength(2);
    expect(result.current.itemSuggestions[0].name).toBe('Arri Alexa 35');
    expect(result.current.itemSuggestions[1].name).toBe('Summicon Lenses');
  });
});
