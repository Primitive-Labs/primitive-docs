# DocumentExplorerModel

Per-model view for the Document Explorer.

Renders a paginated, filterable, sortable table of records for a single model
within the currently selected document, plus dialogs for editing/creating/deleting.

---

## Props

| Prop name          | Description                                          | Type   | Values | Default |
| ------------------ | ---------------------------------------------------- | ------ | ------ | ------- |
| modelName          |                                                      | string | -      |         |
| documentPermission | Document permission level — "reader" means view-only | string | -      |         |

## Events

| Event name  | Properties | Description |
| ----------- | ---------- | ----------- |
| back        |            |
| switchModel |            |
