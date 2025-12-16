[**js-bao**](../README.md)

***

[js-bao](../globals.md) / InferAttrs

# Type Alias: InferAttrs\<TSchema\>

> **InferAttrs**\<`TSchema`\> = `{ [K in keyof TSchema["fields"]]: FieldValue<TSchema["fields"][K]> }`

Defined in: [packages/js-bao/src/models/schema.ts:99](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/schema.ts#L99)

## Type Parameters

### TSchema

`TSchema` *extends* `DefinedModelSchema`\<`any`\>
