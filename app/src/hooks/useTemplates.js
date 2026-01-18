import { useCallback, useEffect, useState } from 'react';
import { createId } from '../data/storage.js';

const emptyTemplateDraft = {
  name: '',
  description: ''
};

/**
 * Manage template library state and template workflows.
 * Assumes project state is provided by the caller.
 */
export const useTemplates = ({ t, setStatus, activeProject, updateProject, rememberItem }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateDraft, setTemplateDraft] = useState(emptyTemplateDraft);

  useEffect(() => {
    if (templates.length === 0) {
      setSelectedTemplateId('');
      return;
    }
    setSelectedTemplateId((prev) =>
      templates.some((template) => template.id === prev) ? prev : templates[0].id
    );
  }, [templates]);

  const updateTemplateDraftField = useCallback((field, value) => {
    setTemplateDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveTemplateFromProject = useCallback(() => {
    if (!activeProject) {
      setStatus(t('status.projectNeededForTemplate', 'Create a project before saving a template.'));
      return;
    }
    const name = templateDraft.name.trim();
    if (!name) {
      setStatus(t('status.templateNameRequired', 'Please name the template.'));
      return;
    }
    const template = {
      id: createId(),
      name,
      description: templateDraft.description.trim(),
      notes: activeProject.notes,
      categories: activeProject.categories.map((category) => ({
        ...category,
        id: createId(),
        items: category.items.map((item) => ({
          ...item,
          id: createId()
        }))
      })),
      lastUsed: new Date().toISOString()
    };
    setTemplates((prev) => [template, ...prev]);
    setTemplateDraft(emptyTemplateDraft);
    setStatus(t('status.templateSaved', 'Template saved from the current project.'));
  }, [activeProject, setStatus, t, templateDraft.description, templateDraft.name]);

  const handleTemplateSubmit = useCallback(
    (event) => {
      event.preventDefault();
      saveTemplateFromProject();
    },
    [saveTemplateFromProject]
  );

  const applyTemplateToProject = useCallback(
    (templateId) => {
      if (!activeProject) {
        setStatus(
          t('status.projectNeededForApplyTemplate', 'Select a project before applying a template.')
        );
        return;
      }
      const template = templates.find((item) => item.id === templateId);
      if (!template) {
        return;
      }
      template.categories.forEach((category) => {
        category.items.forEach((item) => rememberItem(item));
      });
      updateProject(activeProject.id, (project) => ({
        ...project,
        categories: [
          ...project.categories,
          ...template.categories.map((category) => ({
            ...category,
            id: createId(),
            items: category.items.map((item) => ({
              ...item,
              id: createId()
            }))
          }))
        ]
      }));
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === templateId ? { ...item, lastUsed: new Date().toISOString() } : item
        )
      );
      setStatus(t('status.templateApplied', 'Template applied. Autosave will secure the updated list.'));
    },
    [activeProject, rememberItem, setStatus, t, templates, updateProject]
  );

  const handleLoadTemplate = useCallback(() => {
    if (!selectedTemplateId) {
      setStatus(
        t('status.templateSelectionRequired', 'Select a template to load into the active project.')
      );
      return;
    }
    applyTemplateToProject(selectedTemplateId);
  }, [applyTemplateToProject, selectedTemplateId, setStatus, t]);

  const updateTemplateField = useCallback(
    (templateId, field, value) => {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === templateId
            ? {
                ...template,
                [field]: value
              }
            : template
        )
      );
      setStatus(t('status.templateUpdated', 'Template updated.'));
    },
    [setStatus, t]
  );

  const removeTemplate = useCallback(
    (templateId) => {
      setTemplates((prev) => prev.filter((template) => template.id !== templateId));
      setStatus(t('status.templateRemoved', 'Template removed.'));
    },
    [setStatus, t]
  );

  return {
    templates,
    setTemplates,
    selectedTemplateId,
    setSelectedTemplateId,
    templateDraft,
    updateTemplateDraftField,
    saveTemplateFromProject,
    handleTemplateSubmit,
    applyTemplateToProject,
    handleLoadTemplate,
    updateTemplateField,
    removeTemplate
  };
};
