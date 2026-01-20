import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // App uses BrowserRouter usually, but we might need to wrap it or mock it if App renders Router
import App from './App';

// Mock the storage service to avoid side effects
vi.mock('./data/storage.js', () => ({
    createStorageService: () => ({
        loadState: vi.fn().mockResolvedValue({
            state: {
                projects: [],
                templates: [],
                deviceLibrary: { items: [] },
                history: { items: [] },
                theme: 'light',
                showAutoBackups: false,
                lastSaved: null
            },
            warnings: [],
            source: 'defaults'
        }),
        scheduleAutosave: vi.fn(),
        listAutoBackups: vi.fn().mockResolvedValue([]),
        exportBackup: vi.fn(),
        dispose: vi.fn(),
        saveNow: vi.fn(),
        factoryReset: vi.fn()
    }),
    STORAGE_MESSAGE_KEYS: {
        sources: { empty: 'empty', local: 'local', backup: 'backup' },
        defaults: { item: 'Item' }
    }
}));

// Mock the router if App contains Routes but we want to test with MemoryRouter?
// App.jsx imports { Routes, Route, useNavigate } from 'react-router-dom'.
// Usually App is wrapped in BrowserRouter in main.jsx.
// In tests, we should wrap App in MemoryRouter.
// However, App itself *uses* Routes/Route. It does NOT render BrowserRouter.
// So we can wrap App in MemoryRouter here.

describe('App Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the dashboard by default', async () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        // Initial loading state
        expect(screen.getByText(/Loading your saved gear list/i)).toBeInTheDocument();

        // After loading (useEffect in useStorageHydration)
        await waitFor(() => {
            expect(screen.getByText(/Project dashboard/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Create project/i)).toBeInTheDocument();
    });
});
