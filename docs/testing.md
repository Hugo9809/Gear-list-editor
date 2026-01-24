Testing

This document provides guidance on testing Gear-list-editor. Adjust commands to match the project's actual test setup.

Unit tests
- Run unit tests with the project's test command (e.g., npm test, pytest, go test).
- Ensure tests cover core CLI behavior, data validation, and storage interactions.

Integration tests
- Verify end-to-end flows: add, list, export/import paths.
- Use a test data directory to avoid clobbering real data.

Quality checks
- Linting and formatting as per project guidelines.
- Run tests before creating PRs.

Notes
- Replace placeholders with real commands as soon as the project tooling is established.
