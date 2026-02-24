# BlobExplorerDocumentSidebar

Blob Explorer Document Sidebar — left panel showing the document list for the Blob Explorer tab.

Simplified document list (no bulk-select, no invitations) that lets the user
search and pick a document whose blobs they want to inspect.

---

## Props

| Prop name          | Description | Type    | Values | Default |
| ------------------ | ----------- | ------- | ------ | ------- |
| documents          |             | Array   | -      |         |
| selectedDocId      |             | union   | -      |         |
| documentListLoaded |             | boolean | -      |         |

## Events

| Event name      | Properties | Description |
| --------------- | ---------- | ----------- |
| select-document |            |
