---
name: git-commit-workflow
description: Stage, commit, and push git changes with conventional commit messages. Use when user wants to commit and push changes, mentions pushing to remote, or asks to save and push their work.
---

# Git Commit Workflow

Stage all changes, create a conventional commit, and push to the remote branch.

## When to Use

Activate when the user:
- Explicitly asks to push changes ("push this", "commit and push")
- Mentions saving work to remote ("save to github", "push to remote")
- Completes a feature and wants to share it

## Conventional Commits Protocol

**Format:** `<type>(<scope>): <description>`

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, white-space (not CSS!) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `chore` | Changes to build process or auxiliary tools |

### Workflow

```bash
# 1. Check status
git status

# 2. Stage changes
git add -A

# 3. Commit with conventional message
git commit -m "feat(overview): add power calculation display"

# 4. Push to remote
git push -u origin <branch-name>
```

## Atomic Commits Rule

**Constraint:** Do not bundle unrelated changes.

If you fixed a bug in Auth AND added a feature in Dashboard, these MUST be two separate commits:

```bash
git add app/src/data/auth/
git commit -m "fix(auth): resolve session timeout issue"

git add app/src/components/Dashboard/
git commit -m "feat(dashboard): add quick actions panel"

git push
```

## Pre-Commit Verification

Before committing, you MUST ensure:
1. Linter passes: `npm run lint` (if available)
2. Tests pass: `npm test`
3. Build works: `npm run build` (for major changes)

## Commit Message Examples

```
feat(overview): add battery runtime calculation
fix(storage): handle IndexedDB quota exceeded error
docs(readme): update installation instructions
refactor(helpers): extract date formatting utilities
perf(auto-gear): reduce DOM queries in gear list
chore(deps): update vite to latest
```
