[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataWriteResult

# Interface: ResourceMetadataWriteResult

Result of a metadata write (`resourceMetadata.set` — a full replace).

## Properties

### category

> **category**: `string`

***

### data

> **data**: `Record`\<`string`, `unknown`\>

The stored metadata object as validated and persisted.

***

### resourceId

> **resourceId**: `string`

***

### resourceType

> **resourceType**: `string`

***

### schemaVersion

> **schemaVersion**: `number`

Schema version the write was validated against.

***

### size

> **size**: `number`

Stored size of the serialized data, in bytes.
