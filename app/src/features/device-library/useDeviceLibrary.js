// @ts-check
import { useCallback } from 'react';
import { createId } from '../../data/normalize.js';

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
  const normalizeDraft = (draft, existing = null) => {
    const name = typeof draft?.name === 'string' ? draft.name.trim() : existing?.name || '';
    if (!name) {
      return { error: t('status.libraryItemNameRequired', 'Please provide a name for the item.') };
    }
    const quantityCandidate = draft?.quantity ?? existing?.quantity ?? 1;
    const quantity = Math.max(1, Number(quantityCandidate) || 1);
    return {
      name,
      quantity,
      unit: typeof draft?.unit === 'string' ? draft.unit.trim() : existing?.unit || '',
      details: typeof draft?.details === 'string' ? draft.details.trim() : existing?.details || '',
      category: typeof draft?.category === 'string' ? draft.category.trim() : existing?.category || ''
    };
  };

  const addLibraryItem = useCallback(
    (draft) => {
      const normalized = normalizeDraft(draft);
      if (normalized.error) {
        setStatus(normalized.error);
        return;
      }

      const newItem = {
        id: createId(),
        ...normalized,
        dateAdded: new Date().toISOString()
      };

      setDeviceLibrary((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : { items: [] };
        return {
          ...safePrev,
          items: [newItem, ...(safePrev.items || [])]
        };
      });

      setStatus(t('status.libraryItemAdded', 'Item added to Device Library.'));
    },
    [setDeviceLibrary, setStatus, t]
  );

  const updateLibraryItem = useCallback(
    (id, updates) => {
      let hasError = false;
      setDeviceLibrary((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : { items: [] };
        const items = (safePrev.items || []).map((item) => {
          if (item.id !== id) return item;
          const normalized = normalizeDraft(updates, item);
          if (normalized.error) {
            hasError = true;
            return item;
          }
          return { ...item, ...normalized };
        });
        return {
          ...safePrev,
          items
        };
      });

      if (hasError) {
        setStatus(t('status.libraryItemNameRequired', 'Please provide a name for the item.'));
        return;
      }

      setStatus(t('status.libraryItemUpdated', 'Item updated.'));
    },
    [setDeviceLibrary, setStatus, t]
  );

  const deleteLibraryItem = useCallback(
    (id) => {
      setDeviceLibrary((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : { items: [] };
        return {
          ...safePrev,
          items: (safePrev.items || []).filter((item) => item.id !== id)
        };
      });
      setStatus(t('status.libraryItemDeleted', 'Item deleted from library.'));
    },
    [setDeviceLibrary, setStatus, t]
  );

  return {
    libraryItems: deviceLibrary?.items || [],
    addLibraryItem,
    updateLibraryItem,
    deleteLibraryItem
  };
};
