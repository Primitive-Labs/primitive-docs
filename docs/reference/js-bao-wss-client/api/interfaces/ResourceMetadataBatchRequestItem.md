[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataBatchRequestItem

# Interface: ResourceMetadataBatchRequestItem

One item of a batch read request. `categories` is required and must be
non-empty — there is no expand-to-all; an item that omits it comes back as a
per-item error with `status: 400`.

## Properties

### categories

> **categories**: `string`[]

Explicit categories to read for this resource.

***

### resourceId

> **resourceId**: `string`

***

### resourceType

> **resourceType**: `string`
