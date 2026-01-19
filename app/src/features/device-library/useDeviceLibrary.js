// @ts-check
import { useCallback } from 'react';
import { createId, STORAGE_MESSAGE_KEYS } from '../../data/normalize.js';

/**
 * @typedef {import('../../types.js').DeviceLibrary} DeviceLibrary
 * @typedef {import('../../types.js').LibraryItem} LibraryItem
 */

/**
 * Hook to manage the Device Library state.
 * @param {Object} params
 * @param {DeviceLibrary} params.deviceLibrary
 * @param {(value: DeviceLibrary | ((prev: DeviceLibrary) => DeviceLibrary)) => void} params.setDeviceLibrary
 * @param {(key: string, fallback?: string) => string} params.t
 * @param {(media: string) => void} params.setStatus
 */
export const useDeviceLibrary = ({ deviceLibrary, setDeviceLibrary, t, setStatus }) => {

    const addLibraryItem = useCallback((draft) => {
        const name = draft.name?.trim();
        if (!name) {
            setStatus(t('status.libraryItemNameRequired', 'Please provide a name for the item.'));
            return;
        }

        const newItem = {
            id: createId(),
            name,
            quantity: Math.max(1, Number(draft.quantity) || 1),
            unit: draft.unit?.trim() || '',
            details: draft.details?.trim() || '',
            category: draft.category?.trim() || '',
            dateAdded: new Date().toISOString()
        };

        setDeviceLibrary(prev => ({
            ...prev,
            items: [newItem, ...(prev.items || [])]
        }));

        setStatus(t('status.libraryItemAdded', 'Item added to Device Library.'));
    }, [setDeviceLibrary, setStatus, t]);

    const updateLibraryItem = useCallback((id, updates) => {
        setDeviceLibrary(prev => ({
            ...prev,
            items: (prev.items || []).map(item => {
                if (item.id !== id) return item;
                return { ...item, ...updates };
            })
        }));
        setStatus(t('status.libraryItemUpdated', 'Item updated.'));
    }, [setDeviceLibrary, setStatus, t]);

    const deleteLibraryItem = useCallback((id) => {
        setDeviceLibrary(prev => ({
            ...prev,
            items: (prev.items || []).filter(item => item.id !== id)
        }));
        setStatus(t('status.libraryItemDeleted', 'Item deleted from library.'));
    }, [setDeviceLibrary, setStatus, t]);

    return {
        libraryItems: deviceLibrary?.items || [],
        addLibraryItem,
        updateLibraryItem,
        deleteLibraryItem
    };
};
