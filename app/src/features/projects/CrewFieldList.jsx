import { createId } from '../../data/storage.js';

const normalizeCrewList = (crew) => (Array.isArray(crew) ? crew : []);

const CrewFieldList = ({ t, crew, roles, onChange }) => {
  const entries = normalizeCrewList(crew);
  const availableRoles = Array.isArray(roles) ? roles : [];

  const handleAdd = () => {
    onChange([
      ...entries,
      {
        id: createId(),
        name: '',
        role: ''
      }
    ]);
  };

  const handleRemove = (entryId) => {
    onChange(entries.filter((entry) => entry.id !== entryId));
  };

  const handleUpdate = (entryId, field, value) => {
    onChange(
      entries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              [field]: value
            }
          : entry
      )
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-text-secondary">
          {t('project.fields.crew', 'Crew')}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="ui-button ui-button-outline px-3 py-1 text-xs"
        >
          + {t('project.actions.addCrewMember', 'Add crew member')}
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-3 py-3 text-xs text-text-muted">
          {t('project.crew.empty', 'No crew added yet.')}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => {
            const roleOptions = entry.role && !availableRoles.includes(entry.role)
              ? [...availableRoles, entry.role]
              : availableRoles;
            return (
              <div
                key={entry.id}
                className="grid items-center gap-2 md:grid-cols-[2fr_2fr_auto]"
              >
                <input
                  value={entry.name}
                  onChange={(event) => handleUpdate(entry.id, 'name', event.target.value)}
                  placeholder={t('project.crew.namePlaceholder', 'Crew member name')}
                  className="ui-input"
                />
                <select
                  value={entry.role}
                  onChange={(event) => handleUpdate(entry.id, 'role', event.target.value)}
                  className="ui-select"
                >
                  <option value="">{t('project.crew.rolePlaceholder', 'Select role')}</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemove(entry.id)}
                  className="ui-button ui-button-outline px-3 py-1 text-xs"
                  aria-label={t('project.actions.removeCrewMember', 'Remove crew member')}
                >
                  -
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CrewFieldList;
