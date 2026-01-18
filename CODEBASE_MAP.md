# Codebase Map

> **Generated**: 2026-01-18
> **Status**: Verified

## 🗺️ Navigation

**Start here:** [.agentlens/INDEX.md](.agentlens/INDEX.md)  
For deep codebase introspection, use the generated AgentLens documentation.

## 🏛️ Architecture Overview

**Stack**:
- **Build**: Vite (Native ESM)
- **Frontend**: React (JSX), JavaScript (ES2022+ Modules)
- **Styling**: CSS Modules / Global CSS (`app/src/index.css`)
- **State/Storage**: Local-First Architecture
  - Primary: IndexedDB / OPFS (via `storageService.js`)
  - Logic: `app/src/data/`

**Structure**:
```
app/src/
├── components/ # UI Components (Atoms, Molecules, Views)
├── data/       # Persistence, Migrations, Storage Services
├── hooks/      # Custom React Hooks
├── utils/      # Shared Utilities
└── i18n/       # Translations
```

## 📦 Key Modules (AgentLens)

| Module | Description | Path |
|---|---|---|
| **Root** | Core configs, App entry | [View Module](.agentlens/modules/root/MODULE.md) |
| **Components** | UI Library | [View Module](.agentlens/modules/app-src-components/MODULE.md) |
| **I18n** | Internationalization | [View Module](.agentlens/modules/app-src-i18n/MODULE.md) |

## 🛠️ Skills & Capabilities

The following agentic skills are available in `.agent/skills/`:

| Skill | Purpose |
|---|---|
| **concise-planning** | Generate unclear, actionable, and atomic checklists for tasks. |
| **debugging-systematically** | Rigorous 4-phase debugging (Root Cause -> Pattern -> Hypothesis -> Implementation). |
| **git-commit-workflow** | Standardized staging, committing, and pushing with conventional messages. |
| **requesting-code-review** | Verify work against requirements before user review. |
| **ui-ux-design-patterns** | UI/UX best practices, accessibility, and responsive design checks. |
| **verification-before-completion** | Mandatory verification commands before claiming success. |
| **writing-implementation-plans** | Create comprehensive technical plans before coding. |

## 📜 Rules & Protocols

### 1. Identity & Communication
- **Persona**: Senior Full-Stack Engineer. Professional, Technical, Concise.
- **Efficiency**: No fluff ("Certainly", "I can help"). Direct execution.
- **Reporting**: "✅ Task Complete.." only.

### 2. Implementation Protocol
- **Persistence**: ALWAYS save artifacts to `.agent/tasks`, `.agent/plans`, `.agent/walkthrough`.
- **Definition of Done**: 
  - Zero "TODOs".
  - Mandatory Unit & Integration Tests.
  - Edge Case verification.
- **Visual Verification**: Browser screenshots/videos for UI changes using `browser` tool.

### 3. Testing Mandate
- **No Mirroring**: Tests must verify behavior, not repeat implementation.
- **Red/Green/Refactor**: Write failing tests first where possible.
- **Integration**: Verify component interactions (e.g., Save writes to DB).

---
*Map improved by AgentLens integration.*
