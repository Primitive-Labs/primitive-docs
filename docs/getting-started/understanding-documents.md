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

How you structure documents depends on your app's sharing needs. Here are the common patterns.

### Pattern 1: Single Document (Personal Apps)

**Best for:** Personal tools, single-user apps, no sharing needed

Each user gets exactly one document that holds all their data. The document is opened on app load / user sign-in. No document management UI is needed.

**Examples:** Personal task manager, habit tracker, journal app, budgeting tool

**User experience:** Users sign in and immediately see their data. No concept of "documents" is exposed in the UI.

**Implementation using aliases:**

```typescript
// On app initialization after user is authenticated
// Use aliases for atomic get-or-create of a unique default document
const aliasParams = { scope: "user" as const, aliasKey: "default-doc" };

try {
  // Try to open by alias (common case - document already exists)
  await jsBaoClient.documents.openAlias(aliasParams);
} catch {
  // Alias doesn't exist - create document with alias atomically
  // Server prevents duplicates if another client creates simultaneously
  const result = await jsBaoClient.documents.createWithAlias({
    title: "My Data",
    alias: aliasParams,
  });
  await jsBaoClient.documents.open(result.documentId);
}
```

### Pattern 2: One Document at a Time (Workspaces)

**Best for:** Apps where users create discrete projects or workspaces they might share

Users have multiple documents but work in one at a time. They can create new documents, switch between them, and share each with different people.

**Examples:**
- Accounting app (one document per company)
- Project management (one document per project)
- Shared shopping lists (one list per household)

**User experience:** Users see a document switcher in the UI. They can create new workspaces, rename them, share them with teammates, and switch between them.

**UI Components:** The `primitive-app` library provides components for this pattern:

- **`PrimitiveDocumentSwitcher`** — A dropdown menu for the sidebar header. Shows the current document name, lists available documents for quick switching, displays pending invitation badges, and links to a "Manage Documents" page.

- **`PrimitiveDocumentList`** — A full document management interface. Displays documents in a table (desktop) or list (mobile) with support for renaming, sharing, deleting, and accepting invitations.

**Implementation:**

```typescript
// List available documents
const documents = await jsBaoClient.documents.list();

// Open the selected document
await jsBaoClient.documents.open(selectedDocumentId);

// Create a new document/workspace
const { metadata } = await jsBaoClient.documents.create({
  title: "New Project",
  tags: ["workspace"],
});
await jsBaoClient.documents.open(metadata.documentId);
```

### Pattern 3: Multiple Documents

**Best for:** Apps that need to query across multiple documents, each with different sharing contexts

Apps can manage opening and closing documents as needed. All documents that need to receive live updates or be queried across must be open.

**Examples:**
- Chat app (one document per channel, multiple channels visible)
- Multi-tenant dashboard (separate data per client)
- Collaborative workspace with distinct data collections

**User experience:** The app manages which documents are open. Users might see a list of channels, each backed by a separate document with its own sharing settings.

**Implementation:**

```typescript
// Get all documents with a specific tag
const documents = await jsBaoClient.documents.list();
const channels = documents.filter((doc) => doc.tags?.includes("channel"));

// Open all channel documents
await Promise.all(
  channels.map((ch) => jsBaoClient.documents.open(ch.documentId))
);

// Query runs across all open documents by default
const messages = await Message.query({});
```

## The Root Document

Every user has a special **root document** that is automatically opened by primitive-app. This document is reserved exclusively for user preferences (like theme settings, last-used document ID, etc.).

::: warning Important
**Never store application data in the root document.** It should only contain user preferences. Application data belongs in separate documents using the patterns described above.
:::

## Document Aliases

Aliases provide a way to reference documents by name instead of ID. They're particularly useful for the Single Document pattern where you need atomic get-or-create semantics.

**Alias scopes:**
- `"user"` — Unique per user (each user can have their own document with this alias)
- `"app"` — Unique across the entire app (shared by all users)

```typescript
// Resolve an alias to get document info
const aliasInfo = await jsBaoClient.documents.aliases.resolve({
  scope: "user",
  aliasKey: "my-settings"
});

// Set an alias for an existing document
await jsBaoClient.documents.aliases.set({
  scope: "user",
  aliasKey: "my-settings",
  documentId: existingDocId
});

// Create a document with an alias atomically
const result = await jsBaoClient.documents.createWithAlias({
  title: "Settings",
  alias: { scope: "user", aliasKey: "my-settings" }
});
```

## Designing Your Document Structure

When planning your app, ask yourself:

**"What sets of data might users want to share with different people?"**

Each answer is potentially a document boundary:

| If users share... | Consider... |
|-------------------|-------------|
| Nothing | Single Document pattern |
| Entire app data with a team | One Document at a Time pattern |
| Different projects with different people | One Document at a Time pattern |
| Multiple data sets simultaneously | Multiple Documents pattern |

### Best Practices

1. **Model relationships using model IDs** — Use model IDs to connect records, not document IDs. Only use documentIds when required for APIs (sharing, save location).

2. **Use model IDs in routes** — Reference specific records by their model ID, not the document they're in.

3. **Don't over-segment** — More documents means more complexity. Start simple.

4. **Think about the sharing story** — If two pieces of data should always be shared together, they belong in the same document.

5. **Never iterate over documents to query** — js-bao queries operate over ALL open documents automatically. Filter results by documentId or other fields in the query itself if needed.

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

