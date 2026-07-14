# Resource Metadata

Resource metadata is typed, server-stored key/value data you attach to any resource — a user, a group, a collection, a database, or a workflow's subject. Metadata is grouped into named **categories**, and each category carries its own schema and its own CEL read/write rules, so different pieces of data about the same resource can have completely different access rules: a user's `profile` category might be self-editable, while a `billing` category is written only by a server-side workflow.

## Categories and Schemas

A category is defined once per resource type — `(resourceType, category)` — with a schema of typed fields, plus an optional `readRule` and `writeRule`:

```toml
# config/metadata-category-configs/user.profile.toml
[metadataCategoryConfig]
resourceType = "user"
category = "profile"
readRule = "user.userId == resource.resourceId"
writeRule = "user.userId == resource.resourceId"
description = "Per-user profile metadata"

[metadataCategoryConfig.schema.fields.tier]
type = "string"
required = true
enum = ["free", "pro", "enterprise"]

[metadataCategoryConfig.schema.fields.displayName]
type = "string"
maxLength = 120
```

Push it like any other synced config:

```bash
primitive sync push
```

Field types are `string`, `number`, `boolean`, `date`, `id`, and `stringset`; `enum` is valid only on a `string` field. A category holds up to 100 keys and 16 KB of data, and writes are validated against the schema before they're stored.

`readRule` and `writeRule` are CEL expressions evaluated against `user.*` (the caller) and `resource.*` (`resourceType`, `resourceId` — also reachable as `resource.id` — and `category`) — app-level owners and admins bypass both.

When the metadata subject is a database, workflow, or collection, the rule can also read the resource's own columns through `resource.attrs` — for example, a creator-bootstrap rule that lets whoever created a database write its metadata:

```toml novalidate
writeRule = "user.userId == resource.attrs.createdBy"
```

Only those three resource types (and only a fixed set of columns per type) resolve; a rule that references `resource.attrs` on any other resource type, or a column outside the set, denies. The bypass is the app role only: holding a permission on the resource itself (being a database's owner or manager, say) grants no bypass — the rule is what authorizes resource-scoped callers. `writeRule` gates the write API; `readRule` gates the read API. Omit either and it defaults to deny.

A category rule can also use the [identity context's](./access-control.md#the-identity-context) group-membership helpers, so access can be group-scoped instead of just self-scoped:

```toml novalidate
readRule = "isMemberOf('class-teachers', resource.id)"
```

`isMemberOf`, `memberGroups`, and `hasRole` are all available; `hasCollectionAccess` is not — it's collection-scoped, and a category rule that uses it is rejected when the config is pushed.

### Reading Other Categories from a Category Rule

A category's own `readRule`/`writeRule` can reach the resource's *other* categories — declare a `metadataManifest` on the category config the same way a group type or workflow declares one (see [Using Metadata in Access Rules](#using-metadata-in-access-rules)):

```toml
# config/metadata-category-configs/class-post.post.toml
[metadataCategoryConfig]
resourceType = "class-post"
category = "post"
readRule = "isMemberOf('class-teachers', md.self.classLink.classId)"
writeRule = "isMemberOf('class-teachers', md.self.classLink.classId)"

[metadataCategoryConfig.schema.fields.title]
type = "string"
required = true

[metadata.self]
categories = ["classLink"]
```

Every category the rule reads as `md.self.<category>.<key>` must be declared, and `secrets.<KEY>` follows the same declared-only rule described in [App Secrets](./app-secrets.md). A category config that declares no `metadataManifest` has no `md`/`secrets` access in its rule at all.

## Reading and Writing Metadata

Read and write a category's data with the client or the CLI. `get`/`set` take the resource type, resource id, and category as arguments, and `set` fully replaces the category's data:

```typescript
await client.resourceMetadata.set("user", userId, "profile", {
  tier: "pro",
  displayName: "Ada",
});

const profile = await client.resourceMetadata.get("user", userId, "profile");
// { resourceType, resourceId, category, data: { tier: "pro", displayName: "Ada" }, schemaVersion, exists }
```

```bash
primitive metadata set user 01HXY... profile --data '{"tier":"pro","displayName":"Ada"}'
primitive metadata get user 01HXY... profile --json
```

Metadata reads are on-demand: a `get` returns the value at the moment of the call, and changes are not pushed to clients. A client that needs current values polls on whatever interval fits its freshness needs. This is a deliberate division of labor: metadata holds configuration and state the server reads, while state that must react in real time on the client belongs in a [document](./working-with-documents.md), where connected clients receive updates automatically.

### Batch Reads

Read several resources' categories in one call — useful for a listing view that would otherwise issue one request per row. The call always succeeds; per-resource and per-category problems (a missing category, a denied `readRule`) show up inside the results instead of failing the whole batch:

```typescript
const { results } = await client.resourceMetadata.getBatch({
  requests: [
    { resourceType: "user", resourceId: userA, categories: ["profile", "billing"] },
    { resourceType: "user", resourceId: userB, categories: ["profile"] },
  ],
});
// results[i] = { resourceType, resourceId, ok: true,
//   categories: { profile: { ok: true, exists, data, schemaVersion }, billing: { ok: false, status: 403, code: "FORBIDDEN", message } } }
```

```bash
primitive metadata get-batch --resource user:01HXY...:profile,billing --resource user:01HZQ...:profile
```

A batch call covers up to 50 resources and 200 resource/category pairs total.

### Listing and Deleting

To see everything stored on one resource — say, while debugging why a rule isn't matching — list its categories in one call; to remove a category's data, delete it:

```typescript
const { categories } = await client.resourceMetadata.list("user", userId);
// [{ category: "profile", data: {...}, schemaVersion }, ...] — only categories your readRule lets you see

const { deleted } = await client.resourceMetadata.delete("user", userId, "profile");
// deleted: false when nothing was stored — deleting an absent item is not an error
```

```bash
primitive metadata list user 01HXY...
primitive metadata delete user 01HXY... profile
```

`list` returns the categories the caller may read (each category's `readRule` applies, and app-level owners and admins see everything — the CLI reads as an admin, so it always shows all categories). The CLI can also inspect category *definitions* — schema, rules, version — without opening TOML files:

```bash
primitive metadata categories list
primitive metadata categories get user profile
```

## Using Metadata in Access Rules

A rule can read the metadata of the resource it's evaluating as `md.self.<category>.<key>` — but every category it reads must be declared ahead of time on the config that owns the rule (a group type, collection type, database type, or workflow definition). Declaring a category is what authorizes a rule to use it; the metadata read API's `readRule` plays no part here — a rule author is trusted to declare only what they intend the rule to use:

```toml
# config/group-type-configs/team.toml
[groupTypeConfig]
groupType = "team"
ruleSetName = "team-rules"

[metadata.self]
categories = ["config"]
```

```toml novalidate
# in the attached rule set
member.create = "md.self.config.tier == \"pro\""
```

Groups and collections also expose a reserved, read-only `attrs` category projected from the resource's own fields — no schema, nothing to write, just declare it like any other category:

| Resource type | `md.self.attrs.*` |
|---|---|
| `group` | `groupType`, `groupId`, `name`, `createdBy` |
| `collection` | `collectionId`, `collectionType`, `contextId`, `name`, `createdBy` |

```toml novalidate
group.get = "md.self.attrs.createdBy == user.userId"
```

Database operations can also substitute a declared category's value directly into an operation's `filter` or `data` — see [Working with Databases](./working-with-databases.md#access-control-with-cel).

### Reading a Related Resource's Metadata

Beyond the subject's own metadata, a manifest can declare a **path** to another resource reached through a metadata key that holds its id, chaining up to 3 hops:

```toml
[metadata.self]
categories = ["system"]

[metadata.paths.school]
from = "self"
via = "system.schoolId"
type = "school"
categories = ["system"]
```

```toml novalidate
# now usable in the rule:
md.school.system.tier == "pro"
```

## The Caller's Own Metadata

A rule can also read the **calling user's** own metadata, independent of whose resource is being evaluated, by declaring a path rooted at `user.userId` — the one server-authenticated root (every other path root — `input.*`, `record.*`, `params.*` — is a caller-supplied, static context value, not an authenticated identity):

```toml
[metadata.paths.caller]
rootFrom = "user.userId"
type = "user"
categories = ["billing"]
```

```toml novalidate
access = "md.caller.billing.status in ['trialing', 'active', 'past_due']"
```

This is available to database operation access rules and workflow `accessRule`s. When there's no authenticated caller — an anonymous request, or a system-run workflow — `md.caller` binds `null`, and a rule that dereferences it denies rather than erroring.

## Writing Metadata from Workflows

A workflow can write or read a category directly with the `metadata.write` / `metadata.read` steps, which go through the same read/write path — and the same `readRule`/`writeRule` gate — as the client and CLI:

```toml
[[steps]]
id = "record-billing"
kind = "metadata.write"
resourceType = "user"
resourceId = "{{ input.userId }}"
category = "billing"
[steps.data]
stripeCustomerId = "{{ input.customerId }}"
status = "active"
```

Gate a category so only that workflow can write it with `fromWorkflow('key')` in the category's `writeRule` — a call from anywhere else, including the REST API or a different workflow, is denied:

```toml
# config/metadata-category-configs/user.billing.toml
[metadataCategoryConfig]
resourceType = "user"
category = "billing"
writeRule = "fromWorkflow('process-stripe')"
readRule = "true"

[metadataCategoryConfig.schema.fields.stripeCustomerId]
type = "string"
required = true

[metadataCategoryConfig.schema.fields.status]
type = "string"
```

## Stamping Metadata at Create Time

Collections and databases can have metadata stamped in the same call that creates them, instead of a follow-up write. `collections.create()` / `databases.create()` accept an optional `initialMetadata`: a map of category name → values. Each entry is schema-validated before the resource is created — an invalid entry fails the whole create — and the category's `writeRule` is waived for this initial stamp, since creation authority already covers it. Up to 10 categories per create.

```ts
const database = await client.databases.create({
  title: "Class Roster",
  databaseType: "roster",
  initialMetadata: {
    settings: { visibility: "class-only" },
  },
});
```

The same param is available on `collections.create()`, and from the CLI as `--initial-metadata '<json>'` on `primitive databases create` / `primitive collections create`.

## Metadata Lifecycle

Writing metadata doesn't check that the target resource exists — a write for a not-yet-created or already-deleted resource succeeds, and deleting a resource doesn't delete its metadata. This keeps writes cheap (no extra lookup) and lets a provisioning workflow write metadata immediately after — or interleaved with — creating the resource it belongs to.

Two patterns keep metadata consistent with the resources it describes:

- **Gate writes with `writeRule`.** Restricting who (or which workflow) can write a category limits who can create metadata for a resource that doesn't exist.
- **Clean up metadata wherever you delete the resource.** Whatever flow deletes a resource should also delete its metadata categories.

## Next Steps

- **[Access Control](./access-control.md)** — The CEL identity context every rule shares
- **[Users and Groups](./users-and-groups.md)** — Group and collection categories, and the projected `attrs` category
- **[Working with Databases](./working-with-databases.md)** — Substituting metadata into operation filters and writes
- **[Workflows](./workflows.md)** — The `metadata.write` / `metadata.read` steps in full
