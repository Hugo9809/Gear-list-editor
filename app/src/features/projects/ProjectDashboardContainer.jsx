import ProjectDashboard from './ProjectDashboard.jsx';

const ProjectDashboardContainer = ({
  t,
  tPlural,
  dashboardData,
  dashboardActions,
  resolveDisplayName,
  resolveStorageSource
}) => {
  const {
    templates,
    selectedTemplateId,
    projectDraft,
    projects,
    contacts,
    lastSaved,
    showAutoBackups,
    autoBackups
  } = dashboardData;
  const {
    onTemplateSelect,
    onCreateProjectFromTemplate,
    onImportProject,
    onProjectDraftChange,
    onCreateProject,
    onOpenProject,
    onDeleteProject,
    onDuplicateProject,
    onRestoreProject
  } = dashboardActions;

  const { isArchivedView } = dashboardData;

  return (
    <ProjectDashboard
      t={t}
      tPlural={tPlural}
      templates={templates}
      selectedTemplateId={selectedTemplateId}
      onTemplateSelect={onTemplateSelect}
      onCreateProjectFromTemplate={onCreateProjectFromTemplate}
      onImportProject={onImportProject}
      projectDraft={projectDraft}
      contacts={contacts}
      onProjectDraftChange={onProjectDraftChange}
      onCreateProject={onCreateProject}
      projects={projects}
      onOpenProject={onOpenProject}
      onDeleteProject={onDeleteProject}
      onDuplicateProject={onDuplicateProject}
      resolveDisplayName={resolveDisplayName}
      lastSaved={lastSaved}
      showAutoBackups={showAutoBackups}
      autoBackups={autoBackups}
      resolveStorageSource={resolveStorageSource}
      isArchivedView={isArchivedView}
      onRestoreProject={onRestoreProject}
    />
  );
};

export default ProjectDashboardContainer;
