# me — `client.me`

The signed-in user: read and update their profile, list the documents they own
or that are shared with them, manage pending invitations, and control the
profile cache. To look up *other* users, see [`users`](/users).

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
`AvatarUploadResult` in Swift, `{ avatarUrl }` in JS). Swift takes a typed
`AvatarContentType` enum (`.png` / `.jpeg` / `.gif` / `.webp`), matching JS's
typed MIME union.

::: code-group
<<< ./snippets/me/upload-avatar.ts#example{ts} [JavaScript]
<<< ./snippets/me/upload-avatar.swift#example{swift} [Swift]
:::

## ownedDocuments(options?)

List documents the current user owns (live ownership, not creator). Both clients
return a flat `DocumentInfo[]` by default; for the `{ items, cursor }` page
envelope, JS passes `returnPage: true` and Swift calls `ownedDocumentsPage(...)`.
Swift accepts `cursor`/`limit`/`tag` plus the full `MeOwnedDocumentsOptions` set
(`includeRoot`, `refreshFromServer`, `localOnly`, `serverTimeoutMs`,
`waitForLoad`, `forward`, `returnPage`).

Swift's `ownedDocuments` is **offline-first** (#938): when online it fetches
the server list AND merges in owner rows from the local metadata cache (deduped
by `documentId`, server rows winning on conflict), so freshly-created
`pendingCreate` docs and other locally-known owned docs the server list didn't
return still appear; when offline it returns the owner subset of the local cache
only.

::: code-group
<<< ./snippets/me/owned-documents.ts#example{ts} [JavaScript]
<<< ./snippets/me/owned-documents.swift#example{swift} [Swift]
:::

## sharedDocuments(options?)

List documents shared with the current user (non-owner permissions plus pending
legacy invitations). Returns the unified `{ items, cursor? }` envelope — a typed
`SharedDocumentListResult` in Swift; pass `tag` to filter and `cursor` to paginate.

Like `ownedDocuments`, Swift's `sharedDocuments` is now **offline-first** (#938):
online it merges the server page with non-owner rows from the local metadata
cache (deduped by `documentId`, server winning); offline it returns the
non-owner subset of the local cache only.

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
