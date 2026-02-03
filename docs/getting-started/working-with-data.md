# Working with Data

This guide covers how to define data models and perform create, read, update, and delete operations in your Primitive app. By the end, you'll understand how to model your app's data and work with it effectively.

::: tip Framework Agnostic
The js-bao library shown here is **plain JavaScript/TypeScript** and works with any framework—Vue, React, Svelte, or vanilla JS. The Vue-specific examples (like `useJsBaoDataLoader`) are helpers from our template; the core model and query APIs work everywhere.
:::

## Defining Models

Models define the shape of your data. Each model corresponds to a type of record in your app—like `Task`, `Project`, or `Contact`.

### Creating Your First Model

When creating a new js-bao model file, follow this exact workflow:

**Step 1: Create the minimal model file** with only the required sections:

```typescript
// src/models/Task.ts
import { BaseModel, defineModelSchema } from "js-bao";

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

export class Task extends BaseModel {
  static schema = taskSchema;

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
```

**Step 2: Add the model to `getJsBaoConfig`** in your config file:

```typescript
// src/config/envConfig.ts (in the models import)
import { Task } from "@/models/Task";

// Then in the allModels array or getJsBaoConfig models property
```

**Step 3: Run `pnpm codegen`** to generate the auto-generated sections:

```bash
pnpm codegen
```

This generates TypeScript types, field accessors, and other boilerplate code automatically.

**Step 4: Make any additional edits** to the schema (adding fields, constraints, etc.) and run `pnpm codegen` again.

::: warning Critical
**NEVER create or edit auto-generated sections yourself.** The codegen script maintains these code blocks. Look for comments like `// --- auto-generated ---` to identify them. If you manually edit these sections, your changes will be overwritten the next time codegen runs.
:::

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
const categorySchema = defineModelSchema({
  name: "categories",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string" },
    parentId: { type: "string" },
  },
  uniqueConstraints: [["name", "parentId"]], // name+parentId must be unique
});
```

For a single field:

```typescript
const userSchema = defineModelSchema({
  name: "users",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    email: { type: "string", indexed: true },
  },
  uniqueConstraints: [["email"]], // email must be unique
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

// Using single document store (from your local stores, included in the template)
import { useSingleDocumentStore } from "@/stores/singleDocumentStore";
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
// Upsert by unique constraint fields
// If a category with this name+parentId exists, update it; otherwise create it
await Category.upsertByUnique(
  ["name", "parentId"],           // Unique constraint fields
  { name: "Work", parentId: null }, // Match values
  { color: "blue" }               // Fields to set/update
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

### Using the Data Loader (Vue Template)

If you're using our Vue template, the `useJsBaoDataLoader` composable (included in the template) provides automatic subscription handling. It handles four key concerns:

1. **Waiting for documents to be ready** — Queries won't run until `documentReady` is true
2. **Knowing when UI is ready to render** — `initialDataLoaded` becomes true after the first successful load
3. **Subscribing to model changes** — Automatically re-runs `loadData` when subscribed models change
4. **Reactive query parameters** — Re-runs `loadData` when `queryParams` change

```typescript
// Import from your local composables (included in the template)
import { useJsBaoDataLoader } from "@/composables/useJsBaoDataLoader";
import { Task } from "@/models/Task";
import { computed, ref } from "vue";

// documentReady should be true after your document opening logic completes
const documentReady = ref(false);

const { data, initialDataLoaded, reload } = useJsBaoDataLoader<{
  tasks: Task[];
  total: number;
}>({
  subscribeTo: [Task],  // Auto-reload when Task data changes
  queryParams: computed(() => ({ showCompleted: false })), // Reactive filters
  documentReady,
  async loadData({ queryParams }) {
    const query = queryParams.showCompleted ? {} : { completed: false };
    const result = await Task.query(query, { sort: { priority: -1 } });
    return { tasks: result.data as Task[], total: result.data.length };
  },
});

const tasks = computed(() => data.value?.tasks ?? []);
```

**Best practices:**
- Use `useJsBaoDataLoader` no more than once per component
- **Return a single structured object** from `loadData`
- NEVER add a watch on `loadData` results—do processing inside `loadData`
- NEVER rely on component remounting for route param changes—include them in `queryParams`
- Use `initialDataLoaded` (not `documentReady`) with `PrimitiveLoadingGate`
- For sequences of mutations, set `pauseUpdates` while mutating, then call `reload()` afterward

In your template, use `PrimitiveLoadingGate` (included in the template) to show loading state:

```vue
<script setup>
import PrimitiveLoadingGate from "@/components/shared/PrimitiveLoadingGate.vue";
</script>

<template>
  <PrimitiveLoadingGate :is-ready="initialDataLoaded">
    <template #loading>
      <div>Loading tasks...</div>
    </template>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }}
      </li>
    </ul>
  </PrimitiveLoadingGate>
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

