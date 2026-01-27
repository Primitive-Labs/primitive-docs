# PrimitiveDocumentSwitcher

Document switcher dropdown shown at the top of the sidebar.

Displays a configurable label and icon, with a dropdown menu for switching
between documents and accessing the "Manage Documents" page.

This component loads documents and invitations directly from the js-bao client
when mounted. The app provides callbacks for document switching behavior.

---

## Props

| Prop name           | Description                                                                                         | Type      | Values | Default     |
| ------------------- | --------------------------------------------------------------------------------------------------- | --------- | ------ | ----------- |
| label               | Label text displayed in the header (e.g., app name or current context).                             | string    | -      |             |
| icon                | Icon component to display in the header.                                                            | Component | -      |             |
| currentDocumentId   | ID of the currently active document (used to highlight in the menu).                                | union     | -      | null        |
| documentNamePlural  | Plural name for documents (e.g., "Projects", "Workspaces").<br/>Used in "Manage [Documents]" label. | string    | -      | "Documents" |
| manageDocumentsPath | Route path for the manage documents page.<br/>If not provided, the manage link is hidden.           | string    | -      |             |
| mobile              | Whether the component is rendered in mobile mode.<br/>Affects dropdown menu positioning.            | boolean   | -      | false       |

## Events

| Event name      | Properties | Description                                                                                                 |
| --------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| switch-document |            | Emitted when user selects a different document.                                                             |
| navigate        |            | Emitted when navigation occurs (e.g., clicking "Manage Documents").<br/>Used to close the mobile nav sheet. |
