# invitations — `client.invitations`

Manage app-level invitations and the deferred grants that resolve when invited users sign up.

::: tip Swift: now typed
The Swift client mirrors the JS named interfaces field-for-field — `InvitationQuota`,
`AppInvitationInfo`, `CreateInvitationParams`, `InvitationListResult`, `AcceptInviteResult`
(with nested `grantsResolved`), and the `DeferredGrant` union (`.document` / `.group`,
discriminated on `type`). No more `[String: Any]` hand-casting
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## quota()

Check the caller's invitation quota. Admins/owners always get `unlimited: true`.

::: code-group
<<< ./snippets/invitations/quota.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/quota.swift#example{swift} [Swift]
:::

## create(params)

Create an app-level invitation. Only `email` is required. Both clients take a typed `CreateInvitationParams` (Swift: a struct) and return a typed `AppInvitationInfo`.

::: code-group
<<< ./snippets/invitations/create.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/create.swift#example{swift} [Swift]
:::

## list(options?)

List app-level invitations (admin/owner only). Both clients return a typed `InvitationListResult` — `items: [AppInvitationInfo]` plus an optional `cursor`. (Swift takes flat `limit`/`cursor` arguments.)

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

Accept an invitation via its invite token. Marks the invitation accepted (write-once) and resolves any linked deferred grants to the caller. Both clients return a typed `AcceptInviteResult` with nested `grantsResolved` counts (`{ groups, documents }`).

::: code-group
<<< ./snippets/invitations/accept.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/accept.swift#example{swift} [Swift]
:::

## listDeferredGrants(options?)

List pending deferred grants (admin/owner only) — permissions and memberships created for users who haven't signed up yet. Both clients return a typed `{ grants, nextCursor }` envelope; each grant is a `DeferredGrant` union discriminated on `type` (`document` / `group`). In Swift, switch over the enum's `.document` / `.group` cases.

::: code-group
<<< ./snippets/invitations/list-deferred-grants.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/list-deferred-grants.swift#example{swift} [Swift]
:::

## revokeDeferredGrant(deferredId, type)

Revoke a deferred grant. `type` (`document` or `group`) is required because document and group deferred grants live in separate tables. Both clients type `type` as the discriminant (Swift: the `DeferredGrantType` enum) and return a typed `{ status, deferredId }` result.

::: code-group
<<< ./snippets/invitations/revoke-deferred-grant.ts#example{ts} [JavaScript]
<<< ./snippets/invitations/revoke-deferred-grant.swift#example{swift} [Swift]
:::
