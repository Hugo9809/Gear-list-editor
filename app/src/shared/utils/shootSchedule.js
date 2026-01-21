const normalizeEntry = (value) => (typeof value === 'string' ? value.trim() : '');

const createEmptyRange = () => ({ start: '', end: '' });

const normalizeRange = (value) => {
  if (typeof value === 'string') {
    return { start: normalizeEntry(value), end: '' };
  }
  if (Array.isArray(value)) {
    return {
      start: normalizeEntry(value[0]),
      end: normalizeEntry(value[1])
    };
  }
  if (value && typeof value === 'object') {
    return {
      start: normalizeEntry(value.start ?? value.from ?? value.begin),
      end: normalizeEntry(value.end ?? value.to ?? value.until)
    };
  }
  return createEmptyRange();
};

const rangeHasValue = (range) => Boolean(range?.start || range?.end);

const normalizeList = (value, keepEmpty) => {
  if (Array.isArray(value)) {
    const normalized = value.map(normalizeRange);
    if (!keepEmpty) {
      return normalized.filter(rangeHasValue);
    }
    return normalized.length ? normalized : [createEmptyRange()];
  }

  if (value === null || value === undefined) {
    return keepEmpty ? [createEmptyRange()] : [];
  }

  const normalizedRange = normalizeRange(value);
  if (!keepEmpty && !rangeHasValue(normalizedRange)) {
    return [];
  }
  return [normalizedRange];
};

export const createEmptyShootSchedule = () => ({
  prepPeriods: [createEmptyRange()],
  shootingPeriods: [createEmptyRange()],
  returnDays: [createEmptyRange()]
});

export const normalizeShootSchedule = (schedule, { keepEmpty = true } = {}) => {
  if (typeof schedule === 'string') {
    const trimmed = normalizeEntry(schedule);
    return {
      prepPeriods: keepEmpty ? [createEmptyRange()] : [],
      shootingPeriods: normalizeList(trimmed, keepEmpty),
      returnDays: keepEmpty ? [createEmptyRange()] : []
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
  const resolveRangeDate = (range) => range?.start || range?.end || '';
  return (
    resolveRangeDate(normalized.shootingPeriods[0]) ||
    resolveRangeDate(normalized.prepPeriods[0]) ||
    resolveRangeDate(normalized.returnDays[0]) ||
    ''
  );
};
