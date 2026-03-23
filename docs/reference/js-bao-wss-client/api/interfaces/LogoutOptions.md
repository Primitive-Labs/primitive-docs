[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / LogoutOptions

# Interface: LogoutOptions

Options for [JsBaoClient.logout](../classes/JsBaoClient.md#logout).

## Properties

### clearOfflineIdentity?

> `optional` **clearOfflineIdentity**: `boolean`

If false, preserves the in-memory offline identity after logout (default true).

***

### redirectTo?

> `optional` **redirectTo**: `string`

URL to navigate to after logout completes (browser only).

***

### revokeOffline?

> `optional` **revokeOffline**: `boolean`

If true, revokes the stored offline access grant.

***

### waitForDisconnect?

> `optional` **waitForDisconnect**: `boolean`

If true, awaits WebSocket disconnection before resolving; set to false to avoid blocking UI (default false).

***

### wipeLocal?

> `optional` **wipeLocal**: `boolean`

If true, deletes all locally cached document data and KV cache.
