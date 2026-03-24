[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / YjsPersistenceFactory

# Type Alias: YjsPersistenceFactory()

> **YjsPersistenceFactory** = (`docId`, `ydoc`, `context`) => [`YjsPersistenceProvider`](../interfaces/YjsPersistenceProvider.md) \| `null`

Factory function for creating Yjs persistence providers.

## Parameters

### docId

`string`

The document ID being opened

### ydoc

`Doc`

The Yjs document instance

### context

[`YjsPersistenceContext`](../interfaces/YjsPersistenceContext.md)

Additional context (appId, userId)

## Returns

[`YjsPersistenceProvider`](../interfaces/YjsPersistenceProvider.md) \| `null`

A persistence provider instance, or null to disable persistence

## Example

```ts
// Node.js with y-sqlite3
import { SqlitePersistence } from 'y-sqlite3';

const factory: YjsPersistenceFactory = (docId, ydoc, { appId, userId }) => {
  return new SqlitePersistence(docId, ydoc, {
    dbPath: `~/.my-app/${appId}/${userId}/yjs.sqlite`
  });
};
```
