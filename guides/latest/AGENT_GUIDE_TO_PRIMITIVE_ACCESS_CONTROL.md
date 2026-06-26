# Agent Guide to Primitive Access Control

Guidelines for AI agents writing access rules. Server-evaluated authorization across Primitive is expressed in **CEL** (Common Expression Language) against the authenticated caller. Documents are the exception — they use direct permission grants (`reader` | `read-write` | `owner` per user/email/group), not CEL.

## Identity context (available everywhere)

| Variable / function | Meaning |
|---|---|
| `user.userId` | Caller's user ID (`''` when unauthenticated) |
| `user.role` | Caller's app role |
| `isAnonymous()` | True when the caller has no account (unauthenticated request); `!isAnonymous()` ⇒ any signed-in member. Matters where anonymous access is reachable, e.g. a `public` blob bucket |
| `hasRole(role)` | App role check: `"owner"` \| `"admin"` \| `"member"` (app-level role — distinct from the document `owner` permission) |
| `isMemberOf(groupType, groupId)` | Exact group membership (two args, strict) |
| `memberGroups(groupType)` | List of groupIds of that type the caller belongs to |

Prefer membership checks over user-ID comparisons: `isMemberOf('team', params.teamId)`, `params.teamId in memberGroups('team')`.

A rule reads caller identity and operation params only — it cannot read a database record. So a server-enforced entitlement (paid feature, role gate) can't be a flag on a row (`isSubscribed = true`): no rule can check it, so it isn't enforced. Model the entitlement as group membership, which a rule can check — `isMemberOf('subscription', 'active')` — and maintain that membership from your billing source.

## Surfaces and their extra context

| Surface | Field(s) | Extra context | Notes |
|---|---|---|---|
| Database operation | `access` per op; `defaultAccess` on `[type]`; per-param `access` inside `params` JSON | `params.*`, `database.id`, `database.celContext`, `fromWorkflow()` / `fromWorkflow(key)` | No rule and no `defaultAccess` → denied to non-owner/manager callers. `fromWorkflow(key)` gates ops to the internal workflow runner (unspoofable). |
| Database subscription | `accessRule` (subscribe-time) + `filter` (per change) | `accessRule`: full context incl. `database.*`, membership fns, `params.*`. `filter`: **narrow** — `user.userId`, `record.*` (`record.data.*`, `record.previousData.*`, `record.modelName`/`op`/`id`), `params.*` only | `filter` cannot reference `database.*` (HTTP 400 at save) and cannot widen what `accessRule` allows. Both required; use `"true"` for filter to pass everything in scope. |
| Workflow | `accessRule` on `[workflow]` | identity context only | Evaluated on `workflows.start()` and `workflow.call`; NOT on webhook triggers. admin/owner bypass. No rule → any authenticated member can start. |
| Server-stamped fields / triggers | trigger `when` conditions; `autoPopulatedFields` values | `record.*`, `database.*`, `now()` | CEL produces values (`user.userId`, `now()`) as well as conditions. |
| Rule sets | per-op rules on a named rule set | resource objects (e.g. `group.groupType`, `group.groupId`, `group.createdBy`) | Governs **management operations** (create/edit/delete groups & collections, member management) — see below. |

## Rule sets (management operations)

Data-access rules live on operations; **rule sets** govern who may manage groups and collections:

```bash
primitive rule-sets create "team-management" \
  --resource-type group \
  --rules '{
    "group":  { "create": "true", "edit": "user.userId == group.createdBy", "delete": "user.userId == group.createdBy" },
    "member": { "create": "isMemberOf(group.groupType, group.groupId)", "edit": "user.userId == group.createdBy", "delete": "user.userId == group.createdBy" }
  }'
```

Bind via the type config: `config/group-type-configs/<type>.toml` / `config/collection-type-configs/<type>.toml` (synced), or `client.groupTypeConfigs.create({ groupType, ruleSetId })` / `client.collectionTypeConfigs.create(...)`. A **blob bucket** attaches a rule set directly via its `ruleSetId` (TOML, or `--rule-set-id` on `primitive blob-buckets create`), where it governs member-level reads/writes — see the Blob Buckets guide for precedence semantics.

Semantics:
- **App owners/admins bypass rule sets entirely**; rules apply to regular members.
- Group types with no config row get permissive defaults: any member can `create`; the creator can `edit`/`delete` and manage members; creator + direct members can read.
- To deny an op for everyone except admins/owners, set that op's rule to `"false"`.

## Testing and debugging

```bash
primitive rule-sets test <rule-set-id> --scenario '{...}'   # dry-run against a simulated scenario
primitive rule-sets debug --user <userId> --group-type <type> --category <group|member> --operation <create|edit|delete|list> [--group-id <id>]
                                                            # trace against real user/group data (console-admin only)
primitive rule-sets schema                                   # available context variables/functions
```

Client equivalents: `client.ruleSets.test()`, `client.ruleSets.debug()`, `client.ruleSets.schema()`. For end-to-end checks of operation rules, sign in as `+primitivetest` derived users with different roles/memberships and execute the operation. Owners and admins bypass every rule, so a gated or entitlement-gated state reads as open to them even when the gate is correct — test that a gate actually denies as a plain `member`.

## Patterns

```toml novalidate
access = "user.userId != ''"                                   # any authenticated user
access = "hasRole('admin') || hasRole('owner')"                # app admins
access = "isMemberOf('team', database.celContext.teamId)"      # bound team per database instance
access = "params.createdBy == user.userId"                     # record owner
access = "params.teamId in memberGroups('team')"               # any of the caller's teams
access = "fromWorkflow('refresh-prices')"                      # only the named workflow
```

- Default-deny, widen deliberately. Missing rules deny (database ops) or allow any member (workflows) — know which surface you're on.
- One group type per concept (`team`, `org`, `team-admin`); group-level "admin" is modeled as its own group type, not a built-in.
- Parameterize the resource (`params.teamId`) so one operation serves every team.
- External identifiers: never trust a client-supplied provider id (a payment `customer_id`) for a server-side action — a caller could substitute another user's id. Keep the user→external-id mapping in a system-write store (write op gated `access = "fromWorkflow('key')"`) with reads scoped to the caller (`definition` filter on `$user.userId`), and resolve the id server-side from the authenticated user.
