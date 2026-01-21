// @ts-check
/**
 * @fileoverview JSDoc type definitions for the Gear List Editor application.
 * These types provide IDE autocompletion and type hints without requiring TypeScript.
 */

/* =============================================================================
 * CORE DATA TYPES
 * ============================================================================= */

/**
 * @typedef {'needed' | 'packed' | 'missing' | 'rented'} ItemStatus
 */

/**
 * @typedef {Object} Item
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Item name
 * @property {number} quantity - Quantity (positive integer, minimum 1)
 * @property {string} unit - Unit of measurement (e.g., "pcs", "m", "kg")
 * @property {string} details - Additional notes/details for the item
 * @property {ItemStatus} status - Current status of the item
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Category name
 * @property {string} notes - Category-level notes
 * @property {Item[]} items - Items in this category
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Project name
 * @property {string} client - Client name
 * @property {string} shootDate - Date of the shoot (ISO string or formatted date)
 * @property {string} location - Shoot location
 * @property {string} contact - Contact person/info
 * @property {string} notes - Project-level notes
 * @property {Category[]} categories - Categories within this project
 */

/**
 * @typedef {Object} Template
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} notes - Template-level notes
 * @property {Category[]} categories - Template categories with default items
 * @property {string} lastUsed - ISO timestamp of last usage
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {string} name - Item name for autocomplete
 * @property {string} unit - Default unit
 * @property {string} details - Default details
 * @property {string} lastUsed - ISO timestamp of last usage
 */

/**
 * @typedef {Object} History
 * @property {HistoryEntry[]} items - Remembered items for autocomplete
 * @property {string[]} categories - Remembered category names
 */

/**
 * @typedef {Object} LibraryItem
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Item name
 * @property {number} quantity - Default quantity
 * @property {string} unit - Default unit
 * @property {string} details - Default details
 * @property {string} category - Category name for grouping
 * @property {string} dateAdded - ISO timestamp of when item was added
 */

/**
 * @typedef {Object} DeviceLibrary
 * @property {LibraryItem[]} items - Global inventory of items
 */

/* =============================================================================
 * APPLICATION STATE
 * ============================================================================= */

/**
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * @typedef {Object} AppState
 * @property {number} version - Storage schema version
 * @property {Theme} theme - Current UI theme
 * @property {Project[]} projects - All user projects
 * @property {Template[]} templates - Saved templates
 * @property {DeviceLibrary} deviceLibrary - Global device inventory
 * @property {History} history - Autocomplete suggestions history
 * @property {string|null} activeProjectId - Currently open project ID
 * @property {string|null} lastSaved - ISO timestamp of last save
 * @property {boolean} showAutoBackups - Whether to show backup panel
 */

/* =============================================================================
 * STORAGE SERVICE TYPES
 * ============================================================================= */

/**
 * @typedef {Object} LoadStateResult
 * @property {AppState} state - The loaded and migrated state
 * @property {string} source - Source of the loaded data (e.g., 'indexeddb', 'opfs', 'empty')
 * @property {string[]} warnings - Any warnings encountered during load
 */

/**
 * @typedef {Object} SaveResult
 * @property {AppState|null} payload - The saved payload, or null on failure
 * @property {string[]} warnings - Any warnings encountered during save
 */

/**
 * @typedef {Object} ExportResult
 * @property {string} json - JSON string of the exported data
 * @property {string} fileName - Suggested filename for download
 * @property {AppState} payload - The exported payload
 */

/**
 * @typedef {Object} ImportResult
 * @property {AppState} state - The merged state after import
 * @property {string[]} warnings - Any warnings encountered during import
 */

/**
 * @typedef {Object} BackupSummary
 * @property {string} id - Unique identifier for this backup
 * @property {string} source - Source identifier (e.g., 'device_backup_latest')
 * @property {string|null} lastSaved - ISO timestamp of when backup was saved
 * @property {number} projectCount - Number of projects in backup
 * @property {number} templateCount - Number of templates in backup
 * @property {string|null} savedBy - Reason for save (e.g., 'autosave', 'explicit')
 * @property {number|null} timestamp - Unix timestamp for sorting
 */

/**
 * @typedef {Object} StorageServiceOptions
 * @property {(warning: string) => void} [onWarning] - Callback for warnings
 * @property {(payload: AppState, meta: {reason: string, warnings: string[]}) => void} [onSaved] - Callback after successful save
 */

/**
 * @typedef {Object} StorageService
 * @property {() => Promise<LoadStateResult>} loadState - Load state from storage
 * @property {(state: AppState) => void} scheduleAutosave - Schedule debounced autosave
 * @property {(state: AppState) => Promise<SaveResult>} saveNow - Immediately save state
 * @property {(state: AppState) => ExportResult} exportBackup - Export state to JSON
 * @property {(state: AppState, projectId: string) => ExportResult} exportProjectBackup - Export single project
 * @property {() => Promise<BackupSummary[]>} listAutoBackups - List available auto-backups
 * @property {(rawText: string, currentState: AppState) => ImportResult} importBackup - Import from JSON
 * @property {() => Promise<LoadStateResult>} restoreFromBackup - Restore from best backup
 * @property {() => Promise<{state: AppState, warnings: string[]}>} factoryReset - Reset to empty state
 * @property {() => void} dispose - Clean up timers and intervals
 */

/* =============================================================================
 * HOOK TYPES
 * ============================================================================= */

/**
 * @typedef {Object} ItemDraft
 * @property {string} name - Draft item name
 * @property {number|string} quantity - Draft quantity (can be string input before parsing)
 * @property {string} unit - Draft unit
 * @property {string} details - Draft details
 */

/**
 * @typedef {Object} ProjectDraft
 * @property {string} name - Draft project name
 * @property {string} client - Draft client
 * @property {string} shootDate - Draft shoot date
 * @property {string} location - Draft location
 * @property {string} contact - Draft contact
 */

/**
 * @typedef {Object} UseProjectsOptions
 * @property {(key: string, fallback?: string) => string} t - Translation function
 * @property {(message: string) => void} setStatus - Status message setter
 * @property {DeviceLibrary} [deviceLibrary] - Global device library state
 * @property {(value: DeviceLibrary | ((prev: DeviceLibrary) => DeviceLibrary)) => void} [setDeviceLibrary] - Device library updater
 */

/**
 * @typedef {Object} UseProjectsReturn
 * @property {Project[]} projects - All projects
 * @property {(projects: Project[]) => void} setProjects - Direct setter for projects
 * @property {History} history - Autocomplete history
 * @property {(history: History) => void} setHistory - Direct setter for history
 * @property {ProjectDraft} projectDraft - Current new-project draft
 * @property {(field: string, value: string) => void} updateProjectDraftField - Update draft field
 * @property {(event: Event) => string|null} addProject - Create new project, returns ID or null
 * @property {(projectId: string) => void} deleteProject - Delete a project
 * @property {string} newCategoryName - Current new-category name
 * @property {(name: string) => void} setNewCategoryName - Set new category name
 * @property {(projectId: string, event: Event) => void} addCategory - Add category to project
 * @property {Object<string, ItemDraft>} itemDrafts - Draft items keyed by category ID
 * @property {(categoryId: string) => ItemDraft} getItemDraft - Get draft for category
 * @property {(categoryId: string, field: string, value: any) => void} updateDraftItem - Update item draft
 * @property {(projectId: string, event: Event, categoryId: string) => void} addItemToCategory - Add item
 * @property {(projectId: string, categoryId: string) => void} removeCategory - Remove category
 * @property {(projectId: string, categoryId: string, itemId: string) => void} removeItem - Remove item
 * @property {(projectId: string, categoryId: string, itemId: string, field: string, value: any) => void} updateItemField - Update item
 * @property {(projectId: string, categoryId: string, field: string, value: string) => void} updateCategoryField - Update category
 * @property {(projectId: string, field: string, value: string) => void} updateProjectField - Update project
 * @property {(projectId: string, value: string) => void} updateProjectNotes - Update project notes
 * @property {(categoryId: string, suggestion: HistoryEntry) => void} applySuggestionToDraft - Apply suggestion to draft
 * @property {(projectId: string, categoryId: string, itemId: string, suggestion: HistoryEntry) => void} applySuggestionToItem - Apply suggestion to item
 * @property {(projectId: string, updater: (project: Project) => Project) => void} updateProject - Generic project updater
 * @property {(item: Item) => void} rememberItem - Add item to history
 * @property {HistoryEntry[]} itemSuggestions - Filtered item suggestions
 */

export { };
