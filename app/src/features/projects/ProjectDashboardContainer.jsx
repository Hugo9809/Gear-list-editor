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
    onLoadTemplate,
    onImportProject,
    onProjectDraftChange,
    onCreateProject,
    onOpenProject,
    onDeleteProject
  } = dashboardActions;

  return (
    <ProjectDashboard
      t={t}
      tPlural={tPlural}
      templates={templates}
      selectedTemplateId={selectedTemplateId}
      onTemplateSelect={onTemplateSelect}
      onLoadTemplate={onLoadTemplate}
      onImportProject={onImportProject}
      projectDraft={projectDraft}
      contacts={contacts}
      onProjectDraftChange={onProjectDraftChange}
      onCreateProject={onCreateProject}
      projects={projects}
      onOpenProject={onOpenProject}
      onDeleteProject={onDeleteProject}
      resolveDisplayName={resolveDisplayName}
      lastSaved={lastSaved}
      showAutoBackups={showAutoBackups}
      autoBackups={autoBackups}
      resolveStorageSource={resolveStorageSource}
    />
  );
};

export default ProjectDashboardContainer;
