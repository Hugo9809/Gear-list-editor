import { Link } from 'react-router-dom';
import { getShootScheduleDates } from '../../shared/utils/shootSchedule.js';
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
  onLoadTemplate,
  onImportProject,
  projectDraft,
  onProjectDraftChange,
  onCreateProject,
  projects,
  onDeleteProject,
  resolveDisplayName,
  lastSaved,
  showAutoBackups,
  autoBackups,
  resolveStorageSource
}) => {
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

  return (
    <>
      <form
        onSubmit={onCreateProject}
        className="ui-tile flex flex-col gap-4 bg-surface-elevated/60 p-6"
      >
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold ui-heading">
          {t('project.dashboard.title', 'Project dashboard')}
        </h2>
        <p className="text-sm text-text-secondary">
          {t(
            'project.dashboard.description',
            'Track multiple productions and open a project to start editing the gear list. New projects are autosaved the moment they are created.'
          )}
        </p>
      </div>
      <div className="rounded-xl border border-surface-sunken bg-surface-muted/60 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold ui-heading">
              {t('dashboard.quickActions.title', 'Dashboard quick actions')}
            </h3>
            <p className="text-sm text-text-secondary">
              {t(
                'dashboard.quickActions.description',
                'Load trusted templates or bring a project backup back into your local library.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[200px] flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
              {t('template.library.label', 'Template library')}
              <select
                value={selectedTemplateId}
                onChange={(event) => onTemplateSelect(event.target.value)}
                className="ui-select"
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
              onClick={onLoadTemplate}
              disabled={!selectedTemplateId}
              className={`ui-button ${selectedTemplateId
                  ? 'ui-button-primary'
                  : 'cursor-not-allowed bg-surface-sunken text-text-muted'
                }`}
            >
              {t('template.actions.loadIntoProject', 'Load from template')}
            </button>
            <button type="button" onClick={onImportProject} className="ui-button ui-button-outline">
              {t('project.actions.importProject', 'Import project')}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          {t(
            'template.library.helper',
            'Templates add gear to the selected project without overwriting existing entries.'
          )}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-text-secondary">
          {t('project.fields.name', 'Project name')}
          <input
            value={projectDraft.name}
            onChange={(event) => onProjectDraftChange('name', event.target.value)}
            placeholder={t('project.placeholders.name', 'e.g. October studio shoot')}
            className="ui-input ui-input-lg"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-text-secondary">
          {t('project.fields.client', 'Client / production')}
          <input
            value={projectDraft.client}
            onChange={(event) => onProjectDraftChange('client', event.target.value)}
            placeholder={t('project.placeholders.client', 'Client, agency, or show')}
            className="ui-input ui-input-lg"
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
            className="ui-input ui-input-lg"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
          {t('project.fields.contact', 'Lead contact')}
          <input
            value={projectDraft.contact}
            onChange={(event) => onProjectDraftChange('contact', event.target.value)}
            placeholder={t('project.placeholders.contact', 'Producer or department contact')}
            className="ui-input ui-input-lg"
          />
        </label>
      </div>
      <button type="submit" className="ui-button ui-button-primary w-fit px-5">
        {t('project.actions.create', 'Create project')}
      </button>
    </form>

    <div className="ui-tile bg-surface-elevated/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold ui-heading">
            {t('project.list.title', 'Projects')}
          </h2>
          <p className="text-sm text-text-secondary">
            {tPlural('project.count', projects.length, '{count} project stored locally.', {
              count: projects.length
            })}
          </p>
        </div>
        <div className="text-xs text-text-muted">
          {t('project.lastSaved.label', 'Last saved: {time}', {
            time: lastSaved
              ? new Date(lastSaved).toLocaleString()
              : t('project.lastSaved.empty', 'Not saved yet')
          })}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted md:col-span-2">
            {t(
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
            return (
              <div
                key={project.id}
                className="ui-panel flex h-full flex-col gap-4 bg-surface-muted/60 p-4 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold ui-heading">
                      {resolveDisplayName(
                        project.name,
                        { index: projectIndex + 1 },
                        'defaults.untitled_project'
                      )}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {project.client || t('project.client.empty', 'Client not set')} ·{' '}
                      {formatScheduleSummary(project.shootSchedule ?? project.shootDate)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 text-xs text-text-secondary md:grid-cols-2">
                  <div className="rounded-lg border border-surface-sunken bg-surface-input/40 px-3 py-2">
                    <span className="font-semibold text-text-primary">
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
                  <div className="rounded-lg border border-surface-sunken bg-surface-input/40 px-3 py-2">
                    <span className="font-semibold text-text-primary">
                      {tPlural('items.count', itemTotal, '{count} items', { count: itemTotal })}
                    </span>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link
                    to={`/project/${project.id}`}
                    className="ui-button ui-button-primary px-3 py-1 text-xs no-underline"
                  >
                    {t('project.actions.open', 'Open')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDeleteProject(project.id)}
                    className="ui-button ui-button-danger px-3 py-1 text-xs"
                  >
                    {t('project.actions.archive', 'Archive')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {showAutoBackups ? (
      <div className="rounded-2xl border border-surface-sunken bg-surface-elevated/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold ui-heading">
              {t('dashboard.autoBackups.title', 'Auto backups')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t(
                'dashboard.autoBackups.description',
                'Review the on-device auto backups created by autosave.'
              )}
            </p>
          </div>
          <div className="text-xs text-text-muted">
            {tPlural(
              'dashboard.autoBackups.count',
              autoBackups.length,
              '{count} auto backup available.',
              {
                count: autoBackups.length
              }
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {autoBackups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted md:col-span-2">
              {t(
                'dashboard.autoBackups.empty',
                'No auto backups yet. Create or edit a project and autosave will create them.'
              )}
            </div>
          ) : (
            autoBackups.map((backup) => (
              <div
                key={backup.id}
                className="flex h-full flex-col gap-3 rounded-xl border border-surface-sunken bg-surface-muted/60 p-4"
              >
                <div>
                  <h3 className="text-sm font-semibold ui-heading">
                    {resolveStorageSource(backup.source)}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {t('dashboard.autoBackups.lastSaved', 'Last saved: {time}', {
                      time: backup.lastSaved
                        ? new Date(backup.lastSaved).toLocaleString()
                        : t('dashboard.autoBackups.lastSavedEmpty', 'Not saved yet')
                    })}
                  </p>
                </div>
                <div className="text-xs text-text-muted">
                  {tPlural(
                    'dashboard.autoBackups.projects',
                    backup.projectCount,
                    '{count} project in this backup.',
                    {
                      count: backup.projectCount
                    }
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    ) : null}
    </>
  );
};

export default ProjectDashboard;
