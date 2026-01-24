# Contributing to Gear-list-editor

We welcome contributions from the community. This document outlines our basic guidelines to help you get started.

Getting started
- Fork the repository and clone your fork.
- Create a descriptive branch name for your feature or fix (e.g., feat/add-export, fix/parser-bug).
- Install dependencies locally: see package.json for scripts (commonly `npm install`).
- Run tests locally and ensure all pass before submitting a PR.

Code style and quality
- Follow the project’s existing code style and conventions.
- Use the project’s linter/formatter (e.g., ESLint, Prettier) if configured; fix lint errors before submitting.
- Add or update tests for any behavior you change.

Review and workflow
- Open a pull request against the main branch with a concise title.
- Provide a short description of the change and why it’s needed. Include related issue references if applicable.
- We may request changes; please respond promptly and push updates to the same PR branch.

Testing and verification
- Ensure tests pass: `npm test` (or the project’s equivalent script).
- If you introduce a new feature, include tests demonstrating the expected behavior.
- Update documentation if needed to reflect the change.

Deliverables for a PR
- A focused, single-purpose PR when possible.
- Clear commit messages describing the intent behind the change.
- All new or changed code should be covered by tests where feasible.

Maintainer notes
- Do not push to protected branches directly.
- Do not remove existing functionality without good reason.
- If something is unknown or ambiguous, ask in the issue or PR comments.
