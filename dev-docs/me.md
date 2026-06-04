# me — `client.me`

The signed-in user: read and update their profile, list the documents they own
or that are shared with them, manage pending invitations, and control the
profile cache. To look up *other* users, see [`users`](/users).

::: tip Now typed (Swift)
The `client.me` surface is now typed in Swift (issue
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)):
`get`/`update` use `UserProfile` and `UpdateMeParams`, `uploadAvatar` returns
`AvatarUploadResult`, `pendingDocumentInvitations` returns
`[PendingDocumentInvitation]`, `ownedDocuments` returns `[DocumentInfo]`, and
`sharedDocuments` returns `SharedDocumentListResult` (`{ items, cursor? }`).

One **behavioral** divergence remains: in Swift `ownedDocuments`/`sharedDocuments`
are **bare network GETs** (accepting only `cursor`/`limit`/`tag`), whereas JS
layers offline-first cache-merge / stale-refresh and the full `documents.list`
option set on top. The Swift methods therefore return nothing offline. This is a
feature gap, deferred — tracked at
[#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938).
:::

## get(options?)

Read the signed-in user's profile, using the cache when available. Returns
`null` if there is no current user.

::: code-group
<<< ./snippets/me/get.ts#example{ts} [JavaScript]
<<< ./snippets/me/get.swift#example{swift} [Swift]
:::

## update(params)

Update the profile's `name` and/or `avatarUrl`, returning the updated
`UserProfile`. To clear the avatar, pass `avatarUrl: null` (JS) or
`avatarUrl: .clear` (Swift's `UpdateMeParams`).

::: code-group
<<< ./snippets/me/update.ts#example{ts} [JavaScript]
<<< ./snippets/me/update.swift#example{swift} [Swift]
:::

## uploadAvatar(imageData, contentType)

Upload an avatar image and get back the new avatar URL (a typed
`AvatarUploadResult` in Swift, `{ avatarUrl }` in JS).

::: tip Minor divergence
In JS `contentType` is a typed union
(`image/png | image/jpeg | image/gif | image/webp`); Swift takes a bare `String`,
so an invalid MIME type fails at runtime rather than compile-time. The return is
now typed on both sides.
:::

::: code-group
<<< ./snippets/me/upload-avatar.ts#example{ts} [JavaScript]
<<< ./snippets/me/upload-avatar.swift#example{swift} [Swift]
:::

## ownedDocuments(options?)

List documents the current user owns (live ownership, not creator). JS returns a
flat `DocumentInfo[]` by default (or a `{ items, cursor }` page with
`returnPage: true`) and accepts the full `documents.list` option set. Swift
returns a typed `[DocumentInfo]`.

::: warning Swift behavioral gap (deferred)
Swift's `ownedDocuments` accepts only `cursor`/`limit`/`tag` and is a **bare
network GET**. The 7 offline-first knobs (`includeRoot`, `refreshFromServer`,
`localOnly`, `serverTimeoutMs`, `waitForLoad`, `forward`, `returnPage`) and the
local-cache merge / stale-refresh JS performs are absent, so the Swift path
returns nothing offline. This is a feature gap, deferred — tracked at
[#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938). (The return type
itself is now typed, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954).)
:::

::: code-group
<<< ./snippets/me/owned-documents.ts#example{ts} [JavaScript]
<<< ./snippets/me/owned-documents.swift#example{swift} [Swift]
:::

## sharedDocuments(options?)

List documents shared with the current user (non-owner permissions plus pending
legacy invitations). Returns the unified `{ items, cursor? }` envelope — a typed
`SharedDocumentListResult` in Swift; pass `tag` to filter and `cursor` to paginate.

::: warning Swift behavioral gap (deferred)
Like `ownedDocuments`, Swift's `sharedDocuments` is a **bare network GET** — JS
does an offline-first cache-merge with stale-refresh, so the Swift path returns
nothing offline. This is a feature gap, deferred — tracked at
[#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938). (The envelope is
now typed, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954).)
:::

::: code-group
<<< ./snippets/me/shared-documents.ts#example{ts} [JavaScript]
<<< ./snippets/me/shared-documents.swift#example{swift} [Swift]
:::

## pendingDocumentInvitations()

List pending document invitations for the current user. Both clients return a
typed array (`invitationId`, `documentId`, `permission`, `accepted`, nested
`document`, …) — `[PendingDocumentInvitation]` in Swift.

::: code-group
<<< ./snippets/me/pending-document-invitations.ts#example{ts} [JavaScript]
<<< ./snippets/me/pending-document-invitations.swift#example{swift} [Swift]
:::

## cacheInfo()

Read cache metadata for the current user's profile entry.

::: tip Divergent shape
JS returns `{ updatedAt?, ageMs? }`; Swift returns the typed tuple
`(updatedAt: String?, ageMs: Double?)`. This is the one spot on the `me` surface
where Swift is typed rather than an untyped dictionary — a benign access-pattern
difference, not a drift.
:::

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
