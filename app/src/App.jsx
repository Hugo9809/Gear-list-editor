import { useCallback, useMemo, useRef, useState } from 'react';
import { getDictionary, translate, useI18n } from './i18n/index.js';
import HelpPanel from './components/HelpPanel.jsx';
import ProjectDashboard from './components/ProjectDashboard.jsx';
import ProjectWorkspace from './components/ProjectWorkspace.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import TemplateManager from './components/TemplateManager.jsx';
import { useProjects } from './hooks/useProjects.js';
import { useStorageHydration } from './hooks/useStorageHydration.js';
import { useTemplates } from './hooks/useTemplates.js';
import { buildPrintableHtml } from './utils/print.js';

const isDefaultLabelKey = (value) => typeof value === 'string' && value.startsWith('defaults.');

export default function App() {
  const { locale, locales, setLocale, t, tPlural } = useI18n();
  const [status, setStatus] = useState(() =>
    t('status.loading', 'Loading your saved gear list...')
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const fileInputRef = useRef(null);

  const {
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
    itemSuggestions,
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
    rememberItem
  } = useProjects({ t, setStatus });

  const {
    templates,
    setTemplates,
    selectedTemplateId,
    setSelectedTemplateId,
    templateDraft,
    updateTemplateDraftField,
    saveTemplateFromProject,
    handleTemplateSubmit,
    applyTemplateToProject,
    handleLoadTemplate,
    updateTemplateField,
    removeTemplate
  } = useTemplates({ t, setStatus, activeProject, updateProject, rememberItem });

  const {
    storageRef,
    lastSaved,
    theme,
    setTheme,
    showAutoBackups,
    setShowAutoBackups,
    autoBackups,
    exportBackup,
    exportProjectBackup,
    importBackupFile,
    restoreFromDeviceBackup,
    resolveStorageMessage,
    resolveStorageSource
  } = useStorageHydration({
    t,
    locale,
    projects,
    templates,
    history,
    activeProjectId,
    setProjects,
    setTemplates,
    setHistory,
    setActiveProjectId,
    setStatus
  });

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

  const handleCreateProject = useCallback(
    (event) => {
      const created = addProject(event);
      if (created) {
        setActiveTab('project');
      }
    },
    [addProject]
  );

  const handleOpenProject = useCallback(
    (projectId) => {
      openProject(projectId);
      setActiveTab('project');
    },
    [openProject]
  );

  const handleDeleteProject = useCallback(
    (projectId) => {
      const wasActive = projectId === activeProjectId;
      deleteProject(projectId);
      if (wasActive) {
        setActiveTab('dashboard');
      }
    },
    [activeProjectId, deleteProject]
  );

  const handleTemplateSelect = useCallback(
    (templateId) => {
      setSelectedTemplateId(templateId);
    },
    [setSelectedTemplateId]
  );

  const handleImport = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const result = await importBackupFile(file);
      event.target.value = '';
      if (!result) {
        return;
      }
      if (result.warnings.length > 0) {
        setStatus(resolveStorageMessage(result.warnings[0]));
        return;
      }
      const saveResult = await storageRef.current.saveNow(result.state);
      if (saveResult?.warnings?.length) {
        setStatus(resolveStorageMessage(saveResult.warnings[0]));
        return;
      }
      setStatus(t('status.importComplete', 'Import complete and saved safely.'));
    },
    [importBackupFile, resolveStorageMessage, setStatus, storageRef, t]
  );

  const exportPdf = useCallback(() => {
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
      buildPrintableHtml(activeProject, dictionary, Math.max(activeProjectIndex, 0))
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatus(t('status.pdfReady', 'PDF export ready. Confirm printing to save the file.'));
  }, [activeProject, activeProjectIndex, locale, setStatus, t]);

  const exportProject = useCallback(() => {
    if (!activeProject) {
      setStatus(t('status.projectNeededForExport', 'Select a project before exporting.'));
      return;
    }
    const { json, fileName } = exportProjectBackup(activeProject.id);
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
  }, [activeProject, exportProjectBackup, setStatus, t]);

  const downloadBackup = useCallback(() => {
    const { json, fileName } = exportBackup();
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
  }, [exportBackup, setStatus, t]);

  const handleFactoryReset = useCallback(async () => {
    const confirmed = window.confirm(
      t(
        'settings.factoryReset.confirmPrimary',
        'Factory reset will download a full backup, then erase all local data on this device.'
      )
    );
    if (!confirmed) {
      setStatus(t('status.factoryResetCancelled', 'Factory reset cancelled. No data was removed.'));
      return;
    }
    const confirmedAgain = window.confirm(
      t(
        'settings.factoryReset.confirmSecondary',
        'This will remove projects, templates, and local backups from this device. Continue?'
      )
    );
    if (!confirmedAgain) {
      setStatus(t('status.factoryResetCancelled', 'Factory reset cancelled. No data was removed.'));
      return;
    }

    downloadBackup();
    try {
      const result = await storageRef.current.factoryReset();
      setProjects(result.state.projects);
      setTemplates(result.state.templates);
      setHistory(result.state.history);
      setActiveProjectId(result.state.activeProjectId);
      setActiveTab('dashboard');
      setStatus(
        t(
          'status.factoryResetComplete',
          'Factory reset complete. Your backup download is ready and the app has been reset.'
        )
      );
      setTheme(result.state.theme || 'light');
    } catch {
      setStatus(
        t(
          'status.factoryResetFailed',
          'Factory reset could not finish. Your data is still protected in backups.'
        )
      );
    }
  }, [
    downloadBackup,
    setActiveProjectId,
    setHistory,
    setProjects,
    setStatus,
    setTemplates,
    setActiveTab,
    setTheme,
    storageRef,
    t
  ]);

  const handleLocaleChange = useCallback(
    (event) => {
      const nextLocale = event.target.value;
      setLocale(nextLocale);
      setStatus(
        translate(
          getDictionary(nextLocale),
          'language.status',
          t('language.status', 'Language updated and saved locally.')
        )
      );
    },
    [setLocale, setStatus, t]
  );

  const statusClasses = status
    ? 'border border-brand/40 bg-brand/10 text-brand'
    : 'border border-surface-sunken bg-surface-elevated/60 text-text-secondary';

  const navigationTabs = useMemo(
    () => [
      { id: 'dashboard', label: t('navigation.sidebar.dashboard', 'All Projects') },
      { id: 'templates', label: t('navigation.sidebar.templates', 'Templates') },
      { id: 'settings', label: t('navigation.sidebar.settings', 'Settings') },
      { id: 'help', label: t('navigation.sidebar.help', 'Help') }
    ],
    [t]
  );

  const themeOptions = useMemo(
    () => [
      { id: 'light', label: t('theme.options.light', 'Light'), icon: '☀️' },
      { id: 'dark', label: t('theme.options.dark', 'Dark'), icon: '🌙' },
      { id: 'pink', label: t('theme.options.pink', 'Pink'), icon: '🦄' }
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
          <aside className="ui-sidebar flex w-full flex-col gap-6 p-5 lg:w-80">
            <div className="flex flex-col gap-3">
              <h1 className="w-full text-[1.6rem] font-normal ui-heading tracking-tight">
                {t('ui.appName', 'Gear List Creator')}
              </h1>
              <div className="rounded-2xl border border-surface-sunken/60 bg-surface-elevated/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {t('ui.sidebar.title', 'Safe offline workspace')}
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(
                    'ui.sidebar.description',
                    'Your All Projects view keeps projects close while autosave runs in the background.'
                  )}
                </p>
              </div>
            </div>

            <div className="ui-sidebar-section">
              <nav className="flex flex-col gap-2">
                {navigationTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`ui-sidebar-tab ${isActive ? 'ui-sidebar-tab-active' : ''}`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="ui-sidebar-section">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                    {t('theme.label', 'Theme')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {themeOptions.map((themeOption) => {
                      const isActive = theme === themeOption.id;
                      return (
                        <button
                          key={themeOption.id}
                          type="button"
                          onClick={() => setTheme(themeOption.id)}
                          aria-pressed={isActive}
                          className={`ui-button gap-2 px-3 py-1.5 text-xs ${
                            isActive ? 'bg-brand text-brand-foreground' : 'ui-button-outline'
                          }`}
                        >
                          <span aria-hidden="true">{themeOption.icon}</span>
                          <span>{themeOption.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                    {t('language.label', 'Language')}
                  </p>
                  <select
                    value={locale}
                    onChange={handleLocaleChange}
                    className="ui-select text-sm"
                    aria-label={t('language.label', 'Language')}
                  >
                    {locales.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`rounded-xl bg-surface-elevated/60 p-4 text-sm ${statusClasses}`} aria-live="polite">
              {status || t('status.empty', 'Status updates appear here to confirm data safety.')}
            </div>
          </aside>

          <main className="flex flex-1 flex-col gap-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
            {activeTab === 'dashboard' ? (
              <ProjectDashboard
                t={t}
                tPlural={tPlural}
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={handleTemplateSelect}
                onLoadTemplate={handleLoadTemplate}
                onImportProject={() => fileInputRef.current?.click()}
                projectDraft={projectDraft}
                onProjectDraftChange={updateProjectDraftField}
                onCreateProject={handleCreateProject}
                projects={projects}
                onOpenProject={handleOpenProject}
                onDeleteProject={handleDeleteProject}
                resolveDisplayName={resolveDisplayName}
                lastSaved={lastSaved}
                showAutoBackups={showAutoBackups}
                autoBackups={autoBackups}
                resolveStorageSource={resolveStorageSource}
              />
            ) : null}

            {activeTab === 'project' ? (
              <ProjectWorkspace
                t={t}
                tPlural={tPlural}
                activeProject={activeProject}
                activeProjectIndex={activeProjectIndex}
                totals={totals}
                resolveDisplayName={resolveDisplayName}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onExportPdf={exportPdf}
                onExportProject={exportProject}
                onSaveTemplate={saveTemplateFromProject}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}
                onAddCategory={addCategory}
                itemSuggestions={itemSuggestions}
                getItemDraft={getItemDraft}
                onUpdateDraftItem={updateDraftItem}
                onAddItemToCategory={addItemToCategory}
                onUpdateItemField={updateItemField}
                onUpdateCategoryField={updateCategoryField}
                onUpdateProjectField={updateProjectField}
                onUpdateProjectNotes={updateProjectNotes}
                onRemoveCategory={removeCategory}
                onRemoveItem={removeItem}
                onApplySuggestionToDraft={applySuggestionToDraft}
                onApplySuggestionToItem={applySuggestionToItem}
              />
            ) : null}

            {activeTab === 'templates' ? (
              <TemplateManager
                t={t}
                tPlural={tPlural}
                templateDraft={templateDraft}
                onTemplateDraftChange={updateTemplateDraftField}
                onSubmit={handleTemplateSubmit}
                templates={templates}
                resolveDisplayName={resolveDisplayName}
                onUpdateTemplateField={updateTemplateField}
                onApplyTemplate={applyTemplateToProject}
                onRemoveTemplate={removeTemplate}
              />
            ) : null}

            {activeTab === 'settings' ? (
              <SettingsPanel
                t={t}
                showAutoBackups={showAutoBackups}
                onToggleAutoBackups={() => setShowAutoBackups((prev) => !prev)}
                onDownloadBackup={downloadBackup}
                onImportBackup={() => fileInputRef.current?.click()}
                onRestoreFromDeviceBackup={restoreFromDeviceBackup}
                onFactoryReset={handleFactoryReset}
              />
            ) : null}

            {activeTab === 'help' ? (
              <HelpPanel
                t={t}
                helpSections={helpSections}
                documentationSections={documentationSections}
                offlineSteps={offlineSteps}
              />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
