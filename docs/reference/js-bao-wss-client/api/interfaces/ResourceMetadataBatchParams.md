[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataBatchParams

# Interface: ResourceMetadataBatchParams

Parameters for `resourceMetadata.getBatch`.

## Properties

### requests

> **requests**: [`ResourceMetadataBatchRequestItem`](ResourceMetadataBatchRequestItem.md)[]

Up to 50 resource entries, and up to 200 expanded resource/category pairs
per call. Exceeding either limit fails the whole call with `400
BATCH_TOO_LARGE`.
