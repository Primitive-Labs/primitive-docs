# DocumentListPanel

Document List Panel - Left sidebar for the Document Explorer V2 layout.

Displays owned and shared documents in separate searchable sections,
with checkboxes for bulk actions, permission badges, and root document indicator.

---

## Props

| Prop name          | Description | Type    | Values | Default |
| ------------------ | ----------- | ------- | ------ | ------- |
| ownedDocuments     |             | Array   | -      |         |
| sharedDocuments    |             | Array   | -      |         |
| selectedDocId      |             | union   | -      |         |
| documentListLoaded |             | boolean | -      |         |

## Events

| Event name        | Properties | Description |
| ----------------- | ---------- | ----------- |
| select-document   |            |
| create-document   |            |
| bulk-delete       |            |
| bulk-leave        |            |
| bulk-delete-mixed |            |

## Expose

### isCollapsed

>
