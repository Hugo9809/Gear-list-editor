// @ts-check
/**
 * @fileoverview React hook for managing project state, item/category edits, and history.
 */

/** @typedef {import('../../types.js').Project} Project */
/** @typedef {import('../../types.js').Category} Category */
/** @typedef {import('../../types.js').Item} Item */
/** @typedef {import('../../types.js').History} History */
/** @typedef {import('../../types.js').HistoryEntry} HistoryEntry */
/** @typedef {import('../../types.js').ItemDraft} ItemDraft */
/** @typedef {import('../../types.js').ProjectDraft} ProjectDraft */

import { useCallback, useMemo, useRef, useState } from 'react';
import { createId, STORAGE_MESSAGE_KEYS } from '../../data/storage.js';
import { createEmptyShootSchedule, normalizeShootSchedule } from '../utils/shootSchedule.js';
import { useUndo } from './useUndo.js';

const emptyItemDraft = {
  name: '',
  quantity: 1,
  details: ''
};

const createEmptyProjectDraft = () => ({
  name: '',
  client: '',
  shootSchedule: createEmptyShootSchedule(),
  location: '',
  contact: '',
  crew: [],
  // PDF-related/export metadata fields
  resolution: '',
  aspectRatio: '',
  codec: '',
  framerate: ''
});

const DEFAULT_NAME_KEYS = new Set(Object.values(STORAGE_MESSAGE_KEYS.defaults));

/**
 * Manage project state, item/category edits, and history suggestions.
 * Assumes persistence is handled by a higher-level storage hook.
 */
export const useProjects = ({ t, setStatus, deviceLibrary, setDeviceLibrary }) => {
  const {
    state: projects,
    setState: setProjects,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndo(/** @type {Project[]} */([]));
  // @ts-ignore - allow flexible History typing in JS + TS-checking
  const [history, setHistory] = useState(/** @type {History} */({ items: [], categories: [] }));
  // activeProjectId and activeProject logic removed in favor of URL state
  const [projectDraft, setProjectDraft] = useState(/** @type {ProjectDraft} */(createEmptyProjectDraft()));
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDrafts, setItemDrafts] = useState(/** @type {Record<string, ItemDraft>} */({}));
  const itemDraftsRef = useRef(/** @type {Record<string, ItemDraft>} */({}));

  const setItemDraftsWithRef = useCallback((updater) => {
    const prev = itemDraftsRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    itemDraftsRef.current = next;
    setItemDrafts(next);
  }, []);

  const itemSuggestions = useMemo(() => {
    const libraryItems = deviceLibrary?.items || [];
    const historyItems = history.items || [];

    // Combine items, prioritizing library items if names match (or just merging uniques)
    const combined = [...libraryItems, ...historyItems];

    // Deduplicate by name
    const seenNames = new Set();
    const uniqueSuggestions = [];

    for (const item of combined) {
      const normalizedName = item.name?.trim();
      if (normalizedName && !DEFAULT_NAME_KEYS.has(normalizedName) && !seenNames.has(normalizedName.toLowerCase())) {
        seenNames.add(normalizedName.toLowerCase());
        uniqueSuggestions.push(item);
      }
    }

    return uniqueSuggestions;
  }, [history.items, deviceLibrary]);

  /**
   * Retrieves or initializes a draft for a specific category.
   * @param {string} categoryId - The ID of the category.
   * @returns {ItemDraft} The current draft state.
   */
  const getItemDraft = useCallback(
    (categoryId) => itemDrafts[categoryId] || emptyItemDraft,
    [itemDrafts]
  );

  /**
   * Adds an item to the history for future autocomplete suggestions.
   * Ignores empty or default names.
   * @param {Item} item - The item to remember.
   */
  const normalizeText = useCallback((value) => (typeof value === 'string' ? value.trim() : ''), []);
  const normalizeCrewDraft = useCallback((crew) => {
    if (!Array.isArray(crew)) {
      return [];
    }
    return crew
      .map((entry) => ({
        id: typeof entry?.id === 'string' && entry.id ? entry.id : createId(),
        name: normalizeText(entry?.name),
        role: normalizeText(entry?.role),
        phone: normalizeText(entry?.phone),
        email: normalizeText(entry?.email)
      }))
      .filter((entry) => entry.name || entry.role || entry.phone || entry.email);
  }, [normalizeText]);

  const normalizeCategory = useCallback(
    (value) => {
      const trimmed = normalizeText(value);
      return trimmed && !DEFAULT_NAME_KEYS.has(trimmed) ? trimmed : '';
    },
    [normalizeText]
  );

  const rememberItem = useCallback(
    (item, categoryName = '') => {
      const name = normalizeText(item?.name);
      if (!name || DEFAULT_NAME_KEYS.has(name)) {
        return;
      }

      setHistory((prev) => {
        const nextItems = [...(prev.items || [])];
        const index = nextItems.findIndex((entry) => entry.name.toLowerCase() === name.toLowerCase());
        const existing = index >= 0 ? nextItems[index] : null;
        const updated = {
          name,
          details: normalizeText(item?.details) || existing?.details || '',
          lastUsed: new Date().toISOString()
        };
        if (index >= 0) {
          nextItems[index] = { ...nextItems[index], ...updated };
        } else {
          nextItems.push(updated);
        }
        return {
          ...prev,
          items: nextItems
        };
      });

      if (typeof setDeviceLibrary !== 'function') {
        return;
      }

      const details = normalizeText(item?.details);
      const quantity = Math.max(1, Number(item?.quantity) || 1);
      const category = normalizeCategory(categoryName || item?.category);

      setDeviceLibrary((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : { items: [] };
        const items = Array.isArray(safePrev.items) ? safePrev.items : [];
        const existingIndex = items.findIndex(
          (entry) => normalizeText(entry?.name).toLowerCase() === name.toLowerCase()
        );
        if (existingIndex >= 0) {
          const existing = items[existingIndex] || {};
          const existingDetails = normalizeText(existing.details);
          const existingCategory = normalizeText(existing.category);
          const hasValidQuantity =
            Number.isFinite(Number(existing.quantity)) && Number(existing.quantity) > 0;
          const { unit: _ignoredUnit, ...rest } = existing;
          const merged = {
            ...rest,
            name,
            details: existingDetails || details,
            category: existingCategory || category,
            quantity: hasValidQuantity ? Number(existing.quantity) : quantity
          };
          if (
            existing.name === merged.name &&
            existing.details === merged.details &&
            existing.category === merged.category &&
            Number(existing.quantity) === merged.quantity
          ) {
            return safePrev;
          }
          const nextItems = [...items];
          nextItems[existingIndex] = merged;
          return {
            ...safePrev,
            items: nextItems
          };
        }

        return {
          ...safePrev,
          items: [
            {
              id: createId(),
              name,
              quantity,
              details,
              category,
              dateAdded: new Date().toISOString()
            },
            ...items
          ]
        };
      });
    },
    [normalizeCategory, normalizeText, setDeviceLibrary, setHistory]
  );

  /**
   * Adds a category name to history.
   * @param {string} name - The category name.
   */
  const rememberCategory = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed || DEFAULT_NAME_KEYS.has(trimmed)) {
      return;
    }
    setHistory((prev) => {
      const categories = new Set(prev.categories || []);
      categories.add(trimmed);
      return {
        ...prev,
        categories: Array.from(categories)
      };
    });
  }, []);

  /**
   * Helper to update a project by ID.
   * @param {string} projectId - Target project ID.
   * @param {(project: Project) => Project} updater - Update function.
   */
  const updateProject = useCallback((projectId, updater) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? updater(project) : project))
    );
  }, []);

  /**
   * Helper to update a category within a project.
   * @param {string} projectId - Target project ID.
   * @param {string} categoryId - Target category ID.
   * @param {(category: Category) => Category} updater - Update function.
   */
  const updateCategory = useCallback(
    (projectId, categoryId, updater) => {
      updateProject(projectId, (project) => ({
        ...project,
        categories: project.categories.map((category) =>
          category.id === categoryId ? updater(category) : category
        )
      }));
    },
    [updateProject]
  );

  /**
   * Helper to update an item within a category.
   * @param {string} projectId - Target project ID.
   * @param {string} categoryId - Target category ID.
   * @param {string} itemId - Target item ID.
   * @param {(item: Item) => Item} updater - Update function.
   */
  const updateItem = useCallback(
    (projectId, categoryId, itemId, updater) => {
      updateCategory(projectId, categoryId, (category) => ({
        ...category,
        items: category.items.map((item) => (item.id === itemId ? updater(item) : item))
      }));
    },
    [updateCategory]
  );

  const updateProjectDraftField = useCallback((field, value) => {
    setProjectDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getCategoryName = useCallback(
    (projectId, categoryId) => {
      const project = projects.find((entry) => entry.id === projectId);
      const category = project?.categories.find((entry) => entry.id === categoryId);
      return category?.name || '';
    },
    [projects]
  );

  const addProject = useCallback(
    (event) => {
      event.preventDefault();
      const name = projectDraft.name.trim();
      if (!name) {
        setStatus(t('status.projectNameRequired', 'Please name the project before creating it.'));
        return null; // Return null instead of false
      }
      const newProject = {
        id: createId(),
        name,
        client: projectDraft.client.trim(),
        shootSchedule: normalizeShootSchedule(projectDraft.shootSchedule),
        location: projectDraft.location.trim(),
        contact: projectDraft.contact.trim(),
        crew: normalizeCrewDraft(projectDraft.crew),
        // PDF related fields available on the project for later export
        resolution: projectDraft.resolution?.trim(),
        aspectRatio: projectDraft.aspectRatio?.trim(),
        codec: projectDraft.codec?.trim(),
        framerate: projectDraft.framerate ? Number(projectDraft.framerate) : undefined,
        notes: '',
        archived: false,
        categories: []
      };
      setProjects((prev) => [newProject, ...prev]);
      setProjectDraft(createEmptyProjectDraft());
      setStatus(t('status.projectCreated', 'New project created and protected by autosave.'));
      return newProject.id;
    },
    [normalizeCrewDraft, projectDraft, setStatus, t]
  );

  /**
   * Creates a new project from a template.
   * @param {import('../../types.js').Template} template - Template to convert into a project.
   * @param {{ name?: string }} [overrides] - Optional name override.
   * @returns {string|null} New project ID, or null when unavailable.
   */
  const createProjectFromTemplate = useCallback(
    (template, overrides = {}) => {
      if (!template) {
        return null;
      }
      const baseDraft = createEmptyProjectDraft();
      const candidateName = normalizeText(overrides?.name ?? template.name);
      const resolvedName =
        candidateName && !DEFAULT_NAME_KEYS.has(candidateName)
          ? candidateName
          : STORAGE_MESSAGE_KEYS.defaults.project;
      const categories = Array.isArray(template.categories)
        ? template.categories.map((category) => ({
          ...category,
          id: createId(),
          items: Array.isArray(category.items)
            ? category.items.map((item) => ({
              ...item,
              id: createId()
            }))
            : []
        }))
        : [];
      const newProject = {
        id: createId(),
        name: resolvedName,
        client: baseDraft.client,
        shootSchedule: baseDraft.shootSchedule,
        location: baseDraft.location,
        contact: baseDraft.contact,
        crew: baseDraft.crew,
        resolution: baseDraft.resolution,
        aspectRatio: baseDraft.aspectRatio,
        codec: baseDraft.codec,
        framerate: baseDraft.framerate ? Number(baseDraft.framerate) : undefined,
        notes: typeof template.notes === 'string' ? template.notes : '',
        archived: false,
        categories
      };
      setProjects((prev) => [newProject, ...prev]);
      categories.forEach((category) => {
        rememberCategory(category.name);
        category.items.forEach((item) => rememberItem(item, category.name));
      });
      return newProject.id;
    },
    [normalizeText, rememberCategory, rememberItem, setProjects]
  );

  const archiveProject = useCallback(
    (projectId) => {
      updateProject(projectId, (project) => ({
        ...project,
        archived: true
      }));
      setStatus(t('status.projectArchived', 'Project archived. You can find it in Archived Projects.'));
    },
    [setStatus, t, updateProject]
  );

  const restoreProject = useCallback(
    (projectId) => {
      updateProject(projectId, (project) => ({
        ...project,
        archived: false
      }));
      setStatus(t('status.projectRestored', 'Project restored to dashboard.'));
    },
    [setStatus, t, updateProject]
  );

  const deleteProjectPermanently = useCallback(
    (projectId) => {
      setProjects((prev) => {
        const remaining = prev.filter((project) => project.id !== projectId);
        return remaining;
      });
      setStatus(t('status.projectDeleted', 'Project permanently deleted.'));
    },
    [setStatus, t]
  );

  const addCategory = useCallback(
    (projectId, event) => {
      event.preventDefault();
      // Need to find activeProject to check safely? Or just rely on updateProject not finding it?
      // For UX checks, we assume projectId exists if we are here.
      const name = newCategoryName.trim();
      if (!name) {
        setStatus(t('status.categoryNameRequired', 'Please name the category before adding it.'));
        return;
      }
      updateProject(projectId, (project) => ({
        ...project,
        categories: [
          ...project.categories,
          {
            id: createId(),
            name,
            notes: '',
            items: []
          }
        ]
      }));
      rememberCategory(name);
      setNewCategoryName('');
      setStatus(t('status.categoryAdded', 'Category added.'));
    },
    [newCategoryName, rememberCategory, setStatus, t, updateProject]
  );

  const addItemToCategory = useCallback(
    (projectId, event, categoryId) => {
      event.preventDefault();
      const draft = itemDraftsRef.current[categoryId] || emptyItemDraft;
      const name = draft.name.trim();
      if (!name) {
        setStatus(t('status.itemNameRequired', 'Please provide an item name before adding.'));
        return;
      }
      const categoryName = getCategoryName(projectId, categoryId);
      const newItem = {
        id: createId(),
        name,
        quantity: Math.max(1, Number(draft.quantity) || 1),
        details: draft.details.trim(),
        status: 'needed'
      };
      updateCategory(projectId, categoryId, (category) => ({
        ...category,
        items: [...category.items, newItem]
      }));
      rememberItem(newItem, categoryName);
      setItemDraftsWithRef((prev) => ({
        ...prev,
        [categoryId]: { ...emptyItemDraft }
      }));
      setStatus(t('status.itemAdded', 'Item added. Autosave will secure it immediately.'));
    },
    [getCategoryName, rememberItem, setItemDraftsWithRef, setStatus, t, updateCategory]
  );

  const moveCategoryUp = useCallback(
    (projectId, categoryId) => {
      updateProject(projectId, (project) => {
        const categories = [...project.categories];
        const index = categories.findIndex((c) => c.id === categoryId);
        if (index <= 0) return project; // Already first or not found
        [categories[index - 1], categories[index]] = [categories[index], categories[index - 1]];
        return { ...project, categories };
      });
      setStatus(t('status.categoryMoved', 'Category moved.'));
    },
    [setStatus, t, updateProject]
  );

  const moveCategoryDown = useCallback(
    (projectId, categoryId) => {
      updateProject(projectId, (project) => {
        const categories = [...project.categories];
        const index = categories.findIndex((c) => c.id === categoryId);
        if (index < 0 || index >= categories.length - 1) return project; // Already last or not found
        [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]];
        return { ...project, categories };
      });
      setStatus(t('status.categoryMoved', 'Category moved.'));
    },
    [setStatus, t, updateProject]
  );

  /**
   * Reorders categories within a project using Drag and Drop.
   * @param {string} projectId
   * @param {string[]} newOrderIds - Array of category IDs in the new order.
   */
  const reorderCategories = useCallback(
    (projectId, newOrderIds) => {
      updateProject(projectId, (project) => {
        const categoryMap = new Map(project.categories.map((c) => [c.id, c]));
        const newCategories = newOrderIds
          .map((id) => categoryMap.get(id))
          .filter(Boolean);

        // Ensure no categories created during the drag are lost (edge case safety)
        if (newCategories.length !== project.categories.length) {
          return project;
        }

        return {
          ...project,
          categories: newCategories
        };
      });
      // No toast needed for drag operations usually, or minimal one
    },
    [updateProject]
  );

  /**
   * Moves an item between categories or reorders within the same category.
   * @param {string} projectId
   * @param {string} activeId - ID of the item being dragged.
   * @param {string} activeCategoryId - Source category ID.
   * @param {string} overCategoryId - Destination category ID (can be same).
   * @param {number} newIndex - New index in the destination category.
   */
  const moveItem = useCallback(
    (projectId, activeId, activeCategoryId, overCategoryId, newIndex) => {
      updateProject(projectId, (project) => {
        const sourceCategory = project.categories.find((c) => c.id === activeCategoryId);
        const destCategory = project.categories.find((c) => c.id === overCategoryId);

        if (!sourceCategory || !destCategory) return project;

        const itemToMove = sourceCategory.items.find((i) => i.id === activeId);
        if (!itemToMove) return project;

        // If same category, just reorder
        if (activeCategoryId === overCategoryId) {
          const newItems = [...sourceCategory.items];
          const oldIndex = newItems.findIndex((i) => i.id === activeId);
          newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, itemToMove);

          return {
            ...project,
            categories: project.categories.map((c) =>
              c.id === activeCategoryId ? { ...c, items: newItems } : c
            )
          };
        }

        // Moving to different category
        // Remove from source
        const newSourceItems = sourceCategory.items.filter((i) => i.id !== activeId);

        // Add to destination
        const newDestItems = [...destCategory.items];
        newDestItems.splice(newIndex, 0, itemToMove);

        return {
          ...project,
          categories: project.categories.map((c) => {
            if (c.id === activeCategoryId) return { ...c, items: newSourceItems };
            if (c.id === overCategoryId) return { ...c, items: newDestItems };
            return c;
          })
        };
      });
    },
    [updateProject]
  );

  const moveItemUp = useCallback(
    (projectId, categoryId, itemId) => {
      updateCategory(projectId, categoryId, (category) => {
        const items = [...category.items];
        const index = items.findIndex((i) => i.id === itemId);
        if (index <= 0) return category; // Already first or not found
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        return { ...category, items };
      });
      // setStatus(t('status.itemMoved', 'Item moved.')); // Less noise
    },
    [t, updateCategory]
  );

  const moveItemDown = useCallback(
    (projectId, categoryId, itemId) => {
      updateCategory(projectId, categoryId, (category) => {
        const items = [...category.items];
        const index = items.findIndex((i) => i.id === itemId);
        if (index < 0 || index >= items.length - 1) return category;
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        return { ...category, items };
      });
      // setStatus(t('status.itemMoved', 'Item moved.'));
    },
    [t, updateCategory]
  );

  const removeCategory = useCallback(
    (projectId, categoryId) => {
      updateProject(projectId, (project) => ({
        ...project,
        categories: project.categories.filter((category) => category.id !== categoryId)
      }));
      setStatus(t('status.categoryRemoved', 'Category removed.'));
    },
    [setStatus, t, updateProject]
  );

  const removeItem = useCallback(
    (projectId, categoryId, itemId) => {
      updateCategory(projectId, categoryId, (category) => ({
        ...category,
        items: category.items.filter((item) => item.id !== itemId)
      }));
      setStatus(t('status.itemRemoved', 'Item removed. Backups remain available.'));
    },
    [setStatus, t, updateCategory]
  );

  const updateItemField = useCallback(
    (projectId, categoryId, itemId, field, value) => {
      const categoryName = getCategoryName(projectId, categoryId);
      updateItem(projectId, categoryId, itemId, (item) => {
        const next = {
          ...item,
          [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : value
        };
        rememberItem(next, categoryName);
        return next;
      });
      setStatus(t('status.changesQueued', 'Changes queued for autosave.'));
    },
    [getCategoryName, rememberItem, setStatus, t, updateItem]
  );

  const updateCategoryField = useCallback(
    (projectId, categoryId, field, value) => {
      updateCategory(projectId, categoryId, (category) => ({
        ...category,
        [field]: value
      }));
      if (field === 'name') {
        rememberCategory(value);
      }
      setStatus(t('status.categoryUpdated', 'Category updated.'));
    },
    [rememberCategory, setStatus, t, updateCategory]
  );

  const updateProjectField = useCallback(
    (projectId, field, value) => {
      updateProject(projectId, (project) => ({
        ...project,
        [field]: value
      }));
      setStatus(t('status.projectDetailsUpdated', 'Project details updated.'));
    },
    [setStatus, t, updateProject]
  );

  const updateProjectNotes = useCallback(
    (projectId, value) => {
      updateProject(projectId, (project) => ({
        ...project,
        notes: value
      }));
      setStatus(t('status.projectNotesSaved', 'Project notes saved for autosave.'));
    },
    [setStatus, t, updateProject]
  );

  const updateDraftItem = useCallback(
    (categoryId, field, value) => {
      setItemDraftsWithRef((prev) => ({
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] || emptyItemDraft),
          [field]: value
        }
      }));
    },
    [setItemDraftsWithRef]
  );

  const applySuggestionToDraft = useCallback(
    (categoryId, suggestion) => {
      setItemDraftsWithRef((prev) => ({
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] || emptyItemDraft),
          name: suggestion.name,
          details: suggestion.details || ''
        }
      }));
    },
    [setItemDraftsWithRef]
  );

  const applySuggestionToItem = useCallback(
    (projectId, categoryId, itemId, suggestion) => {
      const categoryName = getCategoryName(projectId, categoryId);
      const updated = {
        name: suggestion.name,
        details: suggestion.details || ''
      };
      updateItem(projectId, categoryId, itemId, (item) => ({
        ...item,
        ...updated
      }));
      rememberItem(updated, categoryName);
      setStatus(t('status.suggestionApplied', 'Suggestion applied and ready for autosave.'));
    },
    [getCategoryName, rememberItem, setStatus, t, updateItem]
  );

  return {
    projects,
    setProjects,
    history,
    setHistory,
    projectDraft,
    updateProjectDraftField,
    addProject,
    createProjectFromTemplate,
    archiveProject,
    restoreProject,
    deleteProjectPermanently,
    newCategoryName,
    setNewCategoryName,
    addCategory,
    moveCategoryUp,
    moveCategoryDown,
    moveItemUp,
    moveItemDown,
    itemDrafts,
    getItemDraft,
    updateDraftItem,
    addItemToCategory,
    removeCategory,
    removeItem,
    updateItemField,
    updateCategoryField,
    updateProjectField,
    updateProjectNotes,
    applySuggestionToDraft,
    applySuggestionToItem,
    updateProject,
    rememberItem,
    itemSuggestions,
    deleteProject: deleteProjectPermanently,
    reorderCategories,
    moveItem,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
