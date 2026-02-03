# DocumentSidebar

Sidebar for the Document Explorer.

Lists documents, supports search + pagination, and emits actions for selecting,
deleting, renaming, and mass deletion (where permitted).

---

## Props

| Prop name               | Description                                                                       | Type    | Values | Default |
| ----------------------- | --------------------------------------------------------------------------------- | ------- | ------ | ------- |
| documents               | List of documents to render in the sidebar.                                       | Array   | -      |         |
| selectedDocId           | Currently selected document ID in the explorer UI (may be null before selection). | union   | -      |         |
| currentDocumentId       | Document ID that is currently open/active in the underlying client/store.         | union   | -      |         |
| documentListLoaded      | Whether the initial document list has been loaded.                                | boolean | -      |         |
| deletableDocumentsCount | Count of documents that are deletable (typically owned and not currently active). | number  | -      |         |
| isSyncing               | Whether the app is currently syncing documents/metadata.                          | boolean | -      |         |

## Events

| Event name      | Properties | Description                                             |
| --------------- | ---------- | ------------------------------------------------------- |
| select          |            | Emitted when the user selects a document.               |
| delete          |            | Emitted when the user requests deleting a document.     |
| mass-delete     |            | Emitted when the user requests the mass deletion flow.  |
| add-document    |            | Emitted when the user requests creating a new document. |
| rename-document |            | Emitted when the user requests renaming a document.     |
