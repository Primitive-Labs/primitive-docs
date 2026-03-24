[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / InferAttrs

# Type Alias: InferAttrs\<TSchema\>

> **InferAttrs**\<`TSchema`\> = `{ [K in keyof TSchema["fields"]]: FieldValue<TSchema["fields"][K]> }`

## Type Parameters

### TSchema

`TSchema` *extends* `DefinedModelSchema`\<`any`\>
