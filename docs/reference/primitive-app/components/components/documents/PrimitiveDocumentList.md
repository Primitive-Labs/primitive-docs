# PrimitiveDocumentList

Document management page content for listing, creating, renaming, sharing, and deleting documents.

This component loads documents and invitations directly from the js-bao client
when mounted. The app provides current document info and callbacks for document actions.

---

## Props

| Prop name         | Description                                                                                                                                                                                                                                                       | Type   | Values | Default     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ----------- |
| documentName      | Singular display name for a document (e.g., "Project", "Workspace").<br/>`@default` "Document"                                                                                                                                                                    | string | -      | "Document"  |
| filterTags        | Optional list of tags to filter documents by.<br/>When provided, only documents with at least one matching tag are shown.                                                                                                                                         | Array  | -      | () =&gt; [] |
| inviteUrlTemplate | URL template for invitation links. Use `{documentId}` as a placeholder that will<br/>be replaced with the actual document ID. If not provided, no documentUrl will be<br/>included in the invitation.<br/>`@example` "https://example.com/documents/{documentId}" | string | -      |             |
| currentDocumentId | Optional ID of the currently active document.<br/>When provided, a "Current" badge is shown next to the matching document.                                                                                                                                        | union  | -      | null        |

## Events

| Event name     | Properties | Description                                 |
| -------------- | ---------- | ------------------------------------------- |
| document-click |            | Emitted when user clicks on a document row. |
