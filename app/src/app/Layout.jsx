import { NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout({ t, status, theme, setTheme, locale, setLocale, locales }) {
  // Mobile hamburger-driven drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer when screen grows beyond the mobile breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const baseUrl = import.meta.env?.BASE_URL ?? '/';
  const themeIcons = {
    light: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
      </svg>
    ),
    dark: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
    ),
    pink: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21s-7.2-4.3-9.2-8.6C1.4 9.2 3.5 5.5 7.2 5.5c2 0 3.7 1 4.8 2.6 1.1-1.6 2.8-2.6 4.8-2.6 3.7 0 5.8 3.7 4.4 6.9C19.2 16.8 12 21 12 21z" />
      </svg>
    )
  };

  const themeOptions = [
    { id: 'light', label: t('theme.options.light', 'Light'), icon: themeIcons.light },
    { id: 'dark', label: t('theme.options.dark', 'Dark'), icon: themeIcons.dark },
    { id: 'pink', label: t('theme.options.pink', 'Pink'), icon: themeIcons.pink }
  ];

  const navigationSections = [
    {
      id: 'projects',
      title: t('navigation.sidebar.sections.projects', 'Projects'),
      items: [
        {
          path: '/',
          label: t('navigation.sidebar.dashboard', 'All Projects'),
          end: true,
          icon: (
            <svg
              className="v2-sidebar-link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 01-1 1h-3m-4-5v4M8 12v8m8-8v8M3 12h18" />
              <rect x="5" y="3" width="14" height="4" rx="1" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'tools',
      title: t('navigation.sidebar.sections.tools', 'Tools'),
      items: [
        {
          path: '/templates',
          label: t('navigation.sidebar.templates', 'Templates'),
          icon: (
            <svg
              className="v2-sidebar-link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          )
        },
        {
          path: '/device-library',
          label: t('navigation.sidebar.deviceLibrary', 'Device Library'),
          icon: (
            <svg
              className="v2-sidebar-link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          )
        },
        {
          path: '/contacts',
          label: t('navigation.sidebar.contacts', 'Contacts'),
          icon: (
            <svg
              className="v2-sidebar-link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'support',
      title: t('navigation.sidebar.sections.support', 'Support'),
      items: [
        {
          path: '/settings',
          label: t('navigation.sidebar.settings', 'Settings'),
          icon: (
            <svg
              className="v2-sidebar-link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          )
        },
        {
          path: '/help',
          label: t('navigation.sidebar.help', 'Help'),
          icon: (
            <span className="v2-sidebar-link-icon icon-text" aria-hidden="true">
              ?
            </span>
          )
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile header with hamburger to toggle the drawer on narrow screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-surface-sunken">
        <div className="flex items-center justify-between p-2 px-4">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-md border border-surface-sunken"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="font-semibold">{t('ui.appName', 'Gear List Creator')}</span>
          <span className="w-6" aria-hidden="true" />
        </div>
      </div>
      {/* Mobile overlay backdrop when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-surface-app via-surface-app to-surface-muted">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
            <aside
              className={`v2-sidebar w-full lg:w-[260px] ${drawerOpen ? 'mobile-drawer-open' : 'mobile-drawer-closed'} ${drawerOpen ? '' : ''}`}
              aria-label={t('navigation.sidebar.label', 'Primary navigation')}
            >
            <div className="v2-sidebar-header">
              <img src={`${baseUrl}pwa-192x192.png`} alt="" className="v2-sidebar-logo" />
              <div className="v2-sidebar-header-text">
                <h1 className="v2-sidebar-title">{t('ui.appName', 'Gear List Creator')}</h1>
                <div className="v2-sidebar-subtitle">{t('ui.sidebar.subtitle', 'Safe offline workspace')}</div>
              </div>
            </div>
            <div className="v2-sidebar-nav">
              {navigationSections.map((section) => (
                <div key={section.id} className="v2-sidebar-section">
                  <div className="v2-sidebar-section-title">{section.title}</div>
                  {section.items.map((tab) => (
                    <NavLink
                      key={tab.path}
                      to={tab.path}
                      end={tab.end}
                      className={({ isActive }) => `v2-sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      {tab.icon}
                      <span className="v2-sidebar-link-text">{tab.label}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
            <div className="v2-sidebar-controls-container">
              <div className="v2-controls-row-1">
                <div className="v2-lang-select-wrapper">
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="v2-lang-select"
                    aria-label={t('language.label', 'Language')}
                  >
                    {locales.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="v2-theme-controls" role="group" aria-label={t('theme.label', 'Theme')}>
                  {themeOptions.map((themeOption) => {
                    const isActive = theme === themeOption.id;
                    return (
                      <button
                        key={themeOption.id}
                        type="button"
                        onClick={() => setTheme(themeOption.id)}
                        aria-pressed={isActive}
                        aria-label={themeOption.label}
                        title={themeOption.label}
                        className={`v2-theme-toggle${isActive ? ' active' : ''}`}
                        data-theme={themeOption.id === 'pink' ? 'pink' : undefined}
                      >
                        {themeOption.icon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="v2-sidebar-footer">
              <p
                className={`v2-sidebar-status${status ? ' is-active' : ''}`}
                aria-live="polite"
              >
                {status || t('status.empty', 'Status updates appear here to confirm data safety.')}
              </p>
            </div>
          </aside>

          <main className="flex flex-1 flex-col gap-6">
            <Outlet />
          </main>
          </div>
        </div>
      </div>
      {/* Mobile drawer closes content behind on small screens */}
    </>
  );
}
