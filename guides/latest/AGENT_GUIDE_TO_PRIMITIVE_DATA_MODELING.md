# Data Modeling and Storage Architecture in Primitive

Guidelines for choosing between documents and databases, and designing your app's data architecture.

## Overview

Primitive provides two storage systems that serve different needs:

- **Documents** — local-first, real-time collaborative storage synced to client devices
- **Databases** — server-side storage with fine-grained access control via registered operations

Most apps use one or both depending on the data. This guide helps you make the right choice and shows common patterns.

## Decision Framework

### Quick decision table

| Question | Documents | Databases |
|----------|-----------|-----------|
| Does every user with access need the full dataset? | Yes | No — users need filtered subsets |
| Do you need real-time collaborative editing? | Yes | No |
| Do you need offline access? | Yes | No — requires network |
| Is the dataset small enough that users typically want all of it? | Yes — data is <10MB or splits naturally into <10MB chunks | No — dataset is large or users only need a subset |
| Do different users need different access to records within the same collection? | No — all-or-nothing per document | Yes — per-operation CEL rules |

### Use documents when

- **Uniform access**: All users with access see the same data and have the same capabilities (reader or read-write)
- **Small or naturally partitioned data**: Dataset is <10MB, or splits cleanly into <10MB chunks where users typically want all the data in their chunk
- **Collaborative editing**: Multiple users editing the same data in real-time (like Google Docs)
- **Offline-first**: Apps that must work without network connectivity

### Use databases when

- **Fine-grained access**: Different users need to see or modify different records within the same dataset
- **Large or partial-access data**: Dataset is large (up to 5GB per database) or users only need a filtered subset
- **Server-enforced rules**: Timestamps, audit trails, computed fields that must not be client-editable
- **Analytics and aggregation**: Counting, summing, grouping data across many records
- **Multi-step operations**: Dashboard views combining data from multiple collections in one request

## Example App Architectures

### Personal productivity app (documents only)

**Example:** Task manager, habit tracker, budgeting tool

All data is personal. One document per user holds everything.

```
Storage: Documents only
├── Root document → user preferences, settings
└── Default document (via alias) → all tasks, lists, categories
```

**Why documents:** Data is personal, fits on-device, benefits from offline access and instant local reads. No need for server-side access control.

See: [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) — Pattern 1: Single Document

### Collaborative workspace (documents only)

**Example:** Shared shopping lists, project boards, collaborative notes

Users create workspaces and share them with teammates. Everyone in a workspace has the same access.

```
Storage: Documents only
├── Root document → user preferences
└── One document per workspace → all workspace data
    ├── Shared with team at read-write level
    └── Owner manages sharing
```

**Why documents:** Real-time collaboration is key. Access is all-or-nothing per workspace, which maps cleanly to document sharing. Each workspace stays under ~10MB.

See: [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) — Pattern 2: One Document at a Time

### Classroom / LMS app (databases + documents)

**Example:** Teachers create classes, students submit work, parents view progress

Different roles need different access. Teachers see all students. Students see only their own work. Parents see only their children's data.

```
Storage: Both
├── Documents
│   └── Per-submission document → student work (rich content, collaborative editing, real-time)
│       ├── One document per assignment submission
│       └── Shared with teacher at read-write for feedback/grading
│
└── Databases (type: "classroom")
    ├── Per-class database → assignments, grades, roster, submission metadata
    │   ├── metadata: { classId, teacherId, schoolId }
    │   ├── Operations:
    │   │   ├── "listAssignments" → access: "true" (all class members)
    │   │   ├── "submitWork" → access: "true", data.studentId: "$user.userId"
    │   │   ├── "gradeSubmission" → access: "isMemberOf('teacher', database.metadata.classId)"
    │   │   └── "myGrades" → access: "true", filter: { studentId: "$user.userId" }
    │   └── Triggers: createdAt, modifiedAt on all models
    └── Groups: teacher, student, parent-of (for per-parameter access)
```

**Why both:**
- **Documents** for student submissions — rich content editing, real-time collaboration (student writes, teacher comments), offline drafting
- **Databases** for everything else — assignments, grades, rosters need fine-grained access (students see only their own grades, teachers see all, parents see only their children's), server-enforced grade integrity, aggregations for teacher dashboards

### E-commerce / marketplace (databases + documents)

**Example:** Product catalog, orders, inventory with seller and buyer roles

```
Storage: Both
├── Documents
│   └── Per-user document → shopping cart, wishlists, preferences (offline, instant access)
│
└── Databases
    ├── App-wide database (type: "catalog")
    │   ├── Products, categories, reviews
    │   ├── Operations:
    │   │   ├── "searchProducts" → access: "true"
    │   │   ├── "addProduct" → access: "hasRole('admin') || isMemberOf('seller', 'verified')"
    │   │   └── "productStats" → pipeline with aggregates (admin only)
    │   └── Triggers: createdAt, modifiedAt, searchIndex fields
    │
    └── Per-seller database (type: "seller_store")
        ├── Orders, inventory, analytics
        ├── Operations:
        │   ├── "myOrders" → access: "true", filter: { buyerId: "$user.userId" }
        │   ├── "sellerOrders" → access: "isMemberOf('seller', database.metadata.sellerId)"
        │   └── "salesDashboard" → pipeline, seller access only
        └── metadata: { sellerId }
```

**Why both:**
- **Documents** for cart/wishlist — must work offline, personal data, instant updates
- **Databases** for catalog — large dataset, server-side search/filter, role-based CRUD
- **Separate databases per seller** — Durable Object isolation gives per-seller scaling

### Multi-tenant SaaS (databases + documents)

**Example:** Project management tool with organizations, teams, and projects

```
Storage: Both
├── Documents
│   └── Per-user document → personal dashboard layout, notification preferences
│
└── Databases
    ├── Per-organization database (type: "org")
    │   ├── Teams, members, settings
    │   ├── metadata: { orgId }
    │   └── Operations gated by org membership
    │
    └── Per-project database (type: "project")
        ├── Tasks, milestones, comments, files
        ├── metadata: { orgId, projectId, teamId }
        ├── Operations:
        │   ├── "listTasks" → access: "isMemberOf('team', database.metadata.teamId)"
        │   ├── "createTask" → access: "isMemberOf('team', database.metadata.teamId)"
        │   ├── "projectDashboard" → pipeline with task stats, milestone progress
        │   └── "adminReport" → access: "hasRole('admin')"
        └── Triggers: audit timestamps, status transition tracking
```

**Why both:**
- **Documents** for personal preferences — simple, offline, no sharing complexity
- **Per-org and per-project databases** — each is a separate Durable Object for isolation and scaling. Team-based CEL access. Server-side dashboards and analytics.

### Chat / messaging app (documents + databases)

**Example:** Channels with messages, direct messages, presence

```
Storage: Both
├── Documents
│   ├── Per-channel document → messages, reactions (real-time sync, collaboration)
│   └── Per-DM document → direct message threads
│
└── Databases (type: "app_data")
    ├── App-wide database → channel directory, user profiles, settings
    ├── Operations:
    │   ├── "listChannels" → access: "true"
    │   ├── "createChannel" → access: "hasRole('admin')"
    │   └── "searchUsers" → access: "true"
    └── Triggers: createdAt on channels
```

**Why both:**
- **Documents** for messages — real-time sync is critical, all channel members see everything, offline access
- **Databases** for channel directory — app-wide, searchable, admin-controlled creation

## Design Principles

### 1. One Durable Object per logical boundary

Each database is a separate Durable Object. Design boundaries around:
- **Tenants** (one database per org/team/customer)
- **Data domains** (one database for catalog, another for orders)
- **Scale units** (if one collection could grow very large, give it its own database)

Don't put everything in one giant database. Multiple smaller databases scale better and provide natural isolation.

### 2. Operations are your API

Registered operations are the interface between your app and its data. Design them like API endpoints:
- **Name them clearly**: `listTasks`, `createTask`, `tasksByStatus`
- **Keep access rules tight**: Start restrictive, widen as needed
- **Use substitution variables**: `$user.userId` and `$database.metadata.*` for dynamic scoping
- **Declare parameters explicitly**: Type and require them properly

### 3. Use metadata for database-level context

Store contextual identifiers (team ID, project ID, org ID) in database metadata. Operations can reference these via `$database.metadata.*` for access control and filtering without the caller needing to know the underlying IDs.

### 4. Use triggers for server-enforced invariants

If a field should always be set by the server (timestamps, creator ID, computed status), use triggers — don't trust client-provided values.

### 5. Use groups for flexible access control

Groups (`isMemberOf`, `memberGroups`) enable access patterns like:
- Team membership → can view/edit team data
- Parent-of → can view child's grades (per-parameter access)
- Seller → can manage their own store

Groups are more flexible than roles for multi-tenant patterns where users have different access in different contexts. See the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) for full group management API and CEL patterns.

### 6. Documents for collaboration, databases for control

If you're torn:
- Will multiple people edit the same data simultaneously? → **Documents**
- Do you need the server to enforce who sees what? → **Databases**
- Both? → Use documents for the collaborative editing surface, databases for the structured data layer

## Common Mistakes

| Mistake | Better approach |
|---------|----------------|
| Putting all app data in one database | Split by tenant/domain for isolation and scaling |
| Using direct record access for end users | Use registered operations with CEL access control |
| Granting database permissions to end users | `grantPermission` is for administrative control — use operations with CEL for end-user access |
| Hardcoding values in operation definitions | Use `$params.*`, `$user.*`, `$database.metadata.*` |
| Using documents for large shared datasets | Use databases with server-side filtering |
| Using databases when you need real-time collaboration | Use documents — they handle sync and conflict resolution |
| Trusting client-provided timestamps/IDs | Use triggers to set server-side values |
| Making all operations `access: "true"` | Start restrictive — use groups and roles |

## Further Reading

- [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) — full documentation on local-first document storage
- [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) — full documentation on server-side database storage
- [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) — user model, groups, and access control patterns
