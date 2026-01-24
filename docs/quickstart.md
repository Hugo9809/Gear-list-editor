# Quick Start Guide

This guide walks you through a minimal end-to-end usage scenario for Gear-list-editor.

Prerequisites
- Node.js (LTS recommended)
- Access to the repository workspace where Gear-list-editor is installed

Installation
- Install dependencies: `npm install`
- (Optional) Install the CLI globally or use `npx gear-list-editor` if it’s published as an npm package

Basic workflow
- Create a new gear list: `gear-list-editor create-list "My First Gear List"`
- Suppose the command returns an id: LIST_ID. Add items to the list:
  - `gear-list-editor add-item --list-id LIST_ID --name "Tent" --quantity 2`
- Update item metadata as needed: `gear-list-editor update-item --list-id LIST_ID --item-id ITEM_ID --field notes --value "Use rainfly"`
- Export in JSON: `gear-list-editor export --list-id LIST_ID --format json > my-list.json`
- List existing lists: `gear-list-editor list`

Exploring more features
- See `gear-list-editor --help` for a full command reference.
- Check docs/usage.md for workflows tailored to end users and developers.

Troubleshooting
- If a command is not found, ensure the CLI is installed or call with `npx` as described above.
- If you see validation errors, double-check the required flags and types in `--help` output.
