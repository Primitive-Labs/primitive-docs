[**js-bao**](../README.md)

***

[js-bao](../globals.md) / discoverSchema

# Function: discoverSchema()

> **discoverSchema**(`yDoc`): [`DiscoveredSchema`](../interfaces/DiscoveredSchema.md)

Discover the schema embedded in a YDoc by reading its `_meta_*` maps.

Returns a plain JSON object describing every model that has metadata.
Does not require BaseModel, a database, or any schema registration —
just a Y.Doc.

## Parameters

### yDoc

`Doc`

## Returns

[`DiscoveredSchema`](../interfaces/DiscoveredSchema.md)
