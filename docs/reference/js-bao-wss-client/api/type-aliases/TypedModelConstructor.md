[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / TypedModelConstructor

# Type Alias: TypedModelConstructor\<TModel\>

> **TypedModelConstructor**\<`TModel`\> = (`attrs?`) => `TModel` & *typeof* `BaseModel` & `object`

Helper type that preserves the instance + static typing of schema-built models.
Use this to annotate models passed into JsBaoClient so constructor + statics stay typed.

## Type Declaration

### modelName?

> `optional` **modelName**: `string`

## Type Parameters

### TModel

`TModel` *extends* `BaseModel` = `BaseModel`
