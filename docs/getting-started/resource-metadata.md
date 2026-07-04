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

`readRule` and `writeRule` are CEL expressions evaluated against `user.*` (the caller) and `resource.*` (`resourceType`, `resourceId`, `category`) — app owners and admins bypass both. `writeRule` gates the write API; `readRule` gates the read API. Omit either and it defaults to deny.

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
