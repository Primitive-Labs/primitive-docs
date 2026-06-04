[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseChangeEvent

# Interface: DatabaseChangeEvent

A single change delivered on a `db.change` frame.

The `changeType` is derived server-side from filter transitions (#740):
"enter" (no longer matched → now matches), "update" (matched before and
after), "leave" (matched before → no longer matches). Projection-using
clients should read `changeType`; CRDT-aware clients can keep reading `op`.
It is optional because the server only sets it for filter-based
subscriptions; non-filter paths omit it.

Keep this in sync with the internal copy in
`internal/databaseSubscriptions.ts` — see #949 (the two had drifted).

## Properties

### changeType?

> `optional` **changeType**: `"update"` \| `"enter"` \| `"leave"`

***

### data?

> `optional` **data**: `any`

***

### id

> **id**: `string`

***

### modelName

> **modelName**: `string`

***

### op

> **op**: `"save"` \| `"patch"` \| `"delete"` \| `"increment"` \| `"addToSet"` \| `"removeFromSet"`

***

### previousData?

> `optional` **previousData**: `any`
