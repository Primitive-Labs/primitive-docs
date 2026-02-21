# ModelHeader

Model Header - Header bar and expandable properties panel for DocumentExplorerModel.

Contains the model selector dropdown, properties toggle, filter/sort buttons,
selection action bar, and the expandable schema/relationships/methods/indexes panel.

---

## Props

| Prop name     | Description                            | Type    | Values | Default |
| ------------- | -------------------------------------- | ------- | ------ | ------- |
| currentModel  | Currently selected model               | union   | -      |         |
| modelName     | Raw model name prop (used as fallback) | string  | -      |         |
| models        | All registered models                  | Array   | -      |         |
| modelCounts   | Per-model record counts                | Record  | -      |         |
| canWrite      | Whether the user has write permission  | boolean | -      |         |
| selectedCount | Number of selected records             | number  | -      |         |

## Events

| Event name       | Properties | Description |
| ---------------- | ---------- | ----------- |
| switch-model     |            |
| open-create      |            |
| clear-selection  |            |
| open-bulk-delete |            |
