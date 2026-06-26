# Access Control

Server API calls in Primitive are gated by access rules written in **[CEL](https://github.com/google/cel-spec)** — a one-line expression evaluated against the authenticated caller. Database operations, real-time subscriptions, workflow invocation, management of groups and collections: one expression language, one identity context. Learn it once and you can read and write the access rules anywhere they appear.

## CEL in Sixty Seconds

A CEL expression is a one-line condition that evaluates to true or false:

```toml novalidate
access = "user.userId != ''"                                  # any authenticated user
access = "hasRole('admin') || hasRole('owner')"               # app admins
access = "isMemberOf('team', params.teamId)"                  # team members
access = "params.createdBy == user.userId"                    # the record's owner
access = "size(memberGroups('team')) > 0"                     # member of any team
```

Standard operators work as you'd expect: `==`, `!=`, `<`, `&&`, `||`, `!`, `in`, plus functions like `size(...)`. String literals use single quotes inside TOML double-quoted strings.

## The Identity Context

Every CEL evaluation sees the authenticated caller:

| Variable / function | Meaning |
|---|---|
| `user.userId` | The caller's user ID (empty string when unauthenticated) |
| `user.role` | The caller's app role |
| `isAnonymous()` | True when the caller has no account at all (an unauthenticated request). Write `!isAnonymous()` to require any signed-in member; relevant where anonymous access is possible, such as a `public` [blob bucket](./blobs-and-files.md#access-presets) |
| `hasRole(role)` | True if the caller's app role is `"owner"`, `"admin"`, or `"member"` as given (app-level role — distinct from the document `owner` [permission](./working-with-documents.md#sharing-documents)) |
| `isMemberOf(groupType, groupId)` | True if the caller belongs to that exact group |
| `memberGroups(groupType)` | The list of group IDs of that type the caller belongs to |
| `fromWorkflow()` / `fromWorkflow(key)` | True when the call comes from the internal workflow runner (optionally a specific workflow) — gate an operation to server-side automation only |

Group membership is the workhorse: model teams, roles, and relationships as [groups](./users-and-groups.md), then write rules against membership instead of hard-coding user IDs. `isMemberOf('team', params.teamId)` stays correct as people join and leave; `userId == '01ABC...'` doesn't.

Each place a rule appears adds its own context on top — operation `params.*`, the `database.*` being accessed, the `record.*` being written. The feature pages document their specific variables.

### A Rule Sees Identity, Not Stored Data

Every function above answers a question about the *caller* — their role, their group memberships, the operation's params. A rule has no way to read a database record. So an entitlement you want the server to enforce — a paid feature, a role gate — can't live as a flag on a row: storing `isSubscribed = true` and checking it in a rule doesn't work, because the rule can't read the row, and a flag no rule can check isn't enforced server-side (a client can call the operation regardless).

Model the entitlement as **group membership** instead, which a rule *can* check:

```toml novalidate
access = "isMemberOf('subscription', 'trialing') || isMemberOf('subscription', 'active')"
```

Maintain that membership from your billing source — add a member when a subscription starts, remove them when it lapses — and every rule that gates a paid feature becomes a one-line membership check.

## Where Rules Appear

| Surface | What the rule gates | Details |
|---|---|---|
| Database operations (`access`, `defaultAccess`, per-param `access`) | Who can execute a query/mutation, or set a specific parameter | [Working with Databases](./working-with-databases.md#access-control-with-cel) |
| Database subscriptions (`accessRule` + `filter`) | Who can subscribe, and which changes they receive | [Real-Time Subscriptions](./working-with-databases.md#real-time-subscriptions) |
| Workflows (`accessRule`) | Who can start a run directly from a client | [Controlling Access to Workflows](./workflows.md#controlling-access-to-workflows) |
| Server-stamped fields (trigger `when` conditions) | Whether a computed field applies to this write | [Server-Stamped Fields](./working-with-databases.md#server-stamped-fields) |
| Blob buckets (`ruleSetId`) | Member-level access to a bucket's blobs, per operation | [Blobs and Files](./blobs-and-files.md#access-presets) |
| Rule sets | Who can perform **management operations** on groups and collections | below |

## Rule Sets: Governing Management Operations

Data-access rules live on the operation they protect. **Rule sets** answer a different question: who may *manage* a platform resource — create groups of a type, add or remove members, edit or delete a collection. A rule set is a named bundle of CEL rules per management operation:

```bash
primitive rule-sets create "team-management" \
  --resource-type group \
  --rules '{
    "group":  { "create": "true", "edit": "user.userId == group.createdBy", "delete": "user.userId == group.createdBy" },
    "member": { "create": "isMemberOf(group.groupType, group.groupId)", "edit": "user.userId == group.createdBy", "delete": "user.userId == group.createdBy" }
  }'
```

Bind a rule set to a **group type** or **collection type** via its type config — in TOML (`config/group-type-configs/<type>.toml`, `config/collection-type-configs/<type>.toml`) or from the client (`client.groupTypeConfigs.create({ groupType, ruleSetId })`). A **blob bucket** attaches one directly via its `ruleSetId`, where it governs member access per operation — see [Blobs and Files](./blobs-and-files.md#access-presets).

Two behaviors to know:

- **App owners and admins bypass rule-set evaluation** — rules govern regular members.
- **Types without a config row use permissive defaults** (any member can create; the creator manages what they created). To deny an operation for everyone except admins, attach a rule set with that operation set to `"false"`.

## Testing Rules

Rule sets are versioned and testable — evaluate rules against simulated requests before deploying:

```bash
# Dry-run a rule set against a simulated scenario
primitive rule-sets test <rule-set-id> --scenario '{"user": {"userId": "u-1"}}'

# Trace an evaluation using real user and group data
primitive rule-sets debug --user <userId> --group-type team --category member --operation create
```

The same is available from the client as `client.ruleSets.test()` and `client.ruleSets.debug()`. For database operations, the fastest loop is running the operation as different test users — see [Test Users for Automated Testing](./primitive-cli.md#test-users-for-automated-testing).

**Test gated states as a plain member.** App owners and admins bypass access rules and rule sets — they pass every gate — so you can't exercise a locked or entitlement-gated state while signed in as one. A paywalled feature reads as open to an admin even when the gate is correct. Verify that a gate actually denies using a `member` test user.

## Trusting External Identifiers

When the server later acts on an identifier — opening a billing portal from a payment `customer_id`, calling a provider API on a user's behalf — it must not trust a value the client supplied. A user-writable document holding `customerId` is unsafe: a caller could substitute someone else's id and act on their account.

Keep the authoritative user-to-external-id mapping in a store only the server writes, with reads scoped to the owning user:

- **Writes come from server-side automation only.** Gate the write operation to the workflow that maintains the mapping — `access = "fromWorkflow('billing-webhook')"` — so no client can set it.
- **Reads return only the caller's own row.** Filter the read on `$user.userId`, so a caller can never name another user's id:

```toml
[[operations]]
name = "my-billing-profile"
type = "query"
modelName = "billingProfile"
access = "user.userId != ''"
definition = '{"filter":{"userId":"$user.userId"}}'
```

When a server action needs the external id, resolve it from the authenticated user through this operation — never accept it as a parameter from the client.

## Patterns That Hold Up

1. **Default-deny, then open up.** Start restrictive (`hasRole('admin')`) and widen deliberately. An operation with no rule and no `defaultAccess` is denied to regular callers.
2. **One group type per concept.** Separate `team`, `org`, and role-like types keep expressions readable: `isMemberOf('team', params.teamId) || isMemberOf('org', params.orgId)`.
3. **Membership over IDs.** Manage *who's in the group*, not the rules — rules referencing groups rarely need to change.
4. **Parameterize the resource.** Rules like `isMemberOf('team', params.teamId)` or `params.userId == user.userId` make one operation serve every team/user safely.

## Next Steps

- **[Users and Groups](./users-and-groups.md)** — The groups your rules check membership against
- **[Working with Databases](./working-with-databases.md)** — Operation-level rules in practice
