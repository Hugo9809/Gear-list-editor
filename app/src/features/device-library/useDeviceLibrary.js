// @ts-check
import { useCallback } from 'react';
import { createId, normalizeLibraryItems, safeParse } from '../../data/normalize.js';

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
  const libraryItems = deviceLibrary?.items || [];

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

  const exportLibrary = useCallback(() => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      deviceLibrary: {
        items: libraryItems
      }
    };
    const json = JSON.stringify(payload, null, 2);
    const fileName = `gear-library-${new Date().toISOString().slice(0, 10)}.json`;
    return { json, fileName, payload };
  }, [libraryItems]);

  const importLibrary = useCallback(
    (rawText) => {
      const parsed = safeParse(rawText);
      if (!parsed) {
        setStatus(
          t('status.libraryImportInvalid', 'Import failed. This file is not a device library backup.')
        );
        return { added: 0, total: 0 };
      }

      const sourceItems =
        (Array.isArray(parsed?.deviceLibrary?.items) && parsed.deviceLibrary.items) ||
        (Array.isArray(parsed?.items) && parsed.items) ||
        (Array.isArray(parsed) && parsed) ||
        null;

      if (!sourceItems) {
        setStatus(
          t('status.libraryImportInvalid', 'Import failed. This file is not a device library backup.')
        );
        return { added: 0, total: 0 };
      }

      const normalized = normalizeLibraryItems(sourceItems);
      if (normalized.length === 0) {
        setStatus(t('status.libraryImportEmpty', 'No device library items were found in that file.'));
        return { added: 0, total: 0 };
      }

      let addedCount = 0;
      setDeviceLibrary((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : { items: [] };
        const existingItems = Array.isArray(safePrev.items) ? safePrev.items : [];
        const existingNames = new Set(
          existingItems
            .map((item) => (typeof item?.name === 'string' ? item.name.trim().toLowerCase() : null))
            .filter(Boolean)
        );
        const mergedItems = [...existingItems];
        normalized.forEach((item) => {
          const key = item.name?.trim().toLowerCase();
          if (!key || existingNames.has(key)) {
            return;
          }
          existingNames.add(key);
          mergedItems.push(item);
          addedCount += 1;
        });

        if (addedCount === 0) {
          return safePrev;
        }
        return {
          ...safePrev,
          items: mergedItems
        };
      });

      if (addedCount === 0) {
        setStatus(t('status.libraryImportNoChanges', 'No new items were added to the library.'));
      } else {
        setStatus(
          t('status.libraryImported', '{count} items added to the device library.', {
            count: addedCount
          })
        );
      }

      return { added: addedCount, total: normalized.length };
    },
    [setDeviceLibrary, setStatus, t]
  );

  const resetLibrary = useCallback(() => {
    setDeviceLibrary((prev) => ({
      ...(prev && typeof prev === 'object' ? prev : {}),
      items: []
    }));
    setStatus(t('status.libraryReset', 'Device library reset to factory settings.'));
  }, [setDeviceLibrary, setStatus, t]);

  return {
    libraryItems,
    addLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    exportLibrary,
    importLibrary,
    resetLibrary
  };
};
