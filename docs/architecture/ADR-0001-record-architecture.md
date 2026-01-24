ADR 0001: Record Architecture Decisions for Refactor

Status: Proposed
Date: 2026-01-24

Context
- Gear-list-editor is moving from a likely informal, monolithic structure toward a
  maintainable, scalable architecture to support growth and new features.
- There is currently no formal guidance on module boundaries, dependencies, or
  naming conventions, which makes maintenance harder as the codebase grows.

Decision
- Adopt a modular, layered architecture with clear boundaries and explicit
  interfaces to improve testability, reusability, and scalability.
- Proposed layers:
  - Domain (core business logic, independent of frameworks)
  - Application (use cases/orchestration between domain and infrastructure)
  - Infrastructure (data access, external integrations, adapters)
  - UI / Adapters (presentation, input/output handling, adapters to domains)
  - Shared (common utilities, types, configuration)
- Use adapters to decouple the core domain from external concerns; the domain
  layer should be pure and testable in isolation.
- Establish a small set of conventions:
  - Each layer communicates via well-defined interfaces
  - Shared types are colocated in the Shared module
  - Public APIs are explicit and versioned by directory exports

Rationale
- Improves maintainability by reducing circular dependencies and coupling.
- Enables easier testing of core logic without infrastructure concerns.
- Supports incremental refactors and potential multi-language bindings in the future.

Consequences
- Requires upfront discipline and some boilerplate to enforce boundaries.
- Initial work may feel heavier, but long-term benefits include easier on-boarding and
  safer future changes.

Implementation plan (Phase 1)
- Create a folder structure under src:
  - src/domain
  - src/application
  - src/infra
  - src/ui
  - src/shared
- Add minimal index exports for each layer to establish a starting boundary.
- Introduce a few starter interfaces/types in src/shared (e.g., logger, config).
- Create a small, non-breaking example in src/domain and wire it up through src/application
  and a simple adapter in src/ui to validate the flow.
- Update repository README with the new structure and an ADR index.

Notes
- This ADR is the starting point; it may be updated as the team gains experience.

Authors
- OpenCode (AI-assisted planning)
