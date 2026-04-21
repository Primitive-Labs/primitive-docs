[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / PermissionUpdateResult

# Interface: PermissionUpdateResult

Response from updating document permissions.

## Properties

### message

> **message**: `string`

***

### results?

> `optional` **results**: ([`DirectPermissionGrant`](DirectPermissionGrant.md) \| [`DeferredPermissionGrant`](DeferredPermissionGrant.md))[]

Present when the response includes deferred (email-based) grants.

***

### success

> **success**: `boolean`
