/**
 * Render settings controls for backups, imports, and resets.
 * Assumes callbacks handle storage actions safely.
 */
const SettingsPanel = ({
  t,
  showAutoBackups,
  onToggleAutoBackups,
  onDownloadBackup,
  onImportBackup,
  onRestoreFromDeviceBackup,
  onFactoryReset,
  onHardRefresh
}) => (
  <section className="rounded-2xl border border-surface-sunken bg-surface-elevated/70 p-6">
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold ui-heading">{t('settings.title', 'Settings')}</h2>
      <p className="text-sm text-text-secondary">
        {t(
          'settings.subtitle',
          'Manage full backups, imports, and device resets without leaving offline mode.'
        )}
      </p>
    </div>
    <div className="mt-5 grid gap-4">
      <div className="rounded-xl border border-surface-sunken bg-surface-muted/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold ui-heading">
              {t('settings.autoBackups.title', 'Dashboard auto backups')}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {t(
                'settings.autoBackups.description',
                'Control whether device auto backups appear in the project dashboard.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">
              {t('settings.autoBackups.toggle', 'Show auto backups')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showAutoBackups}
              aria-label={t('settings.autoBackups.toggle', 'Show auto backups')}
              onClick={onToggleAutoBackups}
              className={`relative inline-flex h-6 w-11 items-center rounded-full border border-surface-sunken transition ${
                showAutoBackups ? 'bg-brand' : 'bg-surface-sunken'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  showAutoBackups ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          {t(
            'settings.autoBackups.helper',
            'Keep this on to verify that autosave is generating device backups while you work offline.'
          )}
        </p>
      </div>
      <div className="rounded-xl border border-surface-sunken bg-surface-muted/60 p-4">
        <h3 className="text-base font-semibold ui-heading">
          {t('settings.backup.title', 'Full backup controls')}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {t(
            'settings.backup.description',
            'Download a full backup or import one to merge it safely with your local data.'
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onDownloadBackup}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
          >
            {t('settings.backup.actions.download', 'Download full backup')}
          </button>
          <button
            type="button"
            onClick={onImportBackup}
            className="rounded-lg border border-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
          >
            {t('settings.backup.actions.import', 'Import full backup')}
          </button>
          <button
            type="button"
            onClick={onRestoreFromDeviceBackup}
            className="rounded-lg border border-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
          >
            {t('settings.backup.actions.restore', 'Restore from device backup')}
          </button>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          {t(
            'settings.backup.helper',
            'Imports merge data instead of overwriting it. Device restores use the latest on-device backup.'
          )}
        </p>
      </div>

      <div className="rounded-xl border border-surface-sunken bg-surface-muted/60 p-4">
        <h3 className="text-base font-semibold ui-heading">
          {t('settings.factoryReset.title', 'Factory reset')}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {t(
            'settings.factoryReset.description',
            'Factory reset downloads a full backup, then removes all local projects, templates, and backups on this device.'
          )}
        </p>
        <button
          type="button"
          onClick={onFactoryReset}
          className="mt-4 rounded-lg border border-status-error px-4 py-2 text-sm font-semibold text-status-error transition hover:border-status-error hover:bg-status-error/10"
        >
          {t('settings.factoryReset.action', 'Run factory reset')}
        </button>
        <p className="mt-3 text-xs text-text-muted">
          {t(
            'settings.factoryReset.helper',
            'Keep the downloaded backup in a safe place before continuing.'
          )}
        </p>
      </div>

      {/* Hard refresh: clears offline caches and reloads the app while preserving local data */}
      <div className="rounded-xl border border-surface-sunken bg-surface-muted/60 p-4">
        <h3 className="text-base font-semibold ui-heading">
          {t('settings.hardRefresh.title', 'Hard refresh')}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {t(
            'settings.hardRefresh.description',
            'Clear offline caches and reload the app from scratch while preserving your local data.'
          )}
        </p>
        <button
          type="button"
          onClick={onHardRefresh}
          className="mt-4 rounded-lg border border-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
        >
          {t('settings.hardRefresh.action', 'Hard refresh')}
        </button>
        <p className="mt-3 text-xs text-text-muted">
          {t(
            'settings.hardRefresh.helper',
            'This will clear offline caches and re-load assets from the network. Your on-device data remains intact.'
          )}
        </p>
      </div>
    </div>
  </section>
);

export default SettingsPanel;
