import TypeaheadInput from '../../shared/components/TypeaheadInput.jsx';
import { crewRoles } from '../../data/crewRoles.js';
import { rentalHouseSuggestions, formatRentalHouseValue } from '../../data/rentalHouses.js';
import CrewFieldList from './CrewFieldList.jsx';
import ShootScheduleFields from './ShootScheduleFields.jsx';

/**
 * Render the active project workspace with categories, items, and notes.
 * Assumes callbacks handle state updates and persistence.
 */
const ProjectWorkspace = ({
  t,
  tPlural,
  activeProject,
  activeProjectIndex,
  contacts,
  totals,
  resolveDisplayName,
  onBackToDashboard,
  onExportPdf,
  onExportProject,
  onSaveTemplate,
  newCategoryName,
  onNewCategoryNameChange,
  onAddCategory,
  itemSuggestions,
  getItemDraft,
  onUpdateDraftItem,
  onAddItemToCategory,
  onUpdateItemField,
  onUpdateCategoryField,
  onUpdateProjectField,
  onUpdateProjectNotes,
  onRemoveCategory,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onRemoveItem,
  onApplySuggestionToDraft,
  onApplySuggestionToItem
}) => (
  <div className="ui-tile bg-surface-elevated/60 p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold ui-heading">
          {resolveDisplayName(
            activeProject?.name,
            { index: Math.max(activeProjectIndex, 0) + 1 },
            'defaults.untitled_project'
          )}
        </h2>
        <p className="text-sm text-text-secondary">
          {activeProject
            ? t('project.workspace.summary', '{categories} · {items}', {
                categories: tPlural('categories.count', totals.categories, '{count} categories', {
                  count: totals.categories
                }),
                items: tPlural('items.count', totals.items, '{count} items', {
                  count: totals.items
                })
              })
            : t('project.workspace.empty', 'Select a project to start editing.')}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onBackToDashboard} className="ui-button ui-button-outline">
          {t('project.actions.backToDashboard', 'Back to dashboard')}
        </button>
        {activeProject && (
          <>
            <button type="button" onClick={onExportProject} className="ui-button ui-button-outline">
              {t('project.actions.export', 'Export project')}
            </button>
            <button type="button" onClick={onSaveTemplate} className="ui-button ui-button-outline">
              {t('template.actions.saveFromProject', 'Save as template')}
            </button>
            <button type="button" onClick={onExportPdf} className="ui-button ui-button-primary">
              {t('project.actions.exportPdf', 'Export PDF')}
            </button>
          </>
        )}
      </div>
    </div>

    {activeProject ? (
      <div className="mt-6 flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.name', 'Project name')}
            <input
              value={resolveDisplayName(
                activeProject.name,
                { index: Math.max(activeProjectIndex, 0) + 1 },
                'defaults.untitled_project'
              )}
              onChange={(event) => onUpdateProjectField('name', event.target.value)}
              className="ui-input ui-input-lg"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.client', 'Client / production')}
            <input
              value={activeProject.client}
              onChange={(event) => onUpdateProjectField('client', event.target.value)}
              className="ui-input ui-input-lg"
            />
          </label>
          <ShootScheduleFields
            t={t}
            schedule={activeProject.shootSchedule ?? activeProject.shootDate}
            onChange={(value) => onUpdateProjectField('shootSchedule', value)}
            className="md:col-span-2"
          />
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('project.fields.location', 'Location')}
            <input
              value={activeProject.location}
              onChange={(event) => onUpdateProjectField('location', event.target.value)}
              className="ui-input ui-input-lg"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
            {t('project.fields.contact', 'Rental house')}
            <TypeaheadInput
              value={activeProject.contact}
              onChange={(value) => onUpdateProjectField('contact', value)}
              onSelectSuggestion={(suggestion) =>
                onUpdateProjectField('contact', formatRentalHouseValue(suggestion))
              }
              suggestions={rentalHouseSuggestions}
              placeholder={t(
                'project.placeholders.contact',
                'Rental house name, address, phone'
              )}
              label={t('project.fields.contact', 'Rental house')}
              inputClassName="ui-input ui-input-lg"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm text-text-secondary md:col-span-2">
            <CrewFieldList
              t={t}
              crew={activeProject.crew}
              contacts={contacts}
              roles={crewRoles}
              onChange={(nextCrew) => onUpdateProjectField('crew', nextCrew)}
            />
          </div>
        </div>

        <form
          onSubmit={onAddCategory}
          className="ui-panel flex flex-col gap-3 bg-surface-muted/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold ui-heading">
              {t('categories.title', 'Categories')}
            </h3>
            <span className="text-xs text-text-muted">
              {t('categories.helper', 'Use templates for faster setups.')}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              value={newCategoryName}
              onChange={(event) => onNewCategoryNameChange(event.target.value)}
              placeholder={t('categories.placeholder', 'Add a category (e.g. Camera, Lighting)')}
              className="ui-input flex-1"
            />
            <button type="submit" className="ui-button ui-button-primary">
              {t('categories.actions.add', 'Add category')}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          {activeProject.categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
              {t('categories.empty', 'No categories yet. Add one above or apply a template.')}
            </div>
          ) : (
            activeProject.categories.map((category, categoryIndex) => (
              <div
                key={category.id}
                className="ui-tile flex flex-col gap-4 border-l-4 border-l-brand bg-surface-elevated/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-1 flex-col gap-3">
                    <input
                      value={resolveDisplayName(
                        category.name,
                        { index: categoryIndex + 1 },
                        'defaults.untitled_category'
                      )}
                      onChange={(event) =>
                        onUpdateCategoryField(category.id, 'name', event.target.value)
                      }
                      className="ui-input px-3 py-2 text-lg font-semibold"
                    />
                    <textarea
                      value={category.notes}
                      onChange={(event) =>
                        onUpdateCategoryField(category.id, 'notes', event.target.value)
                      }
                      placeholder={t(
                        'categories.notes.placeholder',
                        'Category notes or rental references'
                      )}
                      rows={2}
                      className="ui-textarea px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onMoveCategoryUp(category.id)}
                      disabled={categoryIndex === 0}
                      className="ui-button ui-button-outline px-2 py-1 text-sm disabled:opacity-40"
                      aria-label={t('categories.actions.moveUp', 'Move up')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveCategoryDown(category.id)}
                      disabled={categoryIndex === activeProject.categories.length - 1}
                      className="ui-button ui-button-outline px-2 py-1 text-sm disabled:opacity-40"
                      aria-label={t('categories.actions.moveDown', 'Move down')}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCategory(category.id)}
                      className="ui-button ui-button-danger px-3 py-2 text-xs uppercase tracking-wide"
                    >
                      {t('categories.actions.remove', 'Remove category')}
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={(event) => onAddItemToCategory(event, category.id)}
                  className="ui-panel grid gap-3 bg-surface-base/90 p-3 md:grid-cols-[3fr_2fr_auto]"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={getItemDraft(category.id).quantity}
                      onChange={(event) =>
                        onUpdateDraftItem(category.id, 'quantity', event.target.value)
                      }
                      className="ui-input w-20"
                    />
                    <span className="text-sm font-semibold text-text-muted">×</span>
                    <div className="min-w-0 flex-1">
                        <TypeaheadInput
                          value={getItemDraft(category.id).name}
                          onChange={(value) => onUpdateDraftItem(category.id, 'name', value)}
                          onSelectSuggestion={(suggestion) =>
                            onApplySuggestionToDraft(category.id, suggestion)
                          }
                          suggestions={itemSuggestions}
                          placeholder={t('items.fields.name', 'Item name')}
                          label={t('items.fields.name', 'Item name')}
                          detailsFallback={t('items.suggestion.detailsFallback')}
                          inputClassName="ui-input px-3 py-2"
                        />
                    </div>
                  </div>
                  <input
                    value={getItemDraft(category.id).details}
                    onChange={(event) =>
                      onUpdateDraftItem(category.id, 'details', event.target.value)
                    }
                    placeholder={t('items.fields.details', 'Details / notes')}
                    className="ui-input px-3 py-2"
                  />
                  <button type="submit" className="ui-button ui-button-primary text-xs">
                    {t('items.actions.add', 'Add')}
                  </button>
                </form>

                <div className="flex flex-col gap-3">
                  {category.items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-4 text-center text-xs text-text-muted">
                      {t('items.empty', 'No items yet. Add the first item above.')}
                    </div>
                  ) : (
                    category.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="ui-panel grid gap-3 bg-surface-muted/70 p-3 md:grid-cols-[3fr_2fr_auto]"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              onUpdateItemField(
                                category.id,
                                item.id,
                                'quantity',
                                event.target.value
                              )
                            }
                            className="ui-input w-20"
                          />
                          <span className="text-sm font-semibold text-text-muted">×</span>
                          <div className="min-w-0 flex-1">
                            <TypeaheadInput
                              value={resolveDisplayName(
                                item.name,
                                { index: itemIndex + 1 },
                                'defaults.untitled_item'
                              )}
                              onChange={(value) =>
                                onUpdateItemField(category.id, item.id, 'name', value)
                              }
                              onSelectSuggestion={(suggestion) =>
                                onApplySuggestionToItem(category.id, item.id, suggestion)
                              }
                              suggestions={itemSuggestions}
                              placeholder={t('items.fields.name', 'Item name')}
                              label={t('items.fields.name', 'Item name')}
                              detailsFallback={t('items.suggestion.detailsFallback')}
                              inputClassName="ui-input px-3 py-2"
                            />
                          </div>
                        </div>
                        <input
                          value={item.details}
                          onChange={(event) =>
                            onUpdateItemField(category.id, item.id, 'details', event.target.value)
                          }
                          className="ui-input px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveItem(category.id, item.id)}
                          className="ui-button ui-button-danger px-3 py-2 text-xs uppercase tracking-wide"
                        >
                          {t('items.actions.remove', 'Remove')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="ui-tile bg-surface-elevated/60 p-4">
          <h3 className="text-lg font-semibold ui-heading">
            {t('project.notes.title', 'Project notes')}
          </h3>
          <p className="text-sm text-text-secondary">
            {t(
              'project.notes.helper',
              'Notes appear in exports and are included in backups for every project.'
            )}
          </p>
          <textarea
            value={activeProject.notes}
            onChange={(event) => onUpdateProjectNotes(event.target.value)}
            placeholder={t(
              'project.notes.placeholder',
              'Crew notes, pickup info, or return instructions'
            )}
            rows={4}
            className="ui-textarea mt-3 rounded-xl"
          />
        </div>
      </div>
    ) : (
      <div className="mt-6 rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
        {t(
          'project.workspace.emptyState',
          'Select or create a project to unlock the gear list editor.'
        )}
      </div>
    )}
  </div>
);

export default ProjectWorkspace;
