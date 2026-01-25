import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ContactEditor from './ContactEditor.jsx';
import { useContacts } from './useContacts.js';
import ConfirmDialog from '../../shared/components/ConfirmDialog.jsx';

export default function ContactsPage({ t, contacts, setContacts, setStatus }) {
  const {
    contacts: contactList,
    addContact,
    updateContact,
    deleteContact
  } = useContacts({ contacts, setContacts, t, setStatus });

  const [editingContact, setEditingContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const emptyValue = t('ui.emptyValue', '—');

  const handleSave = (draft) => {
    if (editingContact) {
      updateContact(editingContact.id, draft);
      setEditingContact(null);
    } else {
      addContact(draft);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setEditingContact(null);
    setIsAdding(false);
  };

  const handleDelete = (contactId) => {
    setContactToDelete(contactId);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      deleteContact(contactToDelete);
      setContactToDelete(null);
    }
  };

  return (
    <section className="ui-tile bg-surface-elevated/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold ui-heading">{t('contacts.title', 'Contacts')}</h2>
          <p className="text-sm text-text-secondary">
            {t(
              'contacts.description',
              'Manage your global crew contacts so phone and email details are ready in every project.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingContact(null);
            setIsAdding(true);
          }}
          className="ui-button ui-button-primary gap-2"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          {t('contacts.add', 'Add contact')}
        </button>
      </div>
      <p className="mt-3 text-xs text-text-muted">
        {t(
          'contacts.helper',
          'Contacts sync into crew entry suggestions and keep role, phone, and email details consistent.'
        )}
      </p>

      <div className="mt-6 ui-panel bg-surface-base/80 p-4">
        {contactList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-surface-sunken bg-surface-muted/70 px-4 py-6 text-center text-sm text-text-muted">
            {t('contacts.empty', 'No contacts yet. Add crew contacts to reuse them in projects.')}
          </div>
        ) : (
          <div className="grid gap-3">
            {contactList.map((contact) => (
              <div
                key={contact.id}
                className="rounded-xl border border-surface-sunken bg-surface-muted/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                      {contact.role || t('contacts.roleEmpty', 'Role not set')}
                    </p>
                    <h3 className="text-base font-semibold ui-heading">{contact.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingContact(contact);
                      }}
                      className="ui-button ui-button-outline px-3 py-1 text-xs"
                    >
                      {t('contacts.actions.edit', 'Edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(contact.id)}
                      className="ui-button ui-button-danger px-3 py-1 text-xs"
                    >
                      {t('contacts.actions.delete', 'Delete')}
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-text-secondary md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-text-primary">
                      {t('contacts.fields.phone', 'Phone')}:
                    </span>{' '}
                    {contact.phone || emptyValue}
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">
                      {t('contacts.fields.email', 'Email')}:
                    </span>{' '}
                    {contact.email || emptyValue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isAdding || editingContact) && (
        <ContactEditor
          t={t}
          contact={editingContact}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <ConfirmDialog
        isOpen={!!contactToDelete}
        title={t('contacts.deleteTitle', 'Delete Contact')}
        message={t('contacts.confirmDelete', 'Are you sure you want to delete this contact?')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setContactToDelete(null)}
        confirmText={t('contacts.actions.delete', 'Delete')}
        cancelText={t('general.cancel', 'Cancel')}
        isDestructive={true}
        t={t}
      />
    </section>
  );
}
