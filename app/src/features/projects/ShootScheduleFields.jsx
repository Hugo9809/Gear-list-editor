import { normalizeShootSchedule } from '../../shared/utils/shootSchedule.js';

const ShootScheduleFields = ({ t, schedule, onChange, className = '' }) => {
  const normalized = normalizeShootSchedule(schedule);
  const addLabel = t('project.shootSchedule.actions.add', 'Add period');
  const removeLabel = t('project.shootSchedule.actions.remove', 'Remove period');
  const startLabel = t('project.shootSchedule.fields.start', 'Start');
  const endLabel = t('project.shootSchedule.fields.end', 'End');
  const emptyRange = { start: '', end: '' };

  const sections = [
    {
      key: 'prepPeriods',
      label: t('project.fields.prepPeriod', 'Prep period')
    },
    {
      key: 'shootingPeriods',
      label: t('project.fields.shootingPeriod', 'Shooting period')
    },
    {
      key: 'returnDays',
      label: t('project.fields.returnDay', 'Return day')
    }
  ];

  const updateSchedule = (key, nextValues) => {
    const safeValues = nextValues.length ? nextValues : [{ ...emptyRange }];
    onChange({
      ...normalized,
      [key]: safeValues
    });
  };

  const handleAdd = (key) => {
    updateSchedule(key, [...normalized[key], { ...emptyRange }]);
  };

  const handleRemove = (key, index) => {
    const nextValues = normalized[key].filter((_, valueIndex) => valueIndex !== index);
    updateSchedule(key, nextValues);
  };

  const handleChange = (key, index, field, value) => {
    const nextValues = normalized[key].map((entry, valueIndex) =>
      valueIndex === index ? { ...entry, [field]: value } : entry
    );
    updateSchedule(key, nextValues);
  };

  const wrapperClassName = `grid gap-4 lg:grid-cols-2 xl:grid-cols-3 ${className}`.trim();

  return (
    <div className={wrapperClassName}>
      {sections.map((section) => (
        <div key={section.key} className="flex min-w-0 flex-col gap-2 text-sm text-text-secondary">
          <span>{section.label}</span>
          <div className="flex flex-col gap-2">
            {normalized[section.key].map((value, index) => (
              <div
                key={`${section.key}-${index}`}
                className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <label className="flex min-w-0 flex-col gap-1 text-xs text-text-muted">
                  <span>{startLabel}</span>
                  <input
                    type="date"
                    value={value.start}
                    onChange={(event) => handleChange(section.key, index, 'start', event.target.value)}
                    className="ui-input ui-input-lg"
                    aria-label={`${section.label} ${startLabel} ${index + 1}`}
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1 text-xs text-text-muted">
                  <span>{endLabel}</span>
                  <input
                    type="date"
                    value={value.end}
                    onChange={(event) => handleChange(section.key, index, 'end', event.target.value)}
                    className="ui-input ui-input-lg"
                    aria-label={`${section.label} ${endLabel} ${index + 1}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(section.key, index)}
                  disabled={normalized[section.key].length === 1}
                  className="ui-button ui-button-outline justify-self-start px-3 py-2 text-xs disabled:opacity-40"
                  aria-label={`${removeLabel}: ${section.label}`}
                  title={`${removeLabel}: ${section.label}`}
                >
                  -
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAdd(section.key)}
            className="ui-button ui-button-outline w-fit px-3 py-2 text-xs"
            aria-label={`${addLabel}: ${section.label}`}
            title={`${addLabel}: ${section.label}`}
          >
            +
          </button>
        </div>
      ))}
    </div>
  );
};

export default ShootScheduleFields;
