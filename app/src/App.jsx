import { useCallback, useRef, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { getDictionary, translate, useI18n } from './i18n/index.js';
import Layout from './app/Layout.jsx';
import HelpPanel from './features/help/HelpPanel.jsx';
import ProjectDashboardContainer from './features/projects/ProjectDashboardContainer.jsx';
import ProjectWorkspaceContainer from './features/projects/ProjectWorkspaceContainer.jsx';
import DeviceLibraryPage from './features/device-library/DeviceLibraryPage.jsx';
import ContactsPage from './features/contacts/ContactsPage.jsx';
import SettingsPanel from './features/settings/SettingsPanel.jsx';
import TemplateManager from './features/templates/TemplateManager.jsx';
import { useProjects } from './shared/hooks/useProjects.js';
import { createId } from './data/storage.js';
import { useStorageHydration } from './shared/hooks/useStorageHydration.js';
import { useTemplates } from './shared/hooks/useTemplates.js';

const isDefaultLabelKey = (value) => typeof value === 'string' && value.startsWith('defaults.');

export default function App() {
  const { locale, locales, setLocale, t, tPlural } = useI18n();
  const [deviceLibrary, setDeviceLibrary] = useState({ items: [] });
  const [contacts, setContacts] = useState([]);
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
    moveCategoryUp,
    moveCategoryDown,
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
  } = useProjects({ t, setStatus, deviceLibrary, setDeviceLibrary });

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
    deviceLibrary,
    contacts,
    history,
    setProjects,
    setTemplates,
    setDeviceLibrary,
    setContacts,
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

  // Sync a crew member to global Contacts when a crew entry gains a non-empty name
  const syncCrewToContacts = useCallback((crewMember) => {
    if (!crewMember || typeof crewMember.name !== 'string' || !crewMember.name.trim()) {
      return;
    }
    setContacts((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const match = safePrev.find((c) => c.name === crewMember.name);
      if (match) {
        // Update existing contact with any provided details
        return safePrev.map((c) =>
          c.id === match.id
            ? {
                ...c,
                role: crewMember.role || c.role,
                phone: crewMember.phone || c.phone,
                email: crewMember.email || c.email
              }
            : c
        );
      }
      // Create a new contact from the crew member details
      const newContact = {
        id: createId(),
        name: crewMember.name,
        role: crewMember.role || '',
        phone: crewMember.phone || '',
        email: crewMember.email || ''
      };
      return [newContact, ...safePrev];
    });
  }, [setContacts]);

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

  const exportPdf = useCallback(
    async (project) => {
      if (!project) {
        setStatus(t('status.projectNeededForExport', 'Select a project before exporting.'));
        return;
      }

      // Use new offline PDF export service
      setStatus(t('status.pdfExporting', 'Generating PDF...'));
      try {
        // Dynamic import to keep initial bundle size small, though it's already split by Vite
        const { exportPdf } = await import('./data/pdf/pdfExportService.js');
        const result = await exportPdf(project, locale, t, theme);
        const successMessage =
          result === 'print'
            ? t('status.pdfReady', 'PDF export ready. Confirm printing to save the file.')
            : t('status.pdfExportComplete', 'PDF downloaded successfully.');
        setStatus(successMessage);
      } catch (err) {
        console.error('PDF export failed:', err);
        const messageKey = err?.message === 'popup-blocked' ? 'status.popupBlocked' : 'status.pdfExportError';
        const fallback =
          messageKey === 'status.popupBlocked'
            ? 'Popup blocked. Please allow popups for PDF export.'
            : 'PDF generation failed. Please try again.';
        setStatus(t(messageKey, fallback));
      }
    },
    [locale, setStatus, t, theme]
  );

  const exportProject = useCallback(
    (project) => {
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
    },
    [exportProjectBackup, setStatus, t]
  );

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
      setContacts(result.state.contacts);
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
    setContacts,
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

  const dashboardData = {
    templates,
    selectedTemplateId,
    projectDraft,
    projects,
    contacts,
    lastSaved,
    showAutoBackups,
    autoBackups
  };

  const dashboardActions = {
    onTemplateSelect: handleTemplateSelect,
    onLoadTemplate: handleLoadTemplate,
    onImportProject: () => fileInputRef.current?.click(),
    onProjectDraftChange: updateProjectDraftField,
    onCreateProject: handleCreateProject,
    onOpenProject: handleOpenProject,
    onDeleteProject: handleDeleteProject
  };

  const projectActions = {
    addCategory,
    moveCategoryUp,
    moveCategoryDown,
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
  };

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
              <ProjectDashboardContainer
                t={t}
                tPlural={tPlural}
                dashboardData={dashboardData}
                dashboardActions={dashboardActions}
                resolveDisplayName={resolveDisplayName}
                resolveStorageSource={resolveStorageSource}
              />
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <ProjectWorkspaceContainer
                t={t}
                tPlural={tPlural}
                projects={projects}
                contacts={contacts}
                resolveDisplayName={resolveDisplayName}
                onBackToDashboard={() => navigate('/')}
                onExportPdf={exportPdf}
                onExportProject={exportProject}
                onSaveTemplate={saveTemplateFromProject}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}
                itemSuggestions={itemSuggestions}
                getItemDraft={getItemDraft}
                isHydrated={isHydrated}
                projectActions={projectActions}
                onSyncCrewToContacts={typeof syncCrewToContacts === 'function' ? syncCrewToContacts : undefined}
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
                path="/contacts"
                element={
                  <ContactsPage
                t={t}
                contacts={contacts}
                setContacts={setContacts}
                setStatus={setStatus}
              />
            }
          />
          <Route
            path="/device-library"
            element={
              <DeviceLibraryPage
                t={t}
                deviceLibrary={deviceLibrary}
                setDeviceLibrary={setDeviceLibrary}
                setStatus={setStatus}
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
