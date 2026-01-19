import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProjectWorkspaceContainer from '../ProjectWorkspaceContainer.jsx';

const createProject = (overrides = {}) => ({
  id: 'project-1',
  name: 'Test Project',
  client: 'Client',
  shootDate: '2025-01-01',
  location: 'Studio',
  contact: 'Producer',
  notes: '',
  categories: [
    {
      id: 'cat-1',
      name: 'Camera',
      notes: '',
      items: [{ id: 'item-1' }, { id: 'item-2' }]
    },
    {
      id: 'cat-2',
      name: 'Lighting',
      notes: '',
      items: [{ id: 'item-3' }]
    }
  ],
  ...overrides
});

const createProjectActions = () => ({
  addCategory: vi.fn(),
  moveCategoryUp: vi.fn(),
  moveCategoryDown: vi.fn(),
  addItemToCategory: vi.fn(),
  updateDraftItem: vi.fn(),
  updateItemField: vi.fn(),
  updateCategoryField: vi.fn(),
  updateProjectField: vi.fn(),
  updateProjectNotes: vi.fn(),
  removeCategory: vi.fn(),
  removeItem: vi.fn(),
  applySuggestionToDraft: vi.fn(),
  applySuggestionToItem: vi.fn()
});

const t = (key, fallback, variables) => {
  const template = fallback ?? key;
  if (!variables) {
    return template;
  }
  return Object.entries(variables).reduce(
    (acc, [name, value]) => acc.replace(`{${name}}`, value),
    template
  );
};

const tPlural = (key, count, fallback, variables) => {
  const template = fallback ?? key;
  const countValue = variables?.count ?? count;
  return template.replace('{count}', countValue);
};

const resolveDisplayName = (value, variables, fallbackKey) => {
  if (value) {
    return value;
  }
  return `${fallbackKey}-${variables?.index ?? ''}`;
};

const renderWorkspace = ({
  initialEntry = '/project/project-1',
  projects = [createProject()],
  isHydrated = true
} = {}) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>Dashboard Home</div>} />
        <Route
          path="/project/:projectId"
          element={
            <ProjectWorkspaceContainer
              t={t}
              tPlural={tPlural}
              projects={projects}
              resolveDisplayName={resolveDisplayName}
              onBackToDashboard={vi.fn()}
              onExportPdf={vi.fn()}
              onExportProject={vi.fn()}
              onSaveTemplate={vi.fn()}
              newCategoryName=""
              onNewCategoryNameChange={vi.fn()}
              itemSuggestions={[]}
              getItemDraft={() => ({ quantity: '', name: '', details: '' })}
              isHydrated={isHydrated}
              projectActions={createProjectActions()}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProjectWorkspaceContainer', () => {
  it('renders the workspace for a valid project id', () => {
    renderWorkspace();

    expect(screen.getByText('Active project workspace')).toBeInTheDocument();
  });

  it('navigates back to the dashboard for an invalid project id', () => {
    renderWorkspace({ initialEntry: '/project/missing' });

    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
  });

  it('shows totals based on the project data', () => {
    renderWorkspace();

    expect(screen.getByText('2 categories · 3 items')).toBeInTheDocument();
  });
});
