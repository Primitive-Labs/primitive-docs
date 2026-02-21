# RecordFormFields

Record Form Fields - Shared form field rendering for edit/create record dialogs.

Renders the appropriate input control for each field based on its schema type,
including relationship dropdowns, StringSet tag editors, date pickers, boolean
toggles, number inputs, JSON textareas, and expandable text inputs.

---

## Props

| Prop name        | Description                                            | Type      | Values | Default |
| ---------------- | ------------------------------------------------------ | --------- | ------ | ------- |
| modelInfo        | The model info for field metadata                      | ModelInfo | -      |         |
| formData         | Current form data (reactive object)                    | Record    | -      |         |
| fields           | Fields to display                                      | Array     | -      |         |
| excludeId        | Whether to exclude the ID field (for create dialogs)   | boolean   | -      | false   |
| relatedModelData | Related model data for relationship dropdowns          | Record    | -      |         |
| customIdFields   | Set of fields in custom ID entry mode                  | Set       | -      |         |
| copiedId         | Clipboard feedback - which ID was just copied          | union     | -      | null    |
| idPrefix         | Prefix for input element IDs (e.g. 'edit' or 'create') | string    | -      | "field" |

## Events

| Event name       | Properties | Description |
| ---------------- | ---------- | ----------- |
| update-field     |            |
| copy-id          |            |
| toggle-custom-id |            |
