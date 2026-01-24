# Core API Overview

This document describes the core data structures and public API surface exposed by Gear-list-editor's core module. It is intended for contributors and integrators.

- Data models (conceptual)
- GearList: { id, name, items: GearItem[], metadata }
- GearItem: { id, name, quantity, notes, metadata }
- Project: { id, name, createdAt, parameters }
- Metadata: { createdAt, updatedAt, tags }

- Public operations (high level)
- createList(name): GearList
- Project metadata for PDFs:
- - Project: { id, name, createdAt, parameters }
- addItem(listId, item): GearItem
- updateItem(listId, itemId, changes): GearItem
- removeItem(listId, itemId)
- export(listId, format): data blob
- import(listId, data): GearList

Notes
- The actual function signatures may differ; refer to the source for exact types and return values.
- This doc intentionally stays high-level to avoid API drift with the implementation.
