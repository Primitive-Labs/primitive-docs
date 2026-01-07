# The Local-First Model

Primitive takes a fundamentally different approach to building web apps. Instead of your frontend making API calls to a backend server, **all your application logic runs entirely in the browser**, reading and writing data locally. The server handles sync, authentication, and collaboration—but your code never waits on it for basic operations.

## How It Works

When you build with Primitive:

1. **Data lives locally** — Your app reads and writes data to a local database in the browser
2. **Changes sync automatically** — The Primitive client syncs your local changes to the server in the background
3. **Updates arrive in real-time** — When other users change shared data, those changes sync down instantly
4. **Offline just works** — Since data is local, your app works without a network connection

```
┌─────────────────────────────────────────────────────────────┐
│                      Your App (Browser)                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Vue UI    │◄──►│  js-bao     │◄──►│  Local Database │  │
│  │             │    │  (ORM)      │    │                 │  │
│  └─────────────┘    └─────────────┘    └────────┬────────┘  │
└────────────────────────────────────────────────│────────────┘
                                                  │
                                          Background Sync
                                                  │
                                                  ▼
                               ┌──────────────────────────────┐
                               │      Primitive Server        │
                               │  (Sync, Auth, Collaboration) │
                               └──────────────────────────────┘
```

## Why This Matters

### Instant UI Updates

When a user creates, updates, or deletes data, it happens immediately in the local database. Your UI updates instantly—no loading spinners, no waiting for network round trips.

```typescript
// This completes instantly
const task = new Task({ title: "Buy groceries", completed: false });
await task.save();

// The UI can render immediately
// Sync happens in the background
```

### Works Offline

Because your app reads from a local database, it works even when the network is unavailable. Changes made offline are queued and sync when connectivity returns.

Users can:
- Browse their data
- Create and edit records
- Delete items
- Use full app functionality

All without an internet connection. When they're back online, everything syncs automatically.

### Real-Time Collaboration

When multiple users have access to the same document, changes sync in real-time. If Alice edits a shared task list, Bob sees the changes appear immediately—no refresh needed.

The sync system uses conflict-free data structures, so simultaneous edits merge cleanly without data loss.

### Simpler Development

You don't need to:
- Write REST APIs or GraphQL resolvers
- Handle loading states for every data operation
- Build retry logic for failed requests
- Manage cache invalidation

Instead, you work with data models like a traditional ORM:

```typescript
// Create
const project = new Project({ name: "Q4 Planning" });
await project.save();

// Query
const activeProjects = await Project.query({ archived: false });

// Update
project.name = "Q4 Planning (Updated)";
await project.save();

// Delete
await project.delete();
```

## What Runs Where

Understanding the division of responsibilities:

| Your App (Browser) | Primitive Server |
|-------------------|------------------|
| All application logic | Authentication (OAuth) |
| Data models and validation | Data sync between clients |
| UI rendering | Real-time collaboration |
| Offline data access | Blob storage |
| Querying and aggregations | LLM/AI proxy |
| Business rules | Third-party API proxy |

**You never write server-side code for data operations.** The server is a service that your app connects to—it handles the infrastructure so you can focus on building your product.

## Implications for Your Code

### Use js-bao Models Like a Database

Think of js-bao as your database layer. Define models, query them, subscribe to changes:

```typescript
// Define your data shape once
const taskSchema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    completed: { type: "boolean", default: false },
    dueDate: { type: "date" },
  },
});

// Query like you would any database
const overdueTasks = await Task.query({
  completed: false,
  dueDate: { $lt: new Date() },
});
```

### React to Data Changes

Since data can change from sync (another user edited it) or from your own code, subscribe to changes and let your UI react:

```typescript
// In Vue with the data loader composable
const { data, reload } = useJsBaoDataLoader({
  subscribeTo: [Task],  // Re-runs loadData when Task data changes
  loadData: async () => {
    const result = await Task.query({ completed: false });
    return { tasks: result.data };
  },
});
```

### No API Calls for CRUD

If you find yourself reaching for `fetch()` to save data, stop—that's not how Primitive works. Data operations go through js-bao, which handles persistence and sync:

```typescript
// ❌ Don't do this
await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify({ title: 'New task' })
});

// ✅ Do this
const task = new Task({ title: 'New task' });
await task.save();
```

## Next Steps

Now that you understand the local-first model:

- **[Understanding Documents](./understanding-documents.md)** — Learn how data is organized and shared
- **[Working with Data](./working-with-data.md)** — Define models and perform CRUD operations

