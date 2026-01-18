---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
---

# Requesting Code Review

## Overview

Dispatch a self-review process to catch issues before they cascade.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After completing major feature
- Before merge to main
- After complex bug fix

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)

## How to Review

### 1. Get the Diff
```bash
git diff HEAD~1..HEAD
# or
git diff origin/main..HEAD
```

### 2. Review Checklist

Use this checklist to self-review your code.

**Code Quality:**
- Clean separation of concerns?
- Proper error handling?
- DRY principle followed?
- Edge cases handled?

**Architecture (for this project):**
- Uses React (JSX) properly?
- Uses CSS Variables / Tailwind consistently?
- New components in `app/src/components/`?
- Data logic in `app/src/data/`?

**Testing:**
- Tests actually test logic (not mocks)?
- Edge cases covered?
- All tests passing (`npm test`)?

**Requirements:**
- All plan requirements met?
- No scope creep?

### 3. Output Format

For each issue found:
- File:line reference
- What's wrong
- Why it matters
- How to fix

### 4. Assessment

**Ready to merge?** [Yes/No/With fixes]

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
