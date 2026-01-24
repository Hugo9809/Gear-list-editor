Improved Help Surface

Overview
- A crisp, actionable help surface for code edits, project workflows, shell tasks, and information gathering.
- Uses concrete templates and examples to reduce friction.

Quick Start Flows
- Add a small feature or fix
 1) Describe the change briefly.
 2) I locate the right place, propose changes, apply patch.
 3) I summarize changes and follow-ups (tests/docs).
- Find where a function is used
 1) Tell me the function name.
 2) I search references and list files and usage notes.
- Inspect and summarize a file
 1) Provide a path or glob.
 2) I read the file with context and summarize key parts.

Templates (copy-paste)
- Inspect a file
  You: Show me <path>
- Patch a bug
  You: Patch bug in <file> to fix <issue>
- Create a new file
  You: Create file <path> with initial content:
- Run tests
  You: Run tests for project (or: Run unit tests)
- Manage git
  You: Create a new branch <name> and commit changes with message <msg>
- Manage to-dos
  You: Create a todo: <content>
  You: List todos
- Create a PR
  You: Create PR with title '<title>' and body:
  [multiline body]

Ask patterns
- To inspect: "Show me <path>"
- To patch: "Patch <description>"
- To run: "Run <command>"
- To organize: "Create a todo: <content>"
- To get help: "Show help"

Notes
- If the request is destructive or touches production, I will ask for confirmation.
- I will avoid touching secrets or credentials.
- I will prefer idempotent edits and explain why.

Next steps
- Integrate this doc as the default help surface in the CLI.
- Add a concise summary of the most common tasks with one-liners.
