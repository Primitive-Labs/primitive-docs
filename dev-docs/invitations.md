# invitations — `client.invitations`

Manage app-level invitations and the deferred grants that resolve when invited users sign up.

::: tip Divergent shape
Every method exists in both clients, but the Swift client returns (and `create` accepts)
an **untyped `[String: Any]`** where JS uses named interfaces — so Swift callers hand-cast
each field. This drops the typed shapes JS exposes: `list`'s `{ items, cursor }` envelope,
`accept`'s `AcceptInviteResult` (including `grantsResolved`), and the `DeferredGrant` union on
`listDeferredGrants`/`revokeDeferredGrant`. Both compile; the shapes differ ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
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

::: code-group
<<< ./snippets/invitations/accept.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/accept.swift#example{swift} [Swift]
:::

## listDeferredGrants(options?)

List pending deferred grants (admin/owner only) — permissions and memberships created for users who haven't signed up yet. JS discriminates each grant on `type` via the typed `DeferredGrant` union; Swift returns untyped dictionaries.

::: code-group
<<< ./snippets/invitations/list-deferred-grants.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/list-deferred-grants.swift#example{swift} [Swift]
:::

## revokeDeferredGrant(deferredId, type)

Revoke a deferred grant. `type` (`"document"` or `"group"`) is required because document and group deferred grants live in separate tables.

::: code-group
<<< ./snippets/invitations/revoke-deferred-grant.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/revoke-deferred-grant.swift#example{swift} [Swift]
:::
