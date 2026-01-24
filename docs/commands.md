Gear-list-editor Commands (high level)

- read <path>: read and display a file's contents.
- glob <pattern>: locate files matching a glob pattern.
- grep <regex> [path]: search for a regex pattern in files.
- apply_patch: apply a patch to modify files (diff-like syntax).
- Write: edit or create files via patch blocks (used with apply_patch).
- bash: run shell commands (git, npm, etc.) from the environment.
- webfetch: fetch and view content from a URL (read-only).
- codesearch: query documentation or code context to gather references.

Usage notes
- Commands are executed within the repository workspace.
- Paths should be ASCII-safe and quoted if they contain spaces.
- For edits, prefer apply_patch with a clear up-to-date patch format.

Common patterns
- Read a file: read /path/to/file
- Find files: glob "**/*.js"
- Search contents: grep "pattern" -r path/
- Patch a change: provide a patch wrapped in the apply_patch format.

Tips
- Use a minimal patch that touches only the necessary lines.
- Review patches before applying to avoid accidental changes.
