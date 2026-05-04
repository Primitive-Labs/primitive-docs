[**js-bao**](../README.md)

***

[js-bao](../globals.md) / loadSchemaFromTomlString

# Function: loadSchemaFromTomlString()

> **loadSchemaFromTomlString**(`tomlString`, `options`): `DefinedModelSchema`\<`Record`\<`string`, [`FieldOptions`](../interfaces/FieldOptions.md)\>\>[]

Parse a TOML string and return an array of DefinedModelSchema objects.

By default operates in strict mode: unknown keys at the model, field,
relationship, or unique-constraint level cause an error. Pass
`{ strict: false }` to silently ignore unknown keys (legacy behavior).

## Parameters

### tomlString

`string`

### options

`LoadSchemaOptions` = `{}`

## Returns

`DefinedModelSchema`\<`Record`\<`string`, [`FieldOptions`](../interfaces/FieldOptions.md)\>\>[]
