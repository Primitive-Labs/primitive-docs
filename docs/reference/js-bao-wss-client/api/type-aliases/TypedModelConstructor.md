[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / TypedModelConstructor

# Type Alias: TypedModelConstructor\<TModel\>

> **TypedModelConstructor**\<`TModel`\> = (`attrs?`) => `TModel` & *typeof* `BaseModel` & `object`

Defined in: [packages/js-bao-wss-client/types/typed-model-constructor.ts:7](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/types/typed-model-constructor.ts#L7)

Helper type that preserves the instance + static typing of schema-built models.
Use this to annotate models passed into JsBaoClient so constructor + statics stay typed.

## Type Declaration

### modelName?

> `optional` **modelName**: `string`

## Type Parameters

### TModel

`TModel` *extends* `BaseModel` = `BaseModel`
