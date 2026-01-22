# Gear Editor - Open Code Friendly Skills and Rules

This repository contains a lightweight, open-code friendly migration and execution layer for skills and rules inspired by Cine Power Planner. It is adapted to our architecture and designed to be extended by contributors.

Features
- Modular Skill and Rule models
- Simple migration adapter scaffold for Cine Power Planner
- Open Code friendly utilities for normalization and ASCII enforcement

Usage
- Run migration (stub): `node scripts/migrate.js path/to/cpp.json [out-dir]`
- Build with TypeScript: `npm run build`
- Run: `npm start`

Next steps
- Wire actual Cine Power Planner schema; implement full migration
- Integrate Skill registry with the editor workflow
- Add tests and linting
