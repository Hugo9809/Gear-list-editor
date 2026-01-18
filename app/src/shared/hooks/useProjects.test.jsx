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

    it('should delete a project', () => {
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
            result.current.deleteProject(projectId);
        });

        expect(result.current.projects).toHaveLength(0);
    });
});
