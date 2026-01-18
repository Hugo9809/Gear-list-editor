---
name: writing-implementation-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code. Generates a comprehensive `implementation_plan.md`.
---

# Writing Implementation Plans

## Overview

Write comprehensive implementation plans assuming the engineer (you or the user) needs a clear roadmap.
**Output Location:** `.agent/plans/implementation_plan.md` (or similar as per Agentic Mode).

**Core principle:** Plan first, code second.

## Plan Structure (Standard)

Every plan MUST follow this structure (adapted from the Agentic Mode artifact definition):

```markdown
# [Goal Description]
Provide a brief description of the problem and what the change accomplishes.

## User Review Required
**[IMPORTANT]** / **[WARNING]**
Document breaking changes, new dependencies, or significant design decisions.

## Proposed Changes
Group files by component.

### [Component Name]
#### [MODIFY] [file basename](file:///absolute/path...)
- Step 1: ...
- Step 2: ...

#### [NEW] [file basename](file:///absolute/path...)
- ...

## Verification Plan

### Automated Tests
- `npm test tests/unit/my-new-feature.test.js`

### Manual Verification
- "Open browser to /settings"
- "Click 'Save'"
- "Verify toast appears"
```

## Bite-Sized Task Granularity

Break down complex logic into steps that take < 10 minutes to execute.

**Example Task:**
"Implement `calculateTotalPower()` in `power-utils.js`"
1. Create `tests/unit/power-utils.test.js` with failing test.
2. Implement `calculateTotalPower` skeleton.
3. Fix logic to pass test.
4. Export function.

## How to Verify the Plan

Before saving:
1. **Check file paths**: Are they absolute? Do the files exist (for modifies)?
2. **Check completeness**: Did I forget a dependency? A translation key? A CSS variable?
3. **Check Testability**: Does every new feature have a planned test?

## Execution

Once the plan is written, ask the user for review.
"I have created the implementation plan at `...`. Please review."
