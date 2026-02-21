# DocumentListSection

Document List Section - Accordion section for the document list within the left sidebar.

Renders the documents accordion header (with bulk action bar overlay), select-all row,
and individual document items with checkboxes, permission badges, and root indicators.
Manages its own checkbox selection state for bulk delete/leave operations.

---

## Props

| Prop name          | Description                                                           | Type    | Values | Default |
| ------------------ | --------------------------------------------------------------------- | ------- | ------ | ------- |
| documents          | Full list of documents (used for permission checks on selected items) | Array   | -      |         |
| filteredDocuments  | Filtered subset of documents to display                               | Array   | -      |         |
| selectedDocId      | Currently selected document ID (for highlight)                        | union   | -      |         |
| isExpanded         | Whether the documents accordion section is expanded                   | boolean | -      |         |
| documentListLoaded | Whether the document list has finished loading                        | boolean | -      |         |
| searchQuery        | Current search query (used for empty-state messaging)                 | string  | -      |         |

## Events

| Event name        | Properties | Description                                                           |
| ----------------- | ---------- | --------------------------------------------------------------------- |
| select-document   |            |
| create-document   |            |
| bulk-delete       |            |
| bulk-leave        |            | Emitted for pure non-owned selections (leave only)                    |
| bulk-delete-mixed |            | Emitted for mixed selections containing both owned and non-owned docs |
| toggle-section    |            |
