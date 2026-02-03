# MassDeleteRecordsDialog

Mass-delete dialog for records in a given model.

Allows selecting multiple record IDs and emits them for deletion. The parent
performs deletion and updates progress via exposed methods.

---

## Props

| Prop name | Description                                                                     | Type    | Values | Default |
| --------- | ------------------------------------------------------------------------------- | ------- | ------ | ------- |
| open      | Whether the dialog is open.                                                     | boolean | -      |         |
| modelName | Human-readable model name to display in the title.                              | union   | -      |         |
| records   | Records available for selection. Each record is expected to have an `id` field. | Array   | -      |         |
| loading   | When true, disables selection and shows a loading state.                        | boolean | -      |         |

## Events

| Event name  | Properties | Description                                                       |
| ----------- | ---------- | ----------------------------------------------------------------- |
| update:open |            | Emitted when the dialog open state changes.                       |
| delete      |            | Emitted when the user confirms deletion for the selected records. |

## Expose

### updateProgress

>

### finishDeleting

>

### isDeleting

>
