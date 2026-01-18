---
name: debugging-systematically
description: Use when encountering any bug, test failure, or unexpected behavior. Enforces a rigorous 4-phase debugging process (Root Cause -> Pattern -> Hypothesis -> Implementation).
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings (e.g., `console.warn`)
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - If not reproducible → gather more data (logs), don't guess

3. **Check Recent Changes**
   - What changed? (Git diff, dependency updates)
   - Environmental differences?

4. **Gather Evidence (Instrumentation)**
   - Log input/output at component boundaries
   - **Trace Data Flow:** Where does the bad value originate?

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Where does similar code work?
   - Compare working vs. broken. List EVERY difference.

2. **Understand Dependencies**
   - Configuring definitions? Global state? (IndexedDB/OPFS)

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**
   - "I think X is the root cause because Y"
   - Write it down.

2. **Test Minimally**
   - Make the SMALLEST change to test the hypothesis.
   - Don't fix multiple things.

3. **Verify Before Continuing**
   - Did it work? If not, REVERT and form a NEW hypothesis.

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case**
   - Simplest possible reproduction.
   - Use TDD principles.

2. **Implement Single Fix**
   - One change at a time.
   - No "while I'm here" refactoring yet.

3. **Verify Fix**
   - Test passes? No regressions?

4. **If Fix Failed (Regroup)**
   - If ≥ 3 attempts failed: STOP. Question the architecture.

## Common Rationalizations (Don't do these)

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast. |
| "Emergency, no time for process" | Systematic debugging is FASTER than thrashing. |
| "I'll write test after" | Untested fixes don't stick. Test first proves it. |
