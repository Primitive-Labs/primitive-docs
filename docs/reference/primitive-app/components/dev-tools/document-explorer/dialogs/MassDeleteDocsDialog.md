# MassDeleteDocsDialog

Mass-delete dialog for documents.

Allows selecting multiple documents and emits their IDs for deletion. The parent
performs deletion and updates progress via exposed methods.

---

## Props

| Prop name | Description                            | Type    | Values | Default |
| --------- | -------------------------------------- | ------- | ------ | ------- |
| open      | Whether the dialog is open.            | boolean | -      |         |
| documents | List of documents that may be deleted. | Array   | -      |         |

## Events

| Event name  | Properties | Description                                                         |
| ----------- | ---------- | ------------------------------------------------------------------- |
| update:open |            | Emitted when the dialog open state changes.                         |
| delete      |            | Emitted when the user confirms deletion for the selected documents. |

## Expose

### updateProgress

>

### finishDeleting

>

### isDeleting

>
