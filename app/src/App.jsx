import { useCallback, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { getDictionary, translate, useI18n } from './i18n/index.js';
import Layout from './app/Layout.jsx';
import HelpPanel from './features/help/HelpPanel.jsx';
import ProjectDashboard from './features/projects/ProjectDashboard.jsx';
import ProjectWorkspace from './features/projects/ProjectWorkspace.jsx';
import SettingsPanel from './features/settings/SettingsPanel.jsx';
import TemplateManager from './features/templates/TemplateManager.jsx';
import { useProjects } from './shared/hooks/useProjects.js';
import { useStorageHydration } from './shared/hooks/useStorageHydration.js';
import { useTemplates } from './shared/hooks/useTemplates.js';
import { buildPrintableHtml } from './shared/utils/print.js';

const isDefaultLabelKey = (value) => typeof value === 'string' && value.startsWith('defaults.');

// Wrapper to extract projectId from URL and find the project object
const ProjectWorkspaceWrapper = ({
  projects,
  onBackToDashboard,
  onExportPdf,
  onExportProject,
  onSaveTemplate,
  hookActions,
  isHydrated,
  ...props
}) => {
  const { projectId } = useParams();

  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const projectIndex = projects.findIndex(p => p.id === projectId);

  // Calculate totals locally since useProjects no longer does it
  const totals = useMemo(() => {
    const categories = project.categories.length;
    const items = project.categories.reduce((sum, category) => sum + category.items.length, 0);
    return { categories, items };
  }, [project]);

  return (
    <ProjectWorkspace
      activeProject={project}
      activeProjectIndex={projectIndex}
      totals={totals}
      onBackToDashboard={onBackToDashboard}
      onExportPdf={() => onExportPdf(project, projectIndex)}
      onExportProject={() => onExportProject(project)}
      onSaveTemplate={() => onSaveTemplate(project)}

      onAddCategory={(e) => hookActions.addCategory(project.id, e)}
      onAddItemToCategory={(e, catId) => hookActions.addItemToCategory(project.id, e, catId)}
      onUpdateDraftItem={hookActions.updateDraftItem} // this one doesn't need projectId
      onUpdateItemField={(catId, itemId, field, val) => hookActions.updateItemField(project.id, catId, itemId, field, val)}
      onUpdateCategoryField={(catId, field, val) => hookActions.updateCategoryField(project.id, catId, field, val)}
      onUpdateProjectField={(field, val) => hookActions.updateProjectField(project.id, field, val)}
      onUpdateProjectNotes={(val) => hookActions.updateProjectNotes(project.id, val)}
      onRemoveCategory={(catId) => hookActions.removeCategory(project.id, catId)}
      onRemoveItem={(catId, itemId) => hookActions.removeItem(project.id, catId, itemId)}
      onApplySuggestionToDraft={hookActions.applySuggestionToDraft} // no projectId
      onApplySuggestionToItem={(catId, itemId, sugg) => hookActions.applySuggestionToItem(project.id, catId, itemId, sugg)}

      {...props}
    />
  );
};

export default function App() {
  const { locale, locales, setLocale, t, tPlural } = useI18n();
  const [status, setStatus] = useState(() =>
    t('status.loading', 'Loading your saved gear list...')
  );
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    projects,
    setProjects,
    history,
    setHistory,
    // activeProjectId removed
    // activeProject removed
    // totals removed (calculated in wrapper)
    projectDraft,
    updateProjectDraftField,
    addProject,
    // openProject removed
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
  } = useTemplates({ t, setStatus, updateProject, rememberItem });

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
    resolveStorageSource,
    isHydrated
  } = useStorageHydration({
    t,
    locale,
    projects,
    templates,
    history,
    setProjects,
    setTemplates,
    setHistory,
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
      const newProjectId = addProject(event);
      if (newProjectId) {
        navigate(`/project/${newProjectId}`);
      }
    },
    [addProject, navigate]
  );

  const handleOpenProject = useCallback(
    (projectId) => {
      navigate(`/project/${projectId}`);
    },
    [navigate]
  );

  const handleDeleteProject = useCallback(
    (projectId) => {
      deleteProject(projectId);
      // If we were on that project page, we might ideally redirect, 
      // but simpler to just let the Wrapper render Navigate to / if not found
    },
    [deleteProject]
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

  const exportPdf = useCallback((project, index) => {
    if (!project) {
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
      buildPrintableHtml(project, dictionary, Math.max(index, 0))
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatus(t('status.pdfReady', 'PDF export ready. Confirm printing to save the file.'));
  }, [locale, setStatus, t]);

  const exportProject = useCallback((project) => {
    if (!project) {
      setStatus(t('status.projectNeededForExport', 'Select a project before exporting.'));
      return;
    }
    const { json, fileName } = exportProjectBackup(project.id);
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
  }, [exportProjectBackup, setStatus, t]);

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

  // Factory reset logic handles 'activeProjectId' in state, but we removed it.
  // We need to just navigate to / after reset.
  const handleFactoryReset = useCallback(async () => {
    const confirmed = window.confirm(
      t(
        'settings.factoryReset.confirmPrimary',
        'Factory reset will download a full backup, then erase all local data on this device.'
      )
    );
    if (!confirmed) {
      return;
    }
    const confirmedAgain = window.confirm(
      t(
        'settings.factoryReset.confirmSecondary',
        'This will remove projects, templates, and local backups from this device. Continue?'
      )
    );
    if (!confirmedAgain) {
      return;
    }

    downloadBackup();
    try {
      const result = await storageRef.current.factoryReset();
      setProjects(result.state.projects);
      setTemplates(result.state.templates);
      setHistory(result.state.history);
      // setActiveProjectId no longer exists
      navigate('/');
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
    setHistory,
    setProjects,
    setStatus,
    setTemplates,
    navigate,
    setTheme,
    storageRef,
    t
  ]);

  const handleLocaleChange = useCallback(
    (value) => {
      setLocale(value);
      setStatus(
        translate(
          getDictionary(value),
          'language.status',
          t('language.status', 'Language updated and saved locally.')
        )
      );
    },
    [setLocale, setStatus, t]
  );

  const helpSections = t('help.sections', []);
  const documentationSections = t('documentation.sections', []);
  const offlineSteps = t('offline.steps', []);

  // Bind actions to accept projectId implicitly in the Workspace
  // Actually we need to pass handlers that take (e) or (params) and calls hook actions with (project.id, ...)
  // This binding happens in the Wrapper mostly.

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className="hidden"
      />
      <Routes>
        <Route
          element={
            <Layout
              t={t}
              status={status}
              theme={theme}
              setTheme={setTheme}
              locale={locale}
              setLocale={handleLocaleChange}
              locales={locales}
            />
          }
        >
          <Route
            path="/"
            element={
              <ProjectDashboard
                t={t}
                tPlural={tPlural}
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={handleTemplateSelect}
                onLoadTemplate={handleLoadTemplate} // Note: This might need adjustment for no active project
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
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <ProjectWorkspaceWrapper
                t={t}
                tPlural={tPlural}
                projects={projects}
                resolveDisplayName={resolveDisplayName}
                onBackToDashboard={() => navigate('/')}
                onExportPdf={exportPdf}
                onExportProject={exportProject}
                onSaveTemplate={saveTemplateFromProject}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}

                hookActions={{
                  addCategory,
                  updateProjectDraftField,
                  addItemToCategory,
                  updateDraftItem,
                  updateItemField,
                  updateCategoryField,
                  updateProjectField,
                  updateProjectNotes,
                  removeCategory,
                  removeItem,
                  applySuggestionToDraft,
                  applySuggestionToItem
                }}

                itemSuggestions={itemSuggestions}
                getItemDraft={getItemDraft}
                isHydrated={isHydrated}
              />
            }
          />
          <Route
            path="/templates"
            element={
              <TemplateManager
                t={t}
                tPlural={tPlural}
                templateDraft={templateDraft}
                onTemplateDraftChange={updateTemplateDraftField}
                onSubmit={(e) => handleTemplateSubmit(e, null)} // Templates tab has no active project
                templates={templates}
                resolveDisplayName={resolveDisplayName}
                onUpdateTemplateField={updateTemplateField}
                onApplyTemplate={(id) => applyTemplateToProject(id, null)} // Templates tab has no active project
                onRemoveTemplate={removeTemplate}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPanel
                t={t}
                showAutoBackups={showAutoBackups}
                onToggleAutoBackups={() => setShowAutoBackups((prev) => !prev)}
                onDownloadBackup={downloadBackup}
                onImportBackup={() => fileInputRef.current?.click()}
                onRestoreFromDeviceBackup={restoreFromDeviceBackup}
                onFactoryReset={handleFactoryReset}
              />
            }
          />
          <Route
            path="/help"
            element={
              <HelpPanel
                t={t}
                helpSections={helpSections}
                documentationSections={documentationSections}
                offlineSteps={offlineSteps}
              />
            }
          />
        </Route>
      </Routes>
    </>
  );
}
