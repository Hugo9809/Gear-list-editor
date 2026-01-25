import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ProjectWorkspace from './ProjectWorkspace.jsx';

const ProjectWorkspaceContainer = ({
  t,
  tPlural,
  projects,
  contacts,
  resolveDisplayName,
  onBackToDashboard,
  onExportPdf,
  onExportProject,
  onSaveTemplate,
  newCategoryName,
  onNewCategoryNameChange,
  itemSuggestions,
  getItemDraft,
  isHydrated,
  onSyncCrewToContacts,
  projectActions,
  onDeleteProject
}) => {
  const { projectId } = useParams();

  // Always call hooks at top level
  const project = projects.find((candidate) => candidate.id === projectId);
  const projectIndex = project ? projects.findIndex((candidate) => candidate.id === projectId) : -1;

  const totals = useMemo(() => {
    if (!project) return { categories: 0, items: 0 };
    const categories = project.categories.length;
    const items = project.categories.reduce((sum, category) => sum + category.items.length, 0);
    return { categories, items };
  }, [project]);

  if (!isHydrated) {
    return null;
  }

  if (!project) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProjectWorkspace
      t={t}
      tPlural={tPlural}
      activeProject={project}
      activeProjectIndex={projectIndex}
      contacts={contacts}
      totals={totals}
      resolveDisplayName={resolveDisplayName}
      onBackToDashboard={onBackToDashboard}
      onExportPdf={() => onExportPdf(project, projectIndex)}
      onExportProject={() => onExportProject(project)}
      onSaveTemplate={() => onSaveTemplate(project)}
      newCategoryName={newCategoryName}
      onNewCategoryNameChange={onNewCategoryNameChange}
      itemSuggestions={itemSuggestions}
      getItemDraft={getItemDraft}
      onAddCategory={(event) => projectActions.addCategory(project.id, event)}
      onMoveCategoryUp={(catId) => projectActions.moveCategoryUp(project.id, catId)}
      onMoveCategoryDown={(catId) => projectActions.moveCategoryDown(project.id, catId)}
      onAddItemToCategory={(event, catId) =>
        projectActions.addItemToCategory(project.id, event, catId)
      }
      onUpdateDraftItem={projectActions.updateDraftItem}
      onUpdateItemField={(catId, itemId, field, val) =>
        projectActions.updateItemField(project.id, catId, itemId, field, val)
      }
      onUpdateCategoryField={(catId, field, val) =>
        projectActions.updateCategoryField(project.id, catId, field, val)
      }
      onUpdateProjectField={(field, val) =>
        projectActions.updateProjectField(project.id, field, val)
      }
      onUpdateProjectNotes={(val) => projectActions.updateProjectNotes(project.id, val)}
      onRemoveCategory={(catId) => projectActions.removeCategory(project.id, catId)}
      onRemoveItem={(catId, itemId) => projectActions.removeItem(project.id, catId, itemId)}
      onApplySuggestionToDraft={projectActions.applySuggestionToDraft}
      onApplySuggestionToItem={(catId, itemId, sugg) =>
        projectActions.applySuggestionToItem(project.id, catId, itemId, sugg)
      }
      onSyncCrewToContacts={typeof onSyncCrewToContacts === 'function' ? onSyncCrewToContacts : undefined}
      onDeleteProject={() => onDeleteProject(project.id)}
    />
  );
};

export default ProjectWorkspaceContainer;
