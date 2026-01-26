import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getShootScheduleDates } from '../../shared/utils/shootSchedule.js';
import TypeaheadInput from '../../shared/components/TypeaheadInput.jsx';
import { crewRoles } from '../../data/crewRoles.js';
import { rentalHouseSuggestions, formatRentalHouseValue } from '../../data/rentalHouses.js';
import CrewFieldList from './CrewFieldList.jsx';
import ShootScheduleFields from './ShootScheduleFields.jsx';

/**
 * Render the project dashboard, quick actions, and backup overview.
 * Assumes callbacks handle persistence and navigation.
 */
const ProjectDashboard = ({
  t,
  tPlural,
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onCreateProjectFromTemplate,
  onImportProject,
  projectDraft,
  onProjectDraftChange,
  onCreateProject,
  projects,
  contacts,
  onDuplicateProject,
  onDeleteProject,
  resolveDisplayName,
  lastSaved,
  showAutoBackups,
  autoBackups,
  resolveStorageSource,
  isArchivedView = false,
  onRestoreProject
}) => {
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const initDelete = (id) => {
    if (deleteConfirmationId === id) {
      onDeleteProject(id);
      setDeleteConfirmationId(null);
    } else {
      setDeleteConfirmationId(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmationId((current) => (current === id ? null : current)), 3000);
    }
  };

  const handleRentalHouseSelect = (suggestion) => {
    onProjectDraftChange('contact', formatRentalHouseValue(suggestion));
  };

  const formatScheduleSummary = (schedule) => {
    const { prepPeriods, shootingPeriods, returnDays } = getShootScheduleDates(schedule);
    const formatRange = (range) => {
      if (range.start && range.end) {
        return `${range.start} - ${range.end}`;
      }
      return range.start || range.end || '';
    };
    const formatList = (values) => values.map(formatRange).filter(Boolean).join(', ');
    const parts = [];
    const prepList = formatList(prepPeriods);
    const shootingList = formatList(shootingPeriods);
    const returnList = formatList(returnDays);
    if (prepList) {
      parts.push(`${t('project.shootSchedule.labels.prep', 'Prep')}: ${prepList}`);
    }
    if (shootingList) {
      parts.push(`${t('project.shootSchedule.labels.shooting', 'Shoot')}: ${shootingList}`);
    }
    if (returnList) {
      parts.push(`${t('project.shootSchedule.labels.return', 'Return')}: ${returnList}`);
    }
    return parts.length
      ? parts.join(' · ')
      : t('project.shootSchedule.empty', 'Dates not set');
  };

  const projectAccentPalette = [
    'var(--v2-project-blue)',
    'var(--v2-project-indigo)',
    'var(--v2-project-teal)',
    'var(--v2-project-green)',
    'var(--v2-project-orange)'
  ];

  return (
    <div className="project-dashboard">
      <form
        onSubmit={onCreateProject}
        className={`dashboard-card dashboard-card--hero flex flex-col gap-6 p-6 lg:p-8 ${isArchivedView ? 'hidden' : ''}`}
      >
        <div className="dashboard-hero">
          <div className="flex flex-col gap-2">
            <p className="dashboard-eyebrow">
              {t('project.dashboard.eyebrow', 'All projects')}
            </p>
            <h2 className="dashboard-title">
              {t('project.dashboard.title', 'Project dashboard')}
            </h2>
            <p className="dashboard-subtitle">
              {t(
                'project.dashboard.description',
                'Track multiple productions and open a project to start editing the gear list. New projects are autosaved the moment they are created.'
              )}
            </p>
          </div>
        </div>
        <div className="dashboard-quickactions">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="dashboard-section-title">
                {t('dashboard.quickActions.title', 'Dashboard quick actions')}
              </h3>
              <p className="dashboard-subtitle">
                {t(
                  'dashboard.quickActions.description',
                  'Start a new project from a template or bring a project backup back into your local library.'
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="dashboard-label flex min-w-[200px] flex-col gap-2">
                {t('template.library.label', 'Template library')}
                <select
                  value={selectedTemplateId}
                  onChange={(event) => onTemplateSelect(event.target.value)}
                  className="ui-select dashboard-select"
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
                          'defaults.untitled_template'
                        )}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <button
                type="button"
                onClick={onCreateProjectFromTemplate}
                disabled={!selectedTemplateId}
                className={`ui-button dashboard-button ${selectedTemplateId
                  ? 'ui-button-primary dashboard-button-primary'
                  : 'dashboard-button-disabled cursor-not-allowed bg-surface-sunken text-text-muted'
                  }`}
              >
                {t('template.actions.loadIntoProject', 'Create project from template')}
              </button>
              <button
                type="button"
                onClick={onImportProject}
                className="ui-button ui-button-outline dashboard-button"
              >
                {t('project.actions.importProject', 'Import project')}
              </button>
            </div>
          </div>
          <p className="dashboard-help">
            {t(
              'template.library.helper',
              'Templates create new projects without altering existing entries.'
            )}
          </p>
        </div>
        <div className="dashboard-form-grid grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.name', 'Project name')}
            <input
              value={projectDraft.name}
              onChange={(event) => onProjectDraftChange('name', event.target.value)}
              placeholder={t('project.placeholders.name', 'e.g. October studio shoot')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.resolution', 'Resolution')}
            <input
              value={projectDraft.resolution}
              onChange={(event) => onProjectDraftChange('resolution', event.target.value)}
              placeholder={t('project.placeholders.resolution', 'e.g. 1920x1080')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.aspectRatio', 'Aspect Ratio')}
            <input
              value={projectDraft.aspectRatio}
              onChange={(event) => onProjectDraftChange('aspectRatio', event.target.value)}
              placeholder={t('project.placeholders.aspectRatio', 'e.g. 16:9')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.codec', 'Codec')}
            <input
              value={projectDraft.codec}
              onChange={(event) => onProjectDraftChange('codec', event.target.value)}
              placeholder={t('project.placeholders.codec', 'e.g. H.264')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
            {t('project.fields.framerate', 'Framerate')}
            <input
              type="number"
              min={1}
              value={projectDraft.framerate}
              onChange={(event) => onProjectDraftChange('framerate', event.target.value)}
              placeholder={t('project.placeholders.framerate', 'e.g. 30')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.client', 'Client / production')}
            <input
              value={projectDraft.client}
              onChange={(event) => onProjectDraftChange('client', event.target.value)}
              placeholder={t('project.placeholders.client', 'Client, agency, or show')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <ShootScheduleFields
            t={t}
            schedule={projectDraft.shootSchedule}
            onChange={(value) => onProjectDraftChange('shootSchedule', value)}
            className="md:col-span-2"
          />
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.location', 'Location')}
            <input
              value={projectDraft.location}
              onChange={(event) => onProjectDraftChange('location', event.target.value)}
              placeholder={t('project.placeholders.location', 'Studio, city, or venue')}
              className="ui-input ui-input-lg dashboard-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
            {t('project.fields.contact', 'Rental house')}
            <TypeaheadInput
              value={projectDraft.contact}
              onChange={(value) => onProjectDraftChange('contact', value)}
              onSelectSuggestion={handleRentalHouseSelect}
              suggestions={rentalHouseSuggestions}
              placeholder={t(
                'project.placeholders.contact',
                'Rental house name, address, phone'
              )}
              label={t('project.fields.contact', 'Rental house')}
              inputClassName="ui-input ui-input-lg dashboard-input"
              listClassName="dashboard-dropdown"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
            <CrewFieldList
              t={t}
              crew={projectDraft.crew}
              contacts={contacts}
              roles={crewRoles}
              onChange={(nextCrew) => onProjectDraftChange('crew', nextCrew)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="ui-button ui-button-primary dashboard-button dashboard-button-primary w-fit px-5"
        >
          {t('project.actions.create', 'Create project')}
        </button>
      </form>

      <div className="dashboard-card flex flex-col gap-6 p-6 lg:p-8">
        <div className="dashboard-list-header">
          <div className="flex flex-col gap-2">
            <p className="dashboard-eyebrow">
              {isArchivedView
                ? t('project.archived.eyebrow', 'Archive')
                : t('project.list.eyebrow', 'Library')}
            </p>
            <h2 className="dashboard-title">
              {isArchivedView ? t('project.archived.title', 'Archived Projects') : t('project.list.title', 'Projects')}
            </h2>
            <div className="dashboard-meta-row">
              <span className="dashboard-pill">
                {tPlural('project.count', projects.length, '{count} project stored locally.', {
                  count: projects.length
                })}
              </span>
              {!isArchivedView && (
                <Link to="/archived" className="dashboard-link">
                  {t('project.actions.viewArchived', 'View Archived')} &rarr;
                </Link>
              )}
              {isArchivedView && (
                <Link to="/" className="dashboard-link">
                  &larr; {t('project.actions.viewActive', 'Back to Projects')}
                </Link>
              )}
            </div>
          </div>
          <div className="dashboard-meta-row">
            <span className="dashboard-pill dashboard-pill-muted">
              {t('project.lastSaved.label', 'Last saved: {time}', {
                time: lastSaved
                  ? new Date(lastSaved).toLocaleString()
                  : t('project.lastSaved.empty', 'Not saved yet')
              })}
            </span>
          </div>
        </div>
        <div className="dashboard-project-grid">
          {projects.length === 0 ? (
            <div className="dashboard-empty">
              {isArchivedView
                ? t('project.archived.empty', 'No archived projects.')
                : t(
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
              const accent = projectAccentPalette[projectIndex % projectAccentPalette.length] || 'var(--v2-brand-primary)';
              return (
                <div
                  key={project.id}
                  className="dashboard-project-card"
                  style={{ '--pd-index': projectIndex, '--pd-accent': accent }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="dashboard-project-title">
                        {resolveDisplayName(
                          project.name,
                          { index: projectIndex + 1 },
                          'defaults.untitled_project'
                        )}
                      </h3>
                      <p className="dashboard-project-meta">
                        {project.client || t('project.client.empty', 'Client not set')} ·{' '}
                        {formatScheduleSummary(project.shootSchedule ?? project.shootDate)}
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-stat-grid">
                    <div className="dashboard-stat">
                      <span>
                        {tPlural(
                          'categories.count',
                          project.categories.length,
                          '{count} categories',
                          {
                            count: project.categories.length
                          }
                        )}
                      </span>
                    </div>
                    <div className="dashboard-stat">
                      <span>
                        {tPlural('items.count', itemTotal, '{count} items', { count: itemTotal })}
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-actions">
                    <Link
                      to={`/project/${project.id}`}
                      className={`ui-button ui-button-primary dashboard-button dashboard-button-primary px-3 py-1 text-xs no-underline ${isArchivedView ? 'hidden' : ''}`}
                    >
                      {t('project.actions.open', 'Open')}
                    </Link>
                    {!isArchivedView && (
                      <button
                        type="button"
                        onClick={() => onDuplicateProject(project.id)}
                        className="ui-button ui-button-outline dashboard-button px-3 py-1 text-xs"
                      >
                        {t('project.actions.duplicate', 'Duplicate')}
                      </button>
                    )}
                    {isArchivedView && (
                      <button
                        type="button"
                        onClick={() => initDelete(project.id)}
                        className={`ui-button dashboard-button px-3 py-1 text-xs transition-colors ${deleteConfirmationId === project.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'ui-button-danger dashboard-button-danger'
                          }`}
                      >
                        {deleteConfirmationId === project.id
                          ? t('project.actions.confirmDelete', 'Confirm?')
                          : t('project.actions.delete', 'Delete')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => initDelete(project.id)}
                      className={`ui-button dashboard-button px-3 py-1 text-xs transition-colors ${deleteConfirmationId === project.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'ui-button-danger dashboard-button-danger'
                        }`}
                    >
                      {deleteConfirmationId === project.id
                        ? t('project.actions.confirmDelete', 'Confirm?')
                        : t('project.actions.delete', 'Delete')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAutoBackups ? (
        <div className="dashboard-card flex flex-col gap-6 p-6 lg:p-8">
          <div className="dashboard-list-header">
            <div className="flex flex-col gap-2">
              <p className="dashboard-eyebrow">
                {t('dashboard.autoBackups.eyebrow', 'Safety copies')}
              </p>
              <h2 className="dashboard-title">
                {t('dashboard.autoBackups.title', 'Auto backups')}
              </h2>
              <p className="dashboard-subtitle">
                {t(
                  'dashboard.autoBackups.description',
                  'Review the on-device auto backups created by autosave.'
                )}
              </p>
            </div>
            <div className="dashboard-meta-row">
              <span className="dashboard-pill">
                {tPlural(
                  'dashboard.autoBackups.count',
                  autoBackups.length,
                  '{count} auto backup available.',
                  {
                    count: autoBackups.length
                  }
                )}
              </span>
            </div>
          </div>
          <div className="dashboard-backup-grid">
            {autoBackups.length === 0 ? (
              <div className="dashboard-empty">
                {t(
                  'dashboard.autoBackups.empty',
                  'No auto backups yet. Create or edit a project and autosave will create them.'
                )}
              </div>
            ) : (
              autoBackups.map((backup, backupIndex) => (
                <div
                  key={backup.id}
                  className="dashboard-backup-card"
                  style={{ '--pd-index': backupIndex }}
                >
                  <div>
                    <h3 className="dashboard-card-title">
                      {resolveStorageSource(backup.source)}
                    </h3>
                    <p className="dashboard-subtitle">
                      {t('dashboard.autoBackups.lastSaved', 'Last saved: {time}', {
                        time: backup.lastSaved
                          ? new Date(backup.lastSaved).toLocaleString()
                          : t('dashboard.autoBackups.lastSavedEmpty', 'Not saved yet')
                      })}
                    </p>
                  </div>
                  <div className="dashboard-meta-row">
                    <span className="dashboard-pill dashboard-pill-muted">
                      {tPlural(
                        'dashboard.autoBackups.projects',
                        backup.projectCount,
                        '{count} project in this backup.',
                        {
                          count: backup.projectCount
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectDashboard;
