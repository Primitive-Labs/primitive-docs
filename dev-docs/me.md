# me — `client.me`

The signed-in user: read and update their profile, list the documents they own
or that are shared with them, manage pending invitations, and control the
profile cache. To look up *other* users, see [`users`](/users).

::: tip Divergent shape
Most of `client.me` matches by name across both clients, but the Swift surface
is largely **untyped**: `get`/`update`/`uploadAvatar`/`pendingDocumentInvitations`
return (and `update` accepts) `[String: Any]` where JS uses named interfaces
(`UserProfile`, `UpdateMeParams`, …). `ownedDocuments`/`sharedDocuments` return
the raw `{ items, cursor? }` envelope as a dictionary, and Swift's
`ownedDocuments` is a bare network GET that accepts only `cursor`/`limit`/`tag`
— it drops the 7 offline-first option fields JS exposes and does no local-cache
merge. Both compile; the shapes differ ([#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938), [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## get(options?)

Read the signed-in user's profile, using the cache when available. Returns
`null` if there is no current user.

::: code-group
<<< ./snippets/me/get.ts#example{ts} [JavaScript]
<<< ./snippets/me/get.swift#example{swift} [Swift]
:::

## update(params)

Update the profile's `name` and/or `avatarUrl`. Pass `avatarUrl: null` (JS) to
clear the avatar — Swift takes an untyped `[String: Any]`, so use `NSNull()` for
the same effect ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).

::: code-group
<<< ./snippets/me/update.ts#example{ts} [JavaScript]
<<< ./snippets/me/update.swift#example{swift} [Swift]
:::

## uploadAvatar(imageData, contentType)

Upload an avatar image and get back the new avatar URL. In JS `contentType` is a
typed union (`image/png | image/jpeg | image/gif | image/webp`); Swift takes a
bare `String`, so an invalid MIME type fails at runtime rather than compile-time
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).

::: code-group
<<< ./snippets/me/upload-avatar.ts#example{ts} [JavaScript]
<<< ./snippets/me/upload-avatar.swift#example{swift} [Swift]
:::

## ownedDocuments(options?)

List documents the current user owns (live ownership, not creator). JS returns a
flat `DocumentInfo[]` by default (or a `{ items, cursor }` page with
`returnPage: true`) and accepts the full `documents.list` option set.

::: tip Divergent shape
Swift's `ownedDocuments` accepts only `cursor`/`limit`/`tag` and returns the raw
`{ items, cursor? }` envelope as `[String: Any]`. The 7 offline-first knobs
(`includeRoot`, `refreshFromServer`, `localOnly`, `serverTimeoutMs`,
`waitForLoad`, `forward`, `returnPage`) are absent, and the Swift call is a bare
network GET with no local-cache merge or stale-refresh ([#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938), [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/me/owned-documents.ts#example{ts} [JavaScript]
<<< ./snippets/me/owned-documents.swift#example{swift} [Swift]
:::

## sharedDocuments(options?)

List documents shared with the current user (non-owner permissions plus pending
legacy invitations). Returns the unified `{ items, cursor? }` envelope; pass
`tag` to filter and `cursor` to paginate.

::: tip Divergent shape
Swift returns the envelope as an untyped `[String: Any]` and, like
`ownedDocuments`, is a bare network GET ([#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938), [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/me/shared-documents.ts#example{ts} [JavaScript]
<<< ./snippets/me/shared-documents.swift#example{swift} [Swift]
:::

## pendingDocumentInvitations()

List pending document invitations for the current user. JS returns a typed array
(`invitationId`, `documentId`, `permission`, `accepted`, nested `document`, …);
Swift returns `[[String: Any]]` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).

::: code-group
<<< ./snippets/me/pending-document-invitations.ts#example{ts} [JavaScript]
<<< ./snippets/me/pending-document-invitations.swift#example{swift} [Swift]
:::

## cacheInfo()

Read cache metadata for the current user's profile entry. JS returns
`{ updatedAt?, ageMs? }`; Swift returns the typed tuple
`(updatedAt: String?, ageMs: Double?)`.

::: code-group
<<< ./snippets/me/cache-info.ts#example{ts} [JavaScript]
<<< ./snippets/me/cache-info.swift#example{swift} [Swift]
:::

## clearCache()

Clear the cached profile so the next `get()` fetches fresh data from the server.

::: code-group
<<< ./snippets/me/clear-cache.ts#example{ts} [JavaScript]
<<< ./snippets/me/clear-cache.swift#example{swift} [Swift]
:::
