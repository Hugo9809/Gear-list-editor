import { useMemo, useRef, useState, useEffect } from 'react';
import { createId, createStorageService } from './data/storage.js';
import {
  createListTranslator,
  createTranslator,
  getInitialLocale,
  storeLocale,
  supportedLocales
} from './i18n/index.js';

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

const buildPrintableHtml = (project, t) => {
  const defaultUnit = t('items.defaultUnit');
  const emptyValue = t('print.emptyValue');
  const getStatusLabel = (status) => {
    const key = `items.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };
  const categoriesHtml = project.categories
    .map((category) => {
      const rows = category.items
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.quantity)}</td>
              <td>${escapeHtml(item.unit || defaultUnit)}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.details)}</td>
              <td>${escapeHtml(getStatusLabel(item.status))}</td>
            </tr>
          `
        )
        .join('');
      return `
        <section>
          <h3>${escapeHtml(category.name)}</h3>
          <table>
            <thead>
              <tr>
                <th>${escapeHtml(t('print.table.quantity'))}</th>
                <th>${escapeHtml(t('print.table.unit'))}</th>
                <th>${escapeHtml(t('print.table.item'))}</th>
                <th>${escapeHtml(t('print.table.details'))}</th>
                <th>${escapeHtml(t('print.table.status'))}</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows || `<tr><td colspan="5">${escapeHtml(t('print.table.noItems'))}</td></tr>`
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
        <title>${escapeHtml(project.name)} - ${escapeHtml(t('print.titleSuffix'))}</title>
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
          <h1>${escapeHtml(project.name)}</h1>
          <div class="meta">
            <div><strong>${escapeHtml(t('print.meta.client'))}:</strong> ${escapeHtml(project.client || emptyValue)}</div>
            <div><strong>${escapeHtml(t('print.meta.date'))}:</strong> ${escapeHtml(project.shootDate || emptyValue)}</div>
            <div><strong>${escapeHtml(t('print.meta.location'))}:</strong> ${escapeHtml(project.location || emptyValue)}</div>
            <div><strong>${escapeHtml(t('print.meta.contact'))}:</strong> ${escapeHtml(project.contact || emptyValue)}</div>
          </div>
        </header>
        ${categoriesHtml}
        <div class="notes">
          <strong>${escapeHtml(t('print.projectNotesLabel'))}</strong> ${escapeHtml(project.notes || t('print.projectNotesEmpty'))}
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
  unitFallback,
  detailsFallback
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
          className={`absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950 text-left text-sm text-slate-200 shadow-xl ${
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
              className="flex w-full flex-col gap-1 px-3 py-2 text-left transition hover:bg-slate-800"
            >
              <span className="font-medium text-white">{suggestion.name}</span>
              <span className="text-xs text-slate-400">
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
  const [locale, setLocale] = useState(getInitialLocale);
  const t = useMemo(() => createTranslator(locale), [locale]);
  const tList = useMemo(() => createListTranslator(locale), [locale]);
  const tRef = useRef(t);
  const localeInitialized = useRef(false);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState({ items: [], categories: [] });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [status, setStatus] = useState(() => t('status.loading'));
  const [isHydrated, setIsHydrated] = useState(false);
  const [projectDraft, setProjectDraft] = useState(emptyProjectDraft);
  const [templateDraft, setTemplateDraft] = useState(emptyTemplateDraft);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDrafts, setItemDrafts] = useState({});
  const [activeHelpView, setActiveHelpView] = useState('overview');
  const fileInputRef = useRef(null);
  const storageRef = useRef(null);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    storeLocale(locale);
    if (localeInitialized.current) {
      setStatus(t('status.languageUpdated'));
    }
    localeInitialized.current = true;
  }, [locale, t]);

  const formatCount = (key, count) =>
    count === 1 ? t(`counts.${key}.one`, { count }) : t(`counts.${key}.other`, { count });

  const translateWarning = (message) => {
    const translate = tRef.current;
    const translations = {
      'Autosave encountered a storage error.': translate('status.autosaveError'),
      'Autosave encountered a storage error. Your data is still safe in memory.': translate(
        'status.autosaveErrorMemory'
      ),
      'Some storage locations could not be updated. Your latest data is still preserved in other backups.':
        translate('status.storagePartial'),
      'IndexedDB was unavailable. Checking device backups instead.': translate(
        'status.indexedDbUnavailable'
      ),
      'Import failed. Please choose a valid backup file.': translate('status.importFailed'),
      'No device backup was found yet.': translate('status.noDeviceBackup'),
      'Payload is missing or invalid.': translate('status.payloadInvalid'),
      'Projects must be an array.': translate('status.projectsInvalid'),
      'Templates must be an array.': translate('status.templatesInvalid'),
      'History must be an object when provided.': translate('status.historyInvalid'),
      'Version must be numeric when provided.': translate('status.versionInvalid')
    };
    return translations[message] || message;
  };

  if (!storageRef.current) {
    storageRef.current = createStorageService({
      onSaved: (payload, { reason, warnings }) => {
        setLastSaved(payload.lastSaved);
        if (warnings?.length) {
          setStatus(translateWarning(warnings[0]));
          return;
        }
        if (reason === 'autosave') {
          setStatus(tRef.current('status.autosaveComplete'));
        } else if (reason === 'explicit') {
          setStatus(tRef.current('status.savedExplicit'));
        } else if (reason === 'rehydrate') {
          setStatus(tRef.current('status.rehydrate'));
        }
      },
      onWarning: (message) => setStatus(translateWarning(message))
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
      if (result.warnings.length > 0) {
        setStatus(translateWarning(result.warnings[0]));
      } else {
        setStatus(
          result.source === 'Empty'
            ? tRef.current('status.noData')
            : tRef.current('status.loadedFrom', { source: result.source })
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
    if (!isHydrated) {
      return;
    }
    storageRef.current.scheduleAutosave({
      projects,
      templates,
      history,
      activeProjectId,
      lastSaved
    });
  }, [projects, templates, history, activeProjectId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProjectId, isHydrated, projects]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0] || null,
    [projects, activeProjectId]
  );

  const itemSuggestions = useMemo(() => history.items || [], [history.items]);

  const rememberItem = (item) => {
    const name = item.name.trim();
    if (!name) {
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
    if (!trimmed) {
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
      setStatus(t('status.needProjectName'));
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
    setProjectDraft(emptyProjectDraft);
    setStatus(t('status.projectCreated'));
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => {
      const remaining = prev.filter((project) => project.id !== projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(remaining[0]?.id || null);
      }
      return remaining;
    });
    setStatus(t('status.projectArchived'));
  };

  const addCategory = (event) => {
    event.preventDefault();
    if (!activeProject) {
      setStatus(t('status.needProjectBeforeCategory'));
      return;
    }
    const name = newCategoryName.trim();
    if (!name) {
      setStatus(t('status.needCategoryName'));
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
    setStatus(t('status.categoryAdded'));
  };

  const addItemToCategory = (event, categoryId) => {
    event.preventDefault();
    if (!activeProject) {
      return;
    }
    const draft = itemDrafts[categoryId] || emptyItemDraft;
    const name = draft.name.trim();
    if (!name) {
      setStatus(t('status.needItemName'));
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
    setStatus(t('status.itemAdded'));
  };

  const removeCategory = (categoryId) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      categories: project.categories.filter((category) => category.id !== categoryId)
    }));
    setStatus(t('status.categoryRemoved'));
  };

  const removeItem = (categoryId, itemId) => {
    if (!activeProject) {
      return;
    }
    updateCategory(activeProject.id, categoryId, (category) => ({
      ...category,
      items: category.items.filter((item) => item.id !== itemId)
    }));
    setStatus(t('status.itemRemoved'));
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
    setStatus(t('status.changesQueued'));
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
    setStatus(t('status.categoryUpdated'));
  };

  const updateProjectField = (field, value) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      [field]: value
    }));
    setStatus(t('status.projectUpdated'));
  };

  const updateProjectNotes = (value) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      notes: value
    }));
    setStatus(t('status.projectNotesSaved'));
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
    setStatus(t('status.suggestionApplied'));
  };

  const saveTemplateFromProject = (event) => {
    event.preventDefault();
    if (!activeProject) {
      setStatus(t('status.needProjectBeforeTemplate'));
      return;
    }
    const name = templateDraft.name.trim();
    if (!name) {
      setStatus(t('status.needTemplateName'));
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
    setStatus(t('status.templateSaved'));
  };

  const applyTemplateToProject = (templateId) => {
    if (!activeProject) {
      setStatus(t('status.selectProjectForTemplate'));
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
    setStatus(t('status.templateApplied'));
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
    setStatus(t('status.templateUpdated'));
  };

  const removeTemplate = (templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
    setStatus(t('status.templateRemoved'));
  };

  const exportPdf = () => {
    if (!activeProject) {
      setStatus(t('status.selectProjectForExport'));
      return;
    }
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      setStatus(t('status.popupBlocked'));
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildPrintableHtml(activeProject, t));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatus(t('status.pdfReady'));
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
    setStatus(t('status.backupDownloaded'));
  };

  const restoreFromDeviceBackup = async () => {
    const result = await storageRef.current.restoreFromBackup();
    setProjects(result.state.projects);
    setTemplates(result.state.templates);
    setHistory(result.state.history);
    setActiveProjectId(result.state.activeProjectId);
    setLastSaved(result.state.lastSaved);
    if (result.warnings.length > 0) {
      setStatus(translateWarning(result.warnings[0]));
      return;
    }
    setStatus(t('status.restoredFrom', { source: result.source }));
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
        setStatus(translateWarning(warnings[0]));
      } else {
        setStatus(t('status.importComplete'));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const saveNow = async () => {
    const result = await storageRef.current.saveNow({
      projects,
      templates,
      history,
      activeProjectId,
      lastSaved
    });
    if (result?.warnings?.length) {
      setStatus(result.warnings[0]);
    }
  };

  const shareData = async () => {
    const { json } = storageRef.current.exportBackup({
      projects,
      templates,
      history,
      activeProjectId,
      lastSaved
    });
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(json);
        setStatus(t('status.clipboardCopied'));
        return;
      } catch {
        setStatus(t('status.clipboardBlocked'));
      }
    } else {
      setStatus(t('status.clipboardUnavailable'));
    }
  };

  const statusClasses = status
    ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    : 'border border-slate-800 bg-slate-900/40 text-slate-400';

  const totals = useMemo(() => {
    if (!activeProject) {
      return { items: 0, categories: 0 };
    }
    const categories = activeProject.categories.length;
    const items = activeProject.categories.reduce((sum, category) => sum + category.items.length, 0);
    return { categories, items };
  }, [activeProject]);

  const helpTabs = useMemo(
    () => [
      { id: 'overview', label: t('help.tabs.overview') },
      { id: 'offline', label: t('help.tabs.offline') },
      { id: 'backups', label: t('help.tabs.backups') },
      { id: 'sharing', label: t('help.tabs.sharing') }
    ],
    [t]
  );

  const helpViews = useMemo(
    () => ({
      overview: {
        title: t('help.views.overview.title'),
        description: t('help.views.overview.description'),
        bullets: tList('help.views.overview.bullets')
      },
      offline: {
        title: t('help.views.offline.title'),
        description: t('help.views.offline.description'),
        bullets: tList('help.views.offline.bullets')
      },
      backups: {
        title: t('help.views.backups.title'),
        description: t('help.views.backups.description'),
        bullets: tList('help.views.backups.bullets')
      },
      sharing: {
        title: t('help.views.sharing.title'),
        description: t('help.views.sharing.description'),
        bullets: tList('help.views.sharing.bullets')
      }
    }),
    [t, tList]
  );

  const activeHelpContent = helpViews[activeHelpView] || helpViews.overview;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('app.kicker')}</p>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <h1 className="text-3xl font-semibold text-white">{t('app.tagline')}</h1>
            <p className="max-w-3xl text-base text-slate-300">
              {t('app.intro')}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  {t('app.badges.autosave')}
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  {t('app.badges.dashboard')}
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  {t('app.badges.templateLibrary')}
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  {t('app.badges.pdfExport')}
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                <span>{t('language.label')}</span>
                <select
                  value={locale}
                  onChange={(event) => setLocale(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  {supportedLocales.map((value) => (
                    <option key={value} value={value}>
                      {t(`language.options.${value}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            <form
              onSubmit={addProject}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-white">{t('projects.dashboardTitle')}</h2>
                <p className="text-sm text-slate-400">
                  {t('projects.dashboardDescription')}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  {t('projects.form.projectName')}
                  <input
                    value={projectDraft.name}
                    onChange={(event) => setProjectDraft((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder={t('projects.form.projectNamePlaceholder')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  {t('projects.form.client')}
                  <input
                    value={projectDraft.client}
                    onChange={(event) => setProjectDraft((prev) => ({ ...prev, client: event.target.value }))}
                    placeholder={t('projects.form.clientPlaceholder')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  {t('projects.form.shootDate')}
                  <input
                    type="date"
                    value={projectDraft.shootDate}
                    onChange={(event) =>
                      setProjectDraft((prev) => ({ ...prev, shootDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  {t('projects.form.location')}
                  <input
                    value={projectDraft.location}
                    onChange={(event) => setProjectDraft((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder={t('projects.form.locationPlaceholder')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
                  {t('projects.form.contact')}
                  <input
                    value={projectDraft.contact}
                    onChange={(event) => setProjectDraft((prev) => ({ ...prev, contact: event.target.value }))}
                    placeholder={t('projects.form.contactPlaceholder')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                {t('projects.form.createButton')}
              </button>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('projects.listTitle')}</h2>
                  <p className="text-sm text-slate-400">
                    {t('projects.stored', {
                      countLabel: formatCount('projects', projects.length)
                    })}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {t('projects.lastSaved', {
                    date: lastSaved ? new Date(lastSaved).toLocaleString() : t('projects.notSavedYet')
                  })}
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {projects.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500 md:col-span-2">
                    {t('projects.empty')}
                  </div>
                ) : (
                  projects.map((project) => {
                    const isActive = project.id === activeProject?.id;
                    const itemTotal = project.categories.reduce(
                      (sum, category) => sum + category.items.length,
                      0
                    );
                    const categoryLabel = formatCount('categories', project.categories.length);
                    const itemLabel = formatCount('items', itemTotal);
                    return (
                      <div
                        key={project.id}
                        className={`flex flex-col gap-3 rounded-xl border p-4 transition ${
                          isActive
                            ? 'border-emerald-500/60 bg-emerald-500/10'
                            : 'border-slate-800 bg-slate-950/60'
                        }`}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                          <p className="text-xs text-slate-400">
                            {project.client || t('projects.card.clientMissing')} ·{' '}
                            {project.shootDate || t('projects.card.dateMissing')}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500">
                          {categoryLabel} · {itemLabel}
                        </div>
                        <div className="mt-auto flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveProjectId(project.id)}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                              isActive
                                ? 'bg-emerald-500 text-emerald-950'
                                : 'border border-slate-700 text-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            {isActive ? t('projects.card.active') : t('projects.card.open')}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProject(project.id)}
                            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-rose-500 hover:text-rose-200"
                          >
                            {t('projects.card.archive')}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('projects.workspace.title')}</h2>
                  <p className="text-sm text-slate-400">
                    {activeProject
                      ? t('projects.workspace.summary', {
                          categoriesLabel: formatCount('categories', totals.categories),
                          itemsLabel: formatCount('items', totals.items)
                        })
                      : t('projects.workspace.noSelection')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportPdf}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                >
                  {t('projects.workspace.exportPdf')}
                </button>
              </div>

              {activeProject ? (
                <div className="mt-6 flex flex-col gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      {t('projects.form.projectName')}
                      <input
                        value={activeProject.name}
                        onChange={(event) => updateProjectField('name', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      {t('projects.form.client')}
                      <input
                        value={activeProject.client}
                        onChange={(event) => updateProjectField('client', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      {t('projects.form.shootDate')}
                      <input
                        type="date"
                        value={activeProject.shootDate}
                        onChange={(event) => updateProjectField('shootDate', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      {t('projects.form.location')}
                      <input
                        value={activeProject.location}
                        onChange={(event) => updateProjectField('location', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
                      {t('projects.form.contact')}
                      <input
                        value={activeProject.contact}
                        onChange={(event) => updateProjectField('contact', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                  </div>

                  <form
                    onSubmit={addCategory}
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{t('projects.workspace.categoriesTitle')}</h3>
                      <span className="text-xs text-slate-500">{t('projects.workspace.categoriesHint')}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <input
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        placeholder={t('projects.workspace.addCategoryPlaceholder')}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                      >
                        {t('projects.workspace.addCategoryButton')}
                      </button>
                    </div>
                  </form>

                  <div className="flex flex-col gap-4">
                    {activeProject.categories.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500">
                        {t('projects.workspace.noCategories')}
                      </div>
                    ) : (
                      activeProject.categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex flex-1 flex-col gap-3">
                              <input
                                value={category.name}
                                onChange={(event) =>
                                  updateCategoryField(category.id, 'name', event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                              />
                              <textarea
                                value={category.notes}
                                onChange={(event) =>
                                  updateCategoryField(category.id, 'notes', event.target.value)
                                }
                                placeholder={t('projects.workspace.categoryNotesPlaceholder')}
                                rows={2}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCategory(category.id)}
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-rose-500 hover:text-rose-200"
                            >
                              {t('projects.workspace.removeCategoryButton')}
                            </button>
                          </div>

                          <form
                            onSubmit={(event) => addItemToCategory(event, category.id)}
                            className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 md:grid-cols-[2fr_1fr_1fr_2fr_auto]"
                          >
                            <TypeaheadInput
                              value={(itemDrafts[category.id] || emptyItemDraft).name}
                              onChange={(value) => updateDraftItem(category.id, 'name', value)}
                              onSelectSuggestion={(suggestion) =>
                                applySuggestionToDraft(category.id, suggestion)
                              }
                              suggestions={itemSuggestions}
                              placeholder={t('items.fields.name')}
                              label={t('items.fields.name')}
                              unitFallback={t('items.defaultUnit')}
                              detailsFallback={t('items.noDetails')}
                              inputClassName="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                            />
                            <input
                              type="number"
                              min="1"
                              value={(itemDrafts[category.id] || emptyItemDraft).quantity}
                              onChange={(event) => updateDraftItem(category.id, 'quantity', event.target.value)}
                              aria-label={t('items.fields.quantity')}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                            />
                            <input
                              value={(itemDrafts[category.id] || emptyItemDraft).unit}
                              onChange={(event) => updateDraftItem(category.id, 'unit', event.target.value)}
                              placeholder={t('items.fields.unit')}
                              aria-label={t('items.fields.unit')}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                            />
                            <input
                              value={(itemDrafts[category.id] || emptyItemDraft).details}
                              onChange={(event) => updateDraftItem(category.id, 'details', event.target.value)}
                              placeholder={t('items.fields.details')}
                              aria-label={t('items.fields.details')}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                            >
                              {t('items.addButton')}
                            </button>
                          </form>

                          <div className="flex flex-col gap-3">
                            {category.items.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-4 text-center text-xs text-slate-500">
                                {t('projects.workspace.itemsEmpty')}
                              </div>
                            ) : (
                              category.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 md:grid-cols-[2fr_1fr_1fr_2fr_1fr_auto]"
                                >
                                  <TypeaheadInput
                                    value={item.name}
                                    onChange={(value) =>
                                      updateItemField(category.id, item.id, 'name', value)
                                    }
                                    onSelectSuggestion={(suggestion) =>
                                      applySuggestionToItem(category.id, item.id, suggestion)
                                    }
                                    suggestions={itemSuggestions}
                                    placeholder={t('items.fields.name')}
                                    label={t('items.fields.name')}
                                    unitFallback={t('items.defaultUnit')}
                                    detailsFallback={t('items.noDetails')}
                                    inputClassName="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'quantity', event.target.value)
                                    }
                                    aria-label={t('items.fields.quantity')}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    value={item.unit}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'unit', event.target.value)
                                    }
                                    aria-label={t('items.fields.unit')}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    value={item.details}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'details', event.target.value)
                                    }
                                    aria-label={t('items.fields.details')}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <select
                                    value={item.status}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'status', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  >
                                    <option value="needed">{t('items.status.needed')}</option>
                                    <option value="packed">{t('items.status.packed')}</option>
                                    <option value="missing">{t('items.status.missing')}</option>
                                    <option value="rented">{t('items.status.rented')}</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(category.id, item.id)}
                                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-rose-500 hover:text-rose-200"
                                  >
                                    {t('items.removeButton')}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <h3 className="text-lg font-semibold text-white">{t('projects.workspace.projectNotesTitle')}</h3>
                    <p className="text-sm text-slate-400">
                      {t('projects.workspace.projectNotesDescription')}
                    </p>
                    <textarea
                      value={activeProject.notes}
                      onChange={(event) => updateProjectNotes(event.target.value)}
                      placeholder={t('projects.workspace.projectNotesPlaceholder')}
                      rows={4}
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500">
                  {t('projects.workspace.empty')}
                </div>
              )}
            </div>

            <form
              onSubmit={saveTemplateFromProject}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-white">{t('templates.title')}</h2>
                <p className="text-sm text-slate-400">
                  {t('templates.description')}
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  {t('templates.form.name')}
                  <input
                    value={templateDraft.name}
                    onChange={(event) => setTemplateDraft((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder={t('templates.form.namePlaceholder')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  {t('templates.form.description')}
                  <input
                    value={templateDraft.description}
                    onChange={(event) =>
                      setTemplateDraft((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder={t('templates.form.descriptionPlaceholder')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                {t('templates.form.saveButton')}
              </button>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {templates.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500 md:col-span-2">
                    {t('templates.empty')}
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
                        {t('templates.card.nameLabel')}
                        <input
                          value={template.name}
                          onChange={(event) =>
                            updateTemplateField(template.id, 'name', event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
                        {t('templates.card.descriptionLabel')}
                        <input
                          value={template.description}
                          onChange={(event) =>
                            updateTemplateField(template.id, 'description', event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                      <div className="text-xs text-slate-500">
                        {t('templates.card.meta', {
                          categoriesLabel: formatCount('categories', template.categories.length),
                          date: template.lastUsed
                            ? new Date(template.lastUsed).toLocaleDateString()
                            : t('templates.card.never')
                        })}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyTemplateToProject(template.id)}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                        >
                          {t('templates.card.applyButton')}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTemplate(template.id)}
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-500 hover:text-rose-200"
                        >
                          {t('templates.card.removeButton')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </form>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-lg font-semibold text-white">{t('sidebar.saveShareTitle')}</h2>
              <p className="text-sm text-slate-400">
                {t('sidebar.saveShareDescription')}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={saveNow}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                >
                  {t('sidebar.saveNow')}
                </button>
                <button
                  type="button"
                  onClick={downloadBackup}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                >
                  {t('sidebar.downloadBackup')}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  {t('sidebar.importBackup')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
                <button
                  type="button"
                  onClick={restoreFromDeviceBackup}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  {t('sidebar.restoreBackup')}
                </button>
                <button
                  type="button"
                  onClick={shareData}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  {t('sidebar.shareClipboard')}
                </button>
              </div>
            </div>

            <div className={`rounded-2xl p-4 text-sm ${statusClasses}`} aria-live="polite">
              {status || t('sidebar.statusPlaceholder')}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{t('help.title')}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {helpTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveHelpView(tab.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        activeHelpView === tab.id
                          ? 'border-emerald-400 bg-emerald-400/20 text-emerald-100'
                          : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <h3 className="text-base font-semibold text-white">{activeHelpContent.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{activeHelpContent.description}</p>
                  <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-slate-300">
                    {activeHelpContent.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
