[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataBatchResult

# Interface: ResourceMetadataBatchResult

Result of `resourceMetadata.getBatch`. The call itself succeeds (HTTP 200)
even when individual items fail — check each entry's `ok` discriminant.

## Properties

### results

> **results**: [`ResourceMetadataBatchResourceResult`](../type-aliases/ResourceMetadataBatchResourceResult.md)[]

One entry per request item, in request order.
