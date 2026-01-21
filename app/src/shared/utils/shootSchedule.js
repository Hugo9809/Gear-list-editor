const normalizeEntry = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeList = (value, keepEmpty) => {
  if (typeof value === 'string') {
    const normalized = normalizeEntry(value);
    if (!normalized) {
      return keepEmpty ? [''] : [];
    }
    return [normalized];
  }
  if (!Array.isArray(value)) {
    return keepEmpty ? [''] : [];
  }
  const normalized = value.map(normalizeEntry);
  if (!keepEmpty) {
    return normalized.filter(Boolean);
  }
  return normalized.length ? normalized : [''];
};

export const createEmptyShootSchedule = () => ({
  prepPeriods: [''],
  shootingPeriods: [''],
  returnDays: ['']
});

export const normalizeShootSchedule = (schedule, { keepEmpty = true } = {}) => {
  if (typeof schedule === 'string') {
    const trimmed = normalizeEntry(schedule);
    return {
      prepPeriods: keepEmpty ? [''] : [],
      shootingPeriods: keepEmpty ? [trimmed] : trimmed ? [trimmed] : [],
      returnDays: keepEmpty ? [''] : []
    };
  }

  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    return keepEmpty
      ? createEmptyShootSchedule()
      : { prepPeriods: [], shootingPeriods: [], returnDays: [] };
  }

  const prepSource = schedule.prepPeriods ?? schedule.prepPeriod ?? schedule.prep;
  const shootingSource =
    schedule.shootingPeriods ?? schedule.shootingPeriod ?? schedule.shoot ?? schedule.shooting;
  const returnSource = schedule.returnDays ?? schedule.returnDay ?? schedule.return ?? schedule.returns;

  return {
    prepPeriods: normalizeList(prepSource, keepEmpty),
    shootingPeriods: normalizeList(shootingSource, keepEmpty),
    returnDays: normalizeList(returnSource, keepEmpty)
  };
};

export const getShootScheduleDates = (schedule) =>
  normalizeShootSchedule(schedule, { keepEmpty: false });

export const getPrimaryShootDate = (schedule) => {
  const normalized = getShootScheduleDates(schedule);
  return (
    normalized.shootingPeriods[0] ||
    normalized.prepPeriods[0] ||
    normalized.returnDays[0] ||
    ''
  );
};
