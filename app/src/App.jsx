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
    // deleteProject removed
    archiveProject, // New soft delete
    restoreProject, // New restore
    deleteProjectPermanently, // New hard delete
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
    rememberItem,
    moveItemUp,
    moveItemDown
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
    // Delay revocation to ensure download starts/completes
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
    setStatus(t('status.backupDownloaded', 'Backup downloaded. Store it somewhere safe.'));
  }, [exportBackup, setStatus, t]);

  // Factory reset modal state
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [factoryResetModalStage, setFactoryResetModalStage] = useState(1);
  // Open modal when user initiates factory reset
  const handleFactoryReset = useCallback(() => {
    setFactoryResetModalStage(1);
    setShowFactoryResetModal(true);
  }, []);
  // Execute factory reset after user confirms in modal
  const executeFactoryReset = useCallback(async () => {
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
    } finally {
      setShowFactoryResetModal(false);
      setFactoryResetModalStage(1);
    }
  }, [downloadBackup, storageRef, setProjects, setTemplates, setHistory, setContacts, navigate, setStatus, t, setTheme]);
  // Primary button handler for modal: advance stage or execute reset
  const onFactoryResetModalPrimary = useCallback(() => {
    if (factoryResetModalStage === 1) {
      setFactoryResetModalStage(2);
    } else {
      executeFactoryReset();
    }
  }, [factoryResetModalStage, executeFactoryReset]);

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
  // Enhanced: deduplicate by email when possible; fallback to name; update fields safely
  const syncCrewToContacts = useCallback((crewMember) => {
    if (!crewMember || typeof crewMember.name !== 'string' || !crewMember.name.trim()) {
      return null;
    }

    // Determine the ID to use
    let targetId = crewMember.contactId;

    // If no ID provided, try to find a match in the CURRENT known contacts
    if (!targetId) {
      if (typeof crewMember.email === 'string' && crewMember.email.trim()) {
        const match = contacts.find((c) => c.email === crewMember.email);
        if (match) targetId = match.id;
      }
      if (!targetId && typeof crewMember.name === 'string' && crewMember.name.trim()) {
        const match = contacts.find((c) => c.name === crewMember.name);
        if (match) targetId = match.id;
      }
    }

    // If still no ID, generate a new one
    if (!targetId) {
      targetId = createId();
    }

    setContacts((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existing = safePrev.find((c) => c.id === targetId);

      if (existing) {
        // Update existing contact
        return safePrev.map((c) =>
          c.id === targetId
            ? {
              ...c,
              name: crewMember.name,
              role: crewMember.role || c.role,
              phone: crewMember.phone || c.phone,
              email: crewMember.email || c.email
            }
            : c
        );
      }

      // Create new contact with the predetermined ID
      const newContact = {
        id: targetId,
        name: crewMember.name,
        role: crewMember.role || '',
        phone: crewMember.phone || '',
        email: crewMember.email || ''
      };
      return [newContact, ...safePrev];
    });

    return targetId;
  }, [contacts, setContacts]);

  const handleOpenProject = useCallback(
    (projectId) => {
      navigate(`/project/${projectId}`);
    },
    [navigate]
  );

  const handleDeleteProject = useCallback(
    (projectId) => {
      archiveProject(projectId); // Soft delete (Archive)
    },
    [archiveProject]
  );

  const handleRestoreProject = useCallback(
    (projectId) => {
      restoreProject(projectId);
    },
    [restoreProject]
  );

  const handleDeletePermanently = useCallback(
    (projectId) => {
      if (window.confirm(t('status.confirmDeletePermanent', 'Are you sure you want to delete this project permanently? This cannot be undone.'))) {
        deleteProjectPermanently(projectId);
      }
    },
    [deleteProjectPermanently, t]
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
    async (project) => {
      try {
        if (!project) {
          setStatus(t('status.projectNeededForExport', 'Select a project before exporting.'));
          return;
        }
        const { json, fileName } = exportProjectBackup(project.id);

        if (!json || !fileName) {
          throw new Error('Invalid export result');
        }

        // Strategy 1: Modern File System Access API (Chrome/Edge/Opera)
        // This is the "compliant" way that satisfies enhanced security checks
        if ('showSaveFilePicker' in window) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: fileName,
              types: [{
                description: 'JSON File',
                accept: { 'application/json': ['.json'] },
              }],
            });
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            setStatus(t('status.projectExported', 'Project exported: ') + fileName);
            return;
          } catch (err) {
            // User cancelled or API failed, fall back if not a cancellation
            if (err.name !== 'AbortError') {
              console.warn('File System Access API failed, falling back to download link:', err);
            } else {
              // User cancelled explicitly, stop here
              return;
            }
          }
        }

        // Strategy 2: Legacy Fallback (Safari/Firefox/Older)
        // Use Blob + Anchor trigger with robust event dispatching
        let blob;
        try {
          blob = new File([json], fileName, { type: 'application/octet-stream' });
        } catch (e) {
          blob = new Blob([json], { type: 'application/octet-stream' });
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);

        // Dispatch a mouse click event instead of .click() to simulate user interaction better
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        link.dispatchEvent(clickEvent);

        // Long timeout to ensure browser has time to handoff to download manager
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 60000);

        // UI Feedback
        setStatus(t('status.projectExported', 'Project exported: ') + fileName);

      } catch (error) {
        console.error('Project export failed:', error);
        setStatus(t('status.exportFailed', 'Export failed. Please check console for details.'));
      }
    },
    [exportProjectBackup, setStatus, t]
  );


  // (Old inline factory reset dialog removed in favor of in-app modal)

  // Hard refresh: clear offline caches/service workers, then reload the page from scratch
  const handleHardRefresh = useCallback(async () => {
    // Optional: notify user
    try {
      // Clear CacheStorage caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (e) {
      // Ignore cache clearing errors to ensure refresh still proceeds
      console.error('Hard refresh: failed to clear caches', e);
    }
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
    } catch (e) {
      console.error('Hard refresh: failed to unregister service workers', e);
    }
    // Reload the page from scratch
    window.location.reload();
  }, []);

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

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjectsList = projects.filter((p) => p.archived);

  const dashboardData = {
    templates,
    selectedTemplateId,
    projectDraft,
    projects: activeProjects,
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
    applySuggestionToItem,
    moveItemUp,
    moveItemDown
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
              onHardRefresh={handleHardRefresh}
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
                onDeleteProject={handleDeleteProject}
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
                onHardRefresh={handleHardRefresh}
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
          <Route
            path="/archived"
            element={
              <ProjectDashboardContainer
                t={t}
                tPlural={tPlural}
                dashboardData={{
                  ...dashboardData,
                  projects: archivedProjectsList,
                  isArchivedView: true
                }}
                dashboardActions={{
                  ...dashboardActions,
                  onDeleteProject: handleDeletePermanently, // Archive view uses permanent delete
                  onRestoreProject: handleRestoreProject
                }}
                resolveDisplayName={resolveDisplayName}
                resolveStorageSource={resolveStorageSource}
              />
            }
          />
        </Route>
      </Routes>
      {showFactoryResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" role="dialog" aria-label={t('settings.factoryReset.modalTitle', 'Factory Reset Confirmation')}>
          <div className="bg-surface-elevated rounded-xl p-6 shadow-lg max-w-md w-full mx-4">
            <p className="text-sm text-text-secondary">
              {factoryResetModalStage === 1
                ? t(
                  'settings.factoryReset.confirmPrimary',
                  'Factory reset will download a full backup, then erase all local data on this device.'
                )
                : t(
                  'settings.factoryReset.confirmSecondary',
                  'This will remove projects, templates, and local backups from this device. Continue?'
                )}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowFactoryResetModal(false);
                  setFactoryResetModalStage(1);
                }}
                className="rounded-lg border border-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onFactoryResetModalPrimary}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
              >
                {factoryResetModalStage === 1 ? 'Continue' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
