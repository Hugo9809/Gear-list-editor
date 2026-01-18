import { NavLink, Outlet } from 'react-router-dom';

export default function Layout({ t, status, theme, setTheme, locale, setLocale, locales }) {
    const navigationTabs = [
        { path: '/', label: t('navigation.sidebar.dashboard', 'All Projects'), end: true },
        { path: '/templates', label: t('navigation.sidebar.templates', 'Templates') },
        { path: '/settings', label: t('navigation.sidebar.settings', 'Settings') },
        { path: '/help', label: t('navigation.sidebar.help', 'Help') }
    ];

    const themeOptions = [
        { id: 'light', label: t('theme.options.light', 'Light'), icon: '☀️' },
        { id: 'dark', label: t('theme.options.dark', 'Dark'), icon: '🌙' },
        { id: 'pink', label: t('theme.options.pink', 'Pink'), icon: '🦄' }
    ];

    const statusClasses = status
        ? 'border border-brand/40 bg-brand/10 text-brand'
        : 'border border-surface-sunken bg-surface-elevated/60 text-text-secondary';

    return (
        <div className="min-h-screen bg-gradient-to-b from-surface-app via-surface-app to-surface-muted">
            <div className="mx-auto w-full max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="ui-sidebar flex w-full flex-col gap-6 p-5 lg:w-80">
                        <div className="flex flex-col gap-3">
                            <h1 className="w-full text-[1.6rem] font-normal ui-heading tracking-tight">
                                {t('ui.appName', 'Gear List Creator')}
                            </h1>
                            <div className="rounded-2xl border border-surface-sunken/60 bg-surface-elevated/70 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                                    {t('ui.sidebar.title', 'Safe offline workspace')}
                                </p>
                                <p className="mt-2 text-sm text-text-secondary">
                                    {t(
                                        'ui.sidebar.description',
                                        'Your All Projects view keeps projects close while autosave runs in the background.'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="ui-sidebar-section">
                            <nav className="flex flex-col gap-2">
                                {navigationTabs.map((tab) => (
                                    <NavLink
                                        key={tab.path}
                                        to={tab.path}
                                        end={tab.end}
                                        className={({ isActive }) =>
                                            `ui-sidebar-tab ${isActive ? 'ui-sidebar-tab-active' : ''}`
                                        }
                                    >
                                        {tab.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="ui-sidebar-section">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                                        {t('theme.label', 'Theme')}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {themeOptions.map((themeOption) => {
                                            const isActive = theme === themeOption.id;
                                            return (
                                                <button
                                                    key={themeOption.id}
                                                    type="button"
                                                    onClick={() => setTheme(themeOption.id)}
                                                    aria-pressed={isActive}
                                                    className={`ui-button gap-2 px-3 py-1.5 text-xs ${isActive ? 'bg-brand text-brand-foreground' : 'ui-button-outline'
                                                        }`}
                                                >
                                                    <span aria-hidden="true">{themeOption.icon}</span>
                                                    <span>{themeOption.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                                        {t('language.label', 'Language')}
                                    </p>
                                    <select
                                        value={locale}
                                        onChange={(e) => setLocale(e.target.value)}
                                        className="ui-select text-sm"
                                        aria-label={t('language.label', 'Language')}
                                    >
                                        {locales.map((option) => (
                                            <option key={option.code} value={option.code}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl bg-surface-elevated/60 p-4 text-sm ${statusClasses}`} aria-live="polite">
                            {status || t('status.empty', 'Status updates appear here to confirm data safety.')}
                        </div>
                    </aside>

                    <main className="flex flex-1 flex-col gap-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
