import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDeviceLibrary } from './useDeviceLibrary';

describe('useDeviceLibrary', () => {
    const mockSetDeviceLibrary = vi.fn();
    const mockSetStatus = vi.fn();
    const mockT = (key, defaultVal) => defaultVal || key;

    const defaultProps = {
        deviceLibrary: { items: [] },
        setDeviceLibrary: mockSetDeviceLibrary,
        t: mockT,
        setStatus: mockSetStatus
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with provided library items', () => {
        const items = [{ id: '1', name: 'Camera', quantity: 1 }];
        const { result } = renderHook(() =>
            useDeviceLibrary({ ...defaultProps, deviceLibrary: { items } })
        );

        expect(result.current.libraryItems).toEqual(items);
    });

    it('adds a new library item correctly', () => {
        const { result } = renderHook(() => useDeviceLibrary(defaultProps));

        const newItemDraft = {
            name: 'New Lens',
            quantity: 2,
            unit: 'pcs',
            category: 'Lenses',
            details: 'f/2.8'
        };

        act(() => {
            result.current.addLibraryItem(newItemDraft);
        });

        expect(mockSetDeviceLibrary).toHaveBeenCalledTimes(1);

        // Simulate state update
        const updateFn = mockSetDeviceLibrary.mock.calls[0][0];
        const newState = updateFn({ items: [] });

        expect(newState.items).toHaveLength(1);
        expect(newState.items[0]).toMatchObject({
            name: 'New Lens',
            quantity: 2,
            unit: 'pcs',
            category: 'Lenses',
            details: 'f/2.8'
        });
        expect(newState.items[0].id).toBeDefined();
        expect(newState.items[0].dateAdded).toBeDefined();

        expect(mockSetStatus).toHaveBeenCalledWith('Item added to Device Library.');
    });

    it('prevents adding item without a name', () => {
        const { result } = renderHook(() => useDeviceLibrary(defaultProps));

        act(() => {
            result.current.addLibraryItem({ name: '   ', quantity: 1 });
        });

        expect(mockSetDeviceLibrary).not.toHaveBeenCalled();
        expect(mockSetStatus).toHaveBeenCalledWith('Please provide a name for the item.');
    });

    it('updates an existing library item', () => {
        const initialItems = [{ id: '1', name: 'Old Name', quantity: 1 }];
        const { result } = renderHook(() =>
            useDeviceLibrary({ ...defaultProps, deviceLibrary: { items: initialItems } })
        );

        act(() => {
            result.current.updateLibraryItem('1', { name: 'Updated Name', quantity: 5 });
        });

        expect(mockSetDeviceLibrary).toHaveBeenCalledTimes(1);

        const updateFn = mockSetDeviceLibrary.mock.calls[0][0];
        const newState = updateFn({ items: initialItems });

        expect(newState.items[0]).toMatchObject({
            id: '1',
            name: 'Updated Name',
            quantity: 5
        });
        expect(mockSetStatus).toHaveBeenCalledWith('Item updated.');
    });

    it('deletes a library item', () => {
        const initialItems = [
            { id: '1', name: 'Item 1' },
            { id: '2', name: 'Item 2' }
        ];
        const { result } = renderHook(() =>
            useDeviceLibrary({ ...defaultProps, deviceLibrary: { items: initialItems } })
        );

        act(() => {
            result.current.deleteLibraryItem('1');
        });

        expect(mockSetDeviceLibrary).toHaveBeenCalledTimes(1);

        const updateFn = mockSetDeviceLibrary.mock.calls[0][0];
        const newState = updateFn({ items: initialItems });

        expect(newState.items).toHaveLength(1);
        expect(newState.items[0].id).toBe('2');
        expect(mockSetStatus).toHaveBeenCalledWith('Item deleted from library.');
    });
});
