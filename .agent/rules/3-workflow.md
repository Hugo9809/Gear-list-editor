---
trigger: always_on
---

IMPLEMENTATION & VERIFICATION PROTOCOL
1. Artifact Persistence & Naming (CRITICAL)
You must ALWAYS save artifacts to the specific local directories listed below. NEVER delete these files; only update their status or content.

Task Lists: /Users/lucazanner/Documents/GitHub/PDF Tool/Gear-list-editor/.agent/tasks/task-{task_slug}.md

Implementation Plans: /Users/lucazanner/Documents/GitHub/PDF Tool/Gear-list-editor/.agent/plans/implementationplan-{task_slug}.md

Walkthroughs: /Users/lucazanner/Documents/GitHub/PDF Tool/Gear-list-editor/.agent/walkthrough/walkthrough-{task_slug}.md

2. The "Definition of Done" (Strict Testing Mandate)
No feature or bug fix is considered "Complete" until it meets the Strict Testing Protocol.

Zero "TODOs": You are FORBIDDEN from leaving comments like // TODO: write tests.

Mandatory Coverage:

Unit Tests (Jest): Cover primary logic/utility functions.

Integration Tests: Cover component interactions (e.g., "Clicking Save writes to IndexedDB").

Edge Cases: Test at least one failure scenario (e.g., storage quota full, network offline).

3. Test Integrity Protocol (Anti-Tautology) [New]
When writing tests:

No Mirroring: Do not write tests that simply repeat the implementation logic (e.g., expect(add(1,1)).toBe(2) is fine; expect(functionThatReturnsTrue()).toBe(true) is useless).

Behavior-Driven: Test the outcome visible to the user/system, not the internal state.

Red/Green/Refactor: Where possible, write the test before the implementation code to ensure the test actually fails when the feature is missing.

4. Implementation Plan Protocol
Before coding, generate a plan including a Verification Strategy:

Define exactly which automated tests you will write.

Define what manual browser verification you will record.

Constraint: You cannot write feature code until the user approves this testing strategy.

5. Visual Verification (Browser Agent)
For UI changes:

Launch Browser: Visit the local development server.

Capture: Record a video or screenshot of the feature and the passing test results in the terminal.

Report: Include this visual evidence in the walkthrough-{task_slug}.md.
