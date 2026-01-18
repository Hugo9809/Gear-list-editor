import { useCallback, useMemo, useState } from 'react';
import { createId, STORAGE_MESSAGE_KEYS } from '../data/storage.js';

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
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectDraft, setProjectDraft] = useState(emptyProjectDraft);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDrafts, setItemDrafts] = useState({});

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const activeProjectIndex = useMemo(
    () => projects.findIndex((project) => project.id === activeProject?.id),
    [activeProject?.id, projects]
  );

  const totals = useMemo(() => {
    if (!activeProject) {
      return { items: 0, categories: 0 };
    }
    const categories = activeProject.categories.length;
    const items = activeProject.categories.reduce((sum, category) => sum + category.items.length, 0);
    return { categories, items };
  }, [activeProject]);

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
        return false;
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
      setActiveProjectId(newProject.id);
      setProjectDraft(emptyProjectDraft);
      setStatus(t('status.projectCreated', 'New project created and protected by autosave.'));
      return true;
    },
    [projectDraft, setStatus, t]
  );

  const openProject = useCallback((projectId) => {
    setActiveProjectId(projectId);
  }, []);

  const deleteProject = useCallback(
    (projectId) => {
      setProjects((prev) => {
        const remaining = prev.filter((project) => project.id !== projectId);
        if (activeProjectId === projectId) {
          setActiveProjectId(null);
        }
        return remaining;
      });
      setStatus(t('status.projectArchived', 'Project archived. Backups remain intact.'));
    },
    [activeProjectId, setStatus, t]
  );

  const addCategory = useCallback(
    (event) => {
      event.preventDefault();
      if (!activeProject) {
        setStatus(t('status.projectNeededForCategories', 'Create a project before adding categories.'));
        return;
      }
      const name = newCategoryName.trim();
      if (!name) {
        setStatus(t('status.categoryNameRequired', 'Please name the category before adding it.'));
        return;
      }
      updateProject(activeProject.id, (project) => ({
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
    [activeProject, newCategoryName, rememberCategory, setStatus, t, updateProject]
  );

  const addItemToCategory = useCallback(
    (event, categoryId) => {
      event.preventDefault();
      if (!activeProject) {
        return;
      }
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
      updateCategory(activeProject.id, categoryId, (category) => ({
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
    [activeProject, itemDrafts, rememberItem, setStatus, t, updateCategory]
  );

  const removeCategory = useCallback(
    (categoryId) => {
      if (!activeProject) {
        return;
      }
      updateProject(activeProject.id, (project) => ({
        ...project,
        categories: project.categories.filter((category) => category.id !== categoryId)
      }));
      setStatus(t('status.categoryRemoved', 'Category removed.'));
    },
    [activeProject, setStatus, t, updateProject]
  );

  const removeItem = useCallback(
    (categoryId, itemId) => {
      if (!activeProject) {
        return;
      }
      updateCategory(activeProject.id, categoryId, (category) => ({
        ...category,
        items: category.items.filter((item) => item.id !== itemId)
      }));
      setStatus(t('status.itemRemoved', 'Item removed. Backups remain available.'));
    },
    [activeProject, setStatus, t, updateCategory]
  );

  const updateItemField = useCallback(
    (categoryId, itemId, field, value) => {
      if (!activeProject) {
        return;
      }
      updateItem(activeProject.id, categoryId, itemId, (item) => {
        const next = {
          ...item,
          [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : value
        };
        rememberItem(next);
        return next;
      });
      setStatus(t('status.changesQueued', 'Changes queued for autosave.'));
    },
    [activeProject, rememberItem, setStatus, t, updateItem]
  );

  const updateCategoryField = useCallback(
    (categoryId, field, value) => {
      if (!activeProject) {
        return;
      }
      updateCategory(activeProject.id, categoryId, (category) => ({
        ...category,
        [field]: value
      }));
      if (field === 'name') {
        rememberCategory(value);
      }
      setStatus(t('status.categoryUpdated', 'Category updated.'));
    },
    [activeProject, rememberCategory, setStatus, t, updateCategory]
  );

  const updateProjectField = useCallback(
    (field, value) => {
      if (!activeProject) {
        return;
      }
      updateProject(activeProject.id, (project) => ({
        ...project,
        [field]: value
      }));
      setStatus(t('status.projectDetailsUpdated', 'Project details updated.'));
    },
    [activeProject, setStatus, t, updateProject]
  );

  const updateProjectNotes = useCallback(
    (value) => {
      if (!activeProject) {
        return;
      }
      updateProject(activeProject.id, (project) => ({
        ...project,
        notes: value
      }));
      setStatus(t('status.projectNotesSaved', 'Project notes saved for autosave.'));
    },
    [activeProject, setStatus, t, updateProject]
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
    (categoryId, itemId, suggestion) => {
      if (!activeProject) {
        return;
      }
      const updated = {
        name: suggestion.name,
        unit: suggestion.unit || '',
        details: suggestion.details || ''
      };
      updateItem(activeProject.id, categoryId, itemId, (item) => ({
        ...item,
        ...updated
      }));
      rememberItem(updated);
      setStatus(t('status.suggestionApplied', 'Suggestion applied and ready for autosave.'));
    },
    [activeProject, rememberItem, setStatus, t, updateItem]
  );

  return {
    projects,
    setProjects,
    history,
    setHistory,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    activeProjectIndex,
    totals,
    projectDraft,
    updateProjectDraftField,
    addProject,
    openProject,
    deleteProject,
    newCategoryName,
    setNewCategoryName,
    addCategory,
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
