# Working with Data

This guide covers how to define data models and perform create, read, update, and delete operations in your Primitive app. By the end, you'll understand how to model your app's data and work with it effectively.

## Defining Models

Models define the shape of your data. Each model corresponds to a type of record in your app—like `Task`, `Project`, or `Contact`.

### Creating Your First Model

Create a new file in `src/models/`:

```typescript
// src/models/Task.ts
import {
  BaseModel,
  defineModelSchema,
  attachAndRegisterModel,
  InferAttrs,
} from "js-bao";

// 1. Define the schema
const taskSchema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    description: { type: "string", default: "" },
    completed: { type: "boolean", default: false },
    priority: { type: "number", default: 0 },
    dueDate: { type: "date" },
  },
});

// 2. Create TypeScript types
export type TaskAttrs = InferAttrs<typeof taskSchema>;
export interface Task extends TaskAttrs, BaseModel {}

// 3. Define the class
export class Task extends BaseModel {
  // Add computed properties
  get isOverdue(): boolean {
    if (!this.dueDate || this.completed) return false;
    return new Date(this.dueDate) < new Date();
  }

  // Add static query helpers
  static async findIncomplete() {
    return Task.query({ completed: false });
  }
}

// 4. Register the model
attachAndRegisterModel(Task, taskSchema);
```

### Registering Models with Your App

After creating a model, add it to your js-bao configuration:

```typescript
// src/config/envConfig.ts
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";

export function getJsBaoConfig() {
  return {
    appId: import.meta.env.VITE_APP_ID,
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WS_URL,
    models: [Task, Project],  // Register your models here
  };
}
```

Then run codegen to generate TypeScript helpers:

```bash
pnpm codegen
```

### Field Types

js-bao supports these field types:

| Type | TypeScript | Description |
|------|------------|-------------|
| `id` | `string` | Unique identifier. Use `autoAssign: true` for auto-generated IDs |
| `string` | `string` | Text data |
| `number` | `number` | Numeric data (integers or floats) |
| `boolean` | `boolean` | True/false values |
| `date` | `string` | Date/time stored as ISO-8601 string |
| `stringset` | `StringSet` | Set of strings (great for tags) |

### Field Options

Each field can have these options:

```typescript
fields: {
  // Auto-generate unique IDs
  id: { type: "id", autoAssign: true, indexed: true },
  
  // Indexed for fast queries
  email: { type: "string", indexed: true },
  
  // Default value when not provided
  status: { type: "string", default: "pending" },
  
  // StringSet with limits
  tags: { type: "stringset", maxCount: 20, maxLength: 50 },
}
```

### Unique Constraints

Enforce uniqueness across one or more fields:

```typescript
const userSchema = defineModelSchema({
  name: "users",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    email: { type: "string", indexed: true },
    username: { type: "string", indexed: true },
  },
  options: {
    uniqueConstraints: [
      { name: "unique_email", fields: ["email"] },
      { name: "unique_username", fields: ["username"] },
    ],
  },
});
```

## Creating Records

### Basic Create

```typescript
import { Task } from "@/models/Task";

// Create and save a new task
const task = new Task({
  title: "Review pull request",
  priority: 2,
  dueDate: new Date().toISOString(),
});

await task.save();

console.log("Created task:", task.id);
```

In single document mode, this saves to the currently active document automatically.

### Specifying the Target Document

When you save a new record, you need to specify which document it belongs to:

```typescript
// Explicit document ID
await task.save({ targetDocument: "doc-abc123" });

// Using single document store
const docStore = useSingleDocumentStore();
await task.save({ targetDocument: docStore.currentDocumentId });
```

::: tip Single Document Mode
If your app uses **Single Document mode** (`DocumentStoreMode.SingleDocument` or `DocumentStoreMode.SingleDocumentWithSwitching`), the current document is automatically set as the default target. You can simply call:

```typescript
await task.save();
```

The record will be saved to the currently active document.
:::

Once a record is saved, subsequent saves don't need the document ID:

```typescript
task.title = "Updated title";
await task.save();  // Saves to the same document
```

## Reading Records

### Find by ID

```typescript
const task = await Task.find("task-id-here");

if (task) {
  console.log(task.title, task.completed);
}
```

### Query with Filters

```typescript
// Simple equality
const highPriority = await Task.query({ priority: 3 });

// Comparison operators
const urgent = await Task.query({
  priority: { $gte: 2 },
  completed: false,
});

// Multiple conditions (AND)
const myTasks = await Task.query({
  assignee: "alice",
  completed: false,
  priority: { $gt: 0 },
});
```

### Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equals | `{ status: { $eq: "active" } }` |
| `$ne` | Not equals | `{ status: { $ne: "deleted" } }` |
| `$gt` | Greater than | `{ priority: { $gt: 1 } }` |
| `$gte` | Greater than or equal | `{ priority: { $gte: 2 } }` |
| `$lt` | Less than | `{ dueDate: { $lt: new Date() } }` |
| `$lte` | Less than or equal | `{ price: { $lte: 100 } }` |
| `$in` | In array | `{ status: { $in: ["pending", "active"] } }` |
| `$nin` | Not in array | `{ category: { $nin: ["archived"] } }` |
| `$startsWith` | String starts with | `{ name: { $startsWith: "Project" } }` |
| `$endsWith` | String ends with | `{ email: { $endsWith: "@company.com" } }` |
| `$containsText` | String contains (case-insensitive) | `{ title: { $containsText: "urgent" } }` |
| `$exists` | Field exists | `{ dueDate: { $exists: true } }` |

### Logical Operators

```typescript
// OR conditions
const results = await Task.query({
  $or: [
    { priority: 3 },
    { dueDate: { $lt: new Date() } },
  ],
});

// AND conditions (explicit)
const results = await Task.query({
  $and: [
    { assignee: "alice" },
    { $or: [{ priority: 3 }, { priority: 2 }] },
  ],
});
```

### Sorting Results

```typescript
// Sort by single field
const tasks = await Task.query(
  { completed: false },
  { sort: { priority: -1 } }  // -1 = descending, 1 = ascending
);

// Sort by multiple fields
const tasks = await Task.query(
  {},
  { sort: { priority: -1, createdAt: 1 } }
);
```

### Pagination

```typescript
// Get first page
const firstPage = await Task.query(
  { completed: false },
  { limit: 20, sort: { createdAt: -1 } }
);

console.log("Tasks:", firstPage.data);
console.log("Has more:", firstPage.hasMore);

// Get next page
if (firstPage.nextCursor) {
  const secondPage = await Task.query(
    { completed: false },
    { 
      limit: 20, 
      sort: { createdAt: -1 },
      uniqueStartKey: firstPage.nextCursor,
    }
  );
}
```

### Finding a Single Record

```typescript
// Find first matching record
const task = await Task.queryOne(
  { assignee: "alice", completed: false },
  { sort: { priority: -1 } }
);

if (task) {
  console.log("Highest priority task:", task.title);
}
```

### Counting Records

```typescript
const incompleteCount = await Task.count({ completed: false });
console.log(`${incompleteCount} tasks remaining`);
```

### Getting All Records

```typescript
// Get all tasks (use sparingly for large datasets)
const allTasks = await Task.findAll();
```

## Updating Records

### Update and Save

```typescript
const task = await Task.find("task-id");

if (task) {
  task.completed = true;
  task.completedAt = new Date().toISOString();
  await task.save();
}
```

### Upsert (Create or Update)

Create a record if it doesn't exist, or update it if it does:

```typescript
// Upsert by unique constraint
const user = await User.upsertByUnique(
  "unique_email",           // Constraint name
  "alice@example.com",      // Lookup value
  { name: "Alice Smith" },  // Data to set/update
  { targetDocument: documentId }
);
```

## Deleting Records

```typescript
const task = await Task.find("task-id");

if (task) {
  await task.delete();
}
```

## Subscribing to Changes

Since data can change from sync (another user edited it), subscribe to model changes to keep your UI updated:

```typescript
// Subscribe to all Task changes
const unsubscribe = Task.subscribe(() => {
  console.log("Tasks changed!");
  // Re-query and update UI
});

// Clean up when done
unsubscribe();
```

### Using the Data Loader (Recommended)

In Vue components, use `useJsBaoDataLoader` for automatic subscription handling:

```typescript
import { useJsBaoDataLoader, useSingleDocumentStore } from "primitive-app";
import { Task } from "@/models/Task";
import { computed } from "vue";
import { storeToRefs } from "pinia";

const docStore = useSingleDocumentStore();
const { isReady: documentReady } = storeToRefs(docStore);

const { data, initialDataLoaded, reload } = useJsBaoDataLoader({
  subscribeTo: [Task],  // Auto-reload when Task data changes
  documentReady,
  loadData: async () => {
    const result = await Task.query({ completed: false });
    return { tasks: result.data as Task[] };
  },
});

const tasks = computed(() => data.value?.tasks ?? []);
```

In your template, use `PrimitiveSkeletonGate` to show loading state:

```vue
<template>
  <PrimitiveSkeletonGate :is-ready="initialDataLoaded">
    <template #skeleton>
      <div>Loading tasks...</div>
    </template>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }}
      </li>
    </ul>
  </PrimitiveSkeletonGate>
</template>
```

## Querying Across Documents

By default, queries run across **all open documents**. This is usually what you want:

```typescript
// Finds tasks in all open documents
const allTasks = await Task.query({ completed: false });
```

To query specific documents:

```typescript
// Query only one document
const projectTasks = await Task.query(
  { completed: false },
  { documents: "project-doc-id" }
);

// Query multiple specific documents
const selectedTasks = await Task.query(
  { completed: false },
  { documents: ["doc-1", "doc-2"] }
);
```

## Working with StringSets

StringSets are perfect for tags, categories, or any collection of strings:

```typescript
const articleSchema = defineModelSchema({
  name: "articles",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string" },
    tags: { type: "stringset", maxCount: 10 },
  },
});
```

Using StringSets:

```typescript
const article = new Article({ title: "Getting Started" });

// Add tags
article.tags.add("tutorial");
article.tags.add("beginner");

// Check membership
if (article.tags.has("tutorial")) {
  console.log("This is a tutorial");
}

// Remove tags
article.tags.remove("beginner");

// Get all tags as array
const tagList = article.tags.toArray();

// Get size
console.log(`${article.tags.size} tags`);

await article.save({ targetDocument: documentId });
```

Querying StringSets:

```typescript
// Find articles with a specific tag
const tutorials = await Article.query({
  tags: { $contains: "tutorial" },
});

// Find articles with any of these tags
const results = await Article.query({
  tags: { $containsAny: ["javascript", "typescript"] },
});

// Find articles with all of these tags
const advanced = await Article.query({
  tags: { $containsAll: ["tutorial", "advanced"] },
});
```

## Working with Dates

Date fields are stored as ISO-8601 strings:

```typescript
// Setting dates
task.dueDate = new Date().toISOString();
task.dueDate = "2024-12-31T23:59:59.000Z";

// Reading dates (returns string)
const dueDateString = task.dueDate;
const dueDateObj = new Date(task.dueDate);

// Querying dates
const overdue = await Task.query({
  dueDate: { $lt: new Date() },
  completed: false,
});

const thisMonth = await Task.query({
  dueDate: {
    $gte: new Date("2024-01-01"),
    $lt: new Date("2024-02-01"),
  },
});
```

## Aggregations

Perform calculations across your data:

```typescript
// Count by category
const categoryCounts = await Task.aggregate({
  groupBy: ["category"],
  operations: [{ type: "count" }],
});
// Result: { "work": 15, "personal": 8, "shopping": 3 }

// Statistics
const stats = await Task.aggregate({
  groupBy: ["category"],
  operations: [
    { type: "count" },
    { type: "avg", field: "priority" },
    { type: "sum", field: "estimatedHours" },
  ],
});
```

## Next Steps

- **[Other Services](./other-services.md)** — Blob storage, AI, and integrations
- **[Is Primitive Right for You?](./good-and-bad-apps.md)** — Understand ideal use cases

