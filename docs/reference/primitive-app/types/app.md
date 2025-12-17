# app

## Exported types

### DocumentStoreMode

```ts
export enum DocumentStoreMode {
  /**
   * Do not initialize any document store.
   */
  None = "none",

  /**
   * Initialize a single-document store for a primary document, without
   * exposing any document switching UI.
   */
  SingleDocument = "single-document",

  /**
   * Initialize a single-document store for a primary document and enable
   * document switching and invitations UX.
   */
  SingleDocumentWithSwitching = "single-document-with-switching",

  /**
   * Enable the multi-document store for managing multiple parallel document
   * collections. Collections are registered dynamically at runtime via
   * registerCollection() - no upfront configuration is needed.
   */
  MultiDoc = "multi-doc",
}
```
