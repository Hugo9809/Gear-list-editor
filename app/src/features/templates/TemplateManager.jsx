import { useState } from 'react';

/**
 * Render the template management UI and saved template cards.
 * Assumes templates are stored locally and callbacks update state.
 */
const TemplateManager = ({
  t,
  tPlural,
  templateDraft,
  onTemplateDraftChange,
  onSubmit,
  templates,
  resolveDisplayName,
  onUpdateTemplateField,
  onApplyTemplate,
  onRemoveTemplate
}) => {
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const handleDeleteTemplate = (templateId) => {
    if (deleteConfirmationId === templateId) {
      onRemoveTemplate(templateId);
      setDeleteConfirmationId(null);
      return;
    }
    setDeleteConfirmationId(templateId);
    setTimeout(
      () => setDeleteConfirmationId((current) => (current === templateId ? null : current)),
      3000
    );
  };

  return (
    <form onSubmit={onSubmit} className="ui-tile bg-surface-elevated/60 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold ui-heading">
          {t('template.management.title', 'Template management')}
        </h2>
        <p className="text-sm text-text-secondary">
          {t(
            'template.management.description',
            'Save reusable setups for recurring shoots. Templates can be applied to any project without overwriting existing data.'
          )}
        </p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-text-secondary">
          {t('template.fields.name', 'Template name')}
          <input
            value={templateDraft.name}
            onChange={(event) => onTemplateDraftChange('name', event.target.value)}
            placeholder={t('template.placeholders.name', 'e.g. Standard documentary kit')}
            className="ui-input ui-input-lg"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-text-secondary">
          {t('template.fields.description', 'Description')}
          <input
            value={templateDraft.description}
            onChange={(event) => onTemplateDraftChange('description', event.target.value)}
            placeholder={t('template.placeholders.description', 'Key details or usage')}
            className="ui-input ui-input-lg"
          />
        </label>
      </div>
      <button type="submit" className="ui-button ui-button-primary mt-4 w-fit px-5">
        {t('template.actions.saveCurrent', 'Save current project as template')}
      </button>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted md:col-span-2">
            {t(
              'template.list.empty',
              'No templates yet. Save the active project to build your library.'
            )}
          </div>
        ) : (
          templates.map((template, templateIndex) => (
            <div
              key={template.id}
              className="ui-panel flex h-full flex-col gap-3 bg-surface-muted/60 p-4"
            >
              <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                {t('template.fields.shortName', 'Name')}
                <input
                  value={resolveDisplayName(
                    template.name,
                    { index: templateIndex + 1 },
                    'defaults.untitled_template'
                  )}
                  onChange={(event) => onUpdateTemplateField(template.id, 'name', event.target.value)}
                  className="ui-input px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-text-secondary">
                {t('template.fields.description', 'Description')}
                <input
                  value={template.description}
                  onChange={(event) =>
                    onUpdateTemplateField(template.id, 'description', event.target.value)
                  }
                  className="ui-input px-3 py-2"
                />
              </label>
              <div className="text-xs text-text-muted">
                {t('template.card.meta', '{categories} · Last used {date}', {
                  categories: tPlural(
                    'categories.count',
                    template.categories.length,
                    '{count} categories',
                    {
                      count: template.categories.length
                    }
                  ),
                  date: template.lastUsed
                    ? new Date(template.lastUsed).toLocaleDateString()
                    : t('template.lastUsed.never', 'Never')
                })}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onApplyTemplate(template.id)}
                  className="ui-button ui-button-primary px-3 py-2 text-xs"
                >
                  {t('template.actions.apply', 'Apply to active project')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(template.id)}
                  className={`ui-button px-3 py-2 text-xs transition-colors ${deleteConfirmationId === template.id
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'ui-button-danger'
                    }`}
                >
                  {deleteConfirmationId === template.id
                    ? t('general.confirm', 'Confirm')
                    : t('general.delete', 'Delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </form>
  );
};

export default TemplateManager;
