[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseChangePayload

# Interface: DatabaseChangePayload

Envelope for a `db.change` event (one event, potentially N changes).

## Properties

### changes

> **changes**: [`DatabaseChangeEvent`](DatabaseChangeEvent.md)[]

***

### databaseId

> **databaseId**: `string`

***

### isOrigin

> **isOrigin**: `boolean`

`true` iff this exact WebSocket connection sent the write that
triggered the frame. Synthesized client-side at dispatch time by
comparing `originConnectionId` against the client's live connection
id. On WS reconnect the local id rotates, so a frame for the writer's
own pre-reconnect write may arrive with `isOrigin: false` — expected.

***

### isOriginUser

> **isOriginUser**: `boolean`

`true` iff any tab/process signed in as the same user sent the write.
Distinct from [isOrigin](#isorigin) because two tabs signed in as the same
user share `isOriginUser` (both `true`) but only one has
`isOrigin: true`. Useful for cache-invalidation logic that doesn't
care which tab issued the write.

***

### originConnectionId

> **originConnectionId**: `string` \| `null`

Connection id of the client that produced the write, or `null` for
server-side / unattributed writes (cron, workflows, admin imports, or
an HTTP write whose request omitted `X-JB-Connection-Id`). Server-
stamped (#737); subscribers use it to synthesize [isOrigin](#isorigin).

***

### originUserId

> **originUserId**: `string` \| `null`

User id of the writer, or `null` for unattributed server-side writes.
Server-stamped (#737); subscribers use it to synthesize
[isOriginUser](#isoriginuser).

***

### subscriptionKey

> **subscriptionKey**: `string`

***

### timestamp

> **timestamp**: `string`

***

### type

> **type**: `"db.change"`
