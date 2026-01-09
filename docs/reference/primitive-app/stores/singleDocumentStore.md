# singleDocumentStore

Pinia store for single-document mode with optional document switching.

Use this store when your app works with one document at a time, with optional
ability to switch between documents. The store handles:

- Automatic default document creation/resolution via aliases
- Persisting the last-used document across sessions
- Document switching with proper cleanup

## Usage

```ts
import { useSingleDocumentStore } from 'primitive-app';

const docStore = useSingleDocumentStore();

// Wait for document to be ready
if (docStore.isReady) {
  console.log('Current document:', docStore.getCurrentDocumentName);
  console.log('Permission:', docStore.getCurrentDocumentPermission);
}

// Switch to a different document (if switching is enabled)
await docStore.switchDocument('doc-id-123');
```

## Configuration

Configured via `createPrimitiveApp` with `documentStoreMode: 'single'` or
`documentStoreMode: 'singleWithSwitching'`.

## State

### `allowDocumentSwitching`

Whether users can switch between documents.

### `userVisibleDocumentName`

User-facing name for documents (e.g., "Project", "Workspace").

### `userVisibleDocumentNamePlural`

Plural form of the document name (e.g., "Projects", "Workspaces").

### `defaultDocumentTitle`

Default title for newly created documents.

### `manageDocumentsRouteName`

Route name for the document management page.

### `currentDocumentId`

ID of the currently active document, or null if none is open.

### `currentDocumentMetadata`

Current document metadata, derived reactively from jsBaoDocumentsStore.
Includes title, tags, and permission level.

### `isReady`

Whether the store is initialized and a document is ready for use.

## Getters

### `getCurrentDocumentName`

The title of the current document.

### `getCurrentDocumentPermission`

The user's permission level on the current document ('owner', 'read-write', or 'reader').

### `isCurrentDocReadOnly`

Whether the current document is read-only for this user.

## Actions

### `initialize`

Initialize the single document store with configuration options.
This is typically called by `createPrimitiveApp` during app bootstrap.
Opens the last-used document or creates/opens a default document via alias.

| Parameter | Description |
| --- | --- |
| `options` | Configuration including document naming and switching options |

### `reset`

Reset the store state, closing any open document.
Call this when the user logs out or the app is being torn down.

### `switchDocument`

Switch to a different document.
Only available when `allowDocumentSwitching` is enabled.
Closes the current document and opens the target document.

| Parameter | Description |
| --- | --- |
| `targetDocumentId` | The ID of the document to switch to |

## Exported types

### DocumentPermission

```ts
export type DocumentPermission = DocumentInfo["permission"];
```

### InitializeSingleDocumentOptions

```ts
export interface InitializeSingleDocumentOptions {
  /**
   * User-visible singular document name (for UI; kept for parity with the
   * React provider but not currently used by this store).
   */
  userVisibleDocumentName: string;
  /**
   * User-visible plural document name for UI.
   */
  userVisibleDocumentNamePlural: string;
  /**
   * Title used when auto-creating the user's default document.
   */
  defaultDocumentTitle: string;
  /**
   * Optional vue-router route name for the manage-documents page.
   */
  manageDocumentsRouteName?: string;
  /**
   * Whether document switching is allowed. When true, users can switch between
   * documents. When false, a single document is used without switching UI.
   * Defaults to false.
   */
  allowDocumentSwitching?: boolean;
}
```
