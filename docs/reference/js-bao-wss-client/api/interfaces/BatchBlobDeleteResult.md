[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / BatchBlobDeleteResult

# Interface: BatchBlobDeleteResult

Result of a batch blob delete (#1455) via `blobBuckets.delete(bucket, ids)`.

## Properties

### blobIds

> **blobIds**: `string`[]

The ids processed, echoed back.

***

### bucketId

> **bucketId**: `string`

The resolved bucket id.

***

### deleted

> **deleted**: `number`

Count of ids processed (input length, duplicates included).
