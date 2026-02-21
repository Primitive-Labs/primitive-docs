# FilterBar

Filter Bar - Inline filter bar for the Document Explorer model view.

Renders an inline bar with an "Add filter" button, active filter chips,
a "Clear all" action, and a dropdown for adding new filters.
Matches the mockup's query-builder style.

---

## Props

| Prop name        | Description | Type     | Values | Default |
| ---------------- | ----------- | -------- | ------ | ------- |
| modelInfo        |             | union    | -      |         |
| filters          |             | Array    | -      |         |
| loadedData       |             | PageData | -      |         |
| showHiddenFields |             | boolean  | -      |         |

## Events

| Event name    | Properties | Description |
| ------------- | ---------- | ----------- |
| add-filter    |            |
| remove-filter |            |
| update-filter |            |
| clear-all     |            |
