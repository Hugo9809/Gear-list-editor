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
  assert(migrated.projects.length >= 1, 'Expected migrated project');
  assert(migrated.projects[0].categories[0].items.length === 1, 'Expected migrated items');
});

run('normalizeItems preserves quantities', () => {
  const normalized = normalizeItems([
    { name: 'Tripod', quantity: '3', unit: 'pcs', details: 'Heavy duty' }
  ]);
  assert(normalized[0].quantity === 3, 'Expected quantity to normalize to number');
});

run('mergePayloads preserves both sets', () => {
  const merged = mergePayloads(validPayload, legacyPayload);
  assert(merged.projects.length >= 2, 'Expected projects to be merged');
  assert(merged.history.items.length > 0, 'Expected history to exist');
});
