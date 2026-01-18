import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { createId, createStorageService, STORAGE_MESSAGE_KEYS } from './data/storage.js';
import { getDictionary, translate, useI18n } from './i18n/index.js';

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

const emptyTemplateDraft = {
  name: '',
  description: ''
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const DEFAULT_NAME_KEYS = new Set(Object.values(STORAGE_MESSAGE_KEYS.defaults));
const isDefaultLabelKey = (value) => typeof value === 'string' && value.startsWith('defaults.');

const buildPrintableHtml = (project, dictionaryOrT, getStatusLabel, projectIndex = 0) => {
  const t =
    typeof dictionaryOrT === 'function'
      ? dictionaryOrT
      : (key, fallback, variables) =>
          translate(dictionaryOrT || getDictionary('en'), key, fallback, variables);
  const resolveLabel = (value, variables) =>
    typeof value === 'string' && value.startsWith('defaults.')
      ? t(value, undefined, variables)
      : value || '';
  const categoriesHtml = project.categories
    .map((category, categoryIndex) => {
      const rows = category.items
        .map(
          (item, itemIndex) => `
            <tr>
              <td>${escapeHtml(item.quantity)}</td>
              <td>${escapeHtml(item.unit || t('units.pcs'))}</td>
              <td>${escapeHtml(
                resolveLabel(item.name, { index: itemIndex + 1 }) || t('defaults.untitled_item', undefined, { index: itemIndex + 1 })
              )}</td>
              <td>${escapeHtml(item.details)}</td>
              <td>${escapeHtml(getStatusLabel(item.status))}</td>
            </tr>
          `
        )
        .join('');
      return `
        <section>
          <h3>${escapeHtml(
            resolveLabel(category.name, { index: categoryIndex + 1 }) ||
              t('defaults.untitled_category', undefined, { index: categoryIndex + 1 })
          )}</h3>
          <table>
            <thead>
              <tr>
                <th>${escapeHtml(t('items.print.headers.quantity'))}</th>
                <th>${escapeHtml(t('items.print.headers.unit'))}</th>
                <th>${escapeHtml(t('items.print.headers.item'))}</th>
                <th>${escapeHtml(t('items.print.headers.details'))}</th>
                <th>${escapeHtml(t('items.print.headers.status'))}</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows ||
                `<tr><td colspan="5">${escapeHtml(
                  t('items.print.empty')
                )}</td></tr>`
              }
            </tbody>
          </table>
        </section>
      `;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(
          resolveLabel(project.name, { index: projectIndex + 1 }) ||
            t('defaults.untitled_project', undefined, { index: projectIndex + 1 })
        )} - ${escapeHtml(t('ui.gearList'))}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            color: #0f172a;
            margin: 32px;
          }
          header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 28px;
            margin: 0 0 8px;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px 24px;
            font-size: 13px;
          }
          section {
            margin-bottom: 24px;
            break-inside: avoid;
          }
          h3 {
            margin: 0 0 8px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #cbd5f5;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
          }
          thead {
            background: #e2e8f0;
          }
          .notes {
            margin-top: 16px;
            font-size: 12px;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(
            resolveLabel(project.name, { index: projectIndex + 1 }) ||
              t('defaults.untitled_project', undefined, { index: projectIndex + 1 })
          )}</h1>
          <div class="meta">
            <div><strong>${escapeHtml(t('project.print.labels.client'))}:</strong> ${escapeHtml(project.client || t('ui.emptyValue', '—'))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.date'))}:</strong> ${escapeHtml(project.shootDate || t('ui.emptyValue', '—'))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.location'))}:</strong> ${escapeHtml(project.location || t('ui.emptyValue', '—'))}</div>
            <div><strong>${escapeHtml(t('project.print.labels.contact'))}:</strong> ${escapeHtml(project.contact || t('ui.emptyValue', '—'))}</div>
          </div>
        </header>
        ${categoriesHtml}
        <div class="notes">
          <strong>${escapeHtml(t('project.print.notes.title'))}:</strong> ${escapeHtml(
            project.notes || t('project.notes.empty', 'No notes added.')
          )}
        </div>
      </body>
    </html>
  `;
};

const TypeaheadInput = ({
  value,
  onChange,
  onSelectSuggestion,
  suggestions,
  placeholder,
  inputClassName,
  listClassName,
  label,
  unitFallback = '',
  detailsFallback = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredSuggestions = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    const sorted = [...suggestions].sort((a, b) =>
      (b.lastUsed || '').localeCompare(a.lastUsed || '')
    );
    const filtered = normalized
      ? sorted.filter((item) => item.name.toLowerCase().includes(normalized))
      : sorted;
    return filtered.slice(0, 6);
  }, [value, suggestions]);

  const handleSelect = (suggestion) => {
    onSelectSuggestion?.(suggestion);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder={placeholder}
        aria-label={label}
        className={inputClassName}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className={`absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-surface-sunken bg-surface-input text-left text-sm text-text-primary shadow-xl ${
            listClassName || ''
          }`}
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
              className="flex w-full flex-col gap-1 px-3 py-2 text-left transition hover:bg-surface-sunken"
            >
              <span className="font-medium text-text-primary">{suggestion.name}</span>
              <span className="text-xs text-text-secondary">
                {suggestion.unit || unitFallback} · {suggestion.details || detailsFallback}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const { locale, locales, setLocale, t, tPlural } = useI18n();
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState({ items: [], categories: [] });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [theme, setTheme] = useState('light');
  const [status, setStatus] = useState(() =>
    t('status.loading', 'Loading your saved gear list...')
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [projectDraft, setProjectDraft] = useState(emptyProjectDraft);
  const [templateDraft, setTemplateDraft] = useState(emptyTemplateDraft);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDrafts, setItemDrafts] = useState({});
  const fileInputRef = useRef(null);
  const storageRef = useRef(null);
  const tRef = useRef(t);

  const resolveDisplayName = useCallback(
    (value, variables, fallbackKey) => {
      if (typeof value !== 'string' || !value.trim()) {
        return fallbackKey ? t(fallbackKey, undefined, variables) : '';
      }
      if (isDefaultLabelKey(value)) {
        return t(value, undefined, variables);
      }
      return value;
    },
    [t]
  );

  const resolveStorageMessage = useCallback(
    (message, variables) => {
      if (!message) {
        return '';
      }
      if (typeof message === 'string' && (message.startsWith('warnings.') || message.startsWith('errors.'))) {
        return t(message, undefined, variables);
      }
      return message;
    },
    [t]
  );

  const resolveStorageSource = useCallback(
    (source) => {
      if (!source) {
        return '';
      }
      if (typeof source === 'string' && source.startsWith('sources.')) {
        return t(source);
      }
      return source;
    },
    [t]
  );

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('meta.title', 'Gear list editor');
  }, [locale, t]);

  if (!storageRef.current) {
    storageRef.current = createStorageService({
      onSaved: (payload, { reason, warnings }) => {
        const tCurrent = tRef.current;
        setLastSaved(payload.lastSaved);
        if (warnings?.length) {
          const warning = warnings[0];
          setStatus(
            typeof warning === 'string' && (warning.startsWith('warnings.') || warning.startsWith('errors.'))
              ? tCurrent(warning)
              : warning
          );
          return;
        }
        if (reason === 'autosave') {
          setStatus(
            tCurrent(
              'status.autosaveComplete',
              'Autosave complete. Your project dashboard is safe.'
            )
          );
        } else if (reason === 'explicit') {
          setStatus(
            tCurrent('status.saveComplete', 'Saved safely to device storage and backups.')
          );
        } else if (reason === 'rehydrate') {
          setStatus(
            tCurrent('status.storageRepaired', 'Storage repaired and redundancies refreshed.')
          );
        }
      },
      onWarning: (message) => {
        const tCurrent = tRef.current;
        setStatus(
          typeof message === 'string' && (message.startsWith('warnings.') || message.startsWith('errors.'))
            ? tCurrent(message)
            : message
        );
      }
    });
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await storageRef.current.loadState();
      if (!mounted) {
        return;
      }
      setProjects(result.state.projects);
      setTemplates(result.state.templates);
      setHistory(result.state.history);
      setActiveProjectId(result.state.activeProjectId);
      setLastSaved(result.state.lastSaved);
      setTheme(result.state.theme || 'light');
      if (result.warnings.length > 0) {
        setStatus(resolveStorageMessage(result.warnings[0]));
      } else {
        const localizedSource = resolveStorageSource(result.source);
        setStatus(
          result.source === STORAGE_MESSAGE_KEYS.sources.empty
            ? t('status.noSavedData', 'No saved data yet. Start a project and autosave will protect it.')
            : t('status.loadedFromSource', 'Loaded safely from {source}.', {
                source: localizedSource
              })
        );
      }
      setIsHydrated(true);
    };
    load();
    return () => {
      mounted = false;
      storageRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    storageRef.current.scheduleAutosave({
      theme,
      projects,
      templates,
      history,
      activeProjectId,
      lastSaved
    });
  }, [projects, templates, history, activeProjectId, isHydrated, theme]);

  useEffect(() => {
    if (templates.length === 0) {
      setSelectedTemplateId('');
      return;
    }
    setSelectedTemplateId((prev) =>
      templates.some((template) => template.id === prev) ? prev : templates[0].id
    );
  }, [templates]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId]
  );
  const activeProjectIndex = useMemo(
    () => projects.findIndex((project) => project.id === activeProject?.id),
    [activeProject?.id, projects]
  );

  const itemSuggestions = useMemo(
    () => (history.items || []).filter((entry) => !DEFAULT_NAME_KEYS.has(entry.name)),
    [history.items]
  );

  const rememberItem = (item) => {
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
  };

  const rememberCategory = (name) => {
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
  };

  const updateProject = (projectId, updater) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? updater(project) : project))
    );
  };

  const updateCategory = (projectId, categoryId, updater) => {
    updateProject(projectId, (project) => ({
      ...project,
      categories: project.categories.map((category) =>
        category.id === categoryId ? updater(category) : category
      )
    }));
  };

  const updateItem = (projectId, categoryId, itemId, updater) => {
    updateCategory(projectId, categoryId, (category) => ({
      ...category,
      items: category.items.map((item) => (item.id === itemId ? updater(item) : item))
    }));
  };

  const addProject = (event) => {
    event.preventDefault();
    const name = projectDraft.name.trim();
    if (!name) {
      setStatus(t('status.projectNameRequired', 'Please name the project before creating it.'));
      return;
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
    setActiveTab('project');
    setProjectDraft(emptyProjectDraft);
    setStatus(t('status.projectCreated', 'New project created and protected by autosave.'));
  };

  const openProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveTab('project');
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => {
      const remaining = prev.filter((project) => project.id !== projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        setActiveTab('dashboard');
      }
      return remaining;
    });
    setStatus(t('status.projectArchived', 'Project archived. Backups remain intact.'));
  };

  const addCategory = (event) => {
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
  };

  const addItemToCategory = (event, categoryId) => {
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
  };

  const removeCategory = (categoryId) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      categories: project.categories.filter((category) => category.id !== categoryId)
    }));
    setStatus(t('status.categoryRemoved', 'Category removed.'));
  };

  const removeItem = (categoryId, itemId) => {
    if (!activeProject) {
      return;
    }
    updateCategory(activeProject.id, categoryId, (category) => ({
      ...category,
      items: category.items.filter((item) => item.id !== itemId)
    }));
    setStatus(t('status.itemRemoved', 'Item removed. Backups remain available.'));
  };

  const updateItemField = (categoryId, itemId, field, value) => {
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
  };

  const updateCategoryField = (categoryId, field, value) => {
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
  };

  const updateProjectField = (field, value) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      [field]: value
    }));
    setStatus(t('status.projectDetailsUpdated', 'Project details updated.'));
  };

  const updateProjectNotes = (value) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      notes: value
    }));
    setStatus(t('status.projectNotesSaved', 'Project notes saved for autosave.'));
  };

  const updateDraftItem = (categoryId, field, value) => {
    setItemDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || emptyItemDraft),
        [field]: value
      }
    }));
  };

  const applySuggestionToDraft = (categoryId, suggestion) => {
    setItemDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || emptyItemDraft),
        name: suggestion.name,
        unit: suggestion.unit || '',
        details: suggestion.details || ''
      }
    }));
  };

  const applySuggestionToItem = (categoryId, itemId, suggestion) => {
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
  };

  const saveTemplateFromProject = () => {
    if (!activeProject) {
      setStatus(t('status.projectNeededForTemplate', 'Create a project before saving a template.'));
      return;
    }
    const name = templateDraft.name.trim();
    if (!name) {
      setStatus(t('status.templateNameRequired', 'Please name the template.'));
      return;
    }
    const template = {
      id: createId(),
      name,
      description: templateDraft.description.trim(),
      notes: activeProject.notes,
      categories: activeProject.categories.map((category) => ({
        ...category,
        id: createId(),
        items: category.items.map((item) => ({
          ...item,
          id: createId()
        }))
      })),
      lastUsed: new Date().toISOString()
    };
    setTemplates((prev) => [template, ...prev]);
    setTemplateDraft(emptyTemplateDraft);
    setStatus(t('status.templateSaved', 'Template saved from the current project.'));
  };

  const handleTemplateSubmit = (event) => {
    event.preventDefault();
    saveTemplateFromProject();
  };

  const applyTemplateToProject = (templateId) => {
    if (!activeProject) {
      setStatus(t('status.projectNeededForApplyTemplate', 'Select a project before applying a template.'));
      return;
    }
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    template.categories.forEach((category) => {
      category.items.forEach((item) => rememberItem(item));
    });
    updateProject(activeProject.id, (project) => ({
      ...project,
      categories: [
        ...project.categories,
        ...template.categories.map((category) => ({
          ...category,
          id: createId(),
          items: category.items.map((item) => ({
            ...item,
            id: createId()
          }))
        }))
      ]
    }));
    setTemplates((prev) =>
      prev.map((item) => (item.id === templateId ? { ...item, lastUsed: new Date().toISOString() } : item))
    );
    setStatus(t('status.templateApplied', 'Template applied. Autosave will secure the updated list.'));
  };

  const handleLoadTemplate = () => {
    if (!selectedTemplateId) {
      setStatus(
        t('status.templateSelectionRequired', 'Select a template to load into the active project.')
      );
      return;
    }
    applyTemplateToProject(selectedTemplateId);
  };

  const updateTemplateField = (templateId, field, value) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? {
              ...template,
              [field]: value
            }
          : template
      )
    );
    setStatus(t('status.templateUpdated', 'Template updated.'));
  };

  const removeTemplate = (templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
    setStatus(t('status.templateRemoved', 'Template removed.'));
  };

  const exportPdf = () => {
    if (!activeProject) {
      setStatus(t('status.projectNeededForExport', 'Select a project before exporting.'));
      return;
    }
    const dictionary = getDictionary(locale);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      setStatus(t('status.popupBlocked', 'Popup blocked. Please allow popups for PDF export.'));
      return;
    }
    printWindow.document.open();
    printWindow.document.write(
      buildPrintableHtml(activeProject, dictionary, getStatusLabel, Math.max(activeProjectIndex, 0))
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatus(t('status.pdfReady', 'PDF export ready. Confirm printing to save the file.'));
  };

  const exportProject = () => {
    if (!activeProject) {
      setStatus(t('status.projectNeededForExport', 'Select a project before exporting.'));
      return;
    }
    const { json, fileName } = storageRef.current.exportProjectBackup(
      {
        projects,
        templates,
        history,
        activeProjectId,
        lastSaved
      },
      activeProject.id
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(t('status.projectExported', 'Project export downloaded. Store it somewhere safe.'));
  };

  const downloadBackup = () => {
    const { json, fileName } = storageRef.current.exportBackup({
      projects,
      templates,
      history,
      activeProjectId,
      lastSaved
    });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(t('status.backupDownloaded', 'Backup downloaded. Store it somewhere safe.'));
  };

  const restoreFromDeviceBackup = async () => {
    const result = await storageRef.current.restoreFromBackup();
    setProjects(result.state.projects);
    setTemplates(result.state.templates);
    setHistory(result.state.history);
    setActiveProjectId(result.state.activeProjectId);
    setLastSaved(result.state.lastSaved);
    if (result.warnings.length > 0) {
      setStatus(resolveStorageMessage(result.warnings[0]));
      return;
    }
    setStatus(
      t('status.restoredFromSource', 'Restored from {source}.', {
        source: resolveStorageSource(result.source)
      })
    );
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const { state, warnings } = storageRef.current.importBackup(reader.result, {
        projects,
        templates,
        history,
        activeProjectId,
        lastSaved
      });
      setProjects(state.projects);
      setTemplates(state.templates);
      setHistory(state.history);
      setActiveProjectId(state.activeProjectId);
      if (warnings.length > 0) {
        setStatus(resolveStorageMessage(warnings[0]));
      } else {
        setStatus(t('status.importComplete', 'Import complete. Existing data was preserved.'));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLocaleChange = (event) => {
    const nextLocale = event.target.value;
    setLocale(nextLocale);
    setStatus(
      translate(
        getDictionary(nextLocale),
        'language.status',
        t('language.status', 'Language updated and saved locally.')
      )
    );
  };

  const getStatusLabel = useCallback(
    (value) => t(`status.labels.${value}`, value),
    [t]
  );

  const statusClasses = status
    ? 'border border-brand/40 bg-brand/10 text-brand'
    : 'border border-surface-sunken bg-surface-elevated/60 text-text-secondary';

  const totals = useMemo(() => {
    if (!activeProject) {
      return { items: 0, categories: 0 };
    }
    const categories = activeProject.categories.length;
    const items = activeProject.categories.reduce((sum, category) => sum + category.items.length, 0);
    return { categories, items };
  }, [activeProject]);

  const navigationTabs = useMemo(
    () => [
      { id: 'dashboard', label: t('navigation.sidebar.dashboard', 'All Projects') },
      { id: 'templates', label: t('navigation.sidebar.templates', 'Templates') },
      { id: 'help', label: t('navigation.sidebar.help', 'Help') }
    ],
    [t]
  );

  const themeOptions = useMemo(
    () => [
      { id: 'light', label: t('theme.options.light', 'Light') },
      { id: 'dark', label: t('theme.options.dark', 'Dark') },
      { id: 'pink', label: t('theme.options.pink', 'Pink') }
    ],
    [t]
  );

  const helpSections = t('help.sections', []);
  const documentationSections = t('documentation.sections', []);
  const offlineSteps = t('offline.steps', []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-app via-surface-app to-surface-muted">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="flex w-full flex-col gap-6 lg:w-72">
            <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/80 p-6 shadow-lg">
              <h1 className="text-[1.35rem] font-semibold text-text-primary title-shadow tracking-tight whitespace-nowrap">
                {t('ui.appName', 'Gear List Creator')}
              </h1>
            </div>

            <nav className="flex flex-col gap-2">
              {navigationTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-4 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand text-brand-foreground'
                        : 'border border-surface-sunken text-text-primary hover:border-brand'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary title-shadow">
                {t('language.label', 'Language')}
              </h3>
              <label className="mt-3 flex flex-col gap-2 text-sm text-text-secondary">
                {t('language.label', 'Language')}
                <select
                  value={locale}
                  onChange={handleLocaleChange}
                  className="rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                >
                  {locales.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-2 text-xs text-text-muted">
                {t('language.helper', 'Saved locally for offline use.')}
              </p>
            </div>

            <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary title-shadow">
                {t('theme.label', 'Theme')}
              </h3>
              <div className="mt-3 grid gap-2">
                {themeOptions.map((themeOption) => {
                  const isActive = theme === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      type="button"
                      onClick={() => setTheme(themeOption.id)}
                      aria-pressed={isActive}
                      className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                        isActive
                          ? 'bg-brand text-brand-foreground'
                          : 'border border-surface-sunken text-text-primary hover:border-brand'
                      }`}
                    >
                      {themeOption.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {t('theme.helper', 'Theme stays with your saved workspace.')}
              </p>
            </div>

            <div className={`rounded-2xl p-4 text-sm ${statusClasses}`} aria-live="polite">
              {status || t('status.empty', 'Status updates appear here to confirm data safety.')}
            </div>
          </aside>

          <main className="flex flex-1 flex-col gap-6">
            {activeProject && activeTab === 'project' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-sunken bg-surface-elevated/80 px-5 py-4 shadow-lg">
                  <div className="flex min-w-[200px] flex-col gap-1">
                    <span className="text-xs uppercase tracking-[0.3em] text-text-muted">
                      {t('project.active.label', 'Active project')}
                    </span>
                    <span className="text-lg font-semibold text-text-primary title-shadow">
                      {resolveDisplayName(
                        activeProject.name,
                        { index: Math.max(activeProjectIndex, 0) + 1 },
                        'project.untitled'
                      )}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {t(
                        'project.active.helper',
                        'Export the current list or save it as a reusable template.'
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <button
                      type="button"
                      onClick={exportProject}
                      className="rounded-full border border-surface-sunken px-4 py-2 font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                    >
                      {t('project.actions.export', 'Export project')}
                    </button>
                    <button
                      type="button"
                      onClick={exportPdf}
                      className="rounded-full border border-surface-sunken px-4 py-2 font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                    >
                      {t('project.actions.exportPdf', 'Export PDF')}
                    </button>
                    <button
                      type="button"
                      onClick={saveTemplateFromProject}
                      className="rounded-full bg-brand px-4 py-2 font-semibold text-brand-foreground transition hover:bg-brand-hover"
                    >
                      {t('template.actions.saveFromProject', 'Save as template')}
                    </button>
                  </div>
                </div>

              </>
            ) : null}

            {activeTab === 'dashboard' ? (
              <>
                <div className="flex flex-col gap-4 rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary title-shadow">
                        {t('dashboard.quickActions.title', 'Dashboard quick actions')}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {t(
                          'dashboard.quickActions.description',
                          'Load trusted templates or bring a project backup back into your local library.'
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex min-w-[200px] flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                        {t('template.library.label', 'Template library')}
                        <select
                          value={selectedTemplateId}
                          onChange={(event) => setSelectedTemplateId(event.target.value)}
                          className="rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                        >
                          {templates.length === 0 ? (
                            <option value="">
                              {t('template.library.emptyOption', 'No templates saved')}
                            </option>
                          ) : (
                            templates.map((template, templateIndex) => (
                              <option key={template.id} value={template.id}>
                                {resolveDisplayName(
                                  template.name,
                                  { index: templateIndex + 1 },
                                  STORAGE_MESSAGE_KEYS.defaults.template
                                )}
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadTemplate}
                        disabled={!selectedTemplateId}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          selectedTemplateId
                            ? 'bg-brand text-brand-foreground hover:bg-brand-hover'
                            : 'cursor-not-allowed bg-surface-sunken text-text-muted'
                        }`}
                      >
                        {t('template.actions.loadIntoProject', 'Load from template')}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border border-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                      >
                        {t('project.actions.importProject', 'Import project')}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted">
                    {t(
                      'template.library.helper',
                      'Templates add gear to the selected project without overwriting existing entries.'
                    )}
                  </p>
                </div>

                <form
                  onSubmit={addProject}
                  className="flex flex-col gap-4 rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-6"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-text-primary title-shadow">
                      {t('project.dashboard.title', 'Project dashboard')}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t(
                        'project.dashboard.description',
                        'Track multiple productions and open a project to start editing the gear list. New projects are autosaved the moment they are created.'
                      )}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                      {t('project.fields.name', 'Project name')}
                      <input
                        value={projectDraft.name}
                        onChange={(event) =>
                          setProjectDraft((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder={t('project.placeholders.name', 'e.g. October studio shoot')}
                        className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                      {t('project.fields.client', 'Client / production')}
                      <input
                        value={projectDraft.client}
                        onChange={(event) =>
                          setProjectDraft((prev) => ({ ...prev, client: event.target.value }))
                        }
                        placeholder={t('project.placeholders.client', 'Client, agency, or show')}
                        className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                      {t('project.fields.shootDate', 'Shoot date')}
                      <input
                        type="date"
                        value={projectDraft.shootDate}
                        onChange={(event) =>
                          setProjectDraft((prev) => ({ ...prev, shootDate: event.target.value }))
                        }
                        className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary focus:border-brand focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-text-secondary">
                      {t('project.fields.location', 'Location')}
                      <input
                        value={projectDraft.location}
                        onChange={(event) =>
                          setProjectDraft((prev) => ({ ...prev, location: event.target.value }))
                        }
                        placeholder={t('project.placeholders.location', 'Studio, city, or venue')}
                        className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
                      {t('project.fields.contact', 'Lead contact')}
                      <input
                        value={projectDraft.contact}
                        onChange={(event) =>
                          setProjectDraft((prev) => ({ ...prev, contact: event.target.value }))
                        }
                        placeholder={t('project.placeholders.contact', 'Producer or department contact')}
                        className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-fit items-center justify-center rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
                  >
                    {t('project.actions.create', 'Create project')}
                  </button>
                </form>

                <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary title-shadow">
                        {t('project.list.title', 'Projects')}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {tPlural(
                          'project.count',
                          projects.length,
                          '{count} project stored locally.',
                          { count: projects.length }
                        )}
                      </p>
                    </div>
                    <div className="text-xs text-text-muted">
                      {t('project.lastSaved.label', 'Last saved: {time}', {
                        time: lastSaved
                          ? new Date(lastSaved).toLocaleString()
                          : t('project.lastSaved.empty', 'Not saved yet')
                      })}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {projects.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted md:col-span-2">
                        {t(
                          'project.list.empty',
                          'No projects yet. Create your first project to begin building a gear list.'
                        )}
                      </div>
                    ) : (
                      projects.map((project, projectIndex) => {
                        const itemTotal = project.categories.reduce(
                          (sum, category) => sum + category.items.length,
                          0
                        );
                        return (
                          <div
                            key={project.id}
                            className="flex h-full flex-col gap-4 rounded-xl border border-surface-sunken bg-surface-muted/60 p-4 transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-text-primary title-shadow">
                                  {resolveDisplayName(
                                    project.name,
                                    { index: projectIndex + 1 },
                                    STORAGE_MESSAGE_KEYS.defaults.project
                                  )}
                                </h3>
                                <p className="text-xs text-text-secondary">
                                  {project.client || t('project.client.empty', 'Client not set')} ·{' '}
                                  {project.shootDate || t('project.shootDate.empty', 'Date not set')}
                                </p>
                              </div>
                            </div>
                            <div className="grid gap-2 text-xs text-text-secondary md:grid-cols-2">
                              <div className="rounded-lg border border-surface-sunken bg-surface-input/40 px-3 py-2">
                                <span className="font-semibold text-text-primary">
                                  {tPlural(
                                    'categories.count',
                                    project.categories.length,
                                    '{count} categories',
                                    { count: project.categories.length }
                                  )}
                                </span>
                              </div>
                              <div className="rounded-lg border border-surface-sunken bg-surface-input/40 px-3 py-2">
                                <span className="font-semibold text-text-primary">
                                  {tPlural('items.count', itemTotal, '{count} items', { count: itemTotal })}
                                </span>
                              </div>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openProject(project.id)}
                                className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
                              >
                                {t('project.actions.open', 'Open')}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProject(project.id)}
                                className="rounded-lg border border-surface-sunken px-3 py-1 text-xs font-semibold text-text-primary transition hover:border-status-error hover:text-status-error"
                              >
                                {t('project.actions.archive', 'Archive')}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === 'project' ? (
              <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary title-shadow">
                      {t('project.workspace.title', 'Active project workspace')}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {activeProject
                        ? t('project.workspace.summary', '{categories} · {items}', {
                            categories: tPlural(
                              'categories.count',
                              totals.categories,
                              '{count} categories',
                              { count: totals.categories }
                            ),
                            items: tPlural('items.count', totals.items, '{count} items', {
                              count: totals.items
                            })
                          })
                        : t('project.workspace.empty', 'Select a project to start editing.')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="rounded-lg border border-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
                    >
                      {t('project.actions.backToDashboard', 'Back to dashboard')}
                    </button>
                    <button
                      type="button"
                      onClick={exportPdf}
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
                    >
                      {t('project.actions.exportPdf', 'Export PDF')}
                    </button>
                  </div>
                </div>

                {activeProject ? (
                  <div className="mt-6 flex flex-col gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('project.fields.name', 'Project name')}
                        <input
                          value={resolveDisplayName(
                            activeProject.name,
                            { index: Math.max(activeProjectIndex, 0) + 1 },
                            STORAGE_MESSAGE_KEYS.defaults.project
                          )}
                          onChange={(event) => updateProjectField('name', event.target.value)}
                          className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary focus:border-brand focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('project.fields.client', 'Client / production')}
                        <input
                          value={activeProject.client}
                          onChange={(event) => updateProjectField('client', event.target.value)}
                          className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary focus:border-brand focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('project.fields.shootDate', 'Shoot date')}
                        <input
                          type="date"
                          value={activeProject.shootDate}
                          onChange={(event) => updateProjectField('shootDate', event.target.value)}
                          className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary focus:border-brand focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-text-secondary">
                        {t('project.fields.location', 'Location')}
                        <input
                          value={activeProject.location}
                          onChange={(event) => updateProjectField('location', event.target.value)}
                          className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary focus:border-brand focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
                        {t('project.fields.contact', 'Lead contact')}
                        <input
                          value={activeProject.contact}
                          onChange={(event) => updateProjectField('contact', event.target.value)}
                          className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary focus:border-brand focus:outline-none"
                        />
                      </label>
                    </div>

                    <form
                      onSubmit={addCategory}
                      className="flex flex-col gap-3 rounded-xl border border-surface-sunken bg-surface-muted/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-text-primary title-shadow">
                          {t('categories.title', 'Categories')}
                        </h3>
                        <span className="text-xs text-text-muted">
                          {t('categories.helper', 'Use templates for faster setups.')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <input
                          value={newCategoryName}
                          onChange={(event) => setNewCategoryName(event.target.value)}
                          placeholder={t(
                            'categories.placeholder',
                            'Add a category (e.g. Camera, Lighting)'
                          )}
                          className="flex-1 rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
                        >
                          {t('categories.actions.add', 'Add category')}
                        </button>
                      </div>
                    </form>

                    <div className="flex flex-col gap-4">
                      {activeProject.categories.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
                          {t(
                            'categories.empty',
                            'No categories yet. Add one above or apply a template.'
                          )}
                        </div>
                      ) : (
                        activeProject.categories.map((category, categoryIndex) => (
                          <div
                            key={category.id}
                            className="flex flex-col gap-4 rounded-2xl border border-l-4 border-surface-sunken border-l-brand bg-surface-elevated/80 p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex flex-1 flex-col gap-3">
                                <input
                                  value={resolveDisplayName(
                                    category.name,
                                    { index: categoryIndex + 1 },
                                    STORAGE_MESSAGE_KEYS.defaults.category
                                  )}
                                  onChange={(event) =>
                                    updateCategoryField(category.id, 'name', event.target.value)
                                  }
                                  className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-lg font-semibold text-text-primary focus:border-brand focus:outline-none"
                                />
                                <textarea
                                  value={category.notes}
                                  onChange={(event) =>
                                    updateCategoryField(category.id, 'notes', event.target.value)
                                  }
                                  placeholder={t(
                                    'categories.notes.placeholder',
                                    'Category notes or rental references'
                                  )}
                                  rows={2}
                                  className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCategory(category.id)}
                                className="rounded-lg border border-surface-sunken px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary transition hover:border-status-error hover:text-status-error"
                              >
                                {t('categories.actions.remove', 'Remove category')}
                              </button>
                            </div>

                            <form
                              onSubmit={(event) => addItemToCategory(event, category.id)}
                              className="grid gap-3 rounded-lg border border-surface-sunken bg-surface-base/90 p-3 md:grid-cols-[3fr_2fr_auto]"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={(itemDrafts[category.id] || emptyItemDraft).quantity}
                                  onChange={(event) =>
                                    updateDraftItem(category.id, 'quantity', event.target.value)
                                  }
                                  className="w-20 rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                                />
                                <span className="text-sm font-semibold text-text-muted">×</span>
                                <div className="min-w-0 flex-1">
                                  <TypeaheadInput
                                    value={(itemDrafts[category.id] || emptyItemDraft).name}
                                    onChange={(value) => updateDraftItem(category.id, 'name', value)}
                                    onSelectSuggestion={(suggestion) =>
                                      applySuggestionToDraft(category.id, suggestion)
                                    }
                                    suggestions={itemSuggestions}
                                    placeholder={t('items.fields.name', 'Item name')}
                                    label={t('items.fields.name', 'Item name')}
                                    unitFallback={t('items.suggestion.unitFallback')}
                                    detailsFallback={t('items.suggestion.detailsFallback')}
                                    inputClassName="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                                  />
                                </div>
                              </div>
                              <input
                                value={(itemDrafts[category.id] || emptyItemDraft).details}
                                onChange={(event) => updateDraftItem(category.id, 'details', event.target.value)}
                                placeholder={t('items.fields.details', 'Details / notes')}
                                className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
                              >
                                {t('items.actions.add', 'Add')}
                              </button>
                            </form>

                            <div className="flex flex-col gap-3">
                              {category.items.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-4 text-center text-xs text-text-muted">
                                  {t('items.empty', 'No items yet. Add the first item above.')}
                                </div>
                              ) : (
                                category.items.map((item, itemIndex) => (
                                  <div
                                    key={item.id}
                                    className="grid gap-3 rounded-lg border border-surface-sunken bg-surface-muted/70 p-3 md:grid-cols-[3fr_2fr_1fr_auto]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(event) =>
                                          updateItemField(
                                            category.id,
                                            item.id,
                                            'quantity',
                                            event.target.value
                                          )
                                        }
                                        className="w-20 rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                                      />
                                      <span className="text-sm font-semibold text-text-muted">×</span>
                                      <div className="min-w-0 flex-1">
                                        <TypeaheadInput
                                          value={resolveDisplayName(
                                            item.name,
                                            { index: itemIndex + 1 },
                                            STORAGE_MESSAGE_KEYS.defaults.item
                                          )}
                                          onChange={(value) =>
                                            updateItemField(category.id, item.id, 'name', value)
                                          }
                                          onSelectSuggestion={(suggestion) =>
                                            applySuggestionToItem(category.id, item.id, suggestion)
                                          }
                                          suggestions={itemSuggestions}
                                          placeholder={t('items.fields.name', 'Item name')}
                                          label={t('items.fields.name', 'Item name')}
                                          unitFallback={t('items.suggestion.unitFallback')}
                                          detailsFallback={t(
                                            'items.suggestion.detailsFallback'
                                          )}
                                          inputClassName="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                    <input
                                      value={item.details}
                                      onChange={(event) =>
                                        updateItemField(
                                          category.id,
                                          item.id,
                                          'details',
                                          event.target.value
                                        )
                                      }
                                      className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                                    />
                                    <select
                                      value={item.status}
                                      onChange={(event) =>
                                        updateItemField(
                                          category.id,
                                          item.id,
                                          'status',
                                          event.target.value
                                        )
                                      }
                                      className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                                    >
                                      <option value="needed">
                                        {t('status.labels.needed', 'Needed')}
                                      </option>
                                      <option value="packed">
                                        {t('status.labels.packed', 'Packed')}
                                      </option>
                                      <option value="missing">
                                        {t('status.labels.missing', 'Missing')}
                                      </option>
                                      <option value="rented">
                                        {t('status.labels.rented', 'Rented')}
                                      </option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(category.id, item.id)}
                                      className="rounded-lg border border-surface-sunken px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary transition hover:border-status-error hover:text-status-error"
                                    >
                                      {t('items.actions.remove', 'Remove')}
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-4">
                      <h3 className="text-lg font-semibold text-text-primary title-shadow">
                        {t('project.notes.title', 'Project notes')}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {t(
                          'project.notes.helper',
                          'Notes appear in exports and are included in backups for every project.'
                        )}
                      </p>
                      <textarea
                        value={activeProject.notes}
                        onChange={(event) => updateProjectNotes(event.target.value)}
                        placeholder={t(
                          'project.notes.placeholder',
                          'Crew notes, pickup info, or return instructions'
                        )}
                        rows={4}
                        className="mt-3 w-full rounded-xl border border-surface-sunken bg-surface-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
                    {t(
                      'project.workspace.emptyState',
                      'Select or create a project to unlock the gear list editor.'
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === 'templates' ? (
              <form
                onSubmit={handleTemplateSubmit}
                className="rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-6"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-text-primary title-shadow">
                    {t('template.management.title', 'Template management')}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t(
                      'template.management.description',
                      'Save reusable setups for recurring shoots. Templates can be applied to any project without overwriting existing data.'
                    )}
                  </p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-text-secondary">
                    {t('template.fields.name', 'Template name')}
                    <input
                      value={templateDraft.name}
                      onChange={(event) =>
                        setTemplateDraft((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder={t('template.placeholders.name', 'e.g. Standard documentary kit')}
                      className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-text-secondary">
                    {t('template.fields.description', 'Description')}
                    <input
                      value={templateDraft.description}
                      onChange={(event) =>
                        setTemplateDraft((prev) => ({ ...prev, description: event.target.value }))
                      }
                      placeholder={t('template.placeholders.description', 'Key details or usage')}
                      className="w-full rounded-lg border border-surface-sunken bg-surface-input px-4 py-2 text-base text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
                >
                  {t('template.actions.saveCurrent', 'Save current project as template')}
                </button>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {templates.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted md:col-span-2">
                      {t(
                        'template.list.empty',
                        'No templates yet. Save the active project to build your library.'
                      )}
                    </div>
                  ) : (
                    templates.map((template, templateIndex) => (
                      <div
                        key={template.id}
                        className="flex h-full flex-col gap-3 rounded-xl border border-surface-sunken bg-surface-muted/60 p-4"
                      >
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                          {t('template.fields.shortName', 'Name')}
                          <input
                            value={resolveDisplayName(
                              template.name,
                              { index: templateIndex + 1 },
                              STORAGE_MESSAGE_KEYS.defaults.template
                            )}
                            onChange={(event) =>
                              updateTemplateField(template.id, 'name', event.target.value)
                            }
                            className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                          {t('template.fields.description', 'Description')}
                          <input
                            value={template.description}
                            onChange={(event) =>
                              updateTemplateField(template.id, 'description', event.target.value)
                            }
                            className="w-full rounded-lg border border-surface-sunken bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
                          />
                        </label>
                        <div className="text-xs text-text-muted">
                          {t('template.card.meta', '{categories} · Last used {date}', {
                            categories: tPlural(
                              'categories.count',
                              template.categories.length,
                              '{count} categories',
                              { count: template.categories.length }
                            ),
                            date: template.lastUsed
                              ? new Date(template.lastUsed).toLocaleDateString()
                              : t('template.lastUsed.never', 'Never')
                          })}
                        </div>
                        <div className="mt-auto flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => applyTemplateToProject(template.id)}
                            className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
                          >
                            {t('template.actions.apply', 'Apply to active project')}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTemplate(template.id)}
                            className="rounded-lg border border-surface-sunken px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-status-error hover:text-status-error"
                          >
                            {t('template.actions.remove', 'Remove')}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </form>
            ) : null}

            {activeTab === 'help' ? (
              <section className="rounded-2xl border border-surface-sunken bg-surface-elevated/70 p-6">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-text-primary title-shadow">
                    {t('help.title', 'Help & documentation')}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t('help.subtitle', 'Offline-first guidance for safe gear lists.')}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {helpSections.map((section, index) => (
                    <details
                      key={section.title}
                      open={index === 0}
                      className="rounded-xl border border-surface-sunken bg-surface-muted/60 px-4 py-3"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-text-primary title-shadow">
                        {section.title}
                      </summary>
                      <p className="mt-2 text-sm text-text-secondary">{section.description}</p>
                      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-text-secondary">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
                <div className="mt-5 border-t border-surface-sunken pt-4">
                  <h3 className="text-base font-semibold text-text-primary title-shadow">
                    {t('offline.title', 'Offline workflow')}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('offline.description', 'Every feature works without a connection.')}
                  </p>
                  <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-text-secondary">
                    {offlineSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs text-text-muted">
                    {t('offline.footer', 'Backups stay on-device unless you export or share them.')}
                  </p>
                </div>
                <div className="mt-5 border-t border-surface-sunken pt-4">
                  <h3 className="text-base font-semibold text-text-primary title-shadow">
                    {t('documentation.title', 'Documentation')}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t(
                      'documentation.subtitle',
                      'Key safety behaviors are automatic, with manual controls when you need them.'
                    )}
                  </p>
                  <div className="mt-3 grid gap-3">
                    {documentationSections.map((section) => (
                      <div
                        key={section.title}
                        className="rounded-xl border border-surface-sunken bg-surface-muted/60 px-4 py-3"
                      >
                        <h4 className="text-sm font-semibold text-text-primary title-shadow">
                          {section.title}
                        </h4>
                        <p className="mt-1 text-xs text-text-secondary">{section.description}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-text-secondary">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
