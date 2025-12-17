[**js-bao**](../README.md)

***

[js-bao](../globals.md) / InferAttrs

# Type Alias: InferAttrs\<TSchema\>

> **InferAttrs**\<`TSchema`\> = `{ [K in keyof TSchema["fields"]]: FieldValue<TSchema["fields"][K]> }`

## Type Parameters

### TSchema

`TSchema` *extends* `DefinedModelSchema`\<`any`\>
