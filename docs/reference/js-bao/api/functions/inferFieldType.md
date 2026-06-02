[**js-bao**](../README.md)

***

[js-bao](../globals.md) / inferFieldType

# Function: inferFieldType()

> **inferFieldType**(`value`): `"string"` \| `"number"` \| `"boolean"` \| `"stringset"` \| `null`

Infer a _meta_ type string from a JS runtime value.

Only an all-`true` Y.Map (the stringset wire shape) is tagged as
`stringset` (issue #625) — a Y.Map carrying a composite payload, or a
Y.Array / Y.Text, is not a stringset and stays untyped (`null`) rather
than being mis-tagged.

## Parameters

### value

`unknown`

## Returns

`"string"` \| `"number"` \| `"boolean"` \| `"stringset"` \| `null`
