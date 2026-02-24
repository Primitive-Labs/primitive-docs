# BlobTablePanel

Blob Table Panel — the blobs view for the Document Explorer middle panel.

Displays a selectable table of blobs with per-row download/delete actions
and a pagination footer. Pagination is server-side (cursor-based). Search
is by blob ID (exact server-side lookup via get()).

Selection state is emitted upward so the parent (DocumentExplorerModel/ModelHeader)
can display the bulk action bar in the toolbar area.

---

## Props

| Prop name        | Description                                     | Type    | Values | Default |
| ---------------- | ----------------------------------------------- | ------- | ------ | ------- |
| documentId       |                                                 | string  | -      |         |
| searchQuery      |                                                 | string  | -      |         |
| canWrite         | Whether current user can write to this document | boolean | -      |         |
| uploadDialogOpen |                                                 | boolean | -      |         |

## Events

| Event name                | Properties | Description                                                             |
| ------------------------- | ---------- | ----------------------------------------------------------------------- |
| select-blob               |            |
| update:upload-dialog-open |            |
| selection-change          |            | Emitted whenever checkbox selection changes so parent can show bulk bar |

## Expose

### executeBulkDelete

>

### refresh

>

### clearSelection

>

### handleExternalDelete

>

### selectedCount

>
