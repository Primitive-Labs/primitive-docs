**js-bao**

***

# js-bao

A lightweight, reactive ODM (Object-Document Mapper) built on top of [Yjs](https://github.com/yjs/yjs) for collaborative, offline-first applications. It allows you to define data models, persist them in Yjs shared types, and query them using a modern document-style API through pluggable database engines like SQL.js.

## Features

- **Schema-First Models**: Define your data schema with `defineModelSchema`
  and attach it to plain `BaseModel` subclasses (via `attachAndRegisterModel`)
  for a single source of truth and native property accessors.
- **Yjs Integration**: Data is stored in Yjs `Y.Map`s, enabling real-time collaboration and automatic data synchronization.
- **Multi-Document Support**: Connect and manage multiple Y.Doc instances with flexible document permissions.
- **Document-Style Queries**: Modern, MongoDB-like query API with filtering, projection, and aggregation.
- **Cursor-Based Pagination**: Efficient pagination with forward/backward navigation and stable cursors.
- **Advanced Aggregation**: Group, count, sum, average, and perform statistical operations on your data.
- **StringSet Support**: Special field type for tag-like data with efficient membership queries and faceting.
- **Pluggable Database Engines**:
  - Currently supports **SQL.js** (SQLite compiled to WebAssembly).
- **Transactional Operations**: Ensures atomicity for database modifications.
- **TypeScript First**: Written in TypeScript with strong type safety.
- **Multi-platform**: Supports both browser and Node.js environments
- **Type-safe**: Full TypeScript support (constructor + instance attrs inferred)
- **Proxy-free runtime**: Native getters/setters wired per schema field

## Installation

```bash
npm install js-bao yjs
# or
yarn add js-bao yjs
# or
pnpm add js-bao yjs

# For SQL.js engine:
npm install sql.js
```

### Optional Dependencies

For Node.js environments, you can install native database engines:

```bash
# For SQLite support in Node.js
npm install better-sqlite3
```

## Platform Support

### Browser

- **SQL.js (SQLite WASM)**: In-memory SQLite database

### Node.js

- **better-sqlite3**: Native SQLite with file system support
- **SQL.js**: SQLite WASM (fallback option)

## Core Concepts

- **Models**: Plain classes that extend `BaseModel`, defined alongside a
  `defineModelSchema` object. `attachAndRegisterModel` wires the schema and
  registers the class (e.g., `User`, `Product`).
- **Fields**: Properties declared inside `defineModelSchema` with full metadata (`type`, `default`, `indexed`, etc.).
- **Database Engines**: In-memory databases (like SQL.js) that mirror the data from Yjs for querying.
- **Document Queries**: MongoDB-style queries using filters, projections, and aggregations instead of SQL.
- **Multi-Document Management**: Connect and manage multiple Y.Doc instances with read/read-write permissions.
- **`initJsBao`**: The main function to set up the library and initialize the database engine and models.

## Defining Models (Schema-First, No Decorators)

Each model file keeps the schema, class, and registration together:

```ts
import {
  BaseModel,
  defineModelSchema,
  attachAndRegisterModel,
  InferAttrs,
} from "js-bao";

const statementSchema = defineModelSchema({
  name: "statements",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    accountName: { type: "string", indexed: true, default: "" },
    currency: { type: "string", default: "USD" },
    startDate: { type: "string", indexed: true },
    endDate: { type: "string", indexed: true },
    endingValue: { type: "number", indexed: true, default: 0 },
    holdingsIncluded: { type: "boolean", default: false },
  },
  options: {
    uniqueConstraints: [
      {
        name: "statement_period_per_account",
        fields: ["accountName", "startDate", "endDate"],
      },
    ],
  },
});

export type StatementAttrs = InferAttrs<typeof statementSchema>;
export interface Statement extends StatementAttrs, BaseModel {}

export class Statement extends BaseModel {
  get durationDays() {
    return (
      (Date.parse(this.endDate ?? "") - Date.parse(this.startDate ?? "")) /
      (1000 * 60 * 60 * 24)
    );
  }

  static async findByAccount(accountName: string) {
    return Statement.queryOne({ accountName });
  }
}

attachAndRegisterModel(Statement, statementSchema);
```

- `defineModelSchema` is the single source of truth for fields/indexing/defaults.
- `InferAttrs<typeof statementSchema>` produces constructor/instance typings automatically.
- `attachAndRegisterModel` sets `modelName`, wires property accessors, and registers
  the class with `ModelRegistry`.
- Property access uses native getters/setters installed per schema field—no proxies required.

> Migrating legacy models? See
> [`docs/model-migration-guide.md`](_media/model-migration-guide.md) and
> [`docs/model-autogen-plan.md`](_media/model-autogen-plan.md) for step-by-step
> guidance.

### Codegen Workflow

`js-bao-codegen` keeps model files consistent by owning two firecracker-marked
sections in every file:

- **🔥🔥 BEGIN/END AUTO HEADER 🔥🔥** – imports `InferAttrs`, emits the
  `export type …Attrs`/`export interface …` declarations, and adds lint pragmas.
- **🔥🔥 BEGIN/END AUTO FOOTER 🔥🔥** – imports `./generated/<Model>.relationships.d`
  and calls `attachAndRegisterModel`.

Everything between those markers (schema + class body) remains developer-owned.
To regenerate the header/footer blocks _and_ the per-model relationship d.ts files:

```bash
# From the library workspace
npm run build:cli      # compiles the CLI once
npm run codegen        # or: npx js-bao-codegen --config js-bao.config.cjs

# From a consuming app (e.g., demos/test-app)
npm run codegen        # points to ../../dist/codegen.cjs in this repo
```

Projects typically wire codegen into `postinstall`/`build` scripts so that
models stay in sync automatically (see `demos/test-app/package.json`).

### Runtime / Programmatic Models

For dynamic scenarios (Scenario 16, plugin systems, etc.) you can define
runtime models entirely in code:

```ts
import {
  BaseModel,
  defineModelSchema,
  attachSchemaToClass,
  autoRegisterModel,
} from "js-bao";

const runtimeItemSchema = defineModelSchema({
  name: "runtime_items",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string", indexed: true },
    quantity: { type: "number" },
  },
});

class RuntimeItem extends BaseModel {}

const runtimeShape = attachSchemaToClass(RuntimeItem, runtimeItemSchema);
autoRegisterModel(RuntimeItem, runtimeShape);

const item = new RuntimeItem({ name: "Dynamic", quantity: 5 });
await item.save({ targetDocument: "doc-123" });
```

`attachSchemaToClass` + `autoRegisterModel` remain available when you need to
control registration (e.g., multiple registries, conditionally skipping
registration). For typical model files, stick with the single-call
`attachAndRegisterModel`.

## Setup & Initialization

### Multi-Document Approach

js-bao now uses a multi-document approach, providing better flexibility for complex applications that need to work with multiple Y.Doc instances.

```typescript
// src/store/doc.ts (or your Yjs setup file)
import * as Y from "yjs";
export const doc = new Y.Doc();

// Example: src/store/StoreContext.tsx (for React)
import React, { createContext, useContext, useEffect, useState } from "react";
import { initJsBao, DatabaseConfig, DatabaseEngine } from "js-bao";
import { doc } from "../store/doc"; // Your Y.Doc instance

// --- Import your defined models (after defining them as shown below) ---
// import { Statement } from '../models/Statement';
// import { Account } from '../models/Account';

interface StoreContextType {
  db: DatabaseEngine | null;
  isReady: boolean;
  error?: Error;
  // Multi-document functions
  connectDocument:
    | ((
        docId: string,
        yDoc: any,
        permission: "read" | "read-write"
      ) => Promise<void>)
    | null;
  disconnectDocument: ((docId: string) => Promise<void>) | null;
  getConnectedDocuments: (() => Map<string, any>) | null;
  isDocumentConnected: ((docId: string) => boolean) | null;
  // Helper for the main document
  mainDocumentId: string;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreContextType>({
    db: null,
    isReady: false,
    connectDocument: null,
    disconnectDocument: null,
    getConnectedDocuments: null,
    isDocumentConnected: null,
    mainDocumentId: "main-document", // Default document ID
  });

  useEffect(() => {
    async function setupJsBao() {
      try {
        // 1. Define Database Configuration
        const dbConfig: DatabaseConfig = {
          type: "sqljs",
          options: {
            // --- SQL.js specific options ---
            // wasmURL: '/sql-wasm.wasm', // If not at default /sql-wasm.wasm
          },
        };

        // 2. Initialize the ODM (no yDoc parameter in new API!)
        const {
          dbEngine,
          connectDocument,
          disconnectDocument,
          getConnectedDocuments,
          isDocumentConnected,
          // Default doc mapping APIs also available:
          addDocumentModelMapping,
          removeDocumentModelMapping,
          clearDocumentModelMappings,
          setDefaultDocumentId,
          clearDefaultDocumentId,
          getDocumentModelMapping,
          getDocumentIdForModel,
          getDefaultDocumentId,
        } = await initJsBao({
          databaseConfig: dbConfig,
          // models: [Statement, Account] // Optional: if models are not auto-detected
        });

        // 3. Connect your main document
        const mainDocumentId = "main-document";
        await connectDocument(mainDocumentId, doc, "read-write");

        setState({
          db: dbEngine,
          isReady: true,
          connectDocument,
          disconnectDocument,
          getConnectedDocuments,
          isDocumentConnected,
          mainDocumentId,
        });
      } catch (error) {
        console.error("Error initializing js-bao:", error);
        setState({
          db: null,
          isReady: false,
          error: error as Error,
          connectDocument: null,
          disconnectDocument: null,
          getConnectedDocuments: null,
          isDocumentConnected: null,
          mainDocumentId: "main-document",
        });
      }
    }
    setupJsBao();
  }, []);

  if (state.error) {
    return <div>Error loading store: {state.error.message}</div>;
  }
  if (!state.isReady || !state.db) {
    return <div>Loading js-bao...</div>;
  }
  return (
    <StoreContext.Provider value={state as StoreContextType}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context || !context.db) {
    throw new Error(
      "useStore must be used within a StoreProvider, and js-bao must be initialized."
    );
  }
  return context;
}

// Helper hook for easier document operations
export function useDocumentOperations() {
  const { mainDocumentId } = useStore();

  const saveToMainDocument = async (model: any) => {
    return await model.save({ targetDocument: mainDocumentId });
  };

  const upsertInMainDocument = async (
    ModelClass: any,
    constraintName: string,
    lookupValue: any,
    data: any
  ) => {
    return await ModelClass.upsertByUnique(constraintName, lookupValue, data, {
      targetDocument: mainDocumentId,
    });
  };

  return {
    saveToMainDocument,
    upsertInMainDocument,
    mainDocumentId,
  };
}
```

## Defining Models

Create a schema + class pair for each model (usually in `src/models`). The
schema is the single source of truth; the class adds business logic.

```ts
// src/models/Product.ts
import { BaseModel, defineModelSchema, attachAndRegisterModel } from "js-bao";
import type { InferAttrs } from "js-bao";

const productSchema = defineModelSchema({
  name: "products",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string", indexed: true },
    sku: { type: "string", indexed: true, default: "" },
    price: { type: "number", default: 0 },
    category: { type: "string", default: "" },
    inStock: { type: "boolean", default: true },
  },
});

export type ProductAttrs = InferAttrs<typeof productSchema>;
export interface Product extends ProductAttrs, BaseModel {}

export class Product extends BaseModel {
  constructor(data?: Partial<Product>) {
    super(data ?? {});
    if (!this.sku) {
      this.sku = crypto.randomUUID();
    }
  }

  get isPremium() {
    return this.price > 1000;
  }

  static async findBySku(sku: string) {
    return Product.queryOne({ sku });
  }
}

attachAndRegisterModel(Product, productSchema);
```

**Constructor notes:**

- `defineModelSchema` handles defaults, indexing, and inference. Only add
  constructor logic for custom behaviors (e.g., generating a SKU) before or
  after calling `super()`.
- `attachAndRegisterModel` mutates the class by setting `modelName`, wiring
  field accessors, and registering it with `ModelRegistry`—no proxies required.

## Using Models

Once initialized, you can interact with your models using the modern document-style API. **Note**: With the multi-document API, saving new records requires specifying a `targetDocument`.

```typescript
import { Product } from "./models/Product";
import { useDocumentOperations } from "./store/StoreContext"; // If using React

async function main() {
  // Wait for js-bao initialization if not using a context/provider

  // Create a new product
  const newProduct = new Product({
    name: "Laptop Pro",
    price: 1200.99,
    category: "Electronics",
  });

  // NEW API: Must specify targetDocument for new records
  await newProduct.save({ targetDocument: "main-document" });
  console.log("Saved Product:", newProduct.id);

  // Find a product by ID
  const foundProduct = await Product.find(newProduct.id);
  if (foundProduct) {
    console.log("Found Product:", foundProduct.name);
  }

  // Document-style queries with filters (searches across ALL connected documents)
  const expensiveProducts = await Product.query({ price: { $gt: 1000 } });
  console.log("Expensive Products:", expensiveProducts.data.length);

  // Query with projection (only return specific fields)
  const productSummary = await Product.query(
    { category: "Electronics" },
    { projection: { name: 1, price: 1 } }
  );
  console.log("Product summaries:", productSummary.data);

  // Restrict queries to one or more documents
  const mainDocProducts = await Product.query(
    {},
    { documents: "main-document" }
  );
  console.log("Products in main document:", mainDocProducts.data.length);

  const activeDocCount = await Product.count(
    {},
    { documents: ["main-document", "archive-doc"] }
  );
  console.log("Products in main/archived documents:", activeDocCount);

  // Pagination with cursor-based navigation
  const firstPage = await Product.query({}, { limit: 10, sort: { price: -1 } });
  console.log("First page:", firstPage.data.length);
  console.log("Has more:", firstPage.hasMore);

  if (firstPage.nextCursor) {
    const secondPage = await Product.query(
      {},
      {
        limit: 10,
        sort: { price: -1 },
        uniqueStartKey: firstPage.nextCursor,
      }
    );
    console.log("Second page:", secondPage.data.length);
  }

  // Count documents
  const totalProducts = await Product.count({ category: "Electronics" });
  console.log("Total electronics:", totalProducts);

  // Find single document
  const cheapestLaptop = await Product.queryOne(
    { category: "Electronics", name: { $containsText: "Laptop" } },
    { sort: { price: 1 } }
  );

  // Update a product (existing records don't need targetDocument unless moving to different doc)
  if (foundProduct) {
    foundProduct.price = 1150.0;
    foundProduct.inStock = false;
    await foundProduct.save(); // No targetDocument needed for existing records
    console.log(
      "Updated Product Price:",
      (await Product.find(newProduct.id))?.price
    );
  }

  // Upsert operation with new API
  const upsertedProduct = await Product.upsertByUnique(
    "name",
    "Laptop Pro",
    { price: 1100.0, category: "Electronics" },
    { targetDocument: "main-document" } // Required for new records
  );

  // Subscribe to changes for all Products
  const unsubscribe = Product.subscribe(() => {
    console.log("Product data changed!");
    Product.findAll().then((allProducts) => {
      console.log("Current products count:", allProducts.length);
    });
  });
  // Call unsubscribe() when done listening

  // Delete a product
  // await foundProduct?.delete();
}

main();
```

Pass a `documents` option (string or array of IDs) to scope `query`, `queryOne`, and `count` calls to specific connected documents when you do not want the default cross-document behaviour.

## Date Fields

js-bao supports a `date` field type. Because Yjs serializes nested data with `JSON.stringify`, date values end up stored as ISO-8601 strings inside the model’s backing `Y.Map`. Reading the field returns that string—wrap it with `new Date(...)` if you need native date helpers. Query filters accept either `Date` instances or any string that `Date.parse` can understand.

### Defining and saving date fields

```typescript
import { BaseModel, defineModelSchema, attachAndRegisterModel } from "js-bao";

const postSchema = defineModelSchema({
  name: "posts",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string" },
    publishedAt: { type: "date" },
  },
});

export class Post extends BaseModel {
  get publishedAtDate(): Date | undefined {
    return this.publishedAt ? new Date(this.publishedAt) : undefined;
  }

  set publishedAtDate(value: Date | undefined) {
    this.publishedAt = value ? value.toISOString() : undefined;
  }
}

attachAndRegisterModel(Post, postSchema);

const post = new Post({
  title: "Working with js-bao dates",
  publishedAt: new Date().toISOString(),
});

await post.save({ targetDocument: "main-document" });
console.log("Saved post:", post.id);
```

### Loading and querying by dates

```typescript
const loaded = await Post.find(post.id);
if (loaded?.publishedAt) {
  const published = new Date(loaded.publishedAt);
  console.log("Published at:", published.toLocaleString());
}

// Queries accept Date objects or ISO strings
const recentPosts = await Post.query({
  publishedAt: { $gte: new Date("2024-01-01") },
});

// Sorting by date uses the stored ISO strings
const ordered = await Post.query({}, { sort: { publishedAt: -1 } });
```

### Working with Multiple Documents

The new multi-document API shines when you need to work with multiple documents:

```typescript
function useMultiDocumentOperations() {
  const { connectDocument, disconnectDocument, isDocumentConnected } =
    useStore();

  const handleConnectUserDocument = async (userId: string, userDoc: Y.Doc) => {
    const docId = `user-${userId}`;

    if (!isDocumentConnected(docId)) {
      await connectDocument(docId, userDoc, "read-write");
      console.log(`Connected document for user ${userId}`);
    }
  };

  const handleSaveToUserDocument = async (userId: string, product: Product) => {
    const docId = `user-${userId}`;

    if (isDocumentConnected(docId)) {
      await product.save({ targetDocument: docId });
    } else {
      throw new Error(`Document for user ${userId} is not connected`);
    }
  };

  const handleDisconnectUserDocument = async (userId: string) => {
    const docId = `user-${userId}`;
    await disconnectDocument(docId);
    console.log(`Disconnected document for user ${userId}`);
  };

  return {
    handleConnectUserDocument,
    handleSaveToUserDocument,
    handleDisconnectUserDocument,
  };
}
```

## Migration from Single-Document API

If you're upgrading from an earlier version of js-bao that used the single-document approach, here are the key changes:

### Old API vs New API

```typescript
// ❌ Old single-document approach
const { dbEngine } = await initJsBao({
  yDoc: doc, // Single document passed directly
  databaseConfig: dbConfig,
  models: [Statement, Account],
});

// ✅ New multi-document approach
const {
  dbEngine,
  connectDocument,
  disconnectDocument,
  getConnectedDocuments,
  isDocumentConnected,
  // New client-level defaults API
  addDocumentModelMapping,
  removeDocumentModelMapping,
  clearDocumentModelMappings,
  setDefaultDocumentId,
  clearDefaultDocumentId,
  getDocumentModelMapping,
  getDocumentIdForModel,
  getDefaultDocumentId,
} = await initJsBao({
  databaseConfig: dbConfig, // No yDoc parameter!
  models: [Statement, Account],
});

// Connect documents explicitly
await connectDocument("main-doc", doc, "read-write");
```

### Model Operations Changes

```typescript
// ❌ Old way - automatic document targeting
const product = new Product({ name: "Item", price: 100 });
await product.save(); // Automatically saved to the single document

// ✅ New way - explicit document targeting for new records (or use defaults mapping)
const product = new Product({ name: "Item", price: 100 });
// Option A: supply explicit target
await product.save({ targetDocument: "main-document" });
// Option B: rely on defaults (see below)

// ❌ Old way - upsert without document specification
const account = await Account.upsertByUnique("email", "user@example.com", {
  name: "John Doe",
});

// ✅ New way - upsert requires targetDocument for new records
const account = await Account.upsertByUnique(
  "email",
  "user@example.com",
  { name: "John Doe" },
  { targetDocument: "main-document" }
);
```

### Default Document ID Mapping

You can set default document ids so new instances can `save()` without specifying a `targetDocument`:

```typescript
const {
  connectDocument,
  addDocumentModelMapping,
  setDefaultDocumentId,
  onDefaultDocChanged,
  onModelDocMappingChanged,
} = await initJsBao({ databaseConfig: dbConfig, models: [Product] });

await connectDocument("main-doc", doc, "read-write");
await connectDocument("archive-doc", new Y.Doc(), "read-write");

// Global default (used when no model-specific mapping exists)
setDefaultDocumentId("main-doc");

// Model-specific default overrides global
addDocumentModelMapping("products", "archive-doc");

// Events
const off1 = onDefaultDocChanged(({ previous, current }) => {
  console.log("Default doc changed:", previous, "->", current);
});
const off2 = onModelDocMappingChanged(({ modelName, previous, current }) => {
  console.log(`Mapping for ${modelName}:`, previous, "->", current);
});

const p = new Product({ name: "Mapped Save" });
await p.save(); // Saves to "archive-doc" via model mapping

off1();
off2();
```

Precedence (highest to lowest):

- Explicit `save({ targetDocument })`
- Instance remembered document (when loaded from a doc)
- Model-specific default document mapping
- Global default document id

Closed document behavior:

- If the resolved `docId` is closed, `save()` throws `ERR_DOC_CLOSED` and will not fall back.
- If nothing resolves, `save()` throws `ERR_DOC_UNRESOLVED`.

Mappings/defaults are cleared on `disconnectDocument(docId)` and are not automatically restored upon reconnect.

### Benefits of the New Multi-Document API

1. **Multiple Data Contexts**: Work with separate documents for different users, projects, or data sets
2. **Dynamic Document Management**: Connect and disconnect documents as needed
3. **Permission Control**: Specify read-only or read-write access per document
4. **Better Scalability**: Handle complex collaborative scenarios with isolated data
5. **Backward Compatible Queries**: Queries automatically search across all connected documents

For a complete migration guide, see `MIGRATION_GUIDE_SINGLE_TO_MULTIDOC.md` in the project repository.

## Query API

js-bao provides a modern, MongoDB-inspired query API for filtering, sorting, and paginating your data.

### Basic Queries

```typescript
// Find all products
const allProducts = await Product.query();

// Filter by exact match
const electronicProducts = await Product.query({
  category: "Electronics",
});

// Filter with operators
const expensiveProducts = await Product.query({
  price: { $gt: 1000 },
  inStock: true,
});

// Complex queries with multiple conditions
const results = await Product.query({
  $and: [
    { price: { $gte: 100, $lte: 500 } },
    { category: { $in: ["Electronics", "Books"] } },
  ],
});
```

### Supported Query Operators

- **Comparison**: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
- **Array/Set**: `$in`, `$nin`
- **Logical**: `$and`, `$or`, `$not`
- **Text**: `$startsWith`, `$endsWith`, `$containsText` (case-insensitive by default)
- **Existence**: `$exists`

### Sorting and Pagination

```typescript
// Sort by price (descending)
const sortedProducts = await Product.query({}, { sort: { price: -1 } });

// Paginated results with cursor-based navigation
const firstPage = await Product.query(
  { category: "Electronics" },
  {
    limit: 20,
    sort: { createdAt: -1 },
  }
);

console.log("Results:", firstPage.data);
console.log("Has more:", firstPage.hasMore);
console.log("Next cursor:", firstPage.nextCursor);

// Get next page
if (firstPage.nextCursor) {
  const nextPage = await Product.query(
    { category: "Electronics" },
    {
      limit: 20,
      sort: { createdAt: -1 },
      uniqueStartKey: firstPage.nextCursor,
    }
  );
}

// Navigate backwards
if (nextPage.prevCursor) {
  const prevPage = await Product.query(
    { category: "Electronics" },
    {
      limit: 20,
      sort: { createdAt: -1 },
      uniqueStartKey: nextPage.prevCursor,
      direction: -1, // Go backwards
    }
  );
}
```

### Projections

Control which fields are returned to optimize performance:

```typescript
// Only return name and price fields
const productSummary = await Product.query(
  { inStock: true },
  {
    projection: { name: 1, price: 1 },
  }
);

// Returns: [{ id: "...", name: "...", price: ... }, ...]
```

### Single Document Queries

```typescript
// Find one document matching criteria
const featuredProduct = await Product.queryOne({
  featured: true,
  inStock: true,
});

// Count documents
const electronicsCount = await Product.count({
  category: "Electronics",
});
```

## Aggregation API

Perform complex data analysis with grouping, statistical operations, and faceting.

### Basic Aggregation

```typescript
// Count products by category
const categoryCounts = await Product.aggregate({
  groupBy: ["category"],
  operations: [{ type: "count" }],
});
// Result: { "Electronics": 25, "Books": 18, "Clothing": 12 }

// Multiple statistical operations
const categoryStats = await Product.aggregate({
  groupBy: ["category"],
  operations: [
    { type: "count" },
    { type: "avg", field: "price" },
    { type: "sum", field: "price" },
    { type: "min", field: "price" },
    { type: "max", field: "price" },
  ],
});
// Result: {
//   "Electronics": {
//     count: 25,
//     avg_price: 299.99,
//     sum_price: 7499.75,
//     min_price: 29.99,
//     max_price: 1299.99
//   },
//   ...
// }
```

### Multi-Dimensional Grouping

```typescript
// Group by multiple fields
const salesData = await Product.aggregate({
  groupBy: ["category", "brand"],
  operations: [{ type: "count" }, { type: "sum", field: "revenue" }],
});
// Result: {
//   "Electronics": {
//     "Apple": { count: 12, sum_revenue: 15000 },
//     "Samsung": { count: 8, sum_revenue: 9500 }
//   },
//   "Books": {
//     "Penguin": { count: 25, sum_revenue: 450 }
//   }
// }
```

### StringSet Aggregation

For StringSet fields (like tags), js-bao provides special aggregation capabilities:

```typescript
import {
  BaseModel,
  defineModelSchema,
  attachAndRegisterModel,
  StringSet,
} from "js-bao";

const articleSchema = defineModelSchema({
  name: "articles",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string" },
    tags: { type: "stringset" },
  },
});

class Article extends BaseModel {}

attachAndRegisterModel(Article, articleSchema);

// Tag facet counts (how many articles have each tag)
const tagCounts = await Article.aggregate({
  groupBy: ["tags"], // StringSet faceting
  operations: [{ type: "count" }],
});
// Result: { "javascript": 45, "react": 32, "tutorial": 28 }

// Membership-based grouping (articles that have specific tag vs don't)
const urgentCounts = await Article.aggregate({
  groupBy: [{ field: "tags", contains: "urgent" }],
  operations: [{ type: "count" }],
});
// Result: { "true": 5, "false": 120 }

// Complex aggregation with filtering and sorting
const topTags = await Article.aggregate({
  groupBy: ["tags"],
  operations: [{ type: "count" }],
  filter: { publishedAt: { $gte: "2024-01-01" } },
  sort: { field: "count", direction: -1 },
  limit: 10,
});
```

### Aggregation Options

```typescript
interface AggregationOptions {
  groupBy: (string | { field: string; contains: string })[];
  operations: {
    type: "count" | "sum" | "avg" | "min" | "max";
    field?: string; // Required for sum, avg, min, max
  }[];
  filter?: DocumentFilter; // Filter documents before aggregation
  limit?: number; // Limit number of groups returned
  sort?: {
    // Sort aggregation results
    field: string; // Field name or operation result
    direction: 1 | -1; // 1 for ascending, -1 for descending
  };
}
```

## StringSet Fields

StringSet is a special field type optimized for tag-like data, providing efficient membership queries and faceting capabilities.

### Defining StringSet Fields

```typescript
import {
  BaseModel,
  StringSet,
  defineModelSchema,
  attachAndRegisterModel,
} from "js-bao";

const articleSchema = defineModelSchema({
  name: "articles",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string" },
    tags: {
      type: "stringset",
      maxCount: 10,
      maxLength: 50,
    },
  },
});

class Article extends BaseModel {}

attachAndRegisterModel(Article, articleSchema);
```

### Working with StringSets

```typescript
const article = new Article({ title: "Getting Started with js-bao" });

// Add tags
article.tags.add("javascript");
article.tags.add("tutorial");
article.tags.add("yjs");

// Check membership
if (article.tags.has("tutorial")) {
  console.log("This is a tutorial");
}

// Remove tags
article.tags.remove("draft");

// Clear all tags
article.tags.clear();

// Iterate over tags
for (const tag of article.tags) {
  console.log(tag);
}

// Get size
console.log(`Article has ${article.tags.size} tags`);

// Convert to array
const tagArray = article.tags.toArray();

await article.save({ targetDocument: "main-document" });
```

### Querying StringSets

```typescript
// Find articles with specific tag
const tutorials = await Article.query({
  tags: { $contains: "tutorial" },
});

// Find articles with any of multiple tags (OR)
const techArticles = await Article.query({
  $or: [
    { tags: { $contains: "javascript" } },
    { tags: { $contains: "python" } },
    { tags: { $contains: "react" } },
  ],
});

// Find articles that have multiple required tags (AND)
const advancedTutorials = await Article.query({
  $and: [
    { tags: { $contains: "tutorial" } },
    { tags: { $contains: "advanced" } },
  ],
});

// Nested AND/OR over StringSets: "javascript" AND ("react" OR "vue" OR "node.js")
const jsFrameworkArticles = await Article.query({
  $and: [
    { tags: { $contains: "javascript" } },
    {
      $or: [
        { tags: { $contains: "react" } },
        { tags: { $contains: "vue" } },
        { tags: { $contains: "node.js" } },
      ],
    },
  ],
});

// Count by tag membership
const tagStats = await Article.aggregate({
  groupBy: [{ field: "tags", contains: "tutorial" }],
  operations: [{ type: "count" }],
});
// Result: { "true": 25, "false": 75 }
```

## Database Engine Specifics

### SQL.js (`type: 'sqljs'`)

- **WASM File**: `sql-wasm.wasm` (from the `sql.js` package) must be publicly accessible in your application.
  - By default, the library expects it at `/sql-wasm.wasm` (root of your public server path).
  - **Vite/Create React App**: Place `sql-wasm.wasm` in your project's `public` directory.
  - **Custom Path**: If the WASM file is located elsewhere, configure it in `DatabaseConfig`:
    ```typescript
    const dbConfig: DatabaseConfig = {
      type: "sqljs",
      options: {
        wasmURL: "/path/to/your/sql-wasm.wasm",
        // or use locateFile for more complex scenarios:
        // locateFile: (file) => `/assets/wasm/${file}`
      },
    };
    ```

## Building the Library (for Contributors)

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Build: `npm run build` (uses `tsup`)
    - Development watch mode: `npm run dev`

## Publishing to npm

To publish a new version to npm:

1. Update the version in `package.json`
2. Run `npm publish`

The `prepublishOnly` script automatically runs the build before publishing.

## License

This library is licensed under the ISC License. (Assuming ISC from your package.json, you might want to add a LICENSE file).

## Quick Start

### Browser Usage

```typescript
import {
  initJsBao,
  BaseModel,
  defineModelSchema,
  attachAndRegisterModel,
} from "js-bao";
import * as Y from "yjs";

const userSchema = defineModelSchema({
  name: "users",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string" },
    email: { type: "string" },
  },
});

class User extends BaseModel {}

attachAndRegisterModel(User, userSchema);

const doc = new Y.Doc();
const { dbEngine, connectDocument } = await initJsBao({
  databaseConfig: {
    type: "sqljs",
    options: {},
  },
  models: [User],
});

// Connect the document
await connectDocument("main-doc", doc, "read-write");

// Create and save a user
const user = new User({ name: "John Doe", email: "john@example.com" });
await user.save({ targetDocument: "main-doc" });

// Query users
const users = await User.query({ name: { $containsText: "John" } });
console.log("Found users:", users.data);
```

### Node.js Usage

```typescript
import {
  initJsBao,
  BaseModel,
  defineModelSchema,
  attachAndRegisterModel,
  getRecommendedNodeEngine,
} from "js-bao/node";
import * as Y from "yjs";

const userSchema = defineModelSchema({
  name: "users",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string" },
    email: { type: "string" },
  },
});

class User extends BaseModel {}

attachAndRegisterModel(User, userSchema);

const doc = new Y.Doc();
const engineType = await getRecommendedNodeEngine();

const { connectDocument } = await initJsBao({
  databaseConfig: {
    type: engineType,
    options: { filePath: ":memory:" },
  },
  models: [User],
});

await connectDocument("main-doc", doc, "read-write");

const user = new User({ name: "John Doe", email: "john@example.com" });
await user.save({ targetDocument: "main-doc" });
```

## Database Configuration

### SQLite (Node.js)

```javascript
{
  type: 'node-sqlite',
  options: {
    filePath: ':memory:' // or '/path/to/database.db'
  }
}
```

### SQL.js (Browser/Node.js)

```javascript
{
  type: 'sqljs',
  options: {
    // Browser: automatically loads WASM
    // Node.js: fallback option
  }
}
```

## Engine Detection

Check available engines in your environment:

```javascript
import { DatabaseFactory } from "js-bao/node"; // or 'js-bao' for browser

const engines = await DatabaseFactory.getAvailableEngines();
engines.forEach((engine) => {
  console.log(
    `${engine.type}: ${engine.available ? "✅" : "❌"} ${engine.reason || ""}`
  );
});
```

## Debug Inspector

Run the bundled Y.Doc debugger to inspect saved updates or dump JSONs:

1. From the repo root, serve static files so `dist/` is reachable (e.g., `python -m http.server 8000` or `npx serve demos/debug-inspector`).
2. Open `http://localhost:8000/demos/debug-inspector/` (or the `index.html` in that folder) in your browser.
3. Load your model module and Y.Doc update/dump, then click **Reset & Connect** to reindex and start querying.

## Examples

See the `examples/` directory for complete working examples:

- `examples/simple-node-test.mjs` - Basic Node.js usage without models
- `examples/node-example.mjs` - Complete Node.js example with models
