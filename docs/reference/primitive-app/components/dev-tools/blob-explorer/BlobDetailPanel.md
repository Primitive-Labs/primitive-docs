# BlobDetailPanel

Blob Detail Panel — right panel shown when the blobs tab is active.

Shows either an empty-selection placeholder or the full detail view for a
selected blob: preview (image / text / generic), actions (download, open,
copy URL, delete), info (ID, filename, type, size, uploaded, SHA-256),
and the download URL code block.

Matches the mock right panel (document-explorer-with-blobs-toggle.html).

---

## Props

| Prop name    | Description                                                                      | Type    | Values | Default |
| ------------ | -------------------------------------------------------------------------------- | ------- | ------ | ------- |
| documentId   |                                                                                  | string  | -      |         |
| selectedBlob |                                                                                  | union   | -      |         |
| canWrite     | Whether the current user has write access; hides destructive actions when false. | boolean | -      |         |

## Events

| Event name   | Properties | Description |
| ------------ | ---------- | ----------- |
| delete-blob  |            |
| reload-blobs |            |
