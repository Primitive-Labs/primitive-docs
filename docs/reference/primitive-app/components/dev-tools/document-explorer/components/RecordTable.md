# RecordTable

Record Table - Displays a paginated table of model records in the Document Explorer.

Renders the data table with sortable column headers, row selection checkboxes,
typed cell rendering, and row action buttons.

---

## Props

| Prop name           | Description                                                     | Type      | Values | Default |
| ------------------- | --------------------------------------------------------------- | --------- | ------ | ------- |
| records             | Records to display in the table                                 | Array     | -      |         |
| modelInfo           | Model metadata for field rendering                              | ModelInfo | -      |         |
| canWrite            | Whether the user has write permission                           | boolean   | -      |         |
| showHiddenFields    | Whether to show hidden (underscore-prefixed) fields             | boolean   | -      |         |
| loadedData          | Loaded data (keyed by table name) for field computation         | Record    | -      |         |
| sorting             | Active sort field (for column indicators)                       | union     | -      |         |
| selectedRecordIds   | Currently selected record IDs                                   | Set       | -      |         |
| highlightedRecordId | Record ID to highlight briefly (flash-then-fade after creation) | union     | -      |         |

## Events

| Event name              | Properties | Description |
| ----------------------- | ---------- | ----------- |
| edit-record             |            |
| delete-record           |            |
| toggle-column-sort      |            |
| toggle-record-selection |            |
| toggle-select-all       |            |
