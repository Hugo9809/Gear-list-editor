import {
  mergePayloads,
  migratePayload,
  normalizeItems,
  validatePayload,
  validationSamples
} from '../src/data/storage.js';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = (label, fn) => {
  try {
    fn();
    console.log(`✅ ${label}`);
  } catch (error) {
    console.error(`❌ ${label}`);
    console.error(error.message);
    process.exitCode = 1;
  }
};

const { validPayload, legacyPayload } = validationSamples();

run('valid payload passes validation', () => {
  const result = validatePayload(validPayload);
  assert(result.valid, 'Expected payload to be valid');
});

run('legacy payload migrates safely', () => {
  const migrated = migratePayload(legacyPayload);
  assert(migrated.items.length === 1, 'Expected migrated items');
  assert(migrated.notes.includes('legacy'), 'Expected notes preserved');
});

run('normalizeItems preserves quantities', () => {
  const normalized = normalizeItems([{ name: 'Tripod', quantity: '3' }]);
  assert(normalized[0].quantity === 3, 'Expected quantity to normalize to number');
});

run('mergePayloads preserves both sets', () => {
  const merged = mergePayloads(validPayload, legacyPayload);
  assert(merged.items.length >= 2, 'Expected items to be merged');
  assert(merged.notes.length > 0, 'Expected notes to exist');
});
