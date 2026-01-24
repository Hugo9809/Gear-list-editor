# Testing Guide

Overview
- How to run tests, what to expect, and how to add tests for new features.

Running tests
- Install dependencies: `npm install`
- Run test suite: `npm test`
- Run with coverage: `npm run test:coverage` (if available)

Fixtures and test data
- See `tests/fixtures` for sample data used in tests (adjust paths as needed for your repo).
- When adding tests, mirror existing patterns for setup/teardown.

Quality checks
- Linting and formatting: `npm run lint` and `npm run fmt` (if configured).
- Ensure tests pass before submitting a PR.
