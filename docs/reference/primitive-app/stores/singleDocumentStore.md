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
