# DocumentPropertiesPanel

Document Properties Panel - Right collapsible panel for the Document Explorer V2 layout.

Shows document title, metadata, tags, aliases, sharing/permissions, and models summary.
Delegates tags, aliases, and sharing to extracted sub-components for maintainability.

---

## Props

| Prop name    | Description | Type                 | Values | Default |
| ------------ | ----------- | -------------------- | ------ | ------- |
| document     |             | DocumentInfoWithRoot | -      |         |
| models       |             | Array                | -      |         |
| recordCounts |             | Record               | -      |         |

## Events

| Event name        | Properties | Description |
| ----------------- | ---------- | ----------- |
| navigate-to-model |            |
| rename-document   |            |
| delete-document   |            |
| documents-changed |            |
