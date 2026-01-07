# Understanding Documents

In Primitive, a **document** is the fundamental unit of data storage, sync, and sharing. Understanding how documents work is essential to designing your app well.

## What is a Document?

A document is a container that holds your js-bao model objects. Think of it like a self-contained database that can be:

- **Synced** — Changes flow to the server and other clients automatically
- **Shared** — You control who can access the data
- **Stored offline** — Persisted locally for offline access

Every piece of data in your app lives inside a document. When you save a `Task` or a `Project`, it's stored in a specific document.

```
┌─────────────────────────────────────────┐
│              Document                    │
│  ┌─────────────┐  ┌─────────────┐       │
│  │   Task 1    │  │  Project A  │       │
│  │   Task 2    │  │  Project B  │       │
│  │   Task 3    │  │             │       │
│  └─────────────┘  └─────────────┘       │
│                                          │
│  Owner: alice@example.com               │
│  Shared with: bob@example.com (editor)  │
└─────────────────────────────────────────┘
```

## Documents Are Private by Default

All documents belong to a user and are **private by default**. Only the owner can see and modify the data—until they explicitly share it.

This is fundamentally different from traditional apps where data typically lives in a shared database. In Primitive:

- Users own their data
- Sharing is opt-in and explicit
- Collaboration happens at the document level

## The Sharing Model

When you share a document, you grant another user a permission level:

| Permission | Can View | Can Edit | Can Share | Can Delete |
|------------|----------|----------|-----------|------------|
| `reader` | ✓ | | | |
| `read-write` | ✓ | ✓ | | |
| `owner` | ✓ | ✓ | ✓ | ✓ |

Sharing happens via email invitation:

```typescript
// Share a document with another user
await documentsStore.shareDocument(
  documentId, 
  "colleague@example.com", 
  "read-write"
);
```

The invited user receives the document in their pending invitations and can accept or decline.

### Real-Time Collaboration

When multiple users have access to the same document, they're collaborating in real-time:

- Changes sync instantly between all connected users
- No conflicts—the system handles concurrent edits automatically
- Users can see who else is viewing/editing (awareness)

## Document Size Guidelines

Documents are designed to hold approximately **10MB of data** each. This is a soft limit—you won't hit a hard wall, but performance may degrade with very large documents.

For most apps, this is plenty:
- Thousands of tasks, notes, or records
- Hundreds of projects with details
- Years of personal data

If you're building something that might exceed this (media libraries, extensive logs), consider splitting data across multiple documents.

## Choosing a Document Pattern

How you structure documents depends on your app's sharing needs. Primitive supports several patterns out of the box.

### Pattern 1: Single Document (Personal Apps)

**Best for:** Personal tools, single-user apps, no sharing needed

Each user gets exactly one document that holds all their data. This is the simplest model—no document management UI needed.

```typescript
// In your app config
documentStoreMode: DocumentStoreMode.SingleDocument
```

**Examples:** Personal task manager, habit tracker, journal app, budgeting tool

**User experience:** Users sign in and immediately see their data. No concept of "documents" exposed in the UI.

### Pattern 2: Single Document with Switching (Workspaces)

**Best for:** Apps where users create discrete projects or workspaces they might share

Users have multiple documents but work in one at a time. They can create new documents, switch between them, and share each with different people.

```typescript
// In your app config
documentStoreMode: DocumentStoreMode.SingleDocumentWithSwitching

// In your single document config
export function getSingleDocumentConfig() {
  return {
    userVisibleDocumentName: "Workspace",
    userVisibleDocumentNamePlural: "Workspaces", 
    defaultDocumentTitle: "My Workspace",
  };
}
```

**Examples:** 
- Accounting app (one document per company)
- Project management (one document per project)
- Shared shopping lists (one list per household)

**User experience:** Users see a document switcher in the UI. They can create "New Workspace", rename them, share them with teammates, and switch between them.

### Pattern 3: Multi-Document (Channels/Collections)

**Best for:** Apps that need multiple documents open simultaneously

Multiple documents can be open at once, organized into collections. Documents are tagged and auto-opened based on configuration.

```typescript
// In your app config
documentStoreMode: DocumentStoreMode.MultiDoc

// Register collections dynamically
const multiDoc = useMultiDocumentStore();

await multiDoc.registerCollection({
  name: "channels",
  tag: "channel",
  autoOpen: true,
  autoAcceptInvites: true,
});
```

**Examples:**
- Chat app (one document per channel, multiple channels visible)
- Multi-tenant dashboard (separate data per client)
- Collaborative workspace with distinct data types

**User experience:** The app manages which documents are open. Users might see a list of channels, each backed by a separate document with its own sharing.

### Pattern 4: Custom Document Management

**Best for:** Advanced use cases with specific requirements

You manage documents directly using the underlying stores and APIs. Full control over when documents open, close, and how they're presented.

```typescript
const documentsStore = useJsBaoDocumentsStore();

// Open a document manually
await documentsStore.openDocument(documentId);

// Close when done
await documentsStore.closeDocument(documentId);
```

## Designing Your Document Structure

When planning your app, ask yourself:

**"What sets of data might users want to share with different people?"**

Each answer is potentially a document boundary:

| If users share... | Consider... |
|-------------------|-------------|
| Nothing | Single Document mode |
| Entire app data with a team | Single Document with Switching |
| Different projects with different people | Single Document with Switching |
| Multiple data sets simultaneously | Multi-Document mode |

### Best Practices

1. **Model relationships within documents** — Use model IDs to connect records, not document boundaries
   
2. **Use model IDs in routes** — Reference specific records by their ID, not the document they're in
   
3. **Don't over-segment** — More documents means more complexity. Start simple.

4. **Think about the sharing story** — If two pieces of data should always be shared together, they belong in the same document

## Documents and Queries

When you query data with js-bao, the query runs across **all open documents** by default. This is usually what you want—your code doesn't need to know which document data lives in.

```typescript
// Finds all active projects across all open documents
const projects = await Project.query({ archived: false });
```

You can restrict queries to specific documents when needed:

```typescript
// Query only within a specific document
const projects = await Project.query(
  { archived: false },
  { documents: specificDocumentId }
);
```

For more on querying, see [Working with Data](./working-with-data.md).

## Next Steps

- **[Working with Data](./working-with-data.md)** — Define models and perform CRUD operations
- **[Other Services](./other-services.md)** — Explore blob storage, AI, and more

