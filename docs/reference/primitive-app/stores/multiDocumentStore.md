# multiDocumentStore

Pinia store for multi-document mode with tag-based collections.

Use this store when your app needs to work with multiple documents
organized into collections. The store provides:

- Tag-based document collections with auto-open
- Collection-level readiness tracking
- Auto-acceptance of invitations for specific collections
- Document creation within collections

## Usage

```ts
import { useMultiDocumentStore } from 'primitive-app';

const multiDoc = useMultiDocumentStore();

// Register a collection
await multiDoc.registerCollection({
  name: 'projects',
  tag: 'project',
  autoOpen: true,
  autoAcceptInvites: true,
});

// Access documents in the collection
const projects = multiDoc.getCollection('projects');

// Create a new document in the collection
const newProject = await multiDoc.createDocument('projects', 'My Project');

// Check collection readiness
const isReady = multiDoc.isCollectionReady('projects');
```

## Configuration

Configured via `createPrimitiveApp` with `documentStoreMode: 'multi'`.

## Getters

### `collections`

All registered collections as a reactive object.
Keys are collection names, values are arrays of TrackedDocuments matching the collection's tag.

### `getCollection`

Get documents for a specific collection.

### `isCollectionRegistered`

Check if a collection is registered (may still be loading).
Use this to avoid duplicate registration attempts.

### `isCollectionReady`

Check if a collection is ready.
A collection is ready when there are no pending document operations
(all opens/closes from registration or document changes have completed).

### `getCollectionReadyRef`

Get a reactive ref for a collection's readiness.
Returns true when there are no pending document operations.

### `isDocumentReady`

Check if a specific document is open and ready.

### `getDocumentReadyRef`

Get a computed ref that tracks whether a specific document is ready.

## Actions

### `registerCollection`

Register a new document collection.
If autoOpen is true (default), all matching documents will be opened.

### `unregisterCollection`

Unregister a document collection.
If autoOpen was true, matching documents will be closed
(unless they belong to another collection).

### `createDocument`

Create a new document in a specific collection.
The document will be tagged with the collection's tag.
If autoOpen is enabled for the collection, the document will be opened immediately.

| Parameter | Description |
| --- | --- |
| `collectionName` | The name of the collection to create the document in |
| `title` | The title of the document |
| `options` | Optional creation options |
| `options.alias` | If provided, creates the document with an alias for uniqueness |

### `reset`

Reset the store, unregistering all collections and closing their documents.
Call this when the user logs out.

## Exported types

### CollectionConfig

```ts
/**
 * Configuration for registering a document collection.
 */
export interface CollectionConfig {
  /** Identifier for the collection. Defaults to tag if not specified. */
  name?: string;
  /** The document tag to filter by. */
  tag: string;
  /** Auto-open matching documents when registered. Defaults to true. */
  autoOpen?: boolean;
  /** Auto-accept invitations for documents in this collection. Defaults to false. */
  autoAcceptInvites?: boolean;
}
```
