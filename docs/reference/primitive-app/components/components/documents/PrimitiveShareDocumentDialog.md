# PrimitiveShareDocumentDialog

Document sharing dialog (invite users and manage existing permissions).

When opened, this component loads permissions + invitations for `documentId`
and renders a table with controls (subject to the current user's permissions).

---

## Props

| Prop name     | Description                                                                                                  | Type    | Values | Default    |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------- | ------ | ---------- |
| isOpen        | Whether the dialog is open.                                                                                  | boolean | -      |            |
| documentId    | Document identifier to load permissions for. When `null`, the dialog renders<br/>but will not load data.     | union   | -      |            |
| documentLabel | Human-readable label used in the dialog title/copy (e.g. "Document", "Workspace").<br/>`@default` "Document" | string  | -      | "Document" |

## Events

| Event name | Properties | Description                               |
| ---------- | ---------- | ----------------------------------------- |
| close      |            | Emitted when the dialog should be closed. |
