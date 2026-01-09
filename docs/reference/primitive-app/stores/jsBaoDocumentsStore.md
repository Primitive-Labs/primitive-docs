# jsBaoDocumentsStore

Pinia store for managing the user's document list and invitations.

This is a low-level store that provides direct access to the user's documents
from js-bao-wss-client. For most use cases, prefer using `useSingleDocumentStore`
or `useMultiDocumentStore` which build on top of this store.

## Features

- Reactive document list with metadata (title, tags, permission)
- Pending invitation management
- Document CRUD operations
- Real-time updates via WebSocket events

## Usage

```ts
import { useJsBaoDocumentsStore } from 'primitive-app';

const docsStore = useJsBaoDocumentsStore();

// Access all documents
const allDocs = docsStore.documents;

// Create a new document
const doc = await docsStore.createDocument('My Document', ['project']);

// Open a document for use
await docsStore.openDocument(doc.documentId);

// Share a document
await docsStore.shareDocument(doc.documentId, 'user@example.com', 'read-write');

// Accept a pending invitation
await docsStore.acceptInvitation(documentId);
```

## State

### `documents`

List of all tracked documents the user has access to.

### `pendingInvitations`

List of pending document invitations for the current user.

### `openDocumentIds`

Set of document IDs that are currently open and syncing.

### `documentListLoaded`

Whether the document list has been loaded from the backend.

### `invitationListLoaded`

Whether the invitation list has been loaded from the backend.

## Getters

### `isReady`

Whether both the document list and invitation list have been loaded.

## Actions

### `initialize`

Initialize the documents store, loading the document list and setting up
real-time listeners for metadata and invitation changes.
This is typically called by `createPrimitiveApp` during app bootstrap.

### `reset`

Reset the store state and clean up listeners.
Call this when the user logs out.

### `refreshDocuments`

Refresh the document list from the backend.

### `getDocumentMetadataById`

Get document metadata by ID.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID to look up |

**Returns:** TrackedDocument or undefined if not found

### `openDocument`

Open a document for use. The document will be synced and available for queries.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID to open |

**Returns:** The TrackedDocument metadata

### `closeDocument`

Close a document, stopping sync and releasing resources.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID to close |

### `createDocument`

Create a new document.

| Parameter | Description |
| --- | --- |
| `title` | The document title |
| `tags` | Optional array of tags to apply to the document |

**Returns:** The created TrackedDocument

### `createDocumentWithAlias`

Create a document with an alias atomically.
Used for creating default documents that should be uniquely identified by alias.

| Parameter | Description |
| --- | --- |
| `title` | The document title |
| `alias` | Alias configuration with scope ('user' or 'app') and aliasKey |
| `tags` | Optional array of tags to apply to the document |

**Returns:** Object containing the documentId and TrackedDocument

### `ensureDocWithAlias`

Ensure a document exists for the given alias.
If a document with the alias already exists, returns its ID (and ensures it has the specified tags).
If not, creates a new document with the alias and returns the new ID.

| Parameter | Description |
| --- | --- |
| `title` | The document title (used if creating a new document) |
| `alias` | Alias configuration with scope ('user' or 'app') and aliasKey |
| `tags` | Optional array of tags to apply to the document |

**Returns:** The document ID (existing or newly created)

### `renameDocument`

Rename a document.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID |
| `newTitle` | The new title for the document |

### `deleteDocument`

Delete a document.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID to delete |
| `options` | Optional deletion options |
| `options.force` | Force delete even if document has collaborators |

### `shareDocument`

Share a document with another user by email.
Creates an invitation that the recipient can accept.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID to share |
| `email` | The recipient's email address |
| `permission` | Permission level to grant ('read-write' or 'reader') |

### `refreshPendingInvitations`

Refresh the list of pending invitations from the backend.

### `acceptInvitation`

Accept a pending invitation to access a document.
After accepting, the document will appear in the documents list.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID from the invitation |

### `declineInvitation`

Decline a pending invitation.
The invitation will be removed from the pending list.

| Parameter | Description |
| --- | --- |
| `documentId` | The document ID from the invitation |
| `invitationId` | The invitation ID |

## Exported types

### TrackedDocument

```ts
/**
 * The fields we track for documents in the store.
 * This is a subset of DocumentInfo focused on what the UI needs.
 */
export interface TrackedDocument {
  documentId: string;
  permission: DocumentInfo["permission"];
  tags: string[];
  title: string;
}
```

### PendingInvitation

```ts
/**
 * Extended invitation type that includes document metadata.
 * This type is used for pending invitations stored in the store, which include
 * document metadata from WebSocket events and the pendingDocumentInvitations API.
 */
export interface PendingInvitation {
  invitationId: string;
  documentId: string;
  email: string;
  permission: "owner" | "read-write" | "reader";
  invitedBy: string;
  invitedAt: string;
  expiresAt?: string;
  accepted: boolean;
  acceptedAt?: string;
  title?: string;
  document?: {
    documentId?: string;
    title?: string;
    tags?: string[];
    createdAt?: string;
    lastModified?: string;
    createdBy?: string;
  };
}
```
