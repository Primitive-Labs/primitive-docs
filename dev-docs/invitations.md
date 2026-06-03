# invitations — `client.invitations`

Manage app-level invitations and the deferred grants that resolve when invited users sign up.

::: warning Swift parity gap
Every method exists in both clients, but the Swift client returns (and `create` accepts)
an **untyped `[String: Any]`** where JS uses named interfaces (`InvitationQuota`,
`AppInvitationInfo`, `InvitationListResult`, `AcceptInviteResult`, `DeferredGrant`) — so Swift
callers hand-cast each field. This drops the typed shapes JS exposes: `list`'s `{ items, cursor }`
envelope, `accept`'s `AcceptInviteResult` (including `grantsResolved`), and the `DeferredGrant`
union on `listDeferredGrants`/`revokeDeferredGrant`. Both compile; the shapes differ. Treat this
as a gap to close, not a by-design difference ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), sweep invitations D1).
:::

## quota()

Check the caller's invitation quota. Admins/owners always get `unlimited: true`.

::: code-group
<<< ./snippets/invitations/quota.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/quota.swift#example{swift} [Swift]
:::

## create(params)

Create an app-level invitation. Only `email` is required.

::: code-group
<<< ./snippets/invitations/create.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/create.swift#example{swift} [Swift]
:::

## list(options?)

List app-level invitations (admin/owner only). JS returns a typed `{ items, cursor }` page; Swift returns the same envelope as an untyped dictionary.

::: warning Swift parity gap
JS returns a typed `InvitationListResult` (`items: [AppInvitationInfo]` + `cursor`) and takes a
typed `InvitationListOptions`; Swift collapses both the envelope and the options into
`[String: Any]`/flat params, so the Swift example reads an opaque dict with no typed `items`
access ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), sweep invitations D2).
:::

::: code-group
<<< ./snippets/invitations/list.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/list.swift#example{swift} [Swift]
:::

## delete(invitationId)

Delete an app-level invitation (admin/owner only). Also cascade-deletes any linked deferred grants.

::: code-group
<<< ./snippets/invitations/delete.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/delete.swift#example{swift} [Swift]
:::

## get(invitationId)

Fetch a single invitation by id. The response includes `inviteToken`, which you combine with your app's accept-page URL to build a working CTA. (There is no separate `getAcceptToken` method — the token comes from `get`.)

::: code-group
<<< ./snippets/invitations/get.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/get.swift#example{swift} [Swift]
:::

## accept(inviteToken)

Accept an invitation via its invite token. Marks the invitation accepted (write-once) and resolves any linked deferred grants to the caller. JS returns a typed `AcceptInviteResult` with `grantsResolved` counts; Swift returns an untyped dictionary.

::: warning Swift parity gap
JS hands back a typed `AcceptInviteResult` including the nested `grantsResolved` counts
(`{ groups, documents }`); Swift returns `[String: Any]` and the example discards the result
entirely, so callers can't read how many grants resolved
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), sweep invitations D3).
:::

::: code-group
<<< ./snippets/invitations/accept.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/accept.swift#example{swift} [Swift]
:::

## listDeferredGrants(options?)

List pending deferred grants (admin/owner only) — permissions and memberships created for users who haven't signed up yet. JS discriminates each grant on `type` via the typed `DeferredGrant` union; Swift returns untyped dictionaries.

::: warning Swift parity gap
JS returns a typed `{ grants: DeferredGrant[], nextCursor }` envelope with the
`"document" | "group"` discriminant; Swift drops the `DeferredGrant` union, the `nextCursor`
envelope, and the literal type, returning `[String: Any]`
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), sweep invitations D4).
:::

::: code-group
<<< ./snippets/invitations/list-deferred-grants.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/list-deferred-grants.swift#example{swift} [Swift]
:::

## revokeDeferredGrant(deferredId, type)

Revoke a deferred grant. `type` (`"document"` or `"group"`) is required because document and group deferred grants live in separate tables.

::: warning Swift parity gap
JS types `type` as the `DeferredGrantType` literal (`"document" | "group"`) and returns a typed
revoke result; Swift takes a bare string and returns `[String: Any]`, so neither the parameter
nor the result is checked at compile time
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), sweep invitations D4).
:::

::: code-group
<<< ./snippets/invitations/revoke-deferred-grant.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/revoke-deferred-grant.swift#example{swift} [Swift]
:::
