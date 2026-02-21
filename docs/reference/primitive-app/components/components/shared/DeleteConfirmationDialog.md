# DeleteConfirmationDialog

Generic "confirm delete" dialog with optional copy customization and loading state.

This component is typically used as a controlled dialog: the parent owns `isOpen`
and listens for confirm/cancel events.

---

## Props

| Prop name       | Description                                                                                                                   | Type    | Values | Default                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | -------------------------------------------- |
| isOpen          | Whether the dialog is open.                                                                                                   | boolean | -      |                                              |
| title           | Dialog title text.<br/>`@default` "Confirm Delete"                                                                            | string  | -      | "Confirm Delete"                             |
| question        | Primary question copy shown to the user.<br/>`@default` "Are you sure you want to delete this item?"                          | string  | -      | "Are you sure you want to delete this item?" |
| warning         | Optional warning copy shown below the question (often in destructive styling).<br/>`@default` "This action cannot be undone." | string  | -      | "This action cannot be undone."              |
| confirmLabel    | Label for the destructive confirm button.<br/>`@default` "Delete"                                                             | string  | -      | "Delete"                                     |
| confirmingLabel | Label shown on the confirm button while the action is in progress.<br/>`@default` "Deleting..."                               | string  | -      | "Deleting..."                                |
| cancelLabel     | Label for the cancel button.<br/>`@default` "Cancel"                                                                          | string  | -      | "Cancel"                                     |
| isDeleting      | When true, disables actions and shows a loading state for the confirm button.<br/>`@default` false                            | boolean | -      | false                                        |

## Events

| Event name    | Properties | Description                                            |
| ------------- | ---------- | ------------------------------------------------------ |
| confirm       |            | Emitted when the user confirms the destructive action. |
| cancel        |            | Emitted when the user cancels or dismisses the dialog. |
| update:isOpen |            | Emitted when the open state changes.                   |
