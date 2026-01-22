// @ts-check
import { useCallback } from 'react';
import { createId } from '../../data/storage.js';

const normalizeDraft = (draft, existing = {}) => {
  const name = typeof draft?.name === 'string' ? draft.name.trim() : existing.name || '';
  if (!name) {
    return { error: 'missing' };
  }
  return {
    name,
    role: typeof draft?.role === 'string' ? draft.role.trim() : existing.role || '',
    phone: typeof draft?.phone === 'string' ? draft.phone.trim() : existing.phone || '',
    email: typeof draft?.email === 'string' ? draft.email.trim() : existing.email || ''
  };
};

export const useContacts = ({ contacts, setContacts, t, setStatus }) => {
  const contactList = Array.isArray(contacts) ? contacts : [];

  const addContact = useCallback(
    (draft) => {
      const normalized = normalizeDraft(draft);
      if (normalized.error) {
        setStatus(t('status.contactNameRequired', 'Please provide a contact name.'));
        return;
      }

      const newContact = {
        id: createId(),
        ...normalized
      };

      setContacts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [newContact, ...safePrev];
      });

      setStatus(t('status.contactAdded', 'Contact added.'));
    },
    [setContacts, setStatus, t]
  );

  const updateContact = useCallback(
    (id, updates) => {
      let hasError = false;
      setContacts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map((contact) => {
          if (contact.id !== id) {
            return contact;
          }
          const normalized = normalizeDraft(updates, contact);
          if (normalized.error) {
            hasError = true;
            return contact;
          }
          return { ...contact, ...normalized };
        });
      });

      if (hasError) {
        setStatus(t('status.contactNameRequired', 'Please provide a contact name.'));
        return;
      }
      setStatus(t('status.contactUpdated', 'Contact updated.'));
    },
    [setContacts, setStatus, t]
  );

  const deleteContact = useCallback(
    (id) => {
      setContacts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter((contact) => contact.id !== id);
      });
      setStatus(t('status.contactDeleted', 'Contact deleted.'));
    },
    [setContacts, setStatus, t]
  );

  return {
    contacts: contactList,
    addContact,
    updateContact,
    deleteContact
  };
};
