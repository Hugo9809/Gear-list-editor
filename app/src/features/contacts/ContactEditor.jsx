import { useEffect, useMemo, useState } from 'react';
import { crewRoles } from '../../data/crewRoles.js';

const emptyDraft = {
  name: '',
  role: '',
  phone: '',
  email: ''
};

export default function ContactEditor({ t, contact, onSave, onCancel }) {
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    const target = contact || emptyDraft;
    setDraft((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(target)) {
        return {
          name: target.name || '',
          role: target.role || '',
          phone: target.phone || '',
          email: target.email || ''
        };
      }
      return prev;
    });
  }, [contact]);

  const roleOptions = useMemo(() => {
    if (draft.role && !crewRoles.includes(draft.role)) {
      return [...crewRoles, draft.role];
    }
    return crewRoles;
  }, [draft.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/70 p-4 backdrop-blur-sm">
      <div className="ui-tile w-full max-w-lg bg-surface-elevated/95 p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold ui-heading">
            {contact
              ? t('contacts.editor.titleEdit', 'Edit contact')
              : t('contacts.editor.titleAdd', 'Add contact')}
          </h3>
          <p className="text-sm text-text-secondary">
            {t(
              'contacts.editor.helper',
              'Store trusted crew contacts so projects can reuse phone and email details quickly.'
            )}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('contacts.fields.name', 'Name')}
            <input
              type="text"
              name="name"
              required
              value={draft.name}
              onChange={handleChange}
              placeholder={t('contacts.placeholders.name', 'Crew member name')}
              className="ui-input ui-input-lg"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('contacts.fields.role', 'Role')}
            <select
              name="role"
              value={draft.role}
              onChange={handleChange}
              className="ui-select"
            >
              <option value="">{t('project.crew.rolePlaceholder', 'Select role')}</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('contacts.fields.phone', 'Phone')}
            <input
              type="tel"
              name="phone"
              value={draft.phone}
              onChange={handleChange}
              placeholder={t('contacts.placeholders.phone', 'Phone')}
              className="ui-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            {t('contacts.fields.email', 'Email')}
            <input
              type="email"
              name="email"
              value={draft.email}
              onChange={handleChange}
              placeholder={t('contacts.placeholders.email', 'Email')}
              className="ui-input"
            />
          </label>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onCancel} className="ui-button ui-button-outline">
              {t('general.cancel', 'Cancel')}
            </button>
            <button type="submit" className="ui-button ui-button-primary">
              {t('general.save', 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
