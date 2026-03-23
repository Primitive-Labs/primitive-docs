# Choosing Your Data Model

Primitive offers two storage systems — **Documents** and **Databases** — each designed for different use cases. Many apps use both — documents for personal/collaborative data, databases for app-wide shared data. This guide helps you decide which to use where.

## At a Glance

| | Documents | Databases |
|---|---|---|
| **Where data lives** | Local-first, in the browser | Server-side |
| **Connectivity** | Offline access, instant local reads | Requires network connectivity |
| **Collaboration** | Real-time sync across collaborators | N/A |
| **Access model** | All-or-nothing sharing per document | Per-operation CEL access rules |
| **Schema** | Schemaless CRDT structures | Schemaless — save any JSON records |
| **Size limit** | ~10 MB per document | ~5 GB per instance |
| **Server logic** | N/A | Server-enforced triggers and computed fields |

**Use documents** when users need offline access, real-time collaboration, or all users with access see the same data. **Use databases** when different users need different views of the data, you need server-enforced rules, or datasets are large.

## When to Use Documents

Documents are local-first collaborative containers. Data lives in the browser, syncs automatically, and works offline. Choose documents when:

- **Users own the data** — Tasks, notes, projects, personal records
- **Real-time collaboration matters** — Multiple users editing shared data simultaneously with conflict-free merging
- **Offline access is important** — Users need to work without a network connection
- **Data is naturally partitioned by sharing context** — Different people have access to different data sets

Documents are the right choice for the "inner" data of most productivity and collaboration apps. Individual documents have a 10 MB data limit — for larger data sets, partition across multiple documents.

## When to Use Databases

Databases are server-side structured storage with registered operations and expression-based access control. Individual databases have a 5 GB data limit. Choose databases when:

- **Server-enforced rules are required** — Validation, computed fields, or business logic that must run server-side
- **Data is shared across all users** — Product catalogs, configuration, lookup tables, shared settings
- **You need cross-user queries** — Leaderboards, directories, marketplace listings, aggregated reports
- **Access control needs to be per-operation** — Different users can read vs. write, or can only modify their own records
- **Admin manages the content** — Content that's curated centrally, not user-generated

::: tip Partitioning Databases for Scale
A single global database works well when your data will stay under 5 GB. But if there are natural ways to partition your data — by user, organization, team, or other context — and most queries stay within a single partition, consider creating separate databases from the start. This gives you scaling benefits for free and avoids a costly migration later. For example, an app where each organization has its own project data can use a database per organization rather than one large shared database.
:::

## Using Both Together

Most non-trivial apps benefit from both systems. Here are some patterns:

### Classroom / LMS App
- **Database** for courses, assignments, and grade records (admin-managed, cross-student queries)
- **Documents** for student submissions and collaborative group work (student-owned, real-time collaboration)

### E-Commerce / Marketplace
- **Database** for product catalog, orders, and inventory (server-enforced stock management, cross-user queries)
- **Documents** for shopping carts, wishlists, and saved preferences (user-owned, offline-capable)

### Team Workspace
- **Database** for organization settings, role definitions, and shared configuration (admin-controlled)
- **Documents** for project data, notes, and collaborative content (team-owned, real-time sync)

### Chat / Messaging
- **Documents** for message history within channels (real-time sync, per-channel sharing)
- **Database** for channel directory, user profiles, and cross-channel search indexes (cross-user queries)

### Multi-Tenant SaaS
- **Database** for tenant configuration, billing state, and feature flags (server-enforced invariants)
- **Documents** for per-tenant collaborative workspaces (tenant-scoped, real-time collaboration)

## Design Principles

1. **Start with the sharing model.** If different users need different access to different data, those boundaries often map to documents. Shared reference data goes in a database.

2. **Don't fight the grain.** If you need server-enforced validation or cross-user queries, use a database — don't try to build that on top of documents. If you need offline access and real-time collaboration, use documents — don't try to replicate that with a database.

3. **Use groups for access control.** Both documents and databases integrate with Primitive's group system. Groups let you model teams, roles, and relationships without building custom permission logic.

4. **Keep documents focused.** A document works best under ~10MB. If data grows large, split across multiple documents by natural boundaries (per-project, per-channel, per-time-period).

## Common Mistakes

| Mistake | Why It's a Problem | Better Approach |
|---|---|---|
| Storing admin-managed content in documents | No server-side enforcement; any editor can change anything | Use a database with CEL access expressions |
| Building cross-user queries on documents | Documents are isolated per user/sharing group — no global queries | Use a database for data that needs cross-user visibility |
| Using databases for real-time collaborative editing | Databases don't have built-in conflict resolution or offline sync | Use documents for collaborative data |
| One giant document for everything | Performance degrades past ~10MB; can't share subsets independently | Split into multiple documents by sharing context |

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — Implement local-first collaborative data
- **[Working with Databases](./working-with-databases.md)** — Implement server-side structured storage
- **[Users and Groups](./users-and-groups.md)** — Set up access control for both systems
