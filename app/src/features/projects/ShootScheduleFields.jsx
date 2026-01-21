import { normalizeShootSchedule } from '../../shared/utils/shootSchedule.js';

const ShootScheduleFields = ({ t, schedule, onChange, className = '' }) => {
  const normalized = normalizeShootSchedule(schedule);
  const addLabel = t('project.shootSchedule.actions.add', 'Add date');
  const removeLabel = t('project.shootSchedule.actions.remove', 'Remove date');

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
    const safeValues = nextValues.length ? nextValues : [''];
    onChange({
      ...normalized,
      [key]: safeValues
    });
  };

  const handleAdd = (key) => {
    updateSchedule(key, [...normalized[key], '']);
  };

  const handleRemove = (key, index) => {
    const nextValues = normalized[key].filter((_, valueIndex) => valueIndex !== index);
    updateSchedule(key, nextValues);
  };

  const handleChange = (key, index, value) => {
    const nextValues = normalized[key].map((entry, valueIndex) =>
      valueIndex === index ? value : entry
    );
    updateSchedule(key, nextValues);
  };

  const wrapperClassName = `grid gap-4 md:grid-cols-3 ${className}`.trim();

  return (
    <div className={wrapperClassName}>
      {sections.map((section) => (
        <div key={section.key} className="flex flex-col gap-2 text-sm text-text-secondary">
          <span>{section.label}</span>
          <div className="flex flex-col gap-2">
            {normalized[section.key].map((value, index) => (
              <div key={`${section.key}-${index}`} className="flex items-center gap-2">
                <input
                  type="date"
                  value={value}
                  onChange={(event) => handleChange(section.key, index, event.target.value)}
                  className="ui-input ui-input-lg flex-1"
                  aria-label={`${section.label} ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(section.key, index)}
                  disabled={normalized[section.key].length === 1}
                  className="ui-button ui-button-outline px-3 py-2 text-xs disabled:opacity-40"
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
