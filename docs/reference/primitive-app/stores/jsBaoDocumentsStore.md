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
