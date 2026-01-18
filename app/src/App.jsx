import { useMemo, useRef, useState, useEffect } from 'react';
import { createId, createStorageService } from './data/storage.js';
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

const buildPrintableHtml = (project) => {
  const categoriesHtml = project.categories
    .map((category) => {
      const rows = category.items
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.quantity)}</td>
              <td>${escapeHtml(item.unit || 'pcs')}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.details)}</td>
              <td>${escapeHtml(item.status)}</td>
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
                <th>Qty</th>
                <th>Unit</th>
                <th>Item</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="5">No items listed.</td></tr>'}
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
        <title>${escapeHtml(project.name)} - Gear List</title>
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
            <div><strong>Client:</strong> ${escapeHtml(project.client || '—')}</div>
            <div><strong>Date:</strong> ${escapeHtml(project.shootDate || '—')}</div>
            <div><strong>Location:</strong> ${escapeHtml(project.location || '—')}</div>
            <div><strong>Contact:</strong> ${escapeHtml(project.contact || '—')}</div>
          </div>
        </header>
        ${categoriesHtml}
        <div class="notes">
          <strong>Project notes:</strong> ${escapeHtml(project.notes || 'No notes added.')}
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
  label
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
                {suggestion.unit || 'pcs'} · {suggestion.details || 'No details saved'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState({ items: [], categories: [] });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [theme, setTheme] = useState('light');
  const [status, setStatus] = useState('Loading your saved gear list...');
  const [isHydrated, setIsHydrated] = useState(false);
  const [projectDraft, setProjectDraft] = useState(emptyProjectDraft);
  const [templateDraft, setTemplateDraft] = useState(emptyTemplateDraft);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDrafts, setItemDrafts] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const fileInputRef = useRef(null);
  const storageRef = useRef(null);
  const { locale, locales, setLocale, t } = useI18n();

  if (!storageRef.current) {
    storageRef.current = createStorageService({
      onSaved: (payload, { reason, warnings }) => {
        setLastSaved(payload.lastSaved);
        if (warnings?.length) {
          setStatus(warnings[0]);
          return;
        }
        if (reason === 'autosave') {
          setStatus('Autosave complete. Your project dashboard is safe.');
        } else if (reason === 'explicit') {
          setStatus('Saved safely to device storage and backups.');
        } else if (reason === 'rehydrate') {
          setStatus('Storage repaired and redundancies refreshed.');
        }
      },
      onWarning: (message) => setStatus(message)
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
        setStatus(result.warnings[0]);
      } else {
        setStatus(
          result.source === 'Empty'
            ? 'No saved data yet. Start a project and autosave will protect it.'
            : `Loaded safely from ${result.source}.`
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
      setStatus('Please name the project before creating it.');
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
    setStatus('New project created and protected by autosave.');
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => {
      const remaining = prev.filter((project) => project.id !== projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(remaining[0]?.id || null);
      }
      return remaining;
    });
    setStatus('Project archived. Backups remain intact.');
  };

  const addCategory = (event) => {
    event.preventDefault();
    if (!activeProject) {
      setStatus('Create a project before adding categories.');
      return;
    }
    const name = newCategoryName.trim();
    if (!name) {
      setStatus('Please name the category before adding it.');
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
    setStatus('Category added.');
  };

  const addItemToCategory = (event, categoryId) => {
    event.preventDefault();
    if (!activeProject) {
      return;
    }
    const draft = itemDrafts[categoryId] || emptyItemDraft;
    const name = draft.name.trim();
    if (!name) {
      setStatus('Please provide an item name before adding.');
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
    setStatus('Item added. Autosave will secure it immediately.');
  };

  const removeCategory = (categoryId) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      categories: project.categories.filter((category) => category.id !== categoryId)
    }));
    setStatus('Category removed.');
  };

  const removeItem = (categoryId, itemId) => {
    if (!activeProject) {
      return;
    }
    updateCategory(activeProject.id, categoryId, (category) => ({
      ...category,
      items: category.items.filter((item) => item.id !== itemId)
    }));
    setStatus('Item removed. Backups remain available.');
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
    setStatus('Changes queued for autosave.');
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
    setStatus('Category updated.');
  };

  const updateProjectField = (field, value) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      [field]: value
    }));
    setStatus('Project details updated.');
  };

  const updateProjectNotes = (value) => {
    if (!activeProject) {
      return;
    }
    updateProject(activeProject.id, (project) => ({
      ...project,
      notes: value
    }));
    setStatus('Project notes saved for autosave.');
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
    setStatus('Suggestion applied and ready for autosave.');
  };

  const saveTemplateFromProject = (event) => {
    event.preventDefault();
    if (!activeProject) {
      setStatus('Create a project before saving a template.');
      return;
    }
    const name = templateDraft.name.trim();
    if (!name) {
      setStatus('Please name the template.');
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
    setStatus('Template saved from the current project.');
  };

  const applyTemplateToProject = (templateId) => {
    if (!activeProject) {
      setStatus('Select a project before applying a template.');
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
    setStatus('Template applied. Autosave will secure the updated list.');
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
    setStatus('Template updated.');
  };

  const removeTemplate = (templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
    setStatus('Template removed.');
  };

  const exportPdf = () => {
    if (!activeProject) {
      setStatus('Select a project before exporting.');
      return;
    }
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      setStatus('Popup blocked. Please allow popups for PDF export.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildPrintableHtml(activeProject));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatus('PDF export ready. Confirm printing to save the file.');
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
    setStatus('Backup downloaded. Store it somewhere safe.');
  };

  const restoreFromDeviceBackup = async () => {
    const result = await storageRef.current.restoreFromBackup();
    setProjects(result.state.projects);
    setTemplates(result.state.templates);
    setHistory(result.state.history);
    setActiveProjectId(result.state.activeProjectId);
    setLastSaved(result.state.lastSaved);
    if (result.warnings.length > 0) {
      setStatus(result.warnings[0]);
      return;
    }
    setStatus(`Restored from ${result.source}.`);
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
        setStatus(warnings[0]);
      } else {
        setStatus('Import complete. Existing data was preserved.');
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
        setStatus('Copied your gear list to the clipboard for sharing.');
        return;
      } catch {
        setStatus('Clipboard access was blocked. Use the download backup option instead.');
      }
    } else {
      setStatus('Clipboard sharing is not available. Use the download backup option instead.');
    }
  };

  const handleLocaleChange = (event) => {
    const nextLocale = event.target.value;
    setLocale(nextLocale);
    setStatus(
      translate(
        getDictionary(nextLocale),
        'language.status',
        'Language updated and saved locally.'
      )
    );
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

  const helpSections = t('help.sections', []);
  const documentationSections = t('documentation.sections', []);
  const offlineSteps = t('offline.steps', []);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', description: 'Project overview and creation' },
    { id: 'project', label: 'Project', description: 'Active project editing' },
    { id: 'templates', label: 'Templates', description: 'Reusable gear setups' },
    { id: 'help', label: 'Help', description: 'Offline guidance and documentation' }
  ];
  const themeOptions = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'pink', label: 'Pink' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row">
        <aside className="flex w-full flex-col gap-6 lg:sticky lg:top-6 lg:h-fit lg:max-w-xs">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Gear List Editor</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">Cine-ready gear planning.</h1>
            <p className="mt-2 text-sm text-slate-300">
              Every edit autosaves locally with redundant backups for offline safety.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
                    activeTab === tab.id
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <span className="text-sm font-semibold">{tab.label}</span>
                  <span className="text-xs text-slate-500">{tab.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-sm font-semibold text-white">{t('language.label', 'Language')}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {t('language.helper', 'Saved locally for offline use.')}
            </p>
            <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">
              <span className="text-slate-400">Locale</span>
              <select
                value={locale}
                onChange={handleLocaleChange}
                className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
              >
                {locales.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-sm font-semibold text-white">Theme</h2>
            <p className="mt-1 text-xs text-slate-400">Choose a viewing mode that fits your set.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    theme === option.id
                      ? 'bg-emerald-500 text-emerald-950'
                      : 'border border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">Save, share, restore</h2>
            <p className="text-sm text-slate-400">
              Your data stays on-device. Save immediately, create offline backups, and restore if you ever
              switch devices.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={saveNow}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                Save now
              </button>
              <button
                type="button"
                onClick={downloadBackup}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                Download backup
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              >
                Import backup file
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
                Restore from device backup
              </button>
              <button
                type="button"
                onClick={shareData}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              >
                Share via clipboard
              </button>
            </div>
          </div>

          <div className={`rounded-2xl p-4 text-sm ${statusClasses}`} aria-live="polite">
            {status || 'Status updates appear here to confirm data safety.'}
          </div>
        </aside>

        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
                <h1 className="text-3xl font-semibold text-white">
                  Project-ready gear lists with offline protection.
                </h1>
                <p className="max-w-3xl text-base text-slate-300">
                  Build equipment lists that match your production PDFs. Create projects, reuse templates,
                  and export print-ready gear lists without leaving offline mode. Every edit is saved
                  locally with redundant backups.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span className="rounded-full border border-slate-700 px-3 py-1">Autosave active</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">Project dashboard</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">Template library</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">PDF export ready</span>
                </div>
              </header>

              <form
                onSubmit={addProject}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-white">Project dashboard</h2>
                  <p className="text-sm text-slate-400">
                    Track multiple productions and always know which list is active. New projects are
                    autosaved the moment they are created.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    Project name
                    <input
                      value={projectDraft.name}
                      onChange={(event) =>
                        setProjectDraft((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="e.g. October studio shoot"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    Client / production
                    <input
                      value={projectDraft.client}
                      onChange={(event) =>
                        setProjectDraft((prev) => ({ ...prev, client: event.target.value }))
                      }
                      placeholder="Client, agency, or show"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    Shoot date
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
                    Location
                    <input
                      value={projectDraft.location}
                      onChange={(event) =>
                        setProjectDraft((prev) => ({ ...prev, location: event.target.value }))
                      }
                      placeholder="Studio, city, or venue"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
                    Lead contact
                    <input
                      value={projectDraft.contact}
                      onChange={(event) =>
                        setProjectDraft((prev) => ({ ...prev, contact: event.target.value }))
                      }
                      placeholder="Producer or department contact"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                >
                  Create project
                </button>
              </form>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Active projects</h2>
                    <p className="text-sm text-slate-400">
                      {projects.length} project{projects.length === 1 ? '' : 's'} stored locally.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Last saved: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Not saved yet'}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {projects.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500 md:col-span-2">
                      No projects yet. Create your first project to begin building a gear list.
                    </div>
                  ) : (
                    projects.map((project) => {
                      const isActive = project.id === activeProject?.id;
                      const itemTotal = project.categories.reduce(
                        (sum, category) => sum + category.items.length,
                        0
                      );
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
                              {project.client || 'Client not set'} · {project.shootDate || 'Date not set'}
                            </p>
                          </div>
                          <div className="text-xs text-slate-500">
                            {project.categories.length} categories · {itemTotal} items
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
                              {isActive ? 'Active' : 'Open'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProject(project.id)}
                              className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-rose-500 hover:text-rose-200"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'project' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Active project workspace</h2>
                  <p className="text-sm text-slate-400">
                    {activeProject
                      ? `${totals.categories} categories · ${totals.items} items`
                      : 'Select a project to start editing.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportPdf}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                >
                  Export PDF
                </button>
              </div>

              {activeProject ? (
                <div className="mt-6 flex flex-col gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      Project name
                      <input
                        value={activeProject.name}
                        onChange={(event) => updateProjectField('name', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      Client / production
                      <input
                        value={activeProject.client}
                        onChange={(event) => updateProjectField('client', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      Shoot date
                      <input
                        type="date"
                        value={activeProject.shootDate}
                        onChange={(event) => updateProjectField('shootDate', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300">
                      Location
                      <input
                        value={activeProject.location}
                        onChange={(event) => updateProjectField('location', event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-2">
                      Lead contact
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
                      <h3 className="text-lg font-semibold text-white">Categories</h3>
                      <span className="text-xs text-slate-500">Use templates for faster setups.</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <input
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        placeholder="Add a category (e.g. Camera, Lighting)"
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                      >
                        Add category
                      </button>
                    </div>
                  </form>

                  <div className="flex flex-col gap-4">
                    {activeProject.categories.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500">
                        No categories yet. Add one above or apply a template.
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
                                placeholder="Category notes or rental references"
                                rows={2}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCategory(category.id)}
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-rose-500 hover:text-rose-200"
                            >
                              Remove category
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
                              placeholder="Item name"
                              label="Item name"
                              inputClassName="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                            />
                            <input
                              type="number"
                              min="1"
                              value={(itemDrafts[category.id] || emptyItemDraft).quantity}
                              onChange={(event) =>
                                updateDraftItem(category.id, 'quantity', event.target.value)
                              }
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                            />
                            <input
                              value={(itemDrafts[category.id] || emptyItemDraft).unit}
                              onChange={(event) => updateDraftItem(category.id, 'unit', event.target.value)}
                              placeholder="Unit"
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                            />
                            <input
                              value={(itemDrafts[category.id] || emptyItemDraft).details}
                              onChange={(event) =>
                                updateDraftItem(category.id, 'details', event.target.value)
                              }
                              placeholder="Details / notes"
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                            >
                              Add
                            </button>
                          </form>

                          <div className="flex flex-col gap-3">
                            {category.items.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-4 text-center text-xs text-slate-500">
                                No items yet. Add the first item above.
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
                                    placeholder="Item name"
                                    label="Item name"
                                    inputClassName="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'quantity', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    value={item.unit}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'unit', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <input
                                    value={item.details}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'details', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  />
                                  <select
                                    value={item.status}
                                    onChange={(event) =>
                                      updateItemField(category.id, item.id, 'status', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                                  >
                                    <option value="needed">Needed</option>
                                    <option value="packed">Packed</option>
                                    <option value="missing">Missing</option>
                                    <option value="rented">Rented</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(category.id, item.id)}
                                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-rose-500 hover:text-rose-200"
                                  >
                                    Remove
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
                    <h3 className="text-lg font-semibold text-white">Project notes</h3>
                    <p className="text-sm text-slate-400">
                      Notes appear in exports and are included in backups for every project.
                    </p>
                    <textarea
                      value={activeProject.notes}
                      onChange={(event) => updateProjectNotes(event.target.value)}
                      placeholder="Crew notes, pickup info, or return instructions"
                      rows={4}
                      className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500">
                  Select or create a project to unlock the gear list editor.
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <form
              onSubmit={saveTemplateFromProject}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-white">Template management</h2>
                <p className="text-sm text-slate-400">
                  Save reusable setups for recurring shoots. Templates can be applied to any project without
                  overwriting existing data.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Template name
                  <input
                    value={templateDraft.name}
                    onChange={(event) => setTemplateDraft((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="e.g. Standard documentary kit"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Description
                  <input
                    value={templateDraft.description}
                    onChange={(event) =>
                      setTemplateDraft((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Key details or usage"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                Save current project as template
              </button>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {templates.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center text-sm text-slate-500 md:col-span-2">
                    No templates yet. Save the active project to build your library.
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
                        Name
                        <input
                          value={template.name}
                          onChange={(event) =>
                            updateTemplateField(template.id, 'name', event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
                        Description
                        <input
                          value={template.description}
                          onChange={(event) =>
                            updateTemplateField(template.id, 'description', event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                      <div className="text-xs text-slate-500">
                        {template.categories.length} categories · Last used{' '}
                        {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyTemplateToProject(template.id)}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                        >
                          Apply to active project
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTemplate(template.id)}
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-500 hover:text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </form>
          )}

          {activeTab === 'help' && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    {t('help.title', 'Help & documentation')}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {t('help.subtitle', 'Offline-first guidance for safe gear lists.')}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {helpSections.map((section, index) => (
                    <details
                      key={section.title}
                      open={index === 0}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-slate-100">
                        {section.title}
                      </summary>
                      <p className="mt-2 text-sm text-slate-400">{section.description}</p>
                      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-300">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-base font-semibold text-white">
                  {t('offline.title', 'Offline workflow')}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {t('offline.description', 'Every feature works without a connection.')}
                </p>
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-slate-300">
                  {offlineSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-slate-500">
                  {t('offline.footer', 'Backups stay on-device unless you export or share them.')}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-base font-semibold text-white">
                  {t('documentation.title', 'Documentation')}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {t(
                    'documentation.subtitle',
                    'Key safety behaviors are automatic, with manual controls when you need them.'
                  )}
                </p>
                <div className="mt-3 grid gap-3">
                  {documentationSections.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <h4 className="text-sm font-semibold text-slate-100">{section.title}</h4>
                      <p className="mt-1 text-xs text-slate-400">{section.description}</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
