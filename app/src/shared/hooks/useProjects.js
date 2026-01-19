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

import { useCallback, useMemo, useState } from 'react';
import { createId, STORAGE_MESSAGE_KEYS } from '../../data/storage.js';

const emptyItemDraft = {
  name: '',
  quantity: 1,
  unit: '',
  details: ''
};

const emptyProjectDraft = {
  name: '',
  client: '',
  shootDate: '',
  location: '',
  contact: ''
};

const DEFAULT_NAME_KEYS = new Set(Object.values(STORAGE_MESSAGE_KEYS.defaults));

/**
 * Manage project state, item/category edits, and history suggestions.
 * Assumes persistence is handled by a higher-level storage hook.
 */
export const useProjects = ({ t, setStatus }) => {
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState({ items: [], categories: [] });
  // activeProjectId and activeProject logic removed in favor of URL state
  const [projectDraft, setProjectDraft] = useState(emptyProjectDraft);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDrafts, setItemDrafts] = useState({});

  const itemSuggestions = useMemo(
    () => (history.items || []).filter((entry) => !DEFAULT_NAME_KEYS.has(entry.name)),
    [history.items]
  );

  const getItemDraft = useCallback(
    (categoryId) => itemDrafts[categoryId] || emptyItemDraft,
    [itemDrafts]
  );

  const rememberItem = useCallback((item) => {
    const name = item.name.trim();
    if (!name || DEFAULT_NAME_KEYS.has(name)) {
      return;
    }
    setHistory((prev) => {
      const nextItems = [...(prev.items || [])];
      const index = nextItems.findIndex((entry) => entry.name.toLowerCase() === name.toLowerCase());
      const existing = index >= 0 ? nextItems[index] : null;
      const updated = {
        name,
        unit: item.unit || existing?.unit || '',
        details: item.details || existing?.details || '',
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
  }, []);

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

  const updateProject = useCallback((projectId, updater) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? updater(project) : project))
    );
  }, []);

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
        shootDate: projectDraft.shootDate.trim(),
        location: projectDraft.location.trim(),
        contact: projectDraft.contact.trim(),
        notes: '',
        categories: []
      };
      setProjects((prev) => [newProject, ...prev]);
      setProjectDraft(emptyProjectDraft);
      setStatus(t('status.projectCreated', 'New project created and protected by autosave.'));
      return newProject.id;
    },
    [projectDraft, setStatus, t]
  );

  const deleteProject = useCallback(
    (projectId) => {
      setProjects((prev) => {
        const remaining = prev.filter((project) => project.id !== projectId);
        return remaining;
      });
      setStatus(t('status.projectArchived', 'Project archived. Backups remain intact.'));
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
      const draft = itemDrafts[categoryId] || emptyItemDraft;
      const name = draft.name.trim();
      if (!name) {
        setStatus(t('status.itemNameRequired', 'Please provide an item name before adding.'));
        return;
      }
      const newItem = {
        id: createId(),
        name,
        quantity: Math.max(1, Number(draft.quantity) || 1),
        unit: draft.unit.trim(),
        details: draft.details.trim(),
        status: 'needed'
      };
      updateCategory(projectId, categoryId, (category) => ({
        ...category,
        items: [...category.items, newItem]
      }));
      rememberItem(newItem);
      setItemDrafts((prev) => ({
        ...prev,
        [categoryId]: { ...emptyItemDraft }
      }));
      setStatus(t('status.itemAdded', 'Item added. Autosave will secure it immediately.'));
    },
    [itemDrafts, rememberItem, setStatus, t, updateCategory]
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
      updateItem(projectId, categoryId, itemId, (item) => {
        const next = {
          ...item,
          [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : value
        };
        rememberItem(next);
        return next;
      });
      setStatus(t('status.changesQueued', 'Changes queued for autosave.'));
    },
    [rememberItem, setStatus, t, updateItem]
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

  const updateDraftItem = useCallback((categoryId, field, value) => {
    setItemDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || emptyItemDraft),
        [field]: value
      }
    }));
  }, []);

  const applySuggestionToDraft = useCallback((categoryId, suggestion) => {
    setItemDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || emptyItemDraft),
        name: suggestion.name,
        unit: suggestion.unit || '',
        details: suggestion.details || ''
      }
    }));
  }, []);

  const applySuggestionToItem = useCallback(
    (projectId, categoryId, itemId, suggestion) => {
      const updated = {
        name: suggestion.name,
        unit: suggestion.unit || '',
        details: suggestion.details || ''
      };
      updateItem(projectId, categoryId, itemId, (item) => ({
        ...item,
        ...updated
      }));
      rememberItem(updated);
      setStatus(t('status.suggestionApplied', 'Suggestion applied and ready for autosave.'));
    },
    [rememberItem, setStatus, t, updateItem]
  );

  return {
    projects,
    setProjects,
    history,
    setHistory,
    projectDraft,
    updateProjectDraftField,
    addProject,
    deleteProject,
    newCategoryName,
    setNewCategoryName,
    addCategory,
    moveCategoryUp,
    moveCategoryDown,
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
    itemSuggestions
  };
};
