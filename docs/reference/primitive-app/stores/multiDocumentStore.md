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
