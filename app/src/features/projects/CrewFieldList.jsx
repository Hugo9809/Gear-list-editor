import { useMemo } from 'react';
import { createId } from '../../data/storage.js';
import TypeaheadInput from '../../shared/components/TypeaheadInput.jsx';

const normalizeCrewList = (crew) => (Array.isArray(crew) ? crew : []);

const CrewFieldList = ({ t, crew, roles, contacts, onChange }) => {
  const entries = normalizeCrewList(crew);
  const availableRoles = Array.isArray(roles) ? roles : [];
  const availableContacts = Array.isArray(contacts) ? contacts : [];

  const contactSuggestions = useMemo(() =>
    availableContacts
      .map((contact) => {
        const details = [contact.role, contact.phone, contact.email].filter(Boolean).join(' | ');
        return {
          ...contact,
          name: contact.name,
          details
        };
      })
      .filter((contact) => contact.name),
    [availableContacts]
  );

  const handleAdd = () => {
    onChange([
      ...entries,
      {
        id: createId(),
        name: '',
        role: '',
        phone: '',
        email: ''
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

  const handleSelectContact = (entryId, contact) => {
    onChange(
      entries.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }
        return {
          ...entry,
          name: contact.name || entry.name,
          role: contact.role || entry.role,
          phone: contact.phone || entry.phone,
          email: contact.email || entry.email
        };
      })
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
                className="grid items-center gap-2 md:grid-cols-[2fr_2fr_1.5fr_2fr_auto]"
              >
                <TypeaheadInput
                  value={entry.name}
                  onChange={(value) => handleUpdate(entry.id, 'name', value)}
                  onSelectSuggestion={(suggestion) => handleSelectContact(entry.id, suggestion)}
                  suggestions={contactSuggestions}
                  placeholder={t('project.crew.namePlaceholder', 'Crew member name')}
                  label={t('project.crew.namePlaceholder', 'Crew member name')}
                  detailsFallback={t('contacts.suggestionFallback', 'No contact details')}
                  inputClassName="ui-input"
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
                <input
                  type="tel"
                  value={entry.phone || ''}
                  onChange={(event) => handleUpdate(entry.id, 'phone', event.target.value)}
                  placeholder={t('project.crew.phonePlaceholder', 'Phone')}
                  className="ui-input"
                />
                <input
                  type="email"
                  value={entry.email || ''}
                  onChange={(event) => handleUpdate(entry.id, 'email', event.target.value)}
                  placeholder={t('project.crew.emailPlaceholder', 'Email')}
                  className="ui-input"
                />
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
