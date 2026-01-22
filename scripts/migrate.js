#!/usr/bin/env node
// Simple migration runner from Cine Power Planner to internal skills
const fs = require('fs');
const path = require('path');

async function main() {
  const inputPath = process.argv[2];
  const outDir = process.argv[3] || path.join(__dirname, '../data');
  if (!inputPath) {
    console.error('Usage: node scripts/migrate.js <cine-power-planner.json> [output-dir]');
    process.exit(2);
  }
  const raw = fs.readFileSync(inputPath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON in input file');
    process.exit(3);
  }
  // Lazy require to avoid heavy deps in this repo
  let migrateFn;
  try {
    migrateFn = require('../dist');
  } catch {
    migrateFn = undefined;
  }
  // If Cine Power planner schema is unknown, do a shallow map
  const skills = Array.isArray(data)
    ? data.map((d, i) => ({ id: d.id || `cpp-skill-${i}`, title: d.title || d.name, summary: d.summary, description: d.description }))
    : [];

  // Write a simple JSON file containing migrated structure
  const outPath = path.join(outDir, 'skills-cinepower.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(skills, null, 2));
  console.log(`Wrote migrated skills to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
