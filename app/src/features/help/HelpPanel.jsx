/**
 * Render offline help, documentation, and workflow guidance.
 * Assumes content arrays come from translations.
 */
const HelpPanel = ({ t, helpSections, documentationSections, offlineSteps }) => (
  <section className="ui-tile bg-surface-elevated/70 p-6">
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold ui-heading">{t('help.title', 'Help & documentation')}</h2>
      <p className="text-sm text-text-secondary">
        {t('help.subtitle', 'Offline-first guidance for safe gear lists.')}
      </p>
    </div>
    <div className="mt-4 flex flex-col gap-3">
      {helpSections.map((section, index) => (
        <details key={section.title} open={index === 0} className="ui-panel bg-surface-muted/60 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold ui-heading">
            {section.title}
          </summary>
          <p className="mt-2 text-sm text-text-secondary">{section.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-text-secondary">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
    <div className="mt-5 border-t border-surface-sunken pt-4">
      <h3 className="text-base font-semibold ui-heading">{t('offline.title', 'Offline workflow')}</h3>
      <p className="mt-1 text-sm text-text-secondary">
        {t('offline.description', 'Every feature works without a connection.')}
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-text-secondary">
        {offlineSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-text-muted">
        {t('offline.footer', 'Backups stay on-device unless you export or share them.')}
      </p>
    </div>
    <div className="mt-5 border-t border-surface-sunken pt-4">
      <h3 className="text-base font-semibold ui-heading">{t('documentation.title', 'Documentation')}</h3>
      <p className="mt-1 text-sm text-text-secondary">
        {t(
          'documentation.subtitle',
          'Key safety behaviors are automatic, with manual controls when you need them.'
        )}
      </p>
      <div className="mt-3 grid gap-3">
        {documentationSections.map((section) => (
          <div key={section.title} className="ui-panel bg-surface-muted/60 px-4 py-3">
            <h4 className="text-sm font-semibold ui-heading">{section.title}</h4>
            <p className="mt-1 text-xs text-text-secondary">{section.description}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-text-secondary">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HelpPanel;
