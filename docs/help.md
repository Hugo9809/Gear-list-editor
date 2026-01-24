Gear-list-editor Help

Overview
- This workspace provides a lightweight assistant to help edit files, manage code, and run common tasks via structured commands and patches.

How I help
- Read, search, and modify code using safe operations (read, glob, grep, apply_patch).
- Explain concepts, workflows, and best practices.
- Propose and apply small changes through patches.
- Offer guidance on git workflows and testing.

Getting started
- Inspect the repository structure to understand where changes belong.
- Propose a patch using apply_patch to modify files. I will guide you through the patch.
- Validate changes with reads, small tests, or build steps if available.

Commands and patterns (high level)
- read: view file contents
- glob: locate files by name/pattern
- grep: search file contents with a regex
- apply_patch: modify files using patch format
- bash: run shell commands (e.g., git status, npm test)
- webfetch / codesearch: fetch or search documentation when needed

Tips for asking for help
- Be specific about the goal and the scope (which files, which behavior).
- If multiple steps are needed, I can break them into a small todo list and execute sequentially.
- I will ask clarifying questions only if truly necessary to avoid misinterpretation.

Examples
- Add a new file:
```
*** Begin Patch
*** Add File: sample.txt
+Hello, world
*** End Patch
```
- Update an existing file:
```
*** Begin Patch
*** Update File: README.md
-Old content
+New content
*** End Patch
```

Notes
- ASCII is preferred for edits; non-ASCII only if needed.
- I avoid destructive actions unless you explicitly request them.
